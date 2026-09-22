import React from 'react';
import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sparkles,
} from 'lucide-react';

interface WeatherIconProps {
  iconType: string;
  className?: string;
  size?: number;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ iconType, className = 'w-6 h-6', size }) => {
  const iconProps = {
    className,
    size,
    strokeWidth: 2,
  };

  switch (iconType) {
    case 'sun':
      return <Sun {...iconProps} className={`${className} text-amber-400 fill-amber-400/20`} />;
    case 'moon':
      return <Moon {...iconProps} className={`${className} text-indigo-300 fill-indigo-300/20`} />;
    case 'cloud-sun':
      return <CloudSun {...iconProps} className={`${className} text-amber-300`} />;
    case 'cloud-moon':
      return <CloudMoon {...iconProps} className={`${className} text-indigo-300`} />;
    case 'cloud':
      return <Cloud {...iconProps} className={`${className} text-slate-300 fill-slate-300/20`} />;
    case 'cloud-fog':
      return <CloudFog {...iconProps} className={`${className} text-stone-300`} />;
    case 'cloud-drizzle':
      return <CloudDrizzle {...iconProps} className={`${className} text-cyan-300`} />;
    case 'cloud-rain':
      return <CloudRain {...iconProps} className={`${className} text-blue-400 fill-blue-400/20`} />;
    case 'cloud-snow':
      return <CloudSnow {...iconProps} className={`${className} text-sky-200 fill-sky-200/20`} />;
    case 'cloud-lightning':
      return <CloudLightning {...iconProps} className={`${className} text-yellow-400 fill-yellow-400/20`} />;
    default:
      return <Sparkles {...iconProps} className={`${className} text-amber-400`} />;
  }
};
