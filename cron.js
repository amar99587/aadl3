const admin = require('firebase-admin');
const axios = require('axios');
const { Pool } = require('pg');

// Firebase setup
const serviceAccount = require("./aadl-3-firebase-adminsdk.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// PostgreSQL setup
const pool = new Pool({
  connectionString: "postgresql://aadl3_user:jxq9LlVDL9B9f9TyhhfMiukZUZLzrP1w@dpg-cq5g4508fa8c7386vpmg-a/aadl3",
  ssl: {
    rejectUnauthorized: false
  }
});

const websiteUrl = 'https://aadl3inscription2024.dz/';

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
    const { rows } = await pool.query('SELECT fcm_token FROM users');
    const tokens = rows.map(row => row.fcm_token);
    
    if (tokens.length === 0) {
      console.log('No users to notify');
      return;
    }

    const response = await admin.messaging().sendMulticast({
      tokens: tokens,
      notification: {
        title: 'AADL Website Status Update',
        body: message
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

  // Close the database connection
  await pool.end();
}

main().catch(console.error);