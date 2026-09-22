import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Battery,
  Signal,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Palette,
  CloudSun,
} from 'lucide-react';
import { DeviceColor, DeviceType } from '../types/weather';

interface DeviceMockupFrameProps {
  children: React.ReactNode;
  onOpenApiSettings: () => void;
  onOpenVercelDeploy: () => void;
}

export const DeviceMockupFrame: React.FC<DeviceMockupFrameProps> = ({
  children,
  onOpenApiSettings,
  onOpenVercelDeploy,
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('mobile');
  const [deviceColor, setDeviceColor] = useState<DeviceColor>('titanium');
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [batteryLevel] = useState<number>(88);
  const [scale, setScale] = useState<number>(1);
  const [islandExpanded, setIslandExpanded] = useState<boolean>(false);

  // Live status bar time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Bezel color style map
  const getDeviceColors = () => {
    switch (deviceColor) {
      case 'black':
        return {
          outer: 'bg-zinc-900 border-zinc-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]',
          rim: 'border-zinc-800',
          accent: 'bg-zinc-800',
        };
      case 'silver':
        return {
          outer: 'bg-slate-300 border-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]',
          rim: 'border-slate-400',
          accent: 'bg-slate-400',
        };
      case 'titanium':
      default:
        return {
          outer: 'bg-gradient-to-b from-stone-800 via-stone-900 to-zinc-900 border-stone-600/70 shadow-[0_25px_70px_-12px_rgba(0,0,0,0.85)]',
          rim: 'border-stone-700',
          accent: 'bg-stone-700',
        };
    }
  };

  const deviceStyle = getDeviceColors();

  return (
    <div id="mockup-studio-wrapper" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Global Navigation & Mockup Controls Toolbar */}
      <header id="mockup-toolbar" className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 sticky top-0 z-40 backdrop-blur-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* App Title & Mockup Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20">
            <CloudSun className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>날씨 대시보드</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                App Mockup
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">실시간 기상 관측 · 주간 예보 · Vercel 준비 완료</p>
          </div>
        </div>

        {/* Device Switcher & Color Selector */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Device Type Switcher */}
          <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/80">
            <button
              id="btn-mockup-mobile"
              onClick={() => {
                setDeviceType('mobile');
                setScale(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceType === 'mobile'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="스마트폰 목업 뷰 (390 x 844)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">스마트폰</span>
            </button>

            <button
              id="btn-mockup-tablet"
              onClick={() => {
                setDeviceType('tablet');
                setScale(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceType === 'tablet'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="태블릿 목업 뷰 (768 x 960)"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">태블릿</span>
            </button>

            <button
              id="btn-mockup-desktop"
              onClick={() => setDeviceType('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                deviceType === 'desktop'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="전체화면 대시보드 뷰"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">전체화면</span>
            </button>
          </div>

          {/* Color Finish Picker (Visible in Mockup Mode) */}
          {deviceType !== 'desktop' && (
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 bg-slate-800/90 rounded-xl border border-slate-700/80">
              <Palette className="w-3 h-3 text-slate-400 mr-1" />
              <button
                id="btn-color-titanium"
                onClick={() => setDeviceColor('titanium')}
                className={`w-4 h-4 rounded-full bg-stone-500 transition-transform ${
                  deviceColor === 'titanium' ? 'ring-2 ring-sky-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="내추럴 티타늄"
              />
              <button
                id="btn-color-black"
                onClick={() => setDeviceColor('black')}
                className={`w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 transition-transform ${
                  deviceColor === 'black' ? 'ring-2 ring-sky-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="스페이스 블랙"
              />
              <button
                id="btn-color-silver"
                onClick={() => setDeviceColor('silver')}
                className={`w-4 h-4 rounded-full bg-slate-300 transition-transform ${
                  deviceColor === 'silver' ? 'ring-2 ring-sky-400 scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="화이트 실버"
              />
            </div>
          )}

          {/* Zoom controls for mockup view */}
          {deviceType !== 'desktop' && (
            <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 bg-slate-800/90 rounded-xl border border-slate-700/80 text-xs text-slate-300">
              <button
                id="btn-zoom-out"
                onClick={() => setScale((s) => Math.max(0.7, Number((s - 0.1).toFixed(1))))}
                className="p-1 hover:text-white rounded"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-mono text-[11px]">{Math.round(scale * 100)}%</span>
              <button
                id="btn-zoom-in"
                onClick={() => setScale((s) => Math.min(1.2, Number((s + 0.1).toFixed(1))))}
                className="p-1 hover:text-white rounded"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* External Modals CTA */}
          <button
            id="btn-toolbar-api-settings"
            onClick={onOpenApiSettings}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors"
          >
            API 키
          </button>

          <button
            id="btn-toolbar-vercel-guide"
            onClick={onOpenVercelDeploy}
            className="px-2.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
          >
            <span>▲ Vercel 배포</span>
          </button>
        </div>
      </header>

      {/* Main Mockup Staging Canvas */}
      <main className="w-full flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-auto">
        {deviceType === 'desktop' ? (
          /* Fullscreen Desktop Dashboard */
          <div
            id="desktop-dashboard-container"
            className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
          >
            {children}
          </div>
        ) : (
          /* Realistic Device Mockup Frame */
          <div
            id="device-mockup-container"
            className="relative transition-all duration-300"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          >
            {/* Device Hardware Physical Buttons */}
            {deviceType === 'mobile' && (
              <>
                {/* Left Side: Action Button & Volume Buttons */}
                <div className="absolute -left-[5px] top-28 w-[5px] h-9 bg-stone-600 rounded-l-sm" />
                <div className="absolute -left-[5px] top-42 w-[5px] h-12 bg-stone-600 rounded-l-sm" />
                <div className="absolute -left-[5px] top-58 w-[5px] h-12 bg-stone-600 rounded-l-sm" />

                {/* Right Side: Power Button */}
                <div className="absolute -right-[5px] top-36 w-[5px] h-16 bg-stone-600 rounded-r-sm" />
              </>
            )}

            {/* Device Bezel Shell */}
            <div
              className={`p-3 sm:p-3.5 rounded-[48px] sm:rounded-[54px] border-4 ${deviceStyle.outer} ${
                deviceType === 'mobile'
                  ? 'w-[380px] sm:w-[410px] min-h-[820px] max-h-[880px]'
                  : 'w-[720px] sm:w-[780px] min-h-[920px] max-h-[980px]'
              } flex flex-col relative transition-all duration-300`}
            >
              {/* Inner Screen Bezel */}
              <div className="w-full h-full bg-slate-950 rounded-[38px] sm:rounded-[44px] overflow-hidden flex flex-col relative border border-black shadow-inner">
                {/* Smartphone Dynamic Island & Status Bar */}
                <div
                  id="mockup-status-bar"
                  className="w-full px-6 pt-3 pb-2 flex items-center justify-between text-xs text-white z-40 bg-slate-900/90 backdrop-blur-md select-none"
                >
                  {/* Status Bar Left: Time */}
                  <div className="font-semibold tracking-tight text-[13px]">{currentTime}</div>

                  {/* Dynamic Island Pill (Center) */}
                  <div
                    id="mockup-dynamic-island"
                    onClick={() => setIslandExpanded(!islandExpanded)}
                    className={`bg-black cursor-pointer rounded-full flex items-center justify-center transition-all duration-300 border border-white/10 ${
                      islandExpanded
                        ? 'px-4 py-1.5 gap-2 shadow-lg shadow-black/80'
                        : 'w-24 h-6 hover:scale-105'
                    }`}
                    title="다이나믹 아일랜드 클릭"
                  >
                    {islandExpanded ? (
                      <div className="flex items-center gap-2 text-[11px] text-sky-300">
                        <CloudSun className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>실시간 기상 관측 중</span>
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                    )}
                  </div>

                  {/* Status Bar Right: Cellular, Wi-Fi, Battery */}
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <div className="flex items-center gap-0.5">
                      <span className="text-[10px] font-mono">{batteryLevel}%</span>
                      <Battery className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Device Inner Scrollable Viewport */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-slate-950 relative">
                  {children}
                </div>

                {/* iOS Home Indicator Bar at Bottom */}
                <div className="w-full py-2 bg-slate-900/90 backdrop-blur-md flex items-center justify-center select-none z-40">
                  <div className="w-32 h-1 bg-white/40 hover:bg-white/70 transition-colors rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
