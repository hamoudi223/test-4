const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getStorage } = require('firebase-admin/storage');

// 🔐 Initialisation Firebase
const firebaseConfigPath = path.join(__dirname, 'firebase-config.json');
if (fs.existsSync(firebaseConfigPath)) {
  initializeApp({
    credential: applicationDefault(),
    storageBucket: process.env.FIREBASE_BUCKET
  });
} else {
  console.error('⚠️ firebase-config.json introuvable.');
}

const bucket = getStorage().bucket();

async function connectWithPairingCode(phoneNumber) {
  if (!phoneNumber) throw new Error("Numéro manquant");

  const sessionFolder = `./sessions/THATBOTZ_${phoneNumber}`;
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['Makima', 'Chrome', '10.0']
  });

  // Générer code de couplage uniquement si non enregistré
  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(phoneNumber);
    console.log(`✅ Pairing code pour ${phoneNumber} :`, code);

    // Écoute des mises à jour d'identifiants
    sock.ev.on('creds.update', async () => {
      await saveCreds();
      await uploadSessionToFirebase(phoneNumber, sessionFolder);
    });

    return code;
  } else {
    return null;
  }
}

async function uploadSessionToFirebase(phone, sessionPath) {
  const folderFiles = fs.readdirSync(sessionPath);
  for (const file of folderFiles) {
    const filePath = path.join(sessionPath, file);
    const dest = `THATBOTZ_${phone}_auth_info/${file}`;
    await bucket.upload(filePath, {
      destination: dest,
      metadata: {
        contentType: 'application/json'
      }
    });
  }
  console.log(`🗃️ Session de ${phone} uploadée vers Firebase.`);
}

module.exports = { connectWithPairingCode };
