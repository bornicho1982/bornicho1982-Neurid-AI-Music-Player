import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export const Visualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPlaying } = usePlayerStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const render = () => {
      const analyser = usePlayerStore.getState().analyser;
      
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser) {
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.8;

          // Gradient color with more premium feel
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); 
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)'); 
          gradient.addColorStop(1, 'rgba(52, 211, 153, 0.8)'); 

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);

          x += barWidth + 2;
        }
      } else {
        // Fallback animation when no analyser (e.g. local tracks in Rust)
        if (isPlaying) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
            for(let i=0; i<10; i++) {
                const h = Math.random() * height * 0.5;
                ctx.fillRect(i * (width/10), height - h, width/12, h);
            }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={600} 
      height={150} 
      className="w-full h-full opacity-40 mask-fade-edges"
    />
  );
};
