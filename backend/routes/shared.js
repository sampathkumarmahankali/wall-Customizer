const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get all shared sessions for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT ss.*, es.name as session_name, u.email as shared_by_email, u2.email as last_edited_by_email
      FROM shared_sessions ss
      JOIN edit_sessions es ON ss.session_id = es.id
      JOIN users u ON ss.shared_by = u.id
      LEFT JOIN users u2 ON ss.last_edited_by = u2.id
      WHERE ss.shared_by = ?
      ORDER BY ss.created_at DESC
    `, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get a specific shared session
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT ss.*, es.name as session_name, u.email as shared_by_email, u2.email as last_edited_by_email
      FROM shared_sessions ss
      JOIN edit_sessions es ON ss.session_id = es.id
      JOIN users u ON ss.shared_by = u.id
      LEFT JOIN users u2 ON ss.last_edited_by = u2.id
      WHERE ss.id = ?
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Shared session not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get the current public/private share for a session
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM shared_sessions WHERE session_id = ? AND (type = 'public' OR type = 'private') LIMIT 1",
      [sessionId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No public/private share found for this session' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create or upsert a shared session
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { session_id, type, editors, viewers } = req.body;
    const shared_by = req.user.id;
    let result;
    // Convert editor user IDs to emails if needed
    let editorEmails = editors;
    if (Array.isArray(editors) && editors.length > 0 && typeof editors[0] !== 'string') {
      // If editors are user IDs, fetch emails
      const placeholders = editors.map(() => '?').join(',');
      const [rows] = await pool.query(`SELECT email FROM users WHERE id IN (${placeholders})`, editors);
      editorEmails = rows.map(r => r.email);
    }
    if (type === 'public' || type === 'private') {
      // Check if a public or private shared session already exists for this session_id
      const [rows] = await pool.query(
        "SELECT id FROM shared_sessions WHERE session_id = ? AND (type = 'public' OR type = 'private')",
        [session_id]
      );
      if (rows.length > 0) {
        // Delete the existing public/private row
        await pool.query('DELETE FROM shared_sessions WHERE id = ?', [rows[0].id]);
      }
      // Insert new public/private row
      [result] = await pool.query(
        'INSERT INTO shared_sessions (session_id, shared_by, type, editors, viewers) VALUES (?, ?, ?, ?, ?)',
        [session_id, shared_by, type, JSON.stringify(editorEmails || []), JSON.stringify(viewers || [])]
      );
      return res.status(201).json({ message: 'Shared session created', id: result.insertId });
    } else if (type === 'view') {
      // Check if a view-only share already exists for this session_id
      const [rows] = await pool.query(
        "SELECT id FROM shared_sessions WHERE session_id = ? AND type = 'view'",
        [session_id]
      );
      if (rows.length > 0) {
        // Update the existing view-only row
        await pool.query(
          'UPDATE shared_sessions SET editors = ?, viewers = ?, shared_by = ? WHERE id = ?',
          [JSON.stringify(editorEmails || []), JSON.stringify(viewers || []), shared_by, rows[0].id]
        );
        return res.status(200).json({ message: 'View-only share updated', id: rows[0].id });
      } else {
        // Insert new view-only row
        [result] = await pool.query(
          'INSERT INTO shared_sessions (session_id, shared_by, type, editors, viewers) VALUES (?, ?, ?, ?, ?)',
          [session_id, shared_by, type, JSON.stringify(editorEmails || []), JSON.stringify(viewers || [])]
        );
        return res.status(201).json({ message: 'View-only share created', id: result.insertId });
      }
    } else {
      return res.status(400).json({ error: 'Invalid share type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a shared session
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, editors, viewers, last_edited_by } = req.body;
    // Convert editor user IDs to emails if needed
    let editorEmails = editors;
    if (Array.isArray(editors) && editors.length > 0 && typeof editors[0] !== 'string') {
      const placeholders = editors.map(() => '?').join(',');
      const [rows] = await pool.query(`SELECT email FROM users WHERE id IN (${placeholders})`, editors);
      editorEmails = rows.map(r => r.email);
    }
    await pool.query(
      'UPDATE shared_sessions SET type = ?, editors = ?, viewers = ?, last_edited_by = ?, last_edited_at = CURRENT_TIMESTAMP WHERE id = ?',
      [type, JSON.stringify(editorEmails), JSON.stringify(viewers), last_edited_by, id]
    );
    res.json({ message: 'Shared session updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Delete a shared session
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM shared_sessions WHERE id = ?', [id]);
    res.json({ message: 'Shared session deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router; 