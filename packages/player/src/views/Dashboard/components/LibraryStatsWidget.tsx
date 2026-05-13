import { Database, Disc, Music, Users } from 'lucide-react';
import { FC } from 'react';

import { useLibraryStore } from '../../../stores/libraryStore';

export const LibraryStatsWidget: FC = () => {
  const { isScanning, tracks } = useLibraryStore();

  if (tracks.length === 0) {
    return null;
  }

  // Calculate stats
  const uniqueArtists = new Set(
    tracks.flatMap((t) => t.artists?.map((a) => a.name).filter(Boolean)),
  ).size;
  const uniqueAlbums = new Set(
    tracks.map((t) => t.album?.title).filter(Boolean),
  ).size;

  return (
    <div className="mb-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-2xl font-black tracking-tight flex items-center gap-3">
          <Database size={24} className="text-primary" />
          Native Library
        </h2>
        {isScanning && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Scanning Files</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tracks Card */}
        <div className="premium-card p-6 relative overflow-hidden group neon-glow border-primary/20">
          <div className="relative z-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Total Tracks</p>
            <p className="text-5xl font-black text-white">{tracks.length}</p>
          </div>
          <Music className="absolute -right-6 -bottom-6 text-primary/5 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" size={140} />
        </div>

        {/* Artists Card */}
        <div className="premium-card p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Artists</p>
            <p className="text-5xl font-black text-white">{uniqueArtists}</p>
          </div>
          <Users className="absolute -right-6 -bottom-6 text-white/5 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" size={140} />
        </div>

        {/* Albums Card */}
        <div className="premium-card p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Albums</p>
            <p className="text-5xl font-black text-white">{uniqueAlbums}</p>
          </div>
          <Disc className="absolute -right-6 -bottom-6 text-white/5 transition-transform duration-700 group-hover:scale-125 group-hover:-rotate-12" size={140} />
        </div>
      </div>
    </div>
  );
};
