import React, { useState } from 'react';
import { X, Key, CheckCircle, Info, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { getStoredApiKey, saveApiKey } from '../services/weatherApi';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: (key: string) => void;
  currentSource: 'open-meteo' | 'openweather';
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  currentSource,
}) => {
  const [keyInput, setKeyInput] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(keyInput);
    onKeySaved(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleResetToOpenMeteo = () => {
    setKeyInput('');
    saveApiKey('');
    onKeySaved('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      id="api-settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="api-settings-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-api-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">날씨 API 키 설정</h3>
            <p className="text-xs text-slate-400">OpenWeatherMap 또는 Open-Meteo 실시간 연동</p>
          </div>
        </div>

        {/* Current status pill */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">현재 활성 데이터 공급자</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            {currentSource === 'openweather' ? 'OpenWeatherMap API' : 'Open-Meteo 실시간 API (무료/키불필요)'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="openweather-api-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              OpenWeatherMap API Key (선택 사항)
            </label>
            <div className="relative">
              <input
                id="openweather-api-input"
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="예: 3a2b1c0d9e8f7g6h5i4j3k2l1m0n"
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400 flex items-start gap-1">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
              <span>
                API 키를 입력하지 않아도 기본 <strong>Open-Meteo 고정밀 글로벌 API</strong>를 통해 전 세계 실시간 날씨 및 주간 예보가 즉시 작동합니다.
              </span>
            </p>
          </div>

          <div className="p-3.5 bg-blue-950/40 border border-blue-800/40 rounded-xl text-xs text-blue-200/90 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-blue-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Vercel 배포 시 환경 변수 등록 방법</span>
            </div>
            <p className="text-[11px] text-blue-300/80">
              Vercel 대시보드 프로젝트 설정의 <code>Environment Variables</code>에서:
            </p>
            <div className="bg-black/40 p-2 rounded text-[11px] font-mono text-emerald-300 select-all border border-blue-900/50">
              VITE_OPENWEATHER_API_KEY=your_key_here
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>설정이 성공적으로 저장되었습니다!</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              id="btn-reset-openmeteo"
              type="button"
              onClick={handleResetToOpenMeteo}
              className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Open-Meteo로 초기화
            </button>
            <button
              id="btn-save-api-key"
              type="submit"
              className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors"
            >
              적용하기
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <a
            href="https://openweathermap.org/api"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
          >
            <span>OpenWeatherMap 무료 API 키 발급받기</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
