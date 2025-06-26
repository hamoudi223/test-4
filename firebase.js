const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,  // ex: https://thatbotz-session-default-rtdb.firebaseio.com
});

const db = admin.database();

module.exports = db;
