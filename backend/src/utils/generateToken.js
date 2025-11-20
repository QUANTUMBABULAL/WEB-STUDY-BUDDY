const jwt = require('jsonwebtoken');

const generateToken = (user, secret, expiresIn = '7d') => {
  return jwt.sign({ id: user._id, username: user.username }, secret, { expiresIn });
};

module.exports = generateToken;
