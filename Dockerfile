# Utiliser une image officielle Node.js stable
FROM node:18

# Créer et se placer dans le dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json s'il existe
COPY package.json ./
COPY package-lock.json* ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet (y compris .env et firebase-config.json)
COPY . .

# Exposer le port sur lequel le serveur écoute (3000 par défaut)
EXPOSE 3000

# Démarrer l'application avec npm start
CMD ["npm", "start"]
