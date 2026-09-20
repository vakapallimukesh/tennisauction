const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, isUsingMySQL, getMemoryStore } = require('../config/db');
const { authenticateJWT, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  try {
    let user = null;

    if (isUsingMySQL()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ? LIMIT 1', [username.toLowerCase().trim()]);
      if (rows && rows.length > 0) {
        user = rows[0];
      }
    } else {
      const store = getMemoryStore();
      user = (store.users || []).find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.'
      });
    }

    // Attach team info if user is a team account
    let teamInfo = null;
    if (user.team_id) {
      if (isUsingMySQL()) {
        const pool = getPool();
        const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [user.team_id]);
        if (teams.length > 0) teamInfo = teams[0];
      } else {
        const store = getMemoryStore();
        teamInfo = store.teams.find(t => t.id === user.team_id) || null;
      }
    }

    const payload = {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      team_id: user.team_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        ...payload,
        team: teamInfo
      }
    });
  } catch (err) {
    console.error('Auth login error:', err);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ success: false, message: 'Server authentication error', ...(isProduction ? {} : { error: err.message }) });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    let teamInfo = null;
    if (req.user.team_id) {
      if (isUsingMySQL()) {
        const pool = getPool();
        const [teams] = await pool.query('SELECT * FROM teams WHERE id = ?', [req.user.team_id]);
        if (teams.length > 0) teamInfo = teams[0];
      } else {
        const store = getMemoryStore();
        teamInfo = store.teams.find(t => t.id === req.user.team_id) || null;
      }
    }

    res.json({
      success: true,
      user: {
        ...req.user,
        team: teamInfo
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
