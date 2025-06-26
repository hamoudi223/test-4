const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { default: P } = require('pino');
const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode');
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');

const { initializeApp, applicationDefault } = require('firebase-admin/app');

// Initialisation Firebase
const firebaseConfig = require('./firebase-config.json');
initializeApp({
  credential: admin.credential.cert(firebaseConfig),
  storageBucket: firebaseConfig.project_id + ".appspot.com"
});
const bucket = getStorage().bucket();

router.post('/generate', async (req, res) => {
  const number = req.body.number;
  if (!number) return res.status(400).json({ error: "Numéro WhatsApp requis" });

  const sessionId = `THATBOTZ_${number.replace(/\D/g, '')}_auth_info`;
  const sessionDir = path.join(__dirname, 'sessions', sessionId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: state,
    browser: ['MakimaBot', 'Chrome', '1.0.0'],
  });

  let qrSent = false;

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;

    if (qr && !qrSent) {
      qrSent = true;

      const qrImage = await qrcode.toDataURL(qr);
      res.json({ qr: qrImage });
    }

    if (connection === 'open') {
      console.log('✅ Connecté à WhatsApp');
      await saveCreds();

      // Zip des fichiers de session
      const zipPath = `${sessionId}.zip`;
      const archiver = require('archiver');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip');

      archive.pipe(output);
      archive.directory(sessionDir, false);
      await archive.finalize();

      output.on('close', async () => {
        // Envoie dans FireBase Storage
        await bucket.upload(zipPath, {
          destination: `sessions/${sessionId}.zip`,
          public: true
        });

        fs.unlinkSync(zipPath); // Nettoyage
        console.log('✅ Session envoyée sur FireBase');
      });
    }

    if (connection === 'close') {
      const reason = update.lastDisconnect?.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        console.log('🔁 Reconnexion...');
        sock.ws.close();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
});

module.exports = router;
