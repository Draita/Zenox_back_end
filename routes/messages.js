const express = require("express");
const router = express.Router();
const Message = require("../models/message");
const User = require("../models/user");
const Media = require("../models/media");

const authMiddleware = require("../middlewares/authMiddleware");

// POST a new message
const sharp = require("sharp");


async function handleMedia(req) {
  let media;
  const myFile = req.files?.file;
  if (myFile) {
    const contentType = myFile.mimetype;
    if (!contentType.startsWith("image/")) {
      throw new Error("Only images");
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
  return media;
}

async function handleMessage(req, content, location, media) {
  const message = new Message({ content, location, media, user: req.user });
  const userWithoutdata = new User({
    _id: req.user._id,
    username: req.user.username,
  });
  const output = await message.save();
  output.user = userWithoutdata;
  return output;
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, location } = req.body;
    const media = await handleMedia(req);
    const output = await handleMessage(req, content, location, media);
    res.status(200).send(output);
  } catch (error) {
    console.error("🤡 Clown! Error saving new message:", error);
    res.sendStatus(500);
  }
});

router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const parentMessage = await Message.findById(req.params.id);

    if (!parentMessage) {
      return res.status(404).send('Message not found');
    }

    const { content, location } = req.body;
    const media = await handleMedia(req);
    const reply = new Message({
      content,
      location,
      media,
      user: req.user,
      location: "reply",
      timestamp: Date.now(),
    });

    await reply.save();

    parentMessage.replies.push(reply._id);
    await parentMessage.save();

    res.sendStatus(200);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.sendStatus(500);
  }
});

router.get("/replies/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId).populate({
      path: "replies",
      options: { sort: { timestamp: "desc" } }, // sort replies by timestamp in descending order
      populate: {
        path: "user",
        select: "username"
      }
    });

    if (!message) {
      return res.status(404).json({ msg: "Message not found" });
    }

    const replies = message.replies;

    res.json(replies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});



router.post("/discover", authMiddleware, async (req, res) => {
  try {
    const { username, filter } = req.body;
    var messages = await Message.find({location: "feed"})
      .sort({ timestamp: "desc" })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await filterMessages(messages, username, filter);
    messages = await addLikedField(messages, req);
    messages = await addPostedSelf(messages, req);

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//get all messages that where posted under the profile of a user
router.get("/profile/:username", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username,});
    var messages = await Message.find({ user: user._id ,  location: "feed"})
      .sort({ timestamp: -1 })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await addLikedField(messages, req);
    console.log(req.user.username)

    messages = await addPostedSelf(messages, req);

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
    // Collect messages from following users in the "feed" location
    const following = user.following.map((user) => user.id);
    var messages = await Message.find({
      user: { $in: following },
      location: "feed" // Filter messages for "feed" location
    })
      .populate("user", "username")
      .populate("likes", "username")
      .lean();

    messages = await addLikedField(messages, req);
    messages = await addPostedSelf(messages, req);

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

async function addPostedSelf(messages, req){
  messages = messages.map(message => ({
    ...message,
    postedSelf: message.user.username === req.user.username,
  }));
  return messages
}

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

async function addRepliedField(messages, req) {
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


//used to filter messages
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
