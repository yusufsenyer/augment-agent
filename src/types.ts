import { z } from 'zod';

// Open-Meteo API response şemaları
export const WeatherDataSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number(),
  generationtime_ms: z.number(),
  utc_offset_seconds: z.number(),
  timezone: z.string(),
  timezone_abbreviation: z.string(),
  current: z.object({
    time: z.string(),
    interval: z.number(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number(),
    apparent_temperature: z.number(),
    is_day: z.number(),
    precipitation: z.number(),
    rain: z.number(),
    showers: z.number(),
    snowfall: z.number(),
    weather_code: z.number(),
    cloud_cover: z.number(),
    pressure_msl: z.number(),
    surface_pressure: z.number(),
    wind_speed_10m: z.number(),
    wind_direction_10m: z.number(),
    wind_gusts_10m: z.number()
  }).optional(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: z.array(z.number()),
    relative_humidity_2m: z.array(z.number()),
    precipitation_probability: z.array(z.number()),
    precipitation: z.array(z.number()),
    weather_code: z.array(z.number()),
    wind_speed_10m: z.array(z.number()),
    wind_direction_10m: z.array(z.number())
  }).optional(),
  daily: z.object({
    time: z.array(z.string()),
    weather_code: z.array(z.number()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()),
    rain_sum: z.array(z.number()),
    snowfall_sum: z.array(z.number()),
    precipitation_hours: z.array(z.number()),
    precipitation_probability_max: z.array(z.number()),
    wind_speed_10m_max: z.array(z.number()),
    wind_gusts_10m_max: z.array(z.number()),
    wind_direction_10m_dominant: z.array(z.number()),
    shortwave_radiation_sum: z.array(z.number())
  }).optional()
});

export type WeatherData = z.infer<typeof WeatherDataSchema>;

// Hava durumu kodu açıklamaları
export const WEATHER_CODES: Record<number, string> = {
  0: 'Açık gökyüzü',
  1: 'Çoğunlukla açık',
  2: 'Parçalı bulutlu',
  3: 'Kapalı',
  45: 'Sis',
  48: 'Dondurucu sis',
  51: 'Hafif çisenti',
  53: 'Orta çisenti',
  55: 'Yoğun çisenti',
  56: 'Hafif dondurucu çisenti',
  57: 'Yoğun dondurucu çisenti',
  61: 'Hafif yağmur',
  63: 'Orta yağmur',
  65: 'Şiddetli yağmur',
  66: 'Hafif dondurucu yağmur',
  67: 'Şiddetli dondurucu yağmur',
  71: 'Hafif kar yağışı',
  73: 'Orta kar yağışı',
  75: 'Şiddetli kar yağışı',
  77: 'Kar taneleri',
  80: 'Hafif sağanak',
  81: 'Orta sağanak',
  82: 'Şiddetli sağanak',
  85: 'Hafif kar sağanağı',
  86: 'Şiddetli kar sağanağı',
  95: 'Gök gürültülü fırtına',
  96: 'Hafif dolu ile gök gürültülü fırtına',
  99: 'Şiddetli dolu ile gök gürültülü fırtına'
};

// Koordinat şeması
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

// Şehir bilgileri
export interface CityInfo {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Türkiye'nin başlıca şehirleri
export const TURKISH_CITIES: Record<string, CityInfo> = {
  'istanbul': { name: 'İstanbul', country: 'Türkiye', latitude: 41.0082, longitude: 28.9784 },
  'ankara': { name: 'Ankara', country: 'Türkiye', latitude: 39.9334, longitude: 32.8597 },
  'izmir': { name: 'İzmir', country: 'Türkiye', latitude: 38.4192, longitude: 27.1287 },
  'bursa': { name: 'Bursa', country: 'Türkiye', latitude: 40.1826, longitude: 29.0665 },
  'antalya': { name: 'Antalya', country: 'Türkiye', latitude: 36.8969, longitude: 30.7133 },
  'adana': { name: 'Adana', country: 'Türkiye', latitude: 37.0000, longitude: 35.3213 },
  'konya': { name: 'Konya', country: 'Türkiye', latitude: 37.8667, longitude: 32.4833 },
  'gaziantep': { name: 'Gaziantep', country: 'Türkiye', latitude: 37.0662, longitude: 37.3833 },
  'kayseri': { name: 'Kayseri', country: 'Türkiye', latitude: 38.7312, longitude: 35.4787 },
  'trabzon': { name: 'Trabzon', country: 'Türkiye', latitude: 41.0015, longitude: 39.7178 }
};
