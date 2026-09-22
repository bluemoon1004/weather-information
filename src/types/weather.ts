export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type DeviceColor = 'titanium' | 'black' | 'silver';
export type TempUnit = 'celsius' | 'fahrenheit';

export interface CityLocation {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number; // m/s
  windDirection: number; // degrees
  uvIndex: number;
  pressure: number; // hPa
  visibility: number; // km
  precipitation: number; // mm
  precipitationProbability: number; // %
  weatherCode: number;
  conditionText: string;
  iconType: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

export interface HourlyForecastItem {
  time: string; // HH:mm
  isoTime: string;
  temperature: number;
  weatherCode: number;
  conditionText: string;
  iconType: string;
  precipitationProbability: number;
  windSpeed: number;
  isCurrentHour?: boolean;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. 오늘, 내일, 화, 수
  weatherCode: number;
  conditionText: string;
  iconType: string;
  tempMin: number;
  tempMax: number;
  precipitationProbability: number;
  uvIndexMax: number;
}

export interface AirQuality {
  aqi: number; // 1-5 or European AQI
  pm25: number; // ug/m3
  pm10: number; // ug/m3
  statusText: '좋음' | '보통' | '나쁨' | '매우 나쁨';
  color: string;
  description: string;
}

export interface WeatherData {
  city: CityLocation;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  airQuality: AirQuality;
  source: 'open-meteo' | 'openweather';
}

export interface LifestyleIndex {
  outfitRecommendation: {
    top: string;
    bottom: string;
    outer?: string;
    accessories: string[];
    summary: string;
  };
  umbrellaNeeded: boolean;
  carWashScore: { score: number; label: string; text: string };
  outdoorScore: { score: number; label: string; text: string };
  uvProtection: { level: string; advice: string };
}
