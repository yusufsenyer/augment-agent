import axios from 'axios';
import { WeatherData, WeatherDataSchema, Coordinates, WEATHER_CODES, TURKISH_CITIES, CityInfo } from './types.js';

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';

  /**
   * Koordinatlara göre güncel hava durumu bilgisini getirir
   */
  async getCurrentWeather(coordinates: Coordinates): Promise<WeatherData> {
    const url = `${this.baseUrl}/forecast`;
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'is_day',
        'precipitation',
        'rain',
        'showers',
        'snowfall',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'surface_pressure',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m'
      ].join(','),
      timezone: 'Europe/Istanbul'
    };

    try {
      const response = await axios.get(url, { params });
      return WeatherDataSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Hava durumu verisi alınamadı: ${error}`);
    }
  }

  /**
   * Saatlik hava durumu tahminini getirir (24 saat)
   */
  async getHourlyForecast(coordinates: Coordinates): Promise<WeatherData> {
    const url = `${this.baseUrl}/forecast`;
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m'
      ].join(','),
      forecast_hours: 24,
      timezone: 'Europe/Istanbul'
    };

    try {
      const response = await axios.get(url, { params });
      return WeatherDataSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Saatlik tahmin verisi alınamadı: ${error}`);
    }
  }

  /**
   * Günlük hava durumu tahminini getirir (7 gün)
   */
  async getDailyForecast(coordinates: Coordinates): Promise<WeatherData> {
    const url = `${this.baseUrl}/forecast`;
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'rain_sum',
        'snowfall_sum',
        'precipitation_hours',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant',
        'shortwave_radiation_sum'
      ].join(','),
      forecast_days: 7,
      timezone: 'Europe/Istanbul'
    };

    try {
      const response = await axios.get(url, { params });
      return WeatherDataSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Günlük tahmin verisi alınamadı: ${error}`);
    }
  }

  /**
   * Şehir adına göre hava durumu bilgisini getirir
   */
  async getWeatherByCity(cityName: string): Promise<WeatherData> {
    const city = this.findCity(cityName);
    if (!city) {
      throw new Error(`Şehir bulunamadı: ${cityName}. Desteklenen şehirler: ${Object.keys(TURKISH_CITIES).join(', ')}`);
    }

    return this.getCurrentWeather({
      latitude: city.latitude,
      longitude: city.longitude
    });
  }

  /**
   * Şehir adına göre günlük tahmin getirir
   */
  async getDailyForecastByCity(cityName: string): Promise<WeatherData> {
    const city = this.findCity(cityName);
    if (!city) {
      throw new Error(`Şehir bulunamadı: ${cityName}. Desteklenen şehirler: ${Object.keys(TURKISH_CITIES).join(', ')}`);
    }

    return this.getDailyForecast({
      latitude: city.latitude,
      longitude: city.longitude
    });
  }

  /**
   * Hava durumu kodunu açıklamaya çevirir
   */
  getWeatherDescription(code: number): string {
    return WEATHER_CODES[code] || 'Bilinmeyen hava durumu';
  }

  /**
   * Rüzgar yönünü açıklamaya çevirir
   */
  getWindDirection(degrees: number): string {
    const directions = [
      'Kuzey', 'Kuzey-Kuzeydoğu', 'Kuzeydoğu', 'Doğu-Kuzeydoğu',
      'Doğu', 'Doğu-Güneydoğu', 'Güneydoğu', 'Güney-Güneydoğu',
      'Güney', 'Güney-Güneybatı', 'Güneybatı', 'Batı-Güneybatı',
      'Batı', 'Batı-Kuzeybatı', 'Kuzeybatı', 'Kuzey-Kuzeybatı'
    ];
    
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Şehir arama fonksiyonu
   */
  private findCity(cityName: string): CityInfo | null {
    const normalizedName = cityName.toLowerCase()
      .replace('ı', 'i')
      .replace('ğ', 'g')
      .replace('ü', 'u')
      .replace('ş', 's')
      .replace('ö', 'o')
      .replace('ç', 'c');

    return TURKISH_CITIES[normalizedName] || null;
  }

  /**
   * Desteklenen şehirleri listeler
   */
  getSupportedCities(): string[] {
    return Object.keys(TURKISH_CITIES);
  }
}
