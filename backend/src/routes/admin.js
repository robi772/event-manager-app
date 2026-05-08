const express = require('express');
const db = require('../db');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/events - all events (pending, approved, rejected)
router.get('/events', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT e.*, u.username as organizer_name FROM events e
       JOIN users u ON e.organizer_id = u.id
       ORDER BY e.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// PATCH /api/admin/events/:id/status - approve or reject event
router.patch('/events/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }

  try {
    await db.query('UPDATE events SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: `Event ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// DELETE /api/admin/events/:id - delete event
router.delete('/events/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM registrations WHERE event_id = ?', [req.params.id]);
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/admin/users - list users
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
