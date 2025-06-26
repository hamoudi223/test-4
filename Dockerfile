# Image officielle Node.js
FROM node:18

# Dossier de travail
WORKDIR /app

# Copie des fichiers nécessaires pour installer les dépendances
COPY package.json ./

# Installation des dépendances
RUN npm install

# Copie de tous les fichiers du projet, y compris firebase-config.json
COPY . .

# Expose le port de ton backend
EXPOSE 3000

# Lancer le serveur
CMD ["npm", "start"]
