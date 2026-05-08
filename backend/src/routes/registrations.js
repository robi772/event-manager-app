const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/registrations - register for event
router.post('/', authenticateToken, async (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    return res.status(400).json({ error: 'event_id is required' });
  }

  try {
    // Check event exists and is approved
    const [events] = await db.query(
      'SELECT * FROM events WHERE id = ? AND status = ?', [event_id, 'approved']
    );
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found or not approved' });
    }

    const event = events[0];

    // Check max participants
    if (event.max_participants) {
      const [countRows] = await db.query(
        'SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ?', [event_id]
      );
      if (countRows[0].cnt >= event.max_participants) {
        return res.status(409).json({ error: 'Event is full' });
      }
    }

    // Check duplicate registration
    const [existing] = await db.query(
      'SELECT id FROM registrations WHERE user_id = ? AND event_id = ?',
      [req.user.id, event_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    const [result] = await db.query(
      'INSERT INTO registrations (user_id, event_id) VALUES (?, ?)',
      [req.user.id, event_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Successfully registered' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/registrations/:id - cancel registration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM registrations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await db.query('DELETE FROM registrations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/registrations/my - my registrations
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, e.title, e.event_date, e.location
       FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.user_id = ?
       ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/registrations/event/:eventId - registrations for organizer
router.get('/event/:eventId', authenticateToken, async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.eventId]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (events[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const [rows] = await db.query(
      `SELECT r.*, u.username, u.email FROM registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?`,
      [req.params.eventId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
