const express = require('express');
const pool = require('../db');

const router = express.Router();

// --- Decor Categories ---
router.get('/decor-categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM decor_categories ORDER BY name ASC');
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', details: err.message });
  }
});

router.post('/decor-categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    const [result] = await pool.query('INSERT INTO decor_categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add category', details: err.message });
  }
});

router.put('/decor-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name required' });
    await pool.query('UPDATE decor_categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ id, name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

router.delete('/decor-categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM decor_categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});

// --- Decors ---
router.get('/decors', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT d.*, c.name as category_name FROM decors d JOIN decor_categories c ON d.category_id = c.id';
    let params = [];
    if (category_id) {
      query += ' WHERE d.category_id = ?';
      params.push(category_id);
    }
    query += ' ORDER BY d.name ASC';
    const [rows] = await pool.query(query, params);
    res.json({ decors: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decors', details: err.message });
  }
});

router.post('/decors', async (req, res) => {
  try {
    const { name, category_id, image_base64, is_active } = req.body;
    if (!name || !category_id || !image_base64) return res.status(400).json({ error: 'Missing required fields' });
    const [result] = await pool.query('INSERT INTO decors (name, category_id, image_base64, is_active) VALUES (?, ?, ?, ?)', [name, category_id, image_base64, is_active !== undefined ? is_active : true]);
    res.status(201).json({ id: result.insertId, name, category_id, image_base64, is_active });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add decor', details: err.message });
  }
});

router.put('/decors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category_id, image_base64, is_active } = req.body;
    if (!name || !category_id || !image_base64) return res.status(400).json({ error: 'Missing required fields' });
    await pool.query('UPDATE decors SET name = ?, category_id = ?, image_base64 = ?, is_active = ? WHERE id = ?', [name, category_id, image_base64, is_active !== undefined ? is_active : true, id]);
    res.json({ id, name, category_id, image_base64, is_active });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update decor', details: err.message });
  }
});

router.delete('/decors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM decors WHERE id = ?', [id]);
    res.json({ message: 'Decor deleted', id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete decor', details: err.message });
  }
});

module.exports = router; 