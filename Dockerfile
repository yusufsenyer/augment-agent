# Node.js 18 tabanlı resmi image kullan
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci --only=production

# Kaynak kodunu kopyala
COPY . .

# TypeScript'i derle
RUN npm run build

# Port'u expose et
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"]
