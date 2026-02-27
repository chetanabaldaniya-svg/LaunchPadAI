import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioStream?: MediaStream;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isListening, isSpeaking, audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    if (isListening && audioStream) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (isListening && analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
          barHeight = dataArray[i] / 2;
          ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
          ctx.fillRect(x, height - barHeight / 2 - height / 2, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else if (isSpeaking) {
        // Simulate speaking waveform
        const time = Date.now() / 100;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        for (let i = 0; i < width; i++) {
          const y = Math.sin(i * 0.05 + time) * 20 * Math.sin(time * 0.5) + height / 2;
          ctx.lineTo(i, y);
        }
        ctx.strokeStyle = '#00ff00'; // Neon green
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Idle state - flat line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
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

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={100}
      className="w-full h-24 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10"
    />
  );
};
