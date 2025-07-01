#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { WeatherService } from './weather-service.js';
import { CoordinatesSchema, WeatherData } from './types.js';

class WeatherMCPServer {
  private server: Server;
  private weatherService: WeatherService;

  constructor() {
    this.server = new Server(
      {
        name: 'weather-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.weatherService = new WeatherService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // Araçları listele
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_current_weather',
            description: 'Belirtilen koordinatlardaki güncel hava durumu bilgisini getirir',
            inputSchema: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Enlem (-90 ile 90 arası)',
                  minimum: -90,
                  maximum: 90,
                },
                longitude: {
                  type: 'number',
                  description: 'Boylam (-180 ile 180 arası)',
                  minimum: -180,
                  maximum: 180,
                },
              },
              required: ['latitude', 'longitude'],
            },
          },
          {
            name: 'get_weather_by_city',
            description: 'Şehir adına göre güncel hava durumu bilgisini getirir (Türkiye şehirleri)',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: 'Şehir adı (örn: istanbul, ankara, izmir)',
                },
              },
              required: ['city'],
            },
          },
          {
            name: 'get_hourly_forecast',
            description: 'Belirtilen koordinatlarda 24 saatlik hava durumu tahminini getirir',
            inputSchema: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Enlem (-90 ile 90 arası)',
                  minimum: -90,
                  maximum: 90,
                },
                longitude: {
                  type: 'number',
                  description: 'Boylam (-180 ile 180 arası)',
                  minimum: -180,
                  maximum: 180,
                },
              },
              required: ['latitude', 'longitude'],
            },
          },
          {
            name: 'get_daily_forecast',
            description: 'Belirtilen koordinatlarda 7 günlük hava durumu tahminini getirir',
            inputSchema: {
              type: 'object',
              properties: {
                latitude: {
                  type: 'number',
                  description: 'Enlem (-90 ile 90 arası)',
                  minimum: -90,
                  maximum: 90,
                },
                longitude: {
                  type: 'number',
                  description: 'Boylam (-180 ile 180 arası)',
                  minimum: -180,
                  maximum: 180,
                },
              },
              required: ['latitude', 'longitude'],
            },
          },
          {
            name: 'get_daily_forecast_by_city',
            description: 'Şehir adına göre 7 günlük hava durumu tahminini getirir (Türkiye şehirleri)',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: 'Şehir adı (örn: istanbul, ankara, izmir)',
                },
              },
              required: ['city'],
            },
          },
          {
            name: 'get_supported_cities',
            description: 'Desteklenen Türkiye şehirlerinin listesini getirir',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ] as Tool[],
      };
    });

    // Araç çağrılarını işle
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_current_weather': {
            const coordinates = CoordinatesSchema.parse(args);
            const weather = await this.weatherService.getCurrentWeather(coordinates);
            
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatCurrentWeather(weather),
                },
              ],
            };
          }

          case 'get_weather_by_city': {
            const { city } = args as { city: string };
            const weather = await this.weatherService.getWeatherByCity(city);
            
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatCurrentWeather(weather),
                },
              ],
            };
          }

          case 'get_hourly_forecast': {
            const coordinates = CoordinatesSchema.parse(args);
            const forecast = await this.weatherService.getHourlyForecast(coordinates);
            
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatHourlyForecast(forecast),
                },
              ],
            };
          }

          case 'get_daily_forecast': {
            const coordinates = CoordinatesSchema.parse(args);
            const forecast = await this.weatherService.getDailyForecast(coordinates);
            
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatDailyForecast(forecast),
                },
              ],
            };
          }

          case 'get_daily_forecast_by_city': {
            const { city } = args as { city: string };
            const forecast = await this.weatherService.getDailyForecastByCity(city);
            
            return {
              content: [
                {
                  type: 'text',
                  text: this.formatDailyForecast(forecast),
                },
              ],
            };
          }

          case 'get_supported_cities': {
            const cities = this.weatherService.getSupportedCities();
            
            return {
              content: [
                {
                  type: 'text',
                  text: `Desteklenen şehirler:\n${cities.join(', ')}`,
                },
              ],
            };
          }

          default:
            throw new Error(`Bilinmeyen araç: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Hata: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private formatCurrentWeather(weather: WeatherData): string {
    if (!weather.current) {
      return 'Güncel hava durumu verisi bulunamadı.';
    }

    const current = weather.current;
    const description = this.weatherService.getWeatherDescription(current.weather_code);
    const windDirection = this.weatherService.getWindDirection(current.wind_direction_10m);
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

  private formatHourlyForecast(forecast: WeatherData): string {
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
      const description = this.weatherService.getWeatherDescription(hourly.weather_code[i]);

      result += `${time}: ${temp}°C, ${description}, Nem: ${humidity}%, Yağış: ${precipitation}mm (${precipProb}%)\n`;
    }

    return result;
  }

  private formatDailyForecast(forecast: WeatherData): string {
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
      const description = this.weatherService.getWeatherDescription(daily.weather_code[i]);
      const windSpeed = daily.wind_speed_10m_max[i];

      result += `${date}:\n`;
      result += `  🌡️ ${minTemp}°C - ${maxTemp}°C\n`;
      result += `  ☁️ ${description}\n`;
      result += `  🌧️ Yağış: ${precipitation}mm (${precipProb}%)\n`;
      result += `  💨 Rüzgar: ${windSpeed} km/h\n\n`;
    }

    return result;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Hava Durumu MCP Server başlatıldı');
  }
}

const server = new WeatherMCPServer();
server.run().catch(console.error);
