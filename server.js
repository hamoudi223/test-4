require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 👉 Sert les fichiers frontend dans le dossier public
app.use(express.static("public"));

// 👉 Connecte les routes de Baileys
const baileys = require("./baileys");
app.use("/session", baileys);

// ❌ SUPPRIME la route GET "/" inutile
// app.get("/", (req, res) => {
//   res.send("THATBOTZ Backend is Running");
// });

app.listen(PORT, () => {
  console.log("✅ THATBOTZ Backend lancé sur le port", PORT);
});
