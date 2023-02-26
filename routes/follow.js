const express = require('express');
const router = express.Router();
const User = require('../models/user');
require("dotenv").config();

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/users/following', authMiddleware, async (req, res) => {
    try {
        const currentUser = req.user;

        // Populate the `following` array with User objects
        await currentUser.find('following').Populate();

        res.status(200).json(currentUser.following);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});




//TODO: fix that you can follow yourself
router.get('/go/:username', authMiddleware, async (req, res) => {
    try {
        // Find the user to follow by their username
        const userToFollow = await User.findOne({ username: req.params.username });
        // If the user to follow doesn't exist, return an error message
        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get the currently logged in user from the authentication middleware
        const currentUser = req.user;
        // If the logged in user is already following the user to follow, return a success message
        if (currentUser.following.includes(userToFollow._id)) {
            return res.status(200).json({ message: 'You are already following this user' });
        }
        // Add the user to follow to the following list of the logged in user
        currentUser.following.push(userToFollow._id);
        // Save the updated user
        await currentUser.save();
        // Return a success message
        res.status(200).json({ message: `You are now following ${userToFollow.username}` });
    } catch (error) {
        // Return an error message
        res.status(500).json({ error: 'Something went wrong' });
    }
});

router.get('/un/:username', authMiddleware, async (req, res) => {
    try {
        // Find the currently logged in user
        const currentUser = req.user;
        // Find the user to unfollow
        const userToUnfollow = await User.findOne({ username: req.params.username });
        // If the user to unfollow is not found, return an error
        if (!userToUnfollow) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Remove the user to unfollow from the following list of the currently logged in user
        currentUser.following.pull(userToUnfollow._id);
        await currentUser.save();
        // Return a success message
        res.status(200).json({ success: true });
    } catch (err) {
        // Return an error message
        res.status(500).json({ error: err.message });
    }
});



router.get('/isfollowing/:username', authMiddleware, async (req, res) => {
    try {
      const currentUser = req.user;
      const userToFollow = await User.findOne({ username: req.params.username });

      if (!userToFollow) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isFollowing = currentUser.following.includes(userToFollow._id);
      res.status(200).json({ isFollowing });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;