import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import type { FC } from 'react';
import { HardDriveIcon, MusicIcon } from 'lucide-react';

import { Loader } from '@nuclearplayer/ui';

import { mediaEngine } from '../../services/MediaEngine';
import { useQueueStore } from '../../stores/queueStore';
import type { Track } from '@nuclearplayer/model';

export const Search: FC = () => {
  const { q } = useSearch({ from: '/search' });
  const addToQueue = useQueueStore((s) => s.addToQueue);

  const { data: results, isLoading } = useQuery({
    queryKey: ['neurid-search', q],
    queryFn: () => mediaEngine.searchAll(q),
    enabled: !!q
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader size="xl" /></div>;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter">Search Results</h1>
        <p className="text-white/40">Showing findings for <span className="text-neurid-teal font-bold">"{q}"</span></p>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 mb-4">
          <HardDriveIcon size={16} className="text-neurid-teal" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Unified Engine Results</span>
        </div>

        {results?.map((track) => (
          <div 
            key={track.id} 
            onClick={() => addToQueue([track as unknown as Track])}
            className="group flex items-center gap-6 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
          >
            <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 shadow-lg">
              {track.coverUrl && <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white group-hover:text-neurid-teal transition-colors truncate">{track.title}</h3>
              <p className="text-sm text-white/40 truncate">{track.artist}</p>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black px-2 py-1 rounded bg-white/5 text-white/20 uppercase tracking-widest">{track.source}</span>
               <span className="text-xs text-white/20 font-mono">
                 {track.durationMs ? `${Math.floor(track.durationMs / 60000)}:${String(Math.floor((track.durationMs % 60000) / 1000)).padStart(2, '0')}` : '--:--'}
               </span>
            </div>
          </div>
        ))}
        {results?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <MusicIcon size={64} className="mb-4" />
            <p className="text-lg font-medium">No results found for your query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
