import { FC } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { useSoundStore } from '../../stores/soundStore';

const formatTime = (seconds: number) => {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const ConnectedSeekBar: FC = () => {
  const { progress, duration, seek } = useSoundStore(
    useShallow((state) => ({
      progress: state.progress,
      duration: state.duration,
      seek: state.seek,
    })),
  );

  const safePosition = (progress / 100) * duration;
  const safeDuration = duration;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    seek(percentage);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-[10px] font-mono text-white/30 min-w-[35px] text-right">
        {formatTime(safePosition)}
      </span>
      <div 
        className="flex-1 seek-bar-neurid group cursor-pointer"
        onClick={handleSeek}
      >
        <div 
          className="seek-bar-fill"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute h-3 w-3 bg-white rounded-full -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_white]"
          style={{ left: `${progress}%`, marginLeft: '-6px' }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/30 min-w-[35px]">
        {formatTime(safeDuration)}
      </span>
    </div>
  );
};
