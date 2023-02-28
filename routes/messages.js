const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const Media = require("../models/media");

const authMiddleware = require("../middlewares/authMiddleware");

// POST a new message
const sharp = require("sharp");

router.post("/reply", authMiddleware, async (req, res) => {

  res.sendStatus(200);
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, location } = req.body;

    let media;
    const myFile = req.files?.file;
    if (myFile) {
      const contentType = myFile.mimetype;
      if (
        !contentType.startsWith("image/") &&
        !contentType.startsWith("video/")
      ) {
        res.status(400).send("Only images and videos are allowed");
        return;
      }

      let buffer = myFile.data;
      if (contentType.startsWith("image/")) {
        // Compress the image if it is larger than 1MB

        buffer = await sharp(myFile.data)
          .resize(800, 800)
          .jpeg({ quality: 80 })
          .toBuffer();
      }

      media = new Media({ data: buffer, contentType });
      await media.save();
    }

    const message = new Message({ content, location, media, user: req.user });

    const userWithoutdata = new User({
      _id: req.user._id,
      username: req.user.username,
    });

     message.save(async function (err, output) {
      const userWithoutdata = new User({
        _id: req.user._id,
        username: req.user.username,
      });
      output.user = userWithoutdata;
      res.status(200).send(output);
    });
  } catch (error) {
    console.error("🤡 Clown! Error saving new message:", error);
    res.sendStatus(500);
  }
});

router.post("/discover", async (req, res) => {
  try {
    const { username, filter } = req.body;
    console.log(username, filter);
    var messages = await Message.find()
      .sort({ timestamp: "desc" })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await filterMessages(messages, username, filter);
    messages = await addLikedField(messages, req);
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//get all messages that where posted under the profile of a user
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    var messages = await Message.find({ user: user._id })
      .sort({ timestamp: -1 })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await addLikedField(messages, req);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/feed", authMiddleware, async (req, res) => {
  try {
    // Find the logged in user and populate the following field
    const user = await User.findById(req.user.id).populate("following");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Collect messages from following users
    const following = user.following.map((user) => user.id);
    var messages = await Message.find({ user: { $in: following } })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await addLikedField(messages, req);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    const user = await User.findById(req.user.id);
    const alreadyLiked = message.likes.includes(user.id);

    if (alreadyLiked) {
      message.likes.pull(user.id);
      res.json({ liked: false, likes: message.likes.length });
    } else {
      message.likes.push(user.id);
      res.json({ liked: true, likes: message.likes.length });
    }

    await message.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Find the message by ID
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if the authenticated user is the owner of the message
    if (message.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this message" });
    }

    // Delete the message
    await message.delete();

    // Send success response
    res.json({ message: "Message deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Add a "liked" field to each message indicating whether the authenticated user has liked it
async function addLikedField(messages, req) {
  const token = req.cookies.token;
  const currentUser = await User.findOne({ token });

  messages.forEach(function (message) {
    const likes = message.likes;
    var liked = false;
    likes.forEach(function (like) {
      if (like.username == currentUser.username) {
        liked = true;
        return "ok";
      }
    });

    message.liked = liked;
  });

  return messages;
}

const filterMessages = async (messages, username, filter) => {
  if (username) {
    messages = messages.filter((message) => message.user.username === username);
  }

  if (filter) {
    const regExp = new RegExp(filter, "i");
    messages = messages.filter((message) => regExp.test(message.content));
  }
  return messages;
};

module.exports = router;
