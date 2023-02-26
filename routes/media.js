const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Media = require('../models/media');

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const media = await Media.findById(id);

    if (!media) {
      return res.status(404).send('Media not found');
    }

    res.set('Content-Type', media.contentType);
    res.send(media.data);
  } catch (error) {
    console.error('Error retrieving media:', error);
    res.sendStatus(500);
  }
});

module.exports = router;