const express = require('express');
const Event = require('../models/Event');

const router = express.Router();

async function emitCalendarUpdate(app) {
	const io = app.get('io');
	if (!io) return;
	try {
		const events = await Event.find().sort({ start: 1 });
		io.emit('calendar:update', events);
	} catch (err) {
		console.error('Emit calendar:update failed', err);
	}
}

router.get('/', async (req, res) => {
	try {
		const events = await Event.find().sort({ start: 1 });
		res.json(events);
	} catch (err) {
		console.error('GET /api/events', err);
		res.status(400).json({ error: 'Unable to fetch events' });
	}
});

router.post('/', async (req, res) => {
	try {
		const event = await Event.create(req.body);
		await emitCalendarUpdate(req.app);
		res.status(201).json(event);
	} catch (err) {
		console.error('POST /api/events', err);
		res.status(400).json({ error: 'Unable to create event' });
	}
});

router.put('/:id', async (req, res) => {
	try {
		const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!event) return res.status(404).json({ error: 'Event not found' });
		await emitCalendarUpdate(req.app);
		res.json(event);
	} catch (err) {
		console.error('PUT /api/events/:id', err);
		res.status(400).json({ error: 'Unable to update event' });
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const event = await Event.findByIdAndDelete(req.params.id);
		if (!event) return res.status(404).json({ error: 'Event not found' });
		await emitCalendarUpdate(req.app);
		res.json({ _id: event._id });
	} catch (err) {
		console.error('DELETE /api/events/:id', err);
		res.status(400).json({ error: 'Unable to delete event' });
	}
});

module.exports = router;
