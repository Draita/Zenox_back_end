const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(403).send("A token is required for authentication");
    }
    // TODO: do something with decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({token});

    if (!user) {
      throw new Error();
    }
    req.user = user
    next();
  } catch (err) {
    res.status(401).send({ error: 'Authentication required' });
  }
};


module.exports = authMiddleware;