const express = require('express');
const pool = require('../db');
const { authenticateAdmin } = require('../middleware/admin');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateAdmin);

// Get dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const [totalUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    
    // Get active users (users with sessions in last 30 days)
    const [activeUsers] = await pool.execute(`
      SELECT COUNT(DISTINCT u.id) as count 
      FROM users u 
      INNER JOIN edit_sessions s ON u.id = s.user_id 
      WHERE s.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Get total sessions
    const [totalSessions] = await pool.execute('SELECT COUNT(*) as count FROM edit_sessions');
    
    // Get sessions created today
    const [todaySessions] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM edit_sessions 
      WHERE DATE(updated_at) = CURDATE()
    `);
    
    // Get premium users
    const [premiumUsers] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE plan = 'premium'
    `);

    res.json({
      totalUsers: totalUsers[0].count,
      activeUsers: activeUsers[0].count,
      totalSessions: totalSessions[0].count,
      todaySessions: todaySessions[0].count,
      premiumUsers: premiumUsers[0].count
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', role = '' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offsetNum = (isNaN(pageNum) ? 0 : (pageNum - 1)) * (isNaN(limitNum) ? 20 : limitNum);
    const safeLimit = isNaN(limitNum) ? 20 : limitNum;
    const safeOffset = isNaN(offsetNum) ? 0 : offsetNum;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    
    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (status) {
      whereClause += ' AND u.plan = ?';
      params.push(status);
    }
    
    if (role) {
      whereClause += ' AND u.role = ?';
      params.push(role);
    }
    
    // Get users with session count
    const [users] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.role, u.plan, 
        u.created_at, u.last_login,
        COUNT(s.id) as session_count
      FROM users u
      LEFT JOIN edit_sessions s ON u.id = s.user_id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.id DESC
      LIMIT ${safeLimit} OFFSET ${safeOffset}
    `, params);
    
    // Get total count for pagination
    const [totalCount] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM users u
      ${whereClause}
    `, params);
    
    res.json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount[0].count / limitNum),
        totalItems: totalCount[0].count,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get user details with sessions
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user details
    const [users] = await pool.execute(`
      SELECT id, name, email, role, plan, updated_at, last_login, profile_photo
      FROM users WHERE id = ?
    `, [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user sessions
    const [sessions] = await pool.execute(`
      SELECT id, name, updated_at
      FROM edit_sessions 
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `, [userId]);
    
    res.json({
      user: users[0],
      sessions
    });
  } catch (error) {
    console.error('User details error:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Update user role or status
router.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, plan, is_active } = req.body;
    
    const updates = [];
    const params = [];
    
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    
    if (plan !== undefined) {
      updates.push('plan = ?');
      params.push(plan);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    params.push(userId);
    
    await pool.execute(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user and all their sessions
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete user sessions first
      await connection.execute('DELETE FROM edit_sessions WHERE user_id = ?', [userId]);
      
      // Delete user
      await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
      
      await connection.commit();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    // User registration trend - use created_at
    const [registrationTrend] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [period]);
    
    // Session creation trend
    const [sessionTrend] = await pool.execute(`
      SELECT 
        DATE(updated_at) as date,
        COUNT(*) as count
      FROM edit_sessions 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(updated_at)
      ORDER BY date
    `, [period]);
    
    // User activity by hour
    const [hourlyActivity] = await pool.execute(`
      SELECT 
        HOUR(updated_at) as hour,
        COUNT(*) as count
      FROM edit_sessions 
      WHERE updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY HOUR(updated_at)
      ORDER BY hour
    `, [period]);
    
    // Subscription distribution
    const [subscriptionStats] = await pool.execute(`
      SELECT 
        plan,
        COUNT(*) as count
      FROM users 
      GROUP BY plan
    `);
    
    res.json({
      registrationTrend,
      sessionTrend,
      hourlyActivity,
      subscriptionStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

// Export user data
router.get('/export/users', async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        id, name, email, role, plan, 
        last_login,
        (SELECT COUNT(*) FROM edit_sessions WHERE user_id = users.id) as session_count
      FROM users
      ORDER BY id DESC
    `);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
    
    // Create CSV content
    const csvHeader = 'ID,Name,Email,Role,Plan,Last Login,Session Count\n';
    const csvContent = users.map(user => 
      `${user.id},"${user.name}","${user.email}","${user.role}","${user.plan}","${user.last_login}",${user.session_count}`
    ).join('\n');
    
    res.send(csvHeader + csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

// Get flagged content (if you have a content moderation system)
router.get('/flagged-content', async (req, res) => {
  try {
    // This would be implemented when you have content moderation
    // For now, return empty array
    res.json({ flaggedContent: [] });
  } catch (error) {
    console.error('Flagged content error:', error);
    res.status(500).json({ message: 'Failed to fetch flagged content' });
  }
});

// Get payment analytics
router.get('/payments', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // This would be implemented when you have payment integration
    // For now, return mock data
    res.json({
      totalRevenue: 0,
      monthlyRevenue: 0,
      paymentMethods: [],
      subscriptionRevenue: 0
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch payment data' });
  }
});

// User Activity Report
router.get('/reports/user-activity', async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, name, email, last_login, is_active FROM users ORDER BY last_login DESC'
    );
    res.json({ users });
  } catch (error) {
    console.error('User Activity Report error:', error);
    res.status(500).json({ message: 'Failed to fetch user activity report' });
  }
});

// Session Analytics Report
router.get('/reports/session-analytics', async (req, res) => {
  try {
    // Sessions per user
    const [sessionsPerUser] = await pool.execute(
      `SELECT u.id, u.name, u.email, COUNT(s.id) as session_count
       FROM users u
       LEFT JOIN edit_sessions s ON u.id = s.user_id
       GROUP BY u.id
       ORDER BY session_count DESC`
    );
    // Recent sessions
    const [recentSessions] = await pool.execute(
      'SELECT id, user_id, name, updated_at FROM edit_sessions ORDER BY updated_at DESC LIMIT 10'
    );
    res.json({ sessionsPerUser, recentSessions });
  } catch (error) {
    console.error('Session Analytics Report error:', error);
    res.status(500).json({ message: 'Failed to fetch session analytics report' });
  }
});

module.exports = router; 