const express = require("express");
const makeWASocket = require("@adiwajshing/baileys").default;
const { useSingleFileAuthState } = require("@adiwajshing/baileys");
const { default: P } = require("pino");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/qr", async (req, res) => {
  const sessionId = req.query.session || "default";
  const filePath = path.join(__dirname, `./auth_info_${sessionId}.json`);
  const { state, saveState } = useSingleFileAuthState(filePath);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: "silent" }),
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, qr } = update;
    if (qr) {
      const qrImage = await QRCode.toDataURL(qr);
      res.send({ qr: qrImage });
    }

    if (connection === "open") {
      console.log("Connected to WhatsApp");
    }
  });

  sock.ev.on("creds.update", saveState);
});

module.exports = router;