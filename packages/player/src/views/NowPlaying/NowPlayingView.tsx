import { FC } from 'react';
import { ViewShell } from '@nuclearplayer/ui';

export const NowPlayingView: FC = () => {
  return (
    <ViewShell className="flex flex-col items-center justify-center h-full gap-8 animate-in zoom-in duration-1000">
      <div className="w-full max-w-4xl flex flex-col items-center gap-12 text-center">
        <div className="w-64 h-64 rounded-3xl bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-neurid-teal/20 to-neurid-purple/20 opacity-40 animate-pulse" />
          <div className="text-white/10 group-hover:scale-110 transition-transform duration-700 font-black text-8xl select-none">N</div>
        </div>
        
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-black tracking-tight text-white uppercase">Now Playing</h1>
          <p className="text-white/40 font-medium tracking-widest text-sm">Experience the sound of Neurid Studio</p>
        </div>

        <div className="flex items-center gap-4 py-3 px-6 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
          <div className="w-2 h-2 rounded-full bg-neurid-teal shadow-[0_0_10px_#00f2fe] animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-white/60">Live Stream Optimization Active</span>
        </div>
      </div>
    </ViewShell>
  );
};
