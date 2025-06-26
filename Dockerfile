# Utilise une image officielle Node.js, version 18 stable
FROM node:18

# Crée et place le dossier de travail
WORKDIR /app

# Copie les fichiers package.json et package-lock.json (si présent)
COPY package.json package-lock.json* ./

# Installe les dépendances (Baileys 6.7.18 etc.)
RUN npm install

# Copie le reste des fichiers du projet dans le container
COPY . .

# Expose le port sur lequel ton app écoute (ajuste si besoin)
EXPOSE 3000

# Démarre l’application avec npm start (node server.js)
CMD ["npm", "start"]
