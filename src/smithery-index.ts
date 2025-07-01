import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WeatherService } from './weather-service.js';
import { CoordinatesSchema } from './types.js';

// Konfigürasyon şeması - isteğe bağlı
export const configSchema = z.object({
  debug: z.boolean().default(false).describe("Debug loglarını etkinleştir"),
  timezone: z.string().default("Europe/Istanbul").describe("Zaman dilimi ayarı")
});

export default function ({ config }: { config: z.infer<typeof configSchema> }) {
  const server = new McpServer({
    name: 'weather-mcp-server',
    version: '1.0.0'
  });

  const weatherService = new WeatherService();

  // Güncel hava durumu aracı
  server.tool(
    'get_current_weather',
    'Belirtilen koordinatlardaki güncel hava durumu bilgisini getirir',
    {
      latitude: z.number().min(-90).max(90).describe('Enlem (-90 ile 90 arası)'),
      longitude: z.number().min(-180).max(180).describe('Boylam (-180 ile 180 arası)')
    },
    async ({ latitude, longitude }) => {
      try {
        const weather = await weatherService.getCurrentWeather({ latitude, longitude });
        return {
          content: [{ 
            type: 'text', 
            text: formatCurrentWeather(weather, weatherService) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  // Şehir adına göre hava durumu aracı
  server.tool(
    'get_weather_by_city',
    'Şehir adına göre güncel hava durumu bilgisini getirir (Türkiye şehirleri)',
    {
      city: z.string().describe('Şehir adı (örn: istanbul, ankara, izmir)')
    },
    async ({ city }) => {
      try {
        const weather = await weatherService.getWeatherByCity(city);
        return {
          content: [{ 
            type: 'text', 
            text: formatCurrentWeather(weather, weatherService) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  // Saatlik tahmin aracı
  server.tool(
    'get_hourly_forecast',
    'Belirtilen koordinatlarda 24 saatlik hava durumu tahminini getirir',
    {
      latitude: z.number().min(-90).max(90).describe('Enlem (-90 ile 90 arası)'),
      longitude: z.number().min(-180).max(180).describe('Boylam (-180 ile 180 arası)')
    },
    async ({ latitude, longitude }) => {
      try {
        const forecast = await weatherService.getHourlyForecast({ latitude, longitude });
        return {
          content: [{ 
            type: 'text', 
            text: formatHourlyForecast(forecast, weatherService) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  // Günlük tahmin aracı
  server.tool(
    'get_daily_forecast',
    'Belirtilen koordinatlarda 7 günlük hava durumu tahminini getirir',
    {
      latitude: z.number().min(-90).max(90).describe('Enlem (-90 ile 90 arası)'),
      longitude: z.number().min(-180).max(180).describe('Boylam (-180 ile 180 arası)')
    },
    async ({ latitude, longitude }) => {
      try {
        const forecast = await weatherService.getDailyForecast({ latitude, longitude });
        return {
          content: [{ 
            type: 'text', 
            text: formatDailyForecast(forecast, weatherService) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  // Şehir adına göre günlük tahmin aracı
  server.tool(
    'get_daily_forecast_by_city',
    'Şehir adına göre 7 günlük hava durumu tahminini getirir (Türkiye şehirleri)',
    {
      city: z.string().describe('Şehir adı (örn: istanbul, ankara, izmir)')
    },
    async ({ city }) => {
      try {
        const forecast = await weatherService.getDailyForecastByCity(city);
        return {
          content: [{ 
            type: 'text', 
            text: formatDailyForecast(forecast, weatherService) 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  // Desteklenen şehirler aracı
  server.tool(
    'get_supported_cities',
    'Desteklenen Türkiye şehirlerinin listesini getirir',
    {},
    async () => {
      try {
        const cities = weatherService.getSupportedCities();
        return {
          content: [{ 
            type: 'text', 
            text: `Desteklenen şehirler:\n${cities.join(', ')}` 
          }]
        };
      } catch (error) {
        return {
          content: [{ 
            type: 'text', 
            text: `Hata: ${error instanceof Error ? error.message : String(error)}` 
          }],
          isError: true
        };
      }
    }
  );

  return server.server;
}

// Yardımcı fonksiyonlar
function formatCurrentWeather(weather: any, weatherService: WeatherService): string {
  if (!weather.current) {
    return 'Güncel hava durumu verisi bulunamadı.';
  }

  const current = weather.current;
  const description = weatherService.getWeatherDescription(current.weather_code);
  const windDirection = weatherService.getWindDirection(current.wind_direction_10m);
  const isDay = current.is_day ? 'Gündüz' : 'Gece';

  return `🌤️ Güncel Hava Durumu
📍 Konum: ${weather.latitude.toFixed(2)}°, ${weather.longitude.toFixed(2)}°
🕐 Zaman: ${current.time}
🌡️ Sıcaklık: ${current.temperature_2m}°C (Hissedilen: ${current.apparent_temperature}°C)
☁️ Durum: ${description}
💧 Nem: ${current.relative_humidity_2m}%
🌧️ Yağış: ${current.precipitation}mm
💨 Rüzgar: ${current.wind_speed_10m} km/h ${windDirection} yönünden
💨 Rüzgar Hızı (Ani): ${current.wind_gusts_10m} km/h
☁️ Bulutluluk: ${current.cloud_cover}%
🔽 Basınç: ${current.pressure_msl} hPa
🌅 ${isDay}`;
}

function formatHourlyForecast(forecast: any, weatherService: WeatherService): string {
  if (!forecast.hourly) {
    return 'Saatlik tahmin verisi bulunamadı.';
  }

  const hourly = forecast.hourly;
  let result = `📊 24 Saatlik Hava Durumu Tahmini\n📍 Konum: ${forecast.latitude.toFixed(2)}°, ${forecast.longitude.toFixed(2)}°\n\n`;

  for (let i = 0; i < Math.min(24, hourly.time.length); i++) {
    const time = new Date(hourly.time[i]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const temp = hourly.temperature_2m[i];
    const humidity = hourly.relative_humidity_2m[i];
    const precipitation = hourly.precipitation[i];
    const precipProb = hourly.precipitation_probability[i];
    const description = weatherService.getWeatherDescription(hourly.weather_code[i]);

    result += `${time}: ${temp}°C, ${description}, Nem: ${humidity}%, Yağış: ${precipitation}mm (${precipProb}%)\n`;
  }

  return result;
}

function formatDailyForecast(forecast: any, weatherService: WeatherService): string {
  if (!forecast.daily) {
    return 'Günlük tahmin verisi bulunamadı.';
  }

  const daily = forecast.daily;
  let result = `📅 7 Günlük Hava Durumu Tahmini\n📍 Konum: ${forecast.latitude.toFixed(2)}°, ${forecast.longitude.toFixed(2)}°\n\n`;

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i]).toLocaleDateString('tr-TR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const precipitation = daily.precipitation_sum[i];
    const precipProb = daily.precipitation_probability_max[i];
    const description = weatherService.getWeatherDescription(daily.weather_code[i]);
    const windSpeed = daily.wind_speed_10m_max[i];

    result += `${date}:\n`;
    result += `  🌡️ ${minTemp}°C - ${maxTemp}°C\n`;
    result += `  ☁️ ${description}\n`;
    result += `  🌧️ Yağış: ${precipitation}mm (${precipProb}%)\n`;
    result += `  💨 Rüzgar: ${windSpeed} km/h\n\n`;
  }

  return result;
}
