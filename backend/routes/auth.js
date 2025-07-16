const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { generateToken, authenticateToken } = require('../middleware/auth');
const emailService = require('../services/email-service');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // Generate JWT token
    const token = generateToken({
      id: result.insertId,
      email: email,
      name: name
    });

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(email, name).catch(error => {
      console.error('Error sending welcome email:', error);
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertId,
      token: token,
      user: {
        id: result.insertId,
        name: name,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const [users] = result;

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last_login timestamp
    await pool.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.json({
      message: 'Login successful',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Update password endpoint
router.post('/update-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    // Validate input
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify current password using bcrypt
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidCurrentPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password using bcrypt
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedNewPassword, email]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Password update failed' });
  }
});

// Verify password endpoint
router.post('/verify-password', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    res.json({
      isValid: isValidPassword,
      message: isValidPassword ? 'Password is correct' : 'Password is incorrect'
    });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ message: 'Password verification failed' });
  }
});

// Protected route to get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, profile_photo, role, subscription_status, is_active, plan FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: users[0]
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Verify token endpoint
router.get('/verify-token', authenticateToken, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
});

router.get('/userid-by-email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const [users] = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ userId: users[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Upload profile photo endpoint (base64)
router.post('/upload-profile-photo', authenticateToken, async (req, res) => {
  try {
    const { imageData, fileName, fileType } = req.body;
    const userId = req.user.id;

    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type' });
    }

    // Create data URL with proper MIME type
    const dataUrl = `data:${fileType};base64,${imageData}`;

    // Update user's profile photo in database with base64 data
    await pool.execute(
      'UPDATE users SET profile_photo = ? WHERE id = ?',
      [dataUrl, userId]
    );

    res.json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: dataUrl
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile photo' });
  }
});

// Remove profile photo endpoint
router.delete('/remove-profile-photo', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user's profile photo to null in database
    await pool.execute(
      'UPDATE users SET profile_photo = NULL WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile photo removed successfully',
      profilePhoto: null
    });
  } catch (error) {
    console.error('Profile photo removal error:', error);
    res.status(500).json({ message: 'Failed to remove profile photo' });
  }
});

// List all users (for sharing)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT id, name, email FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user plan endpoint
router.post('/update-plan', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { plan } = req.body;
    if (!plan || !['premium', 'ultra'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    await pool.execute('UPDATE users SET plan = ? WHERE id = ?', [plan, userId]);
    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Failed to update plan' });
  }
});

module.exports = router; 