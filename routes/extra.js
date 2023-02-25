app.post('/upload', async (req, res, next) => {
    if (!req.files || !req.files.file) {
      return res.status(400).send('No file uploaded');
    }

    const myFile = req.files.file;
    const buffer = new Buffer.from(myFile.data, 'base64')
    const contentType = myFile.mimetype;
    try {
      const user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePicture: buffer },
        { new: true }
      );
    console.log("YOOOO2")

      return res.status(200).send('ok');

    } catch (err) {
      console.log(err)
      return res.status(404).send(err);
    }
  });
