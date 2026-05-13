import { FC, useEffect } from 'react';
import { 
  MusicIcon, 
  HardDriveIcon, 
  FolderPlusIcon, 
  SearchIcon, 
  RefreshCwIcon, 
  Trash2Icon,
  PlayIcon,
  PlusIcon,
  FolderOpenIcon,
} from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { ViewShell, Loader, Button } from '@nuclearplayer/ui';

import { useLibraryStore, type TrackMetadata, type AlbumGroup } from '../../stores/libraryStore';
import { useQueueStore } from '../../stores/queueStore';

export const LibraryView: FC = () => {
  const { tracks, isLoading, scanLibrary, removeFolder, folders } = useLibraryStore();
  const addToQueue = useQueueStore((s) => s.addToQueue);

  useEffect(() => {
    if (tracks.length === 0 && !isLoading && folders.length > 0) {
      scanLibrary();
    }
  }, [tracks.length, isLoading, folders.length, scanLibrary]);

  const handleAddFolder = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected && typeof selected === 'string') {
      useLibraryStore.getState().addFolder(selected);
    }
  };

  const toNuclearTrack = (t: TrackMetadata) => ({
    title: t.title ?? t.fileName,
    artist: t.artist ?? 'Unknown Artist',
    album: t.album ?? 'Unknown Album',
    durationMs: t.durationSeconds ? t.durationSeconds * 1000 : 0,
    source: { provider: 'local-library', id: t.path },
  });

  const albums = tracks.reduce((acc: AlbumGroup[], track) => {
    const albumName = track.album ?? 'Unknown Album';
    const existing = acc.find(a => a.title === albumName);
    if (existing) {
      existing.tracks.push(track);
    } else {
      acc.push({
        title: albumName,
        artist: track.artist ?? 'Unknown Artist',
        coverArt: track.coverArtBase64,
        tracks: [track]
      });
    }
    return acc;
  }, []);

  return (
    <ViewShell className="animate-in fade-in duration-700">
      <header className="flex flex-col gap-6 mb-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-neurid-teal rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)]">
              <HardDriveIcon size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter">Native Library</h1>
              <p className="text-white/40 text-sm font-medium">Local High-Fidelity Collection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={scanLibrary}
              variant="secondary"
              className="bg-white/5 border-white/10 hover:bg-white/10"
            >
              <RefreshCwIcon size={16} className={isLoading ? 'animate-spin' : ''} />
              <span className="ml-2">Rescan</span>
            </Button>
            <Button 
              onClick={handleAddFolder}
              className="bg-neurid-teal text-black hover:scale-105 transition-transform"
            >
              <FolderPlusIcon size={16} />
              <span className="ml-2">Add Folder</span>
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative group">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neurid-teal transition-colors" />
          <input 
            type="text" 
            placeholder="Search in your local collection..."
            className="w-full h-12 bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 outline-none focus:border-neurid-teal/30 focus:bg-white/10 transition-all text-sm"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader size="xl" />
          <p className="text-white/40 animate-pulse font-mono text-xs uppercase tracking-widest">Scanning Local Volumes...</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 glass-panel rounded-3xl border-dashed border-white/10">
          <FolderOpenIcon size={64} className="text-white/10 mb-6" />
          <h2 className="text-xl font-bold mb-2">No Music Found</h2>
          <p className="text-white/40 text-sm mb-8 max-w-xs text-center">Your library is currently empty. Add a folder containing your music files to get started.</p>
          <Button onClick={handleAddFolder} className="bg-white text-black px-8">
            Select Music Folder
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Folders List */}
          {folders.length > 0 && (
            <section className="flex flex-col gap-4">
              <h3 className="text-xs font-black text-white/20 uppercase tracking-widest">Managed Locations</h3>
              <div className="flex flex-wrap gap-3">
                {folders.map(folder => (
                  <div key={folder} className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5 group">
                    <span className="text-xs font-mono text-white/40">{folder}</span>
                    <button 
                      onClick={() => removeFolder(folder)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2Icon size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums Grid */}
          <section className="flex flex-col gap-6">
            <h3 className="text-xs font-black text-white/20 uppercase tracking-widest">Your Albums — {albums.length}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {albums.map((album) => (
                <div key={album.title} className="flex flex-col gap-3 group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl bg-white/5 overflow-hidden border border-white/5 group-hover:border-neurid-teal/40 transition-all duration-500 shadow-xl group-hover:shadow-neurid-teal/10">
                    {album.coverArt ? (
                      <img src={`data:image/jpeg;base64,${album.coverArt}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                        <MusicIcon size={48} className="text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(album.tracks.map(toNuclearTrack as any));
                        }}
                        className="w-12 h-12 bg-neurid-teal rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform"
                      >
                        <PlayIcon size={20} fill="currentColor" />
                      </button>
                      <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                        <PlusIcon size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate text-sm group-hover:text-neurid-teal transition-colors">{album.title}</p>
                    <p className="text-white/40 text-xs truncate">{album.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </ViewShell>
  );
};
