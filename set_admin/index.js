// set-admin-script/index.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Path to your downloaded service account key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// --- IMPORTANT: REPLACE THIS WITH THE ACTUAL UID OF YOUR ADMIN USER ---
// You found this UID in the Firebase Authentication -> Users tab,
// e.g., 'WOXKSjlOHyMRq2UDBZkcne8...' from your screenshot.
const ADMIN_USER_UID = 'W0XktSl0HvMRq2lUDBzRcne8zXB3'; // <--- PASTE YOUR ADMIN USER'S UID HERE!

async function setAdminClaim() {
  try {
    await admin.auth().setCustomUserClaims(ADMIN_USER_UID, { admin: true });
    console.log(`Custom claim 'admin: true' set for user ${ADMIN_USER_UID}`);
    console.log('User needs to log out and log back in to their Admin app for claims to take effect.');
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
  // Exit the process after execution
  process.exit(0);
}

setAdminClaim();