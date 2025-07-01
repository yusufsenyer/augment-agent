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

## Geliştirici

Yusuf Senyer
