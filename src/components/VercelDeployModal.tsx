import React from 'react';
import { X, CloudUpload, Check, ArrowRight, Terminal, Globe, Shield } from 'lucide-react';

interface VercelDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployModal: React.FC<VercelDeployModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="vercel-deploy-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="vercel-deploy-modal-dialog"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="btn-close-vercel-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-white text-black font-black flex items-center justify-center">
            ▲
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Vercel 원클릭 배포 가이드</h3>
            <p className="text-xs text-slate-400">Vercel 호스팅에 최적화된 Vite SPA 구조입니다</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">1</span>
              <span>GitHub 저장소 생성 및 코드 푸시</span>
            </div>
            <div className="bg-black/50 p-2.5 rounded font-mono text-[11px] text-slate-200 space-y-1">
              <p className="text-slate-400"># 로컬에서 깃 초기화 및 푸시</p>
              <p>git init</p>
              <p>git add .</p>
              <p>git commit -m "feat: real-time weather mockup dashboard"</p>
              <p>git branch -M main</p>
              <p>git push -u origin main</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">2</span>
              <span>Vercel에서 프로젝트 가져오기 (Import)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <a href="https://vercel.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-medium">vercel.com/new</a>에 접속하여 해당 GitHub 레포지토리를 선택하세요.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Framework Preset</span>
                <span className="text-emerald-400 font-semibold">Vite (자동 인식)</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Build Command</span>
                <span className="text-emerald-400 font-mono">npm run build</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]">3</span>
              <span>환경 변수 (Environment Variables) 등록</span>
            </div>
            <p className="text-slate-300">
              OpenWeatherMap API 키를 사용하시는 경우 Vercel 환경 변수에 등록합니다:
            </p>
            <div className="p-2 rounded bg-black/50 border border-slate-800 font-mono text-[11px] text-amber-300">
              VITE_OPENWEATHER_API_KEY = &lt;본인의_API_키&gt;
            </div>
            <p className="text-[11px] text-slate-400">
              * 키를 등록하지 않아도 기본 탑재된 Open-Meteo 전세계 실시간 API로 100% 정상 작동합니다.
            </p>
          </div>

          {/* Ready to go */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl flex items-center gap-2.5 text-emerald-300">
            <Check className="w-4 h-4 shrink-0" />
            <span className="font-medium">
              Vite 번들이 <code>dist/</code> 디렉토리에 생성되므로 Vercel Edge 네트워크를 통해 초고속으로 전세계에 배포됩니다.
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            id="btn-confirm-vercel-guide"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
