const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const db = require('./firebase');

async function startSock() {
  // Charge session depuis Firebase Realtime DB
  const sessionRef = db.ref('sessions/thatbotz-session');
  let sessionData = null;
  try {
    const snapshot = await sessionRef.get();
    sessionData = snapshot.exists() ? snapshot.val() : null;
  } catch (err) {
    console.error('Erreur lecture session Firebase:', err);
  }

  // Initialise Baileys avec session récupérée
  const sock = makeWASocket({
    auth: sessionData || undefined,
    printQRInTerminal: true,
  });

  // Écoute changement session pour sauvegarder
  sock.ev.on('creds.update', async (creds) => {
    try {
      await sessionRef.set(sock.authState);
      console.log('Session sauvegardée dans Firebase');
    } catch (err) {
      console.error('Erreur sauvegarde session Firebase:', err);
    }
  });

  // Retourne la socket
  return sock;
}

module.exports = { startSock };
