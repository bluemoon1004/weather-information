import { CityLocation, LifestyleIndex } from '../types/weather';

export const POPULAR_CITIES: CityLocation[] = [
  { id: 'seoul', name: '서울특별시', country: '대한민국', admin1: '서울', latitude: 37.5665, longitude: 126.978, timezone: 'Asia/Seoul' },
  { id: 'busan', name: '부산광역시', country: '대한민국', admin1: '부산', latitude: 35.1796, longitude: 129.0756, timezone: 'Asia/Seoul' },
  { id: 'jeju', name: '제주특별자치도', country: '대한민국', admin1: '제주', latitude: 33.4996, longitude: 126.5312, timezone: 'Asia/Seoul' },
  { id: 'incheon', name: '인천광역시', country: '대한민국', admin1: '인천', latitude: 37.4563, longitude: 126.7052, timezone: 'Asia/Seoul' },
  { id: 'daegu', name: '대구광역시', country: '대한민국', admin1: '대구', latitude: 35.8714, longitude: 128.6014, timezone: 'Asia/Seoul' },
  { id: 'daejeon', name: '대전광역시', country: '대한민국', admin1: '대전', latitude: 36.3504, longitude: 127.3845, timezone: 'Asia/Seoul' },
  { id: 'gwangju', name: '광주광역시', country: '대한민국', admin1: '광주', latitude: 35.1595, longitude: 126.8526, timezone: 'Asia/Seoul' },
  { id: 'gangneung', name: '강릉시', country: '대한민국', admin1: '강원도', latitude: 37.7519, longitude: 128.8761, timezone: 'Asia/Seoul' },
  { id: 'tokyo', name: '도쿄', country: '일본', admin1: '도쿄', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  { id: 'new_york', name: '뉴욕', country: '미국', admin1: '뉴욕', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { id: 'london', name: '런던', country: '영국', admin1: '잉글랜드', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'paris', name: '파리', country: '프랑스', admin1: '일드프랑스', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
];

export interface WeatherConditionInfo {
  text: string;
  icon: 'sun' | 'moon' | 'cloud-sun' | 'cloud-moon' | 'cloud' | 'cloud-fog' | 'cloud-drizzle' | 'cloud-rain' | 'cloud-snow' | 'cloud-lightning';
  bgGradientDay: string;
  bgGradientNight: string;
}

export function parseWmoCode(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        text: '맑음',
        icon: isDay ? 'sun' : 'moon',
        bgGradientDay: 'from-sky-400 via-blue-500 to-indigo-600',
        bgGradientNight: 'from-slate-900 via-indigo-950 to-slate-900',
      };
    case 1:
      return {
        text: '대체로 맑음',
        icon: isDay ? 'cloud-sun' : 'cloud-moon',
        bgGradientDay: 'from-sky-400 via-blue-500 to-cyan-600',
        bgGradientNight: 'from-slate-900 via-blue-950 to-slate-900',
      };
    case 2:
      return {
        text: '구름 조금',
        icon: isDay ? 'cloud-sun' : 'cloud-moon',
        bgGradientDay: 'from-blue-400 via-sky-500 to-indigo-500',
        bgGradientNight: 'from-slate-900 via-indigo-900 to-slate-900',
      };
    case 3:
      return {
        text: '흐림',
        icon: 'cloud',
        bgGradientDay: 'from-slate-500 via-slate-600 to-blue-700',
        bgGradientNight: 'from-slate-900 via-neutral-900 to-slate-900',
      };
    case 45:
    case 48:
      return {
        text: '안개',
        icon: 'cloud-fog',
        bgGradientDay: 'from-stone-400 via-slate-500 to-zinc-600',
        bgGradientNight: 'from-zinc-900 via-slate-900 to-zinc-950',
      };
    case 51:
    case 53:
    case 55:
      return {
        text: '이슬비',
        icon: 'cloud-drizzle',
        bgGradientDay: 'from-slate-500 via-blue-600 to-slate-700',
        bgGradientNight: 'from-slate-900 via-slate-800 to-blue-950',
      };
    case 61:
      return {
        text: '약한 비',
        icon: 'cloud-rain',
        bgGradientDay: 'from-slate-600 via-blue-700 to-indigo-800',
        bgGradientNight: 'from-slate-950 via-blue-950 to-slate-900',
      };
    case 63:
    case 65:
      return {
        text: '비',
        icon: 'cloud-rain',
        bgGradientDay: 'from-blue-700 via-slate-700 to-indigo-900',
        bgGradientNight: 'from-slate-950 via-slate-900 to-blue-950',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        text: '눈',
        icon: 'cloud-snow',
        bgGradientDay: 'from-blue-300 via-indigo-400 to-slate-500',
        bgGradientNight: 'from-slate-900 via-indigo-950 to-slate-900',
      };
    case 80:
    case 81:
    case 82:
      return {
        text: '소나기',
        icon: 'cloud-rain',
        bgGradientDay: 'from-indigo-600 via-slate-700 to-blue-800',
        bgGradientNight: 'from-slate-950 via-indigo-950 to-slate-900',
      };
    case 85:
    case 86:
      return {
        text: '소낙눈',
        icon: 'cloud-snow',
        bgGradientDay: 'from-slate-400 via-blue-500 to-indigo-600',
        bgGradientNight: 'from-slate-900 via-slate-950 to-indigo-950',
      };
    case 95:
    case 96:
    case 99:
      return {
        text: '뇌우 (천둥번개)',
        icon: 'cloud-lightning',
        bgGradientDay: 'from-purple-800 via-slate-800 to-blue-900',
        bgGradientNight: 'from-slate-950 via-purple-950 to-black',
      };
    default:
      return {
        text: '맑음',
        icon: isDay ? 'sun' : 'moon',
        bgGradientDay: 'from-sky-400 via-blue-500 to-indigo-600',
        bgGradientNight: 'from-slate-900 via-indigo-950 to-slate-900',
      };
  }
}

export function calculateLifestyle(
  temperature: number,
  conditionText: string,
  precipitationProb: number,
  uvIndex: number,
  windSpeed: number
): LifestyleIndex {
  const isRainy = conditionText.includes('비') || conditionText.includes('소나기') || precipitationProb >= 40;
  const umbrellaNeeded = isRainy || precipitationProb >= 40;

  // Outfit recommendation based on temperature
  let outfit: LifestyleIndex['outfitRecommendation'];
  if (temperature >= 28) {
    outfit = {
      top: '민소매, 린넨 셔츠, 반팔 티셔츠',
      bottom: '반바지, 얇은 면바지, 치마',
      accessories: ['자외선 차단 선글라스', '양산 또는 모자'],
      summary: '한여름 무더위! 통풍이 잘 되는 시원한 옷차림을 추천합니다.',
    };
  } else if (temperature >= 23) {
    outfit = {
      top: '반팔 티셔츠, 얇은 셔츠',
      bottom: '면바지, 슬랙스, 청바지',
      accessories: ['실내 냉방 대비 얇은 셔츠'],
      summary: '활동하기 쾌적한 날씨입니다. 가벼운 반팔 차림이 적당해요.',
    };
  } else if (temperature >= 20) {
    outfit = {
      top: '긴팔 티셔츠, 얇은 가디건',
      bottom: '청바지, 면바지',
      accessories: ['가벼운 머플러'],
      summary: '선선한 바람이 부는 날씨입니다. 얇은 겉옷을 걸치기 좋아요.',
    };
  } else if (temperature >= 17) {
    outfit = {
      top: '맨투맨, 니트, 셔츠',
      bottom: '청바지, 슬랙스',
      outer: '자켓, 얇은 카디건',
      accessories: ['스카프'],
      summary: '일교차가 있을 수 있으니 가벼운 자켓이나 가디건을 챙기세요.',
    };
  } else if (temperature >= 12) {
    outfit = {
      top: '도톰한 맨투맨, 셔츠와 니트',
      bottom: '청바지, 기모 슬랙스',
      outer: '자켓, 트렌치코트, 야상',
      accessories: ['머플러'],
      summary: '가을/봄 환절기 날씨입니다. 자켓이나 코트로 보온에 신경 쓰세요.',
    };
  } else if (temperature >= 9) {
    outfit = {
      top: '니트, 도톰한 스웨터',
      bottom: '청바지, 기모 바지',
      outer: '트렌치코트, 퀼팅 자켓',
      accessories: ['가죽 장갑, 머플러'],
      summary: '쌀쌀한 기운이 맴돕니다. 도톰한 외투를 착용해 주세요.',
    };
  } else if (temperature >= 5) {
    outfit = {
      top: '기모 스웨터, 히트텍 이너',
      bottom: '기모 팬츠, 울 슬랙스',
      outer: '울 코트, 경량 패딩, 가죽자켓',
      accessories: ['목도리, 기모 양말'],
      summary: '초겨울 추위! 보온성 좋은 코트와 목도리를 꼭 챙기세요.',
    };
  } else {
    outfit = {
      top: '기모 안감 옷, 발열 내의',
      bottom: '방한 팬츠',
      outer: '롱패딩, 두꺼운 다운점퍼',
      accessories: ['방한 목도리', '장갑', '방한모'],
      summary: '강추위 주의! 롱패딩과 방한용품으로 든든하게 무장하세요.',
    };
  }

  // Car wash score
  let carWashScore: LifestyleIndex['carWashScore'];
  if (isRainy || precipitationProb > 30) {
    carWashScore = { score: 20, label: '추천 안 함', text: '비나 눈 예보가 있어 세차를 미루는 것이 좋습니다.' };
  } else if (windSpeed > 8) {
    carWashScore = { score: 50, label: '보통', text: '강한 바람으로 먼지가 묻기 쉬우니 실내 세차를 권장합니다.' };
  } else {
    carWashScore = { score: 95, label: '적합', text: '맑고 건조한 날씨로 세차하기에 아주 좋은 타이밍입니다.' };
  }

  // Outdoor activity score
  let outdoorScore: LifestyleIndex['outdoorScore'];
  if (isRainy) {
    outdoorScore = { score: 30, label: '실내 추천', text: '비 소식이 있으므로 실내 활동이나 박물관 방문을 권장합니다.' };
  } else if (temperature < 0 || temperature > 33) {
    outdoorScore = { score: 45, label: '주의 필요', text: '체온 조절에 주의하며 무리한 야외 운동은 삼가세요.' };
  } else {
    outdoorScore = { score: 90, label: '최고', text: '산책, 조깅, 피크닉 등 야외 활동을 즐기기에 훌륭한 날씨입니다.' };
  }

  // UV protection advice
  let uvAdvice: LifestyleIndex['uvProtection'];
  if (uvIndex >= 8) {
    uvAdvice = { level: '매우 높음', advice: '자외선 차단제 꼼꼼히 도포, 한낮 외출 자제 및 선글라스 필수' };
  } else if (uvIndex >= 6) {
    uvAdvice = { level: '높음', advice: '자외선 차단제(SPF 30+) 사용 및 모자 착용 권장' };
  } else if (uvIndex >= 3) {
    uvAdvice = { level: '보통', advice: '자외선 차단제 바르고 2~3시간마다 덧발라주세요.' };
  } else {
    uvAdvice = { level: '낮음', advice: '자외선 위험이 적어 편안하게 야외활동 가능합니다.' };
  }

  return {
    outfitRecommendation: outfit,
    umbrellaNeeded,
    carWashScore,
    outdoorScore,
    uvProtection: uvAdvice,
  };
}

export function formatTimeHour(isoString: string): string {
  try {
    const d = new Date(isoString);
    const h = d.getHours();
    return `${h.toString().padStart(2, '0')}:00`;
  } catch {
    return '00:00';
  }
}

export function formatKoreanDate(d: Date = new Date()): string {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const dayStr = days[d.getDay()];
  return `${month}월 ${date}일 ${dayStr}`;
}

export function getDayLabel(dateString: string, index: number): string {
  if (index === 0) return '오늘';
  if (index === 1) return '내일';
  try {
    const d = new Date(dateString);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${days[d.getDay()]}요일`;
  } catch {
    return `${index}일 후`;
  }
}
