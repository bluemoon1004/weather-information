import React, { useState } from 'react';
import { DeviceMockupFrame } from './components/DeviceMockupFrame';
import { WeatherDashboard } from './components/WeatherDashboard';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { VercelDeployModal } from './components/VercelDeployModal';
import { getStoredApiKey } from './services/weatherApi';

export default function App() {
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isVercelDeployOpen, setIsVercelDeployOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<'open-meteo' | 'openweather'>(() => {
    return getStoredApiKey() ? 'openweather' : 'open-meteo';
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleKeySaved = (key: string) => {
    setActiveSource(key ? 'openweather' : 'open-meteo');
    // Trigger dashboard refresh with new key
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div id="weather-app-container" className="w-full min-h-screen bg-slate-950 font-sans antialiased text-slate-100">
      <DeviceMockupFrame
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenVercelDeploy={() => setIsVercelDeployOpen(true)}
      >
        <WeatherDashboard
          key={refreshTrigger}
          onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          onOpenVercelDeploy={() => setIsVercelDeployOpen(true)}
        />
      </DeviceMockupFrame>

      {/* API Key Configuration Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        onKeySaved={handleKeySaved}
        currentSource={activeSource}
      />

      {/* Vercel Deployment Step-by-Step Guide Modal */}
      <VercelDeployModal
        isOpen={isVercelDeployOpen}
        onClose={() => setIsVercelDeployOpen(false)}
      />
    </div>
  );
}
