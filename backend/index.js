require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Auth routes
app.use('/api', authRoutes);
// Session routes
app.use('/api', sessionRoutes);
// AI routes
app.use('/api/ai', aiRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Wallora Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});