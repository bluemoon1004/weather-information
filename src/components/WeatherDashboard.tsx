import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  RefreshCw,
  Compass,
  Droplets,
  Wind,
  Sun,
  Eye,
  Gauge,
  Shirt,
  Umbrella,
  Car,
  Activity,
  Check,
  ChevronRight,
  Sparkles,
  Settings,
  HelpCircle,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { CityLocation, TempUnit, WeatherData } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { POPULAR_CITIES, calculateLifestyle, formatKoreanDate, parseWmoCode } from '../services/weatherUtils';
import { getWeatherData, reverseGeocode, searchCities } from '../services/weatherApi';

interface WeatherDashboardProps {
  onOpenApiSettings: () => void;
  onOpenVercelDeploy: () => void;
  isMockupView?: boolean;
}

export const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  onOpenApiSettings,
  onOpenVercelDeploy,
  isMockupView = true,
}) => {
  const [selectedCity, setSelectedCity] = useState<CityLocation>(POPULAR_CITIES[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<TempUnit>('celsius');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<CityLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [favoriteCities, setFavoriteCities] = useState<CityLocation[]>(() => {
    try {
      const saved = localStorage.getItem('weather_fav_cities');
      return saved ? JSON.parse(saved) : [POPULAR_CITIES[0], POPULAR_CITIES[1], POPULAR_CITIES[2]];
    } catch {
      return [POPULAR_CITIES[0], POPULAR_CITIES[1], POPULAR_CITIES[2]];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Convert temperature helper
  const displayTemp = (celsius: number): string => {
    if (tempUnit === 'fahrenheit') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  const displayTempNum = (celsius: number): number => {
    if (tempUnit === 'fahrenheit') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  // Fetch weather for selected city
  const loadWeather = async (city: CityLocation) => {
    setLoading(true);
    try {
      const data = await getWeatherData(city);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to load weather data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
      setShowSearchDropdown(true);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Current GPS Location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('사용자의 브라우저에서 위치 정보를 지원하지 않습니다.');
      return;
    }

    setRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const detectedCity = await reverseGeocode(lat, lon);
          setSelectedCity(detectedCity);
        } catch (err) {
          console.error(err);
        }
      },
      (err) => {
        console.warn('GPS location access denied or timed out:', err);
        setRefreshing(false);
        // Inform user gently
        alert('위치 권한을 허용하시면 현재 위치의 실시간 날씨를 바로 조회할 수 있습니다.');
      },
      { timeout: 8000 }
    );
  };

  // Toggle favorite
  const isFavorite = favoriteCities.some((c) => c.name === selectedCity.name);
  const toggleFavorite = () => {
    let updated: CityLocation[];
    if (isFavorite) {
      updated = favoriteCities.filter((c) => c.name !== selectedCity.name);
    } else {
      updated = [selectedCity, ...favoriteCities.slice(0, 5)];
    }
    setFavoriteCities(updated);
    try {
      localStorage.setItem('weather_fav_cities', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const lifestyle = weatherData
    ? calculateLifestyle(
        weatherData.current.temperature,
        weatherData.current.conditionText,
        weatherData.current.precipitationProbability,
        weatherData.current.uvIndex,
        weatherData.current.windSpeed
      )
    : null;

  const currentConditionMeta = weatherData
    ? parseWmoCode(weatherData.current.weatherCode, weatherData.current.isDay)
    : null;

  const bgGradient = currentConditionMeta
    ? weatherData?.current.isDay
      ? currentConditionMeta.bgGradientDay
      : currentConditionMeta.bgGradientNight
    : 'from-blue-600 via-sky-600 to-indigo-700';

  return (
    <div id="weather-dashboard-root" className="w-full flex flex-col text-slate-100 select-none">
      {/* Top Search & Controls Bar */}
      <div id="dashboard-header-bar" className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search box with auto-complete */}
          <div ref={searchContainerRef} className="relative flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-city-search"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder="도시명 검색 (예: 서울, 강남, 부산, 제주, Tokyo, Paris...)"
                className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all shadow-inner"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Dropdown search results */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                id="search-dropdown-menu"
                className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-40 max-h-60 overflow-y-auto backdrop-blur-xl"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  검색 결과 ({searchResults.length})
                </div>
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    id={`btn-select-city-${city.id}`}
                    onClick={() => {
                      setSelectedCity(city);
                      setSearchQuery('');
                      setShowSearchDropdown(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-sky-600/20 hover:text-sky-300 flex items-center justify-between border-b border-slate-800/60 last:border-b-0 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-xs sm:text-sm text-white">{city.name}</span>
                      <span className="ml-2 text-[11px] text-slate-400">
                        {city.admin1 ? `${city.admin1}, ` : ''}
                        {city.country}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* GPS Location button */}
            <button
              id="btn-gps-location"
              onClick={handleCurrentLocation}
              title="현재 내 위치 날씨 불러오기"
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-sky-400 hover:text-sky-300 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">내 위치</span>
            </button>

            {/* Favorite toggle */}
            <button
              id="btn-toggle-favorite"
              onClick={toggleFavorite}
              title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
              }`}
            >
              {isFavorite ? <BookmarkCheck className="w-4 h-4 fill-amber-400/20" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Temp Unit Switcher (°C / °F) */}
            <button
              id="btn-toggle-temp-unit"
              onClick={() => setTempUnit((u) => (u === 'celsius' ? 'fahrenheit' : 'celsius'))}
              className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-colors"
              title="섭씨/화씨 변경"
            >
              {tempUnit === 'celsius' ? '°C' : '°F'}
            </button>

            {/* Refresh */}
            <button
              id="btn-refresh-weather"
              onClick={() => {
                setRefreshing(true);
                loadWeather(selectedCity);
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="실시간 날씨 새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing || loading ? 'animate-spin text-sky-400' : ''}`} />
            </button>

            {/* Settings button */}
            <button
              id="btn-open-api-settings"
              onClick={onOpenApiSettings}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
              title="API 키 및 데이터 공급자 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Popular & Favorite Cities Quick Carousel */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar pb-0.5">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-400" />
            빠른 도시:
          </span>
          {POPULAR_CITIES.slice(0, 8).map((city) => {
            const isCurrent = city.name === selectedCity.name;
            return (
              <button
                key={city.id}
                id={`btn-preset-city-${city.id}`}
                onClick={() => setSelectedCity(city)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 whitespace-nowrap ${
                  isCurrent
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {city.name.replace('특별시', '').replace('광역시', '').replace('특별자치도', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-4 sm:p-6 space-y-5">
        {loading && !weatherData ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-10 h-10 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-slate-300">최신 실시간 기상 데이터를 수신하고 있습니다...</p>
          </div>
        ) : weatherData ? (
          <>
            {/* Primary Hero Weather Card */}
            <div
              id="card-hero-weather"
              className={`relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-br ${bgGradient} text-white shadow-xl shadow-slate-950/40 border border-white/20 transition-all duration-500`}
            >
              {/* Subtle background glow pattern */}
              <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10">
                {/* Location and time info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-white/90" />
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{weatherData.city.name}</h2>
                      {weatherData.city.country && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 font-medium">
                          {weatherData.city.country}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80 mt-1">
                      {formatKoreanDate()} · 업데이트 {weatherData.current.updatedAt}
                    </p>
                  </div>

                  {/* Weather Icon Badge */}
                  <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 shadow-lg">
                    <WeatherIcon iconType={weatherData.current.iconType} className="w-10 h-10 text-white drop-shadow" />
                  </div>
                </div>

                {/* Main Temperature & Condition Display */}
                <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-5xl sm:text-7xl font-black tracking-tight drop-shadow-md">
                        {displayTempNum(weatherData.current.temperature)}
                      </span>
                      <span className="text-2xl sm:text-3xl font-light ml-1 text-white/80">
                        {tempUnit === 'celsius' ? '°C' : '°F'}
                      </span>
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-white/95 mt-1 flex items-center gap-2">
                      <span>{weatherData.current.conditionText}</span>
                      <span className="text-xs text-white/70 font-normal">
                        (체감 {displayTemp(weatherData.current.feelsLike)})
                      </span>
                    </div>
                  </div>

                  {/* Min / Max & Rain probability */}
                  <div className="text-right space-y-1">
                    <div className="text-xs sm:text-sm font-medium bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/15 inline-block">
                      <span>최저 {displayTemp(weatherData.current.tempMin)}</span>
                      <span className="mx-1.5 text-white/50">/</span>
                      <span>최고 {displayTemp(weatherData.current.tempMax)}</span>
                    </div>
                    <div className="text-[11px] text-white/80 flex items-center justify-end gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-200" />
                      <span>강수확률 {weatherData.current.precipitationProbability}%</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-2">
                  {/* Air Quality Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span>미세먼지 {weatherData.airQuality.statusText}</span>
                    <span className="text-white/70 font-normal">({weatherData.airQuality.pm25} µg/m³)</span>
                  </div>

                  {/* UV Index Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                    <Sun className="w-3.5 h-3.5 text-amber-200" />
                    <span>자외선 {weatherData.current.uvIndex}</span>
                  </div>

                  {/* Wind Badge */}
                  <div className="px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                    <Wind className="w-3.5 h-3.5 text-sky-200" />
                    <span>바람 {weatherData.current.windSpeed} m/s</span>
                  </div>

                  {/* Source indicator */}
                  <div className="ml-auto text-[10px] text-white/60 font-mono">
                    데이터: {weatherData.source === 'openweather' ? 'OpenWeatherMap' : 'Open-Meteo 실시간'}
                  </div>
                </div>
              </div>
            </div>

            {/* 24-Hour Hourly Forecast Carousel */}
            <div id="card-hourly-forecast" className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>24시간 시간별 기상 예보</span>
                </h3>
                <span className="text-[11px] text-slate-400">좌우로 스크롤하여 확인</span>
              </div>

              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-1 px-1">
                {weatherData.hourly.map((hour, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-between min-w-[70px] sm:min-w-[78px] p-3 rounded-xl border transition-all ${
                      hour.isCurrentHour
                        ? 'bg-sky-500/20 border-sky-500/50 shadow-md shadow-sky-500/20'
                        : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-slate-300">
                      {hour.isCurrentHour ? '현재' : hour.time}
                    </span>
                    <div className="my-2.5">
                      <WeatherIcon iconType={hour.iconType} className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-white">{displayTemp(hour.temperature)}</span>

                    {/* Rain probability chip */}
                    <div className="mt-2 text-[10px] text-sky-400 font-semibold flex items-center gap-0.5">
                      <Droplets className="w-2.5 h-2.5" />
                      <span>{hour.precipitationProbability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-Day Weekly Forecast & Lifestyle Recommendations in 2-Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* 7-Day Outlook (7 Cols on desktop) */}
              <div
                id="card-weekly-forecast"
                className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 mb-3.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>7일간 주간 예보</span>
                  </h3>

                  <div className="space-y-2.5">
                    {weatherData.daily.map((day, idx) => {
                      const min = day.tempMin;
                      const max = day.tempMax;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-900/80 transition-colors"
                        >
                          <div className="w-16 text-xs font-semibold text-slate-200">
                            {day.dayLabel}
                          </div>

                          <div className="flex items-center gap-2 w-28">
                            <WeatherIcon iconType={day.iconType} className="w-5 h-5 shrink-0" />
                            <span className="text-xs text-slate-300 truncate">{day.conditionText}</span>
                          </div>

                          {/* Rain chance */}
                          <div className="w-14 text-[11px] text-sky-400 font-medium flex items-center gap-1">
                            {day.precipitationProbability > 0 ? (
                              <>
                                <Droplets className="w-3 h-3 text-sky-400" />
                                <span>{day.precipitationProbability}%</span>
                              </>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </div>

                          {/* Min and Max Range Bar */}
                          <div className="flex items-center gap-2 flex-1 max-w-[130px] justify-end">
                            <span className="text-xs text-slate-400 font-mono w-7 text-right">{displayTempNum(min)}°</span>
                            <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-sky-400 to-amber-400 rounded-full"
                                style={{ width: '100%' }}
                              />
                            </div>
                            <span className="text-xs text-white font-mono w-7">{displayTempNum(max)}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sun Position */}
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">일출</span>
                    <span>{weatherData.current.sunrise}</span>
                  </div>
                  <div className="h-3 w-[1px] bg-slate-700" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-orange-400 font-bold">일몰</span>
                    <span>{weatherData.current.sunset}</span>
                  </div>
                </div>
              </div>

              {/* Lifestyle & Outfit Advisory (5 Cols on desktop) */}
              <div
                id="card-lifestyle-advisor"
                className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-purple-400" />
                    <span>스마트 생활 기상 & 옷차림 추천</span>
                  </h3>
                </div>

                {lifestyle && (
                  <div className="space-y-3">
                    {/* Outfit Card */}
                    <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-purple-300">
                        <Shirt className="w-4 h-4" />
                        <span>오늘의 맞춤 옷차림</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed text-xs">{lifestyle.outfitRecommendation.summary}</p>
                      <div className="space-y-1 pt-1 text-[11px] text-slate-300 font-medium">
                        <div>
                          <span className="text-purple-300">상의/하의: </span>
                          <span>{lifestyle.outfitRecommendation.top} + {lifestyle.outfitRecommendation.bottom}</span>
                        </div>
                        {lifestyle.outfitRecommendation.outer && (
                          <div>
                            <span className="text-purple-300">추천 외투: </span>
                            <span>{lifestyle.outfitRecommendation.outer}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Umbrella Indicator */}
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Umbrella className={`w-4 h-4 ${lifestyle.umbrellaNeeded ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span className="font-semibold text-slate-200">우산 지참 지수</span>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          lifestyle.umbrellaNeeded
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lifestyle.umbrellaNeeded ? '우산 필수 지참' : '우산 불필요'}
                      </span>
                    </div>

                    {/* Car Wash & Outdoor Index */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <Car className="w-3.5 h-3.5 text-emerald-400" />
                          <span>세차 지수</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-white">{lifestyle.carWashScore.label}</span>
                          <span className="text-[10px] text-slate-400">({lifestyle.carWashScore.score}점)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{lifestyle.carWashScore.text}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                          <Activity className="w-3.5 h-3.5 text-sky-400" />
                          <span>야외 활동</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-white">{lifestyle.outdoorScore.label}</span>
                          <span className="text-[10px] text-slate-400">({lifestyle.outdoorScore.score}점)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{lifestyle.outdoorScore.text}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Weather Metrics 6-Grid */}
            <div id="grid-detailed-metrics" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* 1. Humidity */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>습도</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.current.humidity}%</div>
                <div className="text-[10px] text-slate-400">
                  {weatherData.current.humidity > 70 ? '다소 습함' : weatherData.current.humidity < 35 ? '건조함' : '쾌적'}
                </div>
              </div>

              {/* 2. Wind */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Wind className="w-3.5 h-3.5 text-teal-400" />
                  <span>바람</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.current.windSpeed} m/s</div>
                <div className="text-[10px] text-slate-400">
                  풍향 {weatherData.current.windDirection}°
                </div>
              </div>

              {/* 3. UV Index */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>자외선</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.current.uvIndex}</div>
                <div className="text-[10px] text-slate-400">
                  {weatherData.current.uvIndex >= 6 ? '자외선 주의' : '안전 수준'}
                </div>
              </div>

              {/* 4. Air Quality (PM2.5) */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>초미세먼지</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.airQuality.pm25} <span className="text-xs font-normal text-slate-400">µg</span></div>
                <div className={`text-[10px] font-semibold ${weatherData.airQuality.color}`}>
                  {weatherData.airQuality.statusText}
                </div>
              </div>

              {/* 5. Pressure */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                  <span>기압</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.current.pressure} <span className="text-xs font-normal text-slate-400">hPa</span></div>
                <div className="text-[10px] text-slate-400">표준 대기압</div>
              </div>

              {/* 6. Visibility */}
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 shadow-md backdrop-blur-sm space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>가시거리</span>
                </div>
                <div className="text-xl font-bold text-white">{weatherData.current.visibility} <span className="text-xs font-normal text-slate-400">km</span></div>
                <div className="text-[10px] text-slate-400">시야 확보 양호</div>
              </div>
            </div>

            {/* Bottom Actions footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span>공급: Open-Meteo & OpenWeatherMap</span>
                <span>·</span>
                <button
                  id="btn-footer-open-api"
                  onClick={onOpenApiSettings}
                  className="hover:text-sky-400 underline transition-colors"
                >
                  API 키 설정
                </button>
              </div>

              <button
                id="btn-footer-open-vercel"
                onClick={onOpenVercelDeploy}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>▲ Vercel 배포 가이드</span>
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
