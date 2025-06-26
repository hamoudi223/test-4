FROM node:18

WORKDIR /app

# Copie uniquement le fichier package.json
COPY package.json ./

# Exécute npm install pour installer les dépendances
# Cela générera automatiquement le package-lock.json dans le conteneur
RUN npm install

# Copie tous les autres fichiers (baileys, server.js, etc.)
COPY . .

# Expose le port utilisé par l'application
EXPOSE 3000

# Commande pour démarrer ton app
CMD ["npm", "start"]
