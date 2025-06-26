const express = require('express');
const { startBaileysConnection } = require('./baileys');
const app = express();

let sseClients = [];

app.use(express.static('public')); // dossier frontend statique

// Route SSE pour envoyer le pair code en direct
app.get('/pair-code-stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Fonction pour envoyer un message SSE à tous les clients connectés
function sendPairCodeToClients(code) {
  sseClients.forEach(client => {
    client.write(`data: ${code}\n\n`);
  });
}

// Démarre Baileys et écoute le pair code
startBaileysConnection((pairCode) => {
  console.log('Pair code reçu:', pairCode);
  sendPairCodeToClients(pairCode);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
