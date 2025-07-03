const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Auth routes
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.send('Wallora Auth Server Running');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 