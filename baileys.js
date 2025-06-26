const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require("express");
const qrcode = require("qrcode");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const SESSIONS_DIR = './sessions';

if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR);
}

router.post("/start", async (req, res) => {
  const { number } = req.body;

  if (!number) {
    return res.status(400).json({ error: "Numéro manquant" });
  }

  const sessionId = `THATBOTZ_${number}`;
  const sessionPath = path.join(SESSIONS_DIR, sessionId);

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: require('@whiskeysockets/baileys').pino({ level: 'silent' }),
    browser: ["THATBOTZ", "Chrome", "121.0.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;

    if (qr) {
      const qrImage = await qrcode.toDataURL(qr);
      return res.json({ qr: qrImage });
    }

    if (connection === "open") {
      console.log(`✅ Connexion réussie avec ${number}`);
    }

    if (connection === "close") {
      const shouldReconnect = (update.lastDisconnect?.error instanceof Boom) &&
        (update.lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut);
      console.log("📴 Déconnecté", update.reason, "Reconnexion :", shouldReconnect);
    }
  });
});

module.exports = router;
