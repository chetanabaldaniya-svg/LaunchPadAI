import React, { useEffect, useState } from 'react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { AudioVisualizer } from './AudioVisualizer';
import { Mic, MicOff, Radio, AlertCircle, Gauge } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';

export const LiveAgent: React.FC = () => {
  const { connect, disconnect, isConnected, isListening, isSpeaking, error } = useLiveAgent();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [speechRate, setSpeechRate] = useState(25); // Default to slow/deliberate as requested
  const { t } = useTranslation();

  useEffect(() => {
    // Check microphone permission
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));
  }, []);

  const handleToggleConnection = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect(speechRate);
    }
  };

  if (hasPermission === false) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{t('micAccessRequired')}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-slate-500">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600 shadow-[0_0_10px_#059669]' : 'bg-slate-300'}`} />
        {isConnected ? (isSpeaking ? t('agentSpeaking') : t('listening')) : t('offline')}
      </div>

      {/* Visualizer */}
      <div className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
        <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} />
      </div>

      {/* Control Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleConnection}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-xl
          ${isConnected 
            ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100' 
            : 'bg-emerald-600 text-white border border-emerald-500 hover:bg-emerald-500 shadow-[0_0_30px_rgba(5,150,105,0.3)]'}
        `}
      >
        {isConnected ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
        
        {/* Ripple Effect when connecting */}
        {!isConnected && (
          <span className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping" />
        )}
      </motion.button>

      {/* Speed Slider */}
      {!isConnected && (
        <div className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              {t('speakingSpeed')}
            </div>
            <span>{speechRate < 33 ? 'Slow' : speechRate > 66 ? 'Fast' : 'Normal'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            <span>Deliberate</span>
            <span>Conversational</span>
            <span>Energetic</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <p className="text-xs text-center text-slate-400 max-w-[200px]">
        {isConnected 
          ? t('tapToDisconnect') 
          : t('tapToLaunch')}
      </p>
    </div>
  );
};
