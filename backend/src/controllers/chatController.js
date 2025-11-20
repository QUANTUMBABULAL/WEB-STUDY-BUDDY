const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    // fetch last 100 messages sorted ascending by createdAt
    const messages = await Message.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('sender', 'username')
      .lean();

    // return in chronological order
    res.json(messages.reverse());
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
