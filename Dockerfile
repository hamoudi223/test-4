# Étape 1 : Utilise une image Node officielle
FROM node:18

# Étape 2 : Crée et positionne dans le dossier de travail
WORKDIR /app

# Étape 3 : Copie les fichiers nécessaires
COPY package*.json ./
COPY . .

# Étape 4 : Installe les dépendances
RUN npm install

# Étape 5 : Expose le port (Koyeb détectera automatiquement)
EXPOSE 3000

# Étape 6 : Lance le serveur
CMD ["node", "server.js"]
