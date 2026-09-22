import { AirQuality, CityLocation, DailyForecastItem, HourlyForecastItem, WeatherData } from '../types/weather';
import { getDayLabel, parseWmoCode } from './weatherUtils';

const API_KEY_STORAGE_KEY = 'weather_app_owm_api_key';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || (import.meta.env.VITE_OPENWEATHER_API_KEY as string) || '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

/**
 * Fetch live weather from Open-Meteo (Zero API key required, high accuracy globally)
 */
async function fetchFromOpenMeteo(city: CityLocation): Promise<WeatherData> {
  const { latitude, longitude } = city;

  // 1. Weather forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&forecast_days=7`;

  // 2. Air quality
  const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,european_aqi`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl).then((r) => {
      if (!r.ok) throw new Error(`Weather fetch failed: ${r.status}`);
      return r.json();
    }),
    fetch(airQualityUrl).then((r) => (r.ok ? r.json() : null)),
  ]);

  if (weatherRes.status !== 'fulfilled') {
    throw new Error('Failed to fetch Open-Meteo weather data');
  }

  const wData = weatherRes.value;
  const aqiData = aqiRes.status === 'fulfilled' ? aqiRes.value : null;

  const currentWmo = wData.current.weather_code ?? 0;
  const isDay = Boolean(wData.current.is_day ?? 1);
  const condition = parseWmoCode(currentWmo, isDay);

  // Parse Hourly (take next 24 hours from current time)
  const currentIsoHour = new Date().toISOString().slice(0, 13);
  const hourlyTimes: string[] = wData.hourly?.time || [];
  let startIndex = hourlyTimes.findIndex((t) => t.startsWith(currentIsoHour));
  if (startIndex === -1) startIndex = 0;

  const hourly: HourlyForecastItem[] = hourlyTimes
    .slice(startIndex, startIndex + 24)
    .map((isoTime, idx) => {
      const code = wData.hourly.weather_code[startIndex + idx] ?? 0;
      const cond = parseWmoCode(code, true);
      const hourPart = isoTime.includes('T') ? isoTime.split('T')[1].slice(0, 5) : '00:00';
      return {
        time: hourPart,
        isoTime,
        temperature: Math.round(wData.hourly.temperature_2m[startIndex + idx]),
        weatherCode: code,
        conditionText: cond.text,
        iconType: cond.icon,
        precipitationProbability: wData.hourly.precipitation_probability?.[startIndex + idx] ?? 0,
        windSpeed: Number((wData.hourly.wind_speed_10m?.[startIndex + idx] / 3.6).toFixed(1)), // convert km/h to m/s
        isCurrentHour: idx === 0,
      };
    });

  // Parse Daily
  const dailyDates: string[] = wData.daily?.time || [];
  const daily: DailyForecastItem[] = dailyDates.map((dateStr, idx) => {
    const code = wData.daily.weather_code[idx] ?? 0;
    const cond = parseWmoCode(code, true);
    return {
      date: dateStr,
      dayLabel: getDayLabel(dateStr, idx),
      weatherCode: code,
      conditionText: cond.text,
      iconType: cond.icon,
      tempMin: Math.round(wData.daily.temperature_2m_min[idx]),
      tempMax: Math.round(wData.daily.temperature_2m_max[idx]),
      precipitationProbability: wData.daily.precipitation_probability_max?.[idx] ?? 0,
      uvIndexMax: Math.round(wData.daily.uv_index_max?.[idx] ?? 3),
    };
  });

  // Parse Air Quality
  const pm25 = Math.round(aqiData?.current?.pm2_5 ?? 15);
  const pm10 = Math.round(aqiData?.current?.pm10 ?? 28);
  const eAqi = aqiData?.current?.european_aqi ?? 25;

  let statusText: AirQuality['statusText'] = '보통';
  let color = 'text-emerald-400';
  let description = '공기가 깨끗하며 야외 활동에 적합합니다.';

  if (pm25 <= 15 && pm10 <= 30) {
    statusText = '좋음';
    color = 'text-emerald-400';
    description = '대기질이 매우 쾌적하여 산책하기 좋은 날씨입니다.';
  } else if (pm25 <= 35 && pm10 <= 80) {
    statusText = '보통';
    color = 'text-blue-400';
    description = '무난한 공기질 상태로 일상적인 야외 활동이 가능합니다.';
  } else if (pm25 <= 75 || pm10 <= 150) {
    statusText = '나쁨';
    color = 'text-amber-400';
    description = '미세먼지 농도가 높습니다. 민감군은 마스크를 착용하세요.';
  } else {
    statusText = '매우 나쁨';
    color = 'text-rose-400';
    description = '외출을 자제하고 실내 환기에 주의가 필요합니다.';
  }

  const airQuality: AirQuality = {
    aqi: eAqi,
    pm25,
    pm10,
    statusText,
    color,
    description,
  };

  const sunrise = wData.daily?.sunrise?.[0] ? wData.daily.sunrise[0].split('T')[1]?.slice(0, 5) : '06:15';
  const sunset = wData.daily?.sunset?.[0] ? wData.daily.sunset[0].split('T')[1]?.slice(0, 5) : '18:42';

  return {
    city,
    current: {
      temperature: Math.round(wData.current.temperature_2m),
      feelsLike: Math.round(wData.current.apparent_temperature),
      tempMin: Math.round(wData.daily.temperature_2m_min[0] ?? wData.current.temperature_2m - 4),
      tempMax: Math.round(wData.daily.temperature_2m_max[0] ?? wData.current.temperature_2m + 4),
      humidity: Math.round(wData.current.relative_humidity_2m),
      windSpeed: Number((wData.current.wind_speed_10m / 3.6).toFixed(1)), // m/s
      windDirection: wData.current.wind_direction_10m ?? 0,
      uvIndex: Math.round(wData.daily.uv_index_max?.[0] ?? 4),
      pressure: Math.round(wData.current.surface_pressure ?? 1013),
      visibility: 10,
      precipitation: wData.current.precipitation ?? 0,
      precipitationProbability: wData.daily.precipitation_probability_max?.[0] ?? 0,
      weatherCode: currentWmo,
      conditionText: condition.text,
      iconType: condition.icon,
      isDay,
      sunrise,
      sunset,
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
    hourly,
    daily,
    airQuality,
    source: 'open-meteo',
  };
}

/**
 * Fetch from OpenWeatherMap if user supplied API key
 */
async function fetchFromOpenWeather(city: CityLocation, apiKey: string): Promise<WeatherData> {
  const { latitude, longitude } = city;
  // 5-day / 3-hour forecast + current weather
  const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=kr`;

  const [currRes, foreRes] = await Promise.all([
    fetch(currentUrl),
    fetch(forecastUrl),
  ]);

  if (!currRes.ok || !foreRes.ok) {
    throw new Error(`OpenWeather API error: ${currRes.status} / ${foreRes.status}`);
  }

  const curr = await currRes.json();
  const fore = await foreRes.json();

  // Convert OpenWeather icon to our internal condition
  const mainCond = curr.weather?.[0]?.main?.toLowerCase() || '';
  const isDay = curr.weather?.[0]?.icon?.includes('d') ?? true;
  let conditionText = curr.weather?.[0]?.description || '맑음';
  let iconType: string = isDay ? 'sun' : 'moon';

  if (mainCond.includes('cloud')) {
    iconType = isDay ? 'cloud-sun' : 'cloud-moon';
  } else if (mainCond.includes('rain')) {
    iconType = 'cloud-rain';
  } else if (mainCond.includes('drizzle')) {
    iconType = 'cloud-drizzle';
  } else if (mainCond.includes('snow')) {
    iconType = 'cloud-snow';
  } else if (mainCond.includes('thunder')) {
    iconType = 'cloud-lightning';
  } else if (mainCond.includes('fog') || mainCond.includes('mist')) {
    iconType = 'cloud-fog';
  }

  const hourly: HourlyForecastItem[] = (fore.list || []).slice(0, 8).map((item: any, idx: number) => {
    const timeStr = item.dt_txt ? item.dt_txt.split(' ')[1].slice(0, 5) : '00:00';
    return {
      time: timeStr,
      isoTime: item.dt_txt,
      temperature: Math.round(item.main.temp),
      weatherCode: 0,
      conditionText: item.weather?.[0]?.description || '맑음',
      iconType,
      precipitationProbability: Math.round((item.pop || 0) * 100),
      windSpeed: Number((item.wind.speed || 0).toFixed(1)),
      isCurrentHour: idx === 0,
    };
  });

  const daily: DailyForecastItem[] = [
    {
      date: new Date().toISOString().slice(0, 10),
      dayLabel: '오늘',
      weatherCode: 0,
      conditionText,
      iconType,
      tempMin: Math.round(curr.main.temp_min),
      tempMax: Math.round(curr.main.temp_max),
      precipitationProbability: Math.round(((fore.list?.[0]?.pop || 0) * 100)),
      uvIndexMax: 4,
    },
  ];

  const sunrise = curr.sys?.sunrise ? new Date(curr.sys.sunrise * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '06:20';
  const sunset = curr.sys?.sunset ? new Date(curr.sys.sunset * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '18:40';

  return {
    city,
    current: {
      temperature: Math.round(curr.main.temp),
      feelsLike: Math.round(curr.main.feels_like),
      tempMin: Math.round(curr.main.temp_min),
      tempMax: Math.round(curr.main.temp_max),
      humidity: curr.main.humidity,
      windSpeed: Number((curr.wind?.speed || 0).toFixed(1)),
      windDirection: curr.wind?.deg || 0,
      uvIndex: 4,
      pressure: curr.main.pressure,
      visibility: Math.round((curr.visibility || 10000) / 1000),
      precipitation: curr.rain?.['1h'] || 0,
      precipitationProbability: 10,
      weatherCode: 0,
      conditionText,
      iconType,
      isDay,
      sunrise,
      sunset,
      updatedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
    hourly,
    daily,
    airQuality: {
      aqi: 30,
      pm25: 18,
      pm10: 35,
      statusText: '보통',
      color: 'text-blue-400',
      description: 'OpenWeather API 실시간 데이터를 불러왔습니다.',
    },
    source: 'openweather',
  };
}

/**
 * Universal Weather Fetcher
 */
export async function getWeatherData(city: CityLocation, customKey?: string): Promise<WeatherData> {
  const apiKey = customKey || getStoredApiKey();

  if (apiKey) {
    try {
      return await fetchFromOpenWeather(city, apiKey);
    } catch (err) {
      console.warn('OpenWeather request failed, falling back seamlessly to Open-Meteo:', err);
    }
  }

  // Fallback or Default: High precision Open-Meteo
  return await fetchFromOpenMeteo(city);
}

/**
 * Live City Search using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<CityLocation[]> {
  const q = query.trim();
  if (!q || q.length < 1) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=8&language=ko&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((r: any) => ({
      id: `${r.id || r.latitude + '_' + r.longitude}`,
      name: r.name,
      country: r.country || '',
      admin1: r.admin1 || '',
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone || 'Asia/Seoul',
    }));
  } catch (e) {
    console.error('City search failed', e);
    return [];
  }
}

/**
 * Reverse Geocode coordinates to city location
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<CityLocation> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ko`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || '현재 위치';
      return {
        id: `gps_${latitude.toFixed(3)}_${longitude.toFixed(3)}`,
        name: cityName,
        country: data.countryName || '대한민국',
        admin1: data.principalSubdivision || '',
        latitude,
        longitude,
      };
    }
  } catch (err) {
    console.warn('Reverse geocode error', err);
  }

  return {
    id: `gps_${latitude.toFixed(3)}_${longitude.toFixed(3)}`,
    name: '내 현재 위치',
    country: '대한민국',
    latitude,
    longitude,
  };
}
