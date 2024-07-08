const express = require('express');
const admin = require('firebase-admin');
const cron = require('node-cron');
const dotenv = require("dotenv");
const axios = require('axios');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Firebase setup
admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key,
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
    universe_domain: process.env.universe_domain
  })
});

// PostgreSQL setup
const db = new Pool({
  connectionString: "postgresql://aadl3_user:jxq9LlVDL9B9f9TyhhfMiukZUZLzrP1w@dpg-cq5g4508fa8c7386vpmg-a.frankfurt-postgres.render.com/aadl3",
  ssl: {
    rejectUnauthorized: false
  }
});

const websiteUrl = process.env.websiteUrl || 'https://proecole.com/';

// User registration
app.post('/register', async (req, res) => {
  const { email, fcmToken } = req.body;
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

async function checkWebsiteStatus(url) {
  try {
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function sendNotifications(message) {
  try {
    const { rows } = await db.query('SELECT fcm_token FROM users');
    console.log(rows);
    const tokens = rows.map(row => row.fcm_token);
    
    if (tokens.length === 0) {
      console.log('No users to notify');
      return;
    }

    const response = await admin.messaging().sendMulticast({
      tokens: tokens,
      notification: {
        title: 'AADL Website Status Update',
        body: message,
        click_action: websiteUrl
      },
      data: {
        url: websiteUrl
      }
    });
    console.log('Notifications sent successfully:', response.successCount);
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
}

async function main() {
  console.log('Checking website status...');
  const isOnline = await checkWebsiteStatus(websiteUrl);
  
  if (isOnline) {
    console.log('Website is online. Sending notifications...');
    await sendNotifications('AADL website is now online');
  } else {
    console.log('Website is offline.');
  }
}

// Schedule cron job to run every minute
cron.schedule('* * * * *', async () => {
  try {
    await main();
  } catch (error) {
    console.error('Error in cron job:', error);
  }
});

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await db.connect();
    console.log("Connection to the database was successful");
  } catch (error) {
    console.log(error);
  }
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await db.end();
  process.exit(0);
});
