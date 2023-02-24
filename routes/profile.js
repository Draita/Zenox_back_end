const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bodyParser = require('body-parser');
const sharp = require('sharp');




router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

router.get('/get/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by their username
    const user = await User.findOne({ username });

    // If the user does not exist, return a 404 response
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Retrieve the username, profile picture, and description
    const { username: retrievedUsername, profilePicture, description } = user;

    // Return the user's information
    res.status(200).json({ username: retrievedUsername, profilePicture, description });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/upload_profile_picture', async (req, res, next) => {
  console.log("YOOO1")
  if (!req.files || !req.files.file) {
    return res.status(400).send('No file uploaded');
  }
  console.log("YOOO2")


  const myFile = req.files.file;
  const contentType = myFile.mimetype;

  // Check if file is an image
  if (!contentType.startsWith('image/')) {
    return res.status(400).send('File uploaded is not an image');
  }

  // Resize and crop image
  console.log("YOOO3")

  try {
    const buffer = await sharp(myFile.data)
      .resize(512, 512, { fit: 'cover' })
      .jpeg()
      .toBuffer();
    console.log("YOOO4")


    const user = await User.findByIdAndUpdate(
      req.session.user._id,
      { profilePicture: buffer },
      { new: true }
    );

    return res.status(200).send('ok');

  } catch (err) {
    console.log(err)
    return res.status(404).send(err);
  }
});



router.get('/profile_picture/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by their username
    const user = await User.findOne({ username });
    console.log(user)

    // If the user does not exist or has no profile picture, return a 404 response
    if (!user || !user.profilePicture) {
      return res.status(404).json({ msg: 'Profile picture not found' });
    }

    // Set response headers to indicate image content type and cache control
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31557600');

    // Return the user's profile picture data as an image
    return res.send(user.profilePicture);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;
