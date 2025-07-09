// C:\Users\gelay\Downloads\cartify-app\admin\scripts\makeFirstAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Path to your downloaded key

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore(); // Get Firestore instance if you also want to update user doc

// IMPORTANT: Replace this with the email of the user you want to make an admin
const targetEmail = 'admin@example.com'; // <--- REPLACE THIS EMAIL

async function makeAdmin() {
  try {
    // 1. Get the user record by email
    const user = await admin.auth().getUserByEmail(targetEmail);
    console.log(`Found user: ${user.uid} with email ${user.email}`);

    // 2. Set the custom claim 'admin: true' for this user
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set custom claim 'admin: true' for ${targetEmail}`);

    // 3. (Optional but Recommended) Update the user's Firestore document to reflect admin status
    // This is useful for querying or displaying admin status in your UI
    await db.collection('Users').doc(user.uid).set({
      isAdmin: true,
      lastAdminUpdate: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`Updated Firestore user document for ${targetEmail}`);

  } catch (error) {
    console.error(`Error making ${targetEmail} admin:`, error);
    if (error.code === 'auth/user-not-found') {
      console.error('ACTION REQUIRED: The user account does not exist in Firebase Authentication.');
      console.error('Please create this user in Firebase Console > Authentication > Users first.');
    }
  }
}

makeAdmin();