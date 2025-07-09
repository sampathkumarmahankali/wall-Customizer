const db = require('./db');

db.query('SELECT 1')
  .then(() => {
    console.log('MySQL connection works!');
    process.exit(0);
  })
  .catch(err => {
    console.error('MySQL connection error:', err);
    process.exit(1);
  }); 