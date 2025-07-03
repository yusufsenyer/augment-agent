# Augment Weather Agent 🤖

Hava durumu MCP server'ını kullanan akıllı agent. Kullanıcıların doğal dilde hava durumu sorularını yanıtlar.

## Özellikler

- 🌍 **Dünya çapında hava durumu** - Herhangi bir şehrin hava durumunu öğrenin
- 📅 **7 günlük tahmin** - Gelecek hafta için hava durumu tahmini
- 🤖 **Doğal dil işleme** - "İstanbul'da yarın yağmur yağacak mı?" gibi sorular
- 🔄 **MCP entegrasyonu** - Weather MCP server'ını kullanır
- 🌐 **REST API** - HTTP endpoint'leri ile kolay entegrasyon
- 🇹🇷 **Türkçe destek** - Tam Türkçe arayüz ve yanıtlar

## API Endpoints

### 💬 Chat Endpoint
```bash
POST /chat
{
  "message": "İstanbul'un hava durumu nasıl?",
  "sessionId": "user123"
}
```

### 🌤️ Direkt Hava Durumu
```bash
GET /weather/current?city=istanbul
```

### 📅 Direkt 7 Günlük Tahmin
```bash
GET /weather/forecast?city=paris
```

### ℹ️ Diğer Endpoint'ler
- `GET /health` - Sağlık kontrolü
- `GET /info` - Agent bilgileri
- `GET /test` - MCP bağlantı testi
- `DELETE /chat/:sessionId` - Sohbet geçmişi temizle

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Environment dosyası oluştur
cp .env.example .env

# Projeyi derle
npm run build

# Server'ı başlat
npm start

# Geliştirme modu
npm run dev
```

## Environment Variables

```env
# Anthropic API Key (isteğe bağlı - AI yanıtlar için)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# MCP Server URL
MCP_SERVER_URL=https://server.smithery.ai/@yusufsenyer/weather-augment-mcp

# Server Port
PORT=3000
```

## Kullanım Örnekleri

### Chat API
```javascript
const response = await fetch('/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Paris'te yarın hava nasıl olacak?",
    sessionId: "user123"
  })
});

const data = await response.json();
console.log(data.message);
```

### Direkt API
```javascript
// Güncel hava durumu
const weather = await fetch('/weather/current?city=tokyo');
const weatherData = await weather.json();

// 7 günlük tahmin
const forecast = await fetch('/weather/forecast?city=london');
const forecastData = await forecast.json();
```

## Agent Yetenekleri

Agent şu tür soruları anlayabilir:

- "İstanbul'un hava durumu nasıl?"
- "Paris'te yarın yağmur yağacak mı?"
- "Tokyo için 7 günlük tahmin ver"
- "New York'ta sıcaklık kaç derece?"
- "London'da bu hafta hava nasıl?"

## MCP Server Entegrasyonu

Bu agent, deploy edilen Weather MCP server'ını kullanır:
- **MCP Server:** `@yusufsenyer/weather-augment-mcp`
- **Fallback:** Geocoding + Open-Meteo API
- **Desteklenen şehirler:** Dünya çapında tüm şehirler

## Smithery Deployment

Bu agent Smithery platformunda deploy edilebilir:

1. GitHub repository'sini oluşturun
2. Kodu push edin
3. Smithery'de deploy edin
4. Mobil uygulamaya entegre edin

## Mobil Uygulama Entegrasyonu

Deploy edildikten sonra mobil uygulamada kullanım:

```javascript
const agentResponse = await fetch('https://your-agent-url/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    sessionId: userId
  })
});
```

## Geliştirici

Yusuf Senyer

## Lisans

MIT
