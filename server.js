require('dotenv').config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const baileys = require("./baileys");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("THATBOTZ Backend is Running");
});

app.use("/session", baileys);

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
