const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');

// POST a new message
router.post('/', async (req, res) => {
    try {
        const { content, location } = req.body;

        const user = req.session.user; // assuming user is already authenticated and set in the request object


        const message = new Message({ content, location, user });
        await message.save();
        console.log('🤡 Clown! New message saved:', message);
        res.sendStatus(200);
    } catch (error) {
        console.error('🤡 Clown! Error saving new message:', error);
        res.sendStatus(500);
    }
});

router.get('/feed', async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 'desc' }).populate('user', 'username');
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/feed/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        const messages = await Message.find({ user: user._id }).sort({ timestamp: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;