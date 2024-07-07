const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// PostgreSQL setup
const pool = new Pool({
  connectionString: "postgresql://aadl3_user:jxq9LlVDL9B9f9TyhhfMiukZUZLzrP1w@dpg-cq5g4508fa8c7386vpmg-a/aadl3",
  ssl: {
    rejectUnauthorized: false
  }
});

// User registration
app.post('/register', async (req, res) => {
  const { email, fcmToken } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (email, fcm_token) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET fcm_token = $2',
      [ email, fcmToken ]
    );
    res.send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
