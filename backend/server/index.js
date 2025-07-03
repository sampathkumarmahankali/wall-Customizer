const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/session'); // <-- ADD THIS LINE

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Auth routes
app.use('/api', authRoutes);
// Session routes
app.use('/api', sessionRoutes); // <-- AND THIS LINE

app.get('/', (req, res) => {
  res.send('Wallora Auth Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});