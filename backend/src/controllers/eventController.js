const Event = require('../models/Event');

exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find({ owner: req.user._id })
      .sort({ start: 1 })
      .lean();
    res.json(events);
  } catch (err) {
    console.error('listEvents', err);
    res.status(500).json({ message: 'Failed to load events' });
  }
};

exports.createEvent = async (req, res) => {
  const { title, start, className, backgroundColor, borderColor, textColor } = req.body;
  if (!title || !start) {
    return res.status(400).json({ message: 'Title and date are required' });
  }

  try {
    const event = await Event.create({
      owner: req.user._id,
      title,
      start,
      className,
      backgroundColor,
      borderColor,
      textColor
    });
    res.status(201).json(event);
  } catch (err) {
    console.error('createEvent', err);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

exports.updateEvent = async (req, res) => {
  const { title, start, className, backgroundColor, borderColor, textColor } = req.body;
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, start, className, backgroundColor, borderColor, textColor },
      { new: true }
    ).lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('updateEvent', err);
    res.status(500).json({ message: 'Failed to update event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, owner: req.user._id }).lean();
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error('deleteEvent', err);
    res.status(500).json({ message: 'Failed to delete event' });
  }
};
