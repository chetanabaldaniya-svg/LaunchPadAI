import React, { useEffect, useState, useRef } from 'react';
import { useLiveAgent } from '../hooks/useLiveAgent';
import { AudioVisualizer } from './AudioVisualizer';
import { Mic, MicOff, PhoneOff, AlertCircle, Gauge, Camera, CameraOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation';

export const LiveAgent: React.FC = () => {
  const { connect, disconnect, isConnected, isListening, isSpeaking, error, audioStream, isCameraOn, toggleCamera, videoStream, isMuted, toggleMute } = useLiveAgent();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [speechRate, setSpeechRate] = useState(25); // Default to slow/deliberate as requested
  const [sessionDuration, setSessionDuration] = useState(0);
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    // Increment timer when it's the user's turn to speak
    if (isConnected && !isSpeaking) {
      interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else if (isSpeaking) {
      // Reset timer when the agent is speaking
      setSessionDuration(0);
    } else if (!isConnected) {
      setSessionDuration(0);
    }
    return () => clearInterval(interval);
  }, [isConnected, isSpeaking]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
    <div className="flex flex-col items-center gap-3 md:gap-6 w-full max-w-md mx-auto">
      {/* Status Indicator */}
      <div className="flex items-center gap-2 text-xs md:text-sm font-medium tracking-wider uppercase text-slate-500">
        <div className={`w-2 h-2 rounded-full ${isConnected ? (isMuted ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-emerald-600 shadow-[0_0_10px_#059669]') : 'bg-slate-300'}`} />
        {isConnected ? (isMuted ? 'Muted' : (isSpeaking ? t('agentSpeaking') : t('listening'))) : t('offline')}
        {isConnected && (
          <span className="ml-2 font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
            {formatDuration(sessionDuration)}
          </span>
        )}
      </div>

      {/* Visualizer */}
      <div className="w-full relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
        <AudioVisualizer isListening={isListening} isSpeaking={isSpeaking} audioStream={audioStream || undefined} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 md:gap-6">
        {/* Camera Toggle (Only visible when connected) */}
        {isConnected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCamera}
            className={`
              w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-md
              ${isCameraOn 
                ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}
            `}
            title={isCameraOn ? "Turn off camera" : "Turn on camera for Homework Help"}
          >
            {isCameraOn ? <Camera className="w-5 h-5 md:w-6 md:h-6" /> : <CameraOff className="w-5 h-5 md:w-6 md:h-6" />}
          </motion.button>
        )}

        {/* Main Connect/Disconnect Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleConnection}
          className={`
            relative w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-xl
            ${isConnected 
              ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100' 
              : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white border border-indigo-400 hover:from-indigo-600 hover:to-violet-700 shadow-[0_0_30px_rgba(79,70,229,0.4)]'}
          `}
          title={isConnected ? "End Session" : "Start Session"}
        >
          {isConnected ? (
            <PhoneOff className="w-6 h-6 md:w-8 md:h-8" />
          ) : (
            <Mic className="w-6 h-6 md:w-8 md:h-8" />
          )}
          
          {/* Ripple Effect when connecting */}
          {!isConnected && (
            <span className="absolute inset-0 rounded-full border border-indigo-500/50 animate-ping" />
          )}
        </motion.button>

        {/* Mute Toggle (Only visible when connected) */}
        {isConnected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`
              w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center
              transition-all duration-300 shadow-md
              ${isMuted 
                ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100' 
                : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-50'}
            `}
            title={isMuted ? "Unmute microphone" : "Mute microphone"}
          >
            {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </motion.button>
        )}

        {/* Placeholder to balance the flex layout if buttons are not visible */}
        {!isConnected && <div className="w-12 md:w-14 hidden" />}
      </div>

      {/* Video Preview */}
      {isCameraOn && (
        <div className="w-full max-w-[240px] aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-200 relative mt-2">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-medium text-white uppercase tracking-wider">Live</span>
          </div>
        </div>
      )}

      {/* Speed Slider */}
      {!isConnected && (
        <div className="w-full px-3 py-2 md:px-4 md:py-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-1 md:gap-2">
          <div className="flex items-center justify-between text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider">
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
            className="w-full h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
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
