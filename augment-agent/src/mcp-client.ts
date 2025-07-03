import axios from 'axios';

export interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

export class WeatherMCPClient {
  private readonly mcpServerUrl: string;

  constructor(mcpServerUrl?: string) {
    this.mcpServerUrl = mcpServerUrl || 'https://server.smithery.ai/@yusufsenyer/weather-augment-mcp';
  }

  /**
   * MCP tool çağrısı yap
   */
  async callTool(toolName: string, parameters: Record<string, any>): Promise<MCPResponse> {
    // Farklı endpoint'leri dene
    const endpoints = [
      `${this.mcpServerUrl}/tools/call`,
      `${this.mcpServerUrl}/call`,
      `${this.mcpServerUrl}/mcp/tools/call`,
      `${this.mcpServerUrl}/api/tools/call`
    ];

    let lastError: any;

    for (const endpoint of endpoints) {
      try {
        console.log(`MCP çağrısı: ${endpoint} - ${toolName}`);
        
        const response = await axios.post(endpoint, {
          name: toolName,
          arguments: parameters
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          timeout: 15000 // 15 saniye timeout
        });

        console.log(`MCP başarılı: ${endpoint}`);
        return response.data;
      } catch (error) {
        console.log(`MCP başarısız: ${endpoint}`, error);
        lastError = error;
        continue;
      }
    }

    // Tüm endpoint'ler başarısız - fallback kullan
    console.log('Tüm MCP endpoint\'leri başarısız, fallback kullanılıyor');
    return await this.fallbackCall(toolName, parameters);
  }

  /**
   * Fallback: Doğrudan Open-Meteo API kullan
   */
  private async fallbackCall(toolName: string, parameters: Record<string, any>): Promise<MCPResponse> {
    try {
      switch (toolName) {
        case 'get_weather_by_city':
          return await this.fallbackCurrentWeather(parameters.city);
        case 'get_daily_forecast_by_city':
          return await this.fallbackDailyForecast(parameters.city);
        default:
          throw new Error(`Desteklenmeyen tool: ${toolName}`);
      }
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Fallback hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
        }],
        isError: true
      };
    }
  }

  /**
   * Fallback: Güncel hava durumu
   */
  private async fallbackCurrentWeather(city: string): Promise<MCPResponse> {
    // Geocoding ile şehir bul
    const geocodingResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: city,
        count: 1,
        language: 'tr',
        format: 'json'
      }
    });

    if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
      throw new Error(`${city} şehri bulunamadı`);
    }

    const location = geocodingResponse.data.results[0];
    const { latitude, longitude, name, country } = location;

    // Hava durumu al
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        timezone: 'auto'
      }
    });

    const current = weatherResponse.data.current;
    const weatherCodes: Record<number, string> = {
      0: 'Açık gökyüzü ☀️',
      1: 'Çoğunlukla açık 🌤️',
      2: 'Parçalı bulutlu ⛅',
      3: 'Kapalı ☁️',
      45: 'Sis 🌫️',
      61: 'Hafif yağmur 🌧️',
      63: 'Orta yağmur 🌧️',
      65: 'Şiddetli yağmur ⛈️',
      71: 'Hafif kar ❄️',
      73: 'Orta kar ❄️',
      75: 'Şiddetli kar ❄️',
      95: 'Gök gürültülü fırtına ⛈️'
    };

    const description = weatherCodes[current.weather_code] || 'Bilinmeyen hava durumu';
    const isDay = current.is_day ? 'Gündüz' : 'Gece';

    const weatherText = `🌍 ${name}, ${country}
📍 Koordinat: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°
🕐 Zaman: ${current.time}
🌡️ Sıcaklık: ${Math.round(current.temperature_2m)}°C (Hissedilen: ${Math.round(current.apparent_temperature)}°C)
☁️ Durum: ${description}
💧 Nem: ${current.relative_humidity_2m}%
🌧️ Yağış: ${current.precipitation}mm
💨 Rüzgar: ${Math.round(current.wind_speed_10m)} km/h
☁️ Bulutluluk: ${current.cloud_cover}%
🔽 Basınç: ${Math.round(current.pressure_msl)} hPa
🌅 ${isDay}

🤖 Agent Fallback API (Geocoding + Open-Meteo)`;

    return {
      content: [{
        type: 'text',
        text: weatherText
      }]
    };
  }

  /**
   * Fallback: 7 günlük tahmin
   */
  private async fallbackDailyForecast(city: string): Promise<MCPResponse> {
    // Geocoding ile şehir bul
    const geocodingResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: city,
        count: 1,
        language: 'tr',
        format: 'json'
      }
    });

    if (!geocodingResponse.data.results || geocodingResponse.data.results.length === 0) {
      throw new Error(`${city} şehri bulunamadı`);
    }

    const location = geocodingResponse.data.results[0];
    const { latitude, longitude, name, country } = location;

    // 7 günlük tahmin al
    const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'precipitation_probability_max'
        ].join(','),
        forecast_days: 7,
        timezone: 'auto'
      }
    });

    const daily = weatherResponse.data.daily;
    let result = `📅 ${name}, ${country} - 7 Günlük Tahmin\n📍 Koordinat: ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°\n\n`;

    const weatherCodes: Record<number, string> = {
      0: 'Açık ☀️', 1: 'Az bulutlu 🌤️', 2: 'Parçalı bulutlu ⛅', 3: 'Kapalı ☁️',
      61: 'Hafif yağmur 🌧️', 63: 'Orta yağmur 🌧️', 65: 'Şiddetli yağmur ⛈️',
      71: 'Hafif kar ❄️', 73: 'Orta kar ❄️', 75: 'Şiddetli kar ❄️'
    };

    for (let i = 0; i < daily.time.length; i++) {
      const date = new Date(daily.time[i]).toLocaleDateString('tr-TR', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
      const maxTemp = Math.round(daily.temperature_2m_max[i]);
      const minTemp = Math.round(daily.temperature_2m_min[i]);
      const precipitation = Math.round(daily.precipitation_sum[i]);
      const precipProb = Math.round(daily.precipitation_probability_max[i]);
      const description = weatherCodes[daily.weather_code[i]] || 'Bilinmeyen';

      result += `${date}: ${minTemp}°C-${maxTemp}°C, ${description}, Yağış: ${precipitation}mm (${precipProb}%)\n`;
    }

    result += `\n🤖 Agent Fallback API (Geocoding + Open-Meteo)`;

    return {
      content: [{
        type: 'text',
        text: result
      }]
    };
  }

  /**
   * Güncel hava durumu al
   */
  async getCurrentWeather(city: string): Promise<string> {
    const response = await this.callTool('get_weather_by_city', { city });
    if (response.isError) {
      throw new Error(response.content[0]?.text || 'MCP hatası');
    }
    return response.content[0]?.text || 'Veri alınamadı';
  }

  /**
   * 7 günlük tahmin al
   */
  async getDailyForecast(city: string): Promise<string> {
    const response = await this.callTool('get_daily_forecast_by_city', { city });
    if (response.isError) {
      throw new Error(response.content[0]?.text || 'MCP hatası');
    }
    return response.content[0]?.text || 'Veri alınamadı';
  }
}
