const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');
const Media = require('../models/media');

const authMiddleware = require('../middlewares/authMiddleware');


// POST a new message
const sharp = require('sharp');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { content, location } = req.body;

        let media;
        const myFile = req.files?.file;
        if (myFile) {
            const contentType = myFile.mimetype;
            if (!contentType.startsWith('image/') && !contentType.startsWith('video/')) {
                res.status(400).send('Only images and videos are allowed');
                return;
            }

            let buffer = myFile.data;
            if (contentType.startsWith('image/')) {
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
        await message.save();

        res.sendStatus(200);
    } catch (error) {
        console.error('🤡 Clown! Error saving new message:', error);
        res.sendStatus(500);
    }
});

router.get('/discover', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 'desc' }).populate('user', 'username');
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const messages = await Message.find({ user: user._id })
            .sort({ timestamp: -1 })
            .populate('user', 'username').populate('likes', 'username')
            .lean();


        // Add a "liked" field to each message indicating whether the authenticated user has liked it
        const userId = user._id;

        messages.forEach(function (message) {
            const likes = message.likes
            var liked = false
            likes.forEach(function (like) {
                if (like.username == user.username) {
                    liked = true
                    return "ok"
                }
            });
            message.liked = liked
        });

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


router.get('/feed', authMiddleware, async (req, res) => {
    try {
        // Find the logged in user and populate the following field
        const user = await User.findById(req.user.id).populate('following');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Collect messages from following users
        const following = user.following.map((user) => user.id);
        const messages = await Message.find({ user: { $in: following } }).populate('user', 'username');

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
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

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Find the message by ID
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Check if the authenticated user is the owner of the message
        if (message.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'You are not authorized to delete this message' });
        }

        // Delete the message
        await message.delete();

        // Send success response
        res.json({ message: 'Message deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;