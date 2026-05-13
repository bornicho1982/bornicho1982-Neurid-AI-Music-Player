import { FC } from 'react';
import { ShuffleIcon, RepeatIcon, Volume2Icon, ListMusicIcon } from 'lucide-react';

import { ConnectedControls } from './ConnectedControls';
import { ConnectedNowPlaying } from './ConnectedNowPlaying';
import { ConnectedSeekBar } from './ConnectedSeekBar';

export const ConnectedPlayerBar: FC = () => {
  return (
    <div className="flex items-center justify-between w-full h-full gap-12">
      {/* Track Info (Left) */}
      <div className="flex items-center gap-4 min-w-[280px]">
        <ConnectedNowPlaying />
      </div>

      {/* Playback Cluster (Center) */}
      <div className="flex-1 flex flex-col items-center gap-3">
        <div className="flex items-center gap-8">
           <div className="w-1/3 h-[1px] bg-white/5" />
           <ConnectedControls />
           <div className="w-1/3 h-[1px] bg-white/5" />
        </div>
        <div className="w-full max-w-2xl px-4 flex flex-col gap-1">
          {/* Waveform Placeholder - Could be implemented with canvas */}
          <div className="h-8 flex items-center justify-center gap-1 opacity-40">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-neurid-teal rounded-full" 
                style={{ height: `${Math.random() * 100}%` }} 
              />
            ))}
          </div>
          <ConnectedSeekBar />
        </div>
      </div>

      {/* Control Tools (Right) */}
      <div className="flex items-center gap-6 min-w-[200px] justify-end">
        <ShuffleIcon className="player-control-icon" size={22} />
        <RepeatIcon className="player-control-icon" size={22} />
        <Volume2Icon className="player-control-icon" size={22} />
        <ListMusicIcon className="player-control-icon" size={22} />
      </div>
    </div>
  );
};
