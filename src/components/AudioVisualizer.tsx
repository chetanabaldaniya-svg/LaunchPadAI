import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioStream?: MediaStream;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening, isSpeaking, audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    // Setup Audio Context for User Input (Listening)
    if (isListening && audioStream && !isSpeaking) {
      try {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyserRef.current = audioContext.createAnalyser();
        analyserRef.current.fftSize = 64; // Smaller FFT for chunkier bars
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyserRef.current);
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      } catch (e) {
        console.error("Error setting up audio visualizer:", e);
      }
    }

    const draw = () => {
      if (!canvas || !ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const time = Date.now() / 1000;

      ctx.clearRect(0, 0, width, height);

      // 1. AGENT SPEAKING STATE (Active Waveform)
      if (isSpeaking) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        // Create a multi-layered sine wave effect
        for (let i = 0; i < width; i++) {
          // Combine multiple sine waves for a more organic "voice" look
          const y1 = Math.sin(i * 0.03 + time * 8) * 15;
          const y2 = Math.sin(i * 0.01 - time * 4) * 10;
          const y3 = Math.sin(i * 0.05 + time * 2) * 5;
          
          // Amplitude modulation based on center (louder in middle)
          const amplitude = 1 - Math.abs((i - width / 2) / (width / 2));
          const y = (y1 + y2 + y3) * amplitude + height / 2;
          
          ctx.lineTo(i, y);
        }
        
        // Gradient stroke
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#3b82f6'); // Blue
        gradient.addColorStop(0.5, '#8b5cf6'); // Purple
        gradient.addColorStop(1, '#3b82f6'); // Blue
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8b5cf6';
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow
      } 
      
      // 2. USER SPEAKING / LISTENING STATE (Frequency Bars)
      else if (isListening && analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        const barCount = 16; // Number of bars to display
        const barWidth = 6;
        const gap = 4;
        const totalWidth = barCount * (barWidth + gap);
        const startX = (width - totalWidth) / 2;
        
        // Center the bars
        for (let i = 0; i < barCount; i++) {
          // Map data array to bars (skip lower frequencies to avoid noise)
          const dataIndex = Math.floor(i * (dataArrayRef.current.length / barCount));
          const value = dataArrayRef.current[dataIndex];
          
          // Calculate height with a minimum value for visibility
          const barHeight = Math.max(4, (value / 255) * height * 0.8);
          
          const x = startX + i * (barWidth + gap);
          const y = (height - barHeight) / 2;
          
          // Color based on intensity
          const hue = 150 + (value / 255) * 60; // Green to Emerald range
          ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
          
          // Rounded bars
          roundRect(ctx, x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } 
      
      // 3. PROCESSING / IDLE STATE (Breathing Dot)
      else {
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Breathing animation
        const breath = (Math.sin(time * 2) + 1) / 2; // 0 to 1
        const radius = 4 + breath * 2;
        const opacity = 0.3 + breath * 0.4;
        
        // Core dot
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`; // Emerald
        ctx.fill();
        
        // Outer ripple (occasional)
        const rippleTime = time % 3;
        if (rippleTime < 1) {
          const rippleRadius = 4 + rippleTime * 20;
          const rippleOpacity = 1 - rippleTime;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${rippleOpacity * 0.5})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        
        // Text label for state
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)'; // Slate-400
        ctx.textAlign = 'center';
        ctx.fillText(isListening ? "Listening..." : "Ready", centerX, height - 10);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [isListening, isSpeaking, audioStream]);

  // Helper function for rounded rectangles
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-24 md:h-32 rounded-2xl bg-slate-900/5 backdrop-blur-sm border border-slate-200/50 shadow-inner"
    />
  );
};
