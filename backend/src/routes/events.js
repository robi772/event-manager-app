const express = require('express');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/events - list approved events
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.username as organizer_name,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registration_count
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.status = 'approved'
       ORDER BY e.event_date ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/events/:id - event details
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.username as organizer_name,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registration_count
       FROM events e
       JOIN users u ON e.organizer_id = u.id
       WHERE e.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/events - create event (auth required)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, event_date, location, max_participants } = req.body;

  if (!title || !event_date || !location) {
    return res.status(400).json({ error: 'Title, date and location are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO events (title, description, event_date, location, max_participants, organizer_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, event_date, location, max_participants || null, req.user.id, 'pending']
    );
    res.status(201).json({ id: result.insertId, message: 'Event created, pending approval' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PUT /api/events/:id - update own event
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, event_date, location, max_participants } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (rows[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await db.query(
      'UPDATE events SET title=?, description=?, event_date=?, location=?, max_participants=? WHERE id=?',
      [title, description, event_date, location, max_participants, req.params.id]
    );
    res.json({ message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/events/my/events - own events
router.get('/my/events', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*,
       (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id) as registration_count
       FROM events e WHERE e.organizer_id = ? ORDER BY e.event_date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
