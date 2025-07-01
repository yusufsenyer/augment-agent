# Hava Durumu MCP Server

Open-Meteo API kullanarak hava durumu verilerini sağlayan Model Context Protocol (MCP) server'ı.

## Özellikler

- 🌤️ Güncel hava durumu bilgisi
- 📊 24 saatlik hava durumu tahmini
- 📅 7 günlük hava durumu tahmini
- 🏙️ Türkiye şehirleri için özel destek
- 🌍 Koordinat tabanlı sorgular
- 🇹🇷 Türkçe arayüz

## Desteklenen Araçlar

### `get_current_weather`
Belirtilen koordinatlardaki güncel hava durumu bilgisini getirir.

**Parametreler:**
- `latitude`: Enlem (-90 ile 90 arası)
- `longitude`: Boylam (-180 ile 180 arası)

### `get_weather_by_city`
Şehir adına göre güncel hava durumu bilgisini getirir.

**Parametreler:**
- `city`: Şehir adı (istanbul, ankara, izmir, vb.)

### `get_hourly_forecast`
24 saatlik hava durumu tahminini getirir.

**Parametreler:**
- `latitude`: Enlem (-90 ile 90 arası)
- `longitude`: Boylam (-180 ile 180 arası)

### `get_daily_forecast`
7 günlük hava durumu tahminini getirir.

**Parametreler:**
- `latitude`: Enlem (-90 ile 90 arası)
- `longitude`: Boylam (-180 ile 180 arası)

### `get_daily_forecast_by_city`
Şehir adına göre 7 günlük hava durumu tahminini getirir.

**Parametreler:**
- `city`: Şehir adı (istanbul, ankara, izmir, vb.)

### `get_supported_cities`
Desteklenen şehirlerin listesini getirir.

## Desteklenen Şehirler

- İstanbul
- Ankara
- İzmir
- Bursa
- Antalya
- Adana
- Konya
- Gaziantep
- Kayseri
- Trabzon

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Projeyi derle
npm run build

# Server'ı başlat
npm start

# Geliştirme modu
npm run dev
```

## Kullanım

Bu MCP server'ı Claude Desktop veya diğer MCP uyumlu uygulamalarla kullanılabilir.

### Claude Desktop Konfigürasyonu

`claude_desktop_config.json` dosyanıza ekleyin:

```json
{
  "mcpServers": {
    "weather": {
      "command": "node",
      "args": ["path/to/weather-mcp-server/dist/index.js"]
    }
  }
}
```

## API Kaynağı

Bu proje [Open-Meteo](https://open-meteo.com/) API'sini kullanmaktadır. Open-Meteo ücretsiz, açık kaynak bir hava durumu API'sidir.

## Lisans

MIT

## Smithery Deployment

Bu MCP server Smithery platformunda deploy edilebilir:

1. GitHub repository'sini oluşturun
2. Kodu GitHub'a push edin
3. [Smithery.ai](https://smithery.ai) hesabınızla giriş yapın
4. "Deploy" butonuna tıklayın ve GitHub repository'sini seçin
5. Smithery otomatik olarak build ve deploy işlemini gerçekleştirecek

### Smithery URL
Deploy edildikten sonra MCP server şu şekilde kullanılabilir:
```
https://server.smithery.ai/@username/weather-mcp-server
```

## Mobil Uygulama

Bu proje ayrıca React Native/Expo ile geliştirilmiş basit bir mobil uygulama içerir:

```bash
cd weather-mobile-app
npm run web    # Web versiyonu için
npm run android # Android için (Android Studio gerekli)
npm run ios    # iOS için (macOS gerekli)
```

## Geliştirici

Yusuf Senyer
