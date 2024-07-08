const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configure CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace * with your allowed origins in production
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Include Content-Type here
  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // Respond to OPTIONS requests with 200 OK
  } else {
    next(); // Pass control to the next middleware
  }
});


app.use(express.json());
app.use(express.static('public'));


// PostgreSQL setup
const db = new Pool({
  connectionString: process.env.db_local_url,
  ssl: {
    rejectUnauthorized: false
  }
});

// User registration
app.post('/register', async (req, res) => {
  const { email, fcmToken } = req.body;
  console.log(email);
  try {
    await db.query(
      'INSERT INTO users (email, fcm_token) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET fcm_token = $2',
      [ email, fcmToken ]
    );
    res.send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

app.listen(port, async () => {
  console.log(`1 - server listening on port ${port}`);
  try {
      await db.connect();
      console.log("2 - connection to the database was successful");
  } catch (error) {
      console.log(error);
  }
});
