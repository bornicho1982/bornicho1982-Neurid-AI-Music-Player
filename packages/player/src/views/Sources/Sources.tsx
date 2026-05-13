import { FC } from 'react';
import { ViewShell } from '@nuclearplayer/ui';
import { Music, PlayCircle } from 'lucide-react';

export const Sources: FC = () => {
  return (
    <ViewShell className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter">Unified Engine</h1>
        <p className="text-white/40">Manage your native studio connections</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Spotify Native */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 group hover:border-neurid-teal/20 transition-all">
          <div className="w-16 h-16 bg-[#1DB954]/10 rounded-2xl flex items-center justify-center text-[#1DB954]">
            <Music size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Spotify Native</h3>
            <p className="text-sm text-white/40 leading-relaxed">Direct search and metadata resolution using the Neurid Native Engine.</p>
          </div>
          <div className="mt-auto flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-neurid-teal shadow-[0_0_8px_#00f2fe]" />
             <span className="text-xs font-mono uppercase tracking-widest text-neurid-teal/60">Connected</span>
          </div>
        </div>

        {/* YouTube / Piped */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 flex flex-col gap-6 group hover:border-red-500/20 transition-all">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
            <PlayCircle size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">YouTube Streams</h3>
            <p className="text-sm text-white/40 leading-relaxed">High-performance stream resolution via the Piped API integration.</p>
          </div>
          <div className="mt-auto flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-neurid-teal shadow-[0_0_8px_#00f2fe]" />
             <span className="text-xs font-mono uppercase tracking-widest text-neurid-teal/60">Connected</span>
          </div>
        </div>
      </div>
    </ViewShell>
  );
};
