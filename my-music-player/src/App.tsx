import { useState, useEffect, useRef } from 'react';
import {
  Library,
  ListMusic,
  Compass,
  Cpu,
  Settings,
  Search,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  FolderPlus,
  MonitorSpeaker,
  Mic,
  Link2,
  User,
  Trash2,
  Music,
  Plus,
  Terminal,
  Zap,
  Flame,
  Database,
  Info,
  Sparkles,
  History,
  X,
  Wand2,
  Telescope,
  ShieldCheck,
  Code,
  ArrowRight,
  Filter,
  BarChart4,
  Home
} from 'lucide-react';
import { usePlayerStore } from './store/playerStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Visualizer } from './components/Visualizer';
import { localAIService } from './services/localAIService';
import { open } from '@tauri-apps/plugin-dialog';
import { HomeView } from './views/HomeView';

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// --- Sub-components (Atoms) ---

const NavItem = ({ icon, label, active, onClick, isNeon = false }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
      active 
        ? (isNeon ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.2)]' : 'bg-white/10 text-white') 
        : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className={`text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
      {label}
    </span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#34d399]"></div>}
  </button>
);

const NeonCard = ({ title, subtitle, image, onClick }: any) => (
  <div 
    onClick={onClick}
    className="relative aspect-square rounded-[32px] overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-all duration-500 shadow-2xl"
  >
    <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
    <div className="absolute bottom-6 left-6 right-6">
      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">{subtitle}</p>
      <h3 className="text-xl font-black text-white leading-tight">{title}</h3>
    </div>
    <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 shadow-2xl border border-white/20">
      <Play size={18} fill="white" className="ml-0.5" />
    </div>
  </div>
);

// --- Main Views ---

const LyricsView = () => {
  const { lyrics, currentTime, queue, currentIndex } = usePlayerStore();
  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;
  const activeLineIndex = lyrics ? lyrics.synced.filter((l: any) => l.time <= currentTime).length - 1 : -1;

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-1000 p-12">
      <div className="max-w-4xl w-full text-center mb-16">
        <h2 className="text-6xl font-black mb-4 tracking-tighter">{currentTrack?.title || "No track"}</h2>
        <p className="text-emerald-400 font-black uppercase tracking-[0.4em] text-sm">{currentTrack?.artist || "Unknown Artist"}</p>
      </div>

      <div className="h-[60vh] overflow-y-auto w-full custom-scrollbar flex flex-col items-center mask-fade-edges">
        {!lyrics ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-700">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-800 flex items-center justify-center mb-6 animate-spin-slow">
               <Mic size={32} className="opacity-20" />
            </div>
            <p className="font-bold tracking-widest uppercase text-xs">Sincronizando flujo de datos...</p>
          </div>
        ) : lyrics.synced.length === 0 ? (
          <div className="whitespace-pre-line text-3xl font-bold text-gray-400 leading-[1.6] max-w-2xl text-center">
            {lyrics.plain}
          </div>
        ) : (
          <div className="space-y-12 py-[35vh] w-full max-w-4xl">
            {lyrics.synced.map((line, index) => (
              <p 
                key={index} 
                className={`text-4xl font-black transition-all duration-700 cursor-default text-center leading-tight ${
                  index === activeLineIndex 
                    ? 'text-white scale-110 blur-0' 
                    : 'text-white/10 blur-[2px] hover:text-white/30'
                }`}
              >
                {line.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DiscoverView = ({ onAlchemist }: { onAlchemist: (val: string) => void }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent italic">ORÁCULO</h2>
          <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-xs">Tendencias Globales x Inteligencia Neurid</p>
        </div>
        <button className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/10 transition-all font-black text-xs tracking-widest uppercase">
          <Filter size={16} /> FILTRAR VIBRA
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <NeonCard
          title="CHILLWAVE RETREAT"
          subtitle="Lo-Fi / Ambient"
          image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=800"
        />
        <NeonCard
          title="CYBERPUNK NIGHTS"
          subtitle="Synth / Electro"
          image="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800"
        />
        <NeonCard
          title="ETHEREAL VOICES"
          subtitle="Indie / Dream"
          image="https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=800"
        />
        <NeonCard
          title="KINETIC BEATS"
          subtitle="Techno / House"
          image="https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&q=80&w=800"
        />
      </div>

      <div className="mt-20 p-12 rounded-[48px] bg-gradient-to-br from-[#1DB954]/10 to-purple-600/10 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
        <div className="max-w-2xl">
          <h3 className="text-4xl font-black mb-6 leading-tight">¿Buscas algo específico? <br/><span className="text-emerald-400 underline decoration-2 underline-offset-8">Pregunta a la IA.</span></h3>
          <p className="text-gray-400 text-lg mb-8 font-medium">Neurid analiza millones de patrones para encontrar exactamente la frecuencia que necesitas hoy.</p>
          <button className="bg-white text-black px-10 py-5 rounded-3xl font-black hover:scale-105 transition-transform shadow-2xl flex items-center gap-3">
             INVOCAR ASISTENTE <ArrowRight size={20} />
          </button>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="p-12 rounded-[48px] bg-black/40 border border-white/5 group hover:border-orange-500/30 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-8 border border-orange-500/20">
            <Flame className="text-orange-400" size={32} />
          </div>
          <h3 className="text-3xl font-black mb-4">ALQUIMISTA DE MEZCLAS</h3>
          <p className="text-gray-500 mb-10 leading-relaxed">Fusiona géneros imposibles o crea bandas sonoras para conceptos abstractos.</p>
          <div className="flex gap-4">
            <input 
              id="alchemist-input"
              type="text" 
              placeholder="Ej: 'Cyberpunk Flamenco' o 'Lluvia en Marte'..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-orange-500/50 transition-all"
            />
            <button 
              onClick={() => {
                const val = (document.getElementById('alchemist-input') as HTMLInputElement).value;
                if(val) onAlchemist(val);
              }}
              className="p-4 rounded-2xl bg-orange-500 text-black hover:scale-105 transition-all shadow-lg shadow-orange-500/20"
            >
              <Wand2 size={24} />
            </button>
          </div>
        </div>

        <div className="p-12 rounded-[48px] bg-black/40 border border-white/5 group hover:border-emerald-500/30 transition-all flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
              <Telescope className="text-emerald-400" size={32} />
            </div>
            <h3 className="text-3xl font-black mb-4">DESCUBRIMIENTO PROFUNDO</h3>
            <p className="text-gray-500 leading-relaxed">Explora las raíces ocultas de tus artistas favoritos y sus conexiones neuronales.</p>
          </div>
          <button className="mt-10 w-full py-5 rounded-3xl border border-white/10 hover:bg-white/5 transition-all font-black text-xs tracking-widest uppercase">
            INICIAR EXPLORACIÓN
          </button>
        </div>
      </div>
    </div>
  );
};

const LibraryView = () => {
  const { library, playTrack, currentIndex, scanLocalFolder, loadLibrary } = usePlayerStore();
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadLibrary(); }, []);

  const rowVirtualizer = useVirtualizer({
    count: library.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
  });

  const handleSelectFolder = async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === 'string') {
        await scanLocalFolder(selected);
      }
    } catch (err) {
      console.error("Failed to select folder", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-12 flex-shrink-0">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2">ARCHIVOS LOCALES</h2>
          <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Gestión de datos de audio de alta fidelidad</p>
        </div>
        <div className="flex gap-4">
          <button className="p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><BarChart4 size={20} /></button>
          <button
            onClick={handleSelectFolder}
            className="flex items-center gap-3 bg-emerald-500 text-black px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(52,211,153,0.3)] hover:scale-105 transition-all font-black text-xs tracking-widest uppercase"
          >
            <FolderPlus size={20} /> IMPORTAR DIRECTORIO
          </button>
        </div>
      </div>

      <div className="bg-[#121620]/60 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden flex-1 flex flex-col shadow-2xl">
        <div className="flex bg-white/5 text-gray-500 border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="p-6 w-16 text-center">#</div>
          <div className="p-6 flex-1">COMPOSICIÓN</div>
          <div className="p-6 w-1/4">ARTISTA</div>
          <div className="p-6 w-1/4">ÁLBUM</div>
        </div>
        <div ref={parentRef} className="flex-1 overflow-auto custom-scrollbar">
          {library.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-20 text-center">
              <Database size={64} className="text-gray-800 mb-8" />
              <p className="text-gray-500 font-bold uppercase tracking-widest">No hay datos indexados.</p>
              <button onClick={handleSelectFolder} className="mt-6 text-emerald-400 hover:underline">Iniciar escaneo del sistema</button>
            </div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const index = virtualRow.index;
                const track = library[index];
                const isPlaying = currentIndex === index;

                return (
                  <div
                    key={virtualRow.key}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    onClick={() => {
                      const mappedTracks = library.map(t => ({
                        id: t.id,
                        path: t.path,
                        title: t.title || t.filename,
                        artist: t.artist || "Desconocido",
                        isRemote: false,
                        coverUrl: ''
                      }));
                      usePlayerStore.setState({ queue: mappedTracks, currentIndex: index });
                      playTrack(index);
                    }}
                    className={`flex items-center border-b border-white/5 hover:bg-white/5 group cursor-pointer transition-all ${isPlaying ? 'bg-emerald-500/5' : ''}`}
                  >
                    <div className="p-6 text-gray-600 w-16 text-center font-mono">
                      {isPlaying ? <div className="flex gap-1 justify-center items-end h-4"><div className="w-1 bg-emerald-400 animate-music-bar-1"></div><div className="w-1 bg-emerald-400 animate-music-bar-2"></div><div className="w-1 bg-emerald-400 animate-music-bar-3"></div></div> : index + 1}
                    </div>
                    <div className={`p-6 flex-1 flex items-center gap-4 ${isPlaying ? 'text-emerald-400' : 'text-white'}`}>
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                        <Music size={18} className={isPlaying ? 'text-emerald-400' : 'text-gray-600'} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate text-sm">{track.title || track.filename}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest truncate">{track.path.split('/').pop()}</p>
                      </div>
                    </div>
                    <div className="p-6 w-1/4 text-gray-400 text-sm font-medium truncate">{track.artist || "Desconocido"}</div>
                    <div className="p-6 w-1/4 text-gray-500 text-sm truncate">{track.album || "-"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PlaylistsView = () => {
  const { savedPlaylists, loadPlaylistToQueue, removePlaylist, createPlaylist } = usePlayerStore();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any[]>([]);

  useEffect(() => {
    if (selectedPlaylistId) {
      import('./db').then(({ getPlaylistTracks }) => {
        getPlaylistTracks(selectedPlaylistId).then((tracks: any[]) => {
          setPlaylistTracks(tracks);
        });
      });
    } else {
      setPlaylistTracks([]);
    }
  }, [selectedPlaylistId]);

  const activePlaylist = savedPlaylists.find(p => p.id === selectedPlaylistId);

  const handlePlayPlaylistTrack = async (trackIndex: number) => {
    const mappedQueue = playlistTracks.map(t => ({
      id: t.trackId,
      path: t.path || '',
      title: t.title,
      artist: t.artist || "Artista Desconocido",
      isRemote: t.isRemote,
      coverUrl: t.coverUrl
    }));
    usePlayerStore.setState({ queue: mappedQueue, currentIndex: trackIndex, isPlaying: true });
    const store = usePlayerStore.getState();
    await store.playTrack(trackIndex);
  };

  if (activePlaylist) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <button
          onClick={() => setSelectedPlaylistId(null)}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white px-6 py-3 rounded-xl transition-all font-black text-[10px] tracking-widest uppercase mb-10"
        >
          ← VOLVER A COLECCIONES
        </button>

        <div className="flex items-center gap-8 mb-12">
          <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
            {activePlaylist.coverUrl ? (
              <img src={activePlaylist.coverUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <ListMusic size={48} className="text-white/10" />
            )}
          </div>
          <div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest inline-block mb-3">
              {activePlaylist.source}
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-2 text-white">{activePlaylist.title}</h2>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
              {playlistTracks.length} PISTAS • IMPORTADO EL {new Date(activePlaylist.importDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="bg-[#121620]/60 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden shadow-2xl p-6">
          {playlistTracks.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Esta lista no contiene canciones.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlistTracks.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => handlePlayPlaylistTrack(idx)}
                  className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-6 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <Music size={18} className="text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm truncate text-white group-hover:text-emerald-400 transition-colors">{track.title}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{track.artist || "Artista Desconocido"}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100">
                    <Play size={16} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2 text-white">COLECCIONES</h2>
          <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Archivos unificados de servicios externos</p>
        </div>
        <button
          onClick={() => {
            const title = prompt("Nombre de la nueva lista:");
            if (title) createPlaylist(title);
          }}
          className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-all font-black text-xs tracking-widest uppercase"
        >
          <Plus size={20} /> NUEVA PLAYLIST
        </button>
      </div>

      {savedPlaylists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-[#121620]/40 rounded-[48px] border border-dashed border-white/5">
          <ListMusic size={64} className="text-gray-800 mb-8" />
          <p className="text-gray-500 font-bold uppercase tracking-widest">Tu almacén está vacío.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {savedPlaylists.map(pl => (
            <div 
              key={pl.id} 
              onClick={() => setSelectedPlaylistId(pl.id)}
              className="bg-[#121620]/60 backdrop-blur-md border border-white/5 rounded-[40px] overflow-hidden group hover:border-emerald-500/30 transition-all shadow-2xl relative cursor-pointer"
            >
              <div className="aspect-square relative overflow-hidden">
                {pl.coverUrl ? (
                  <img src={pl.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={pl.title} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <ListMusic size={48} className="text-white/10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      loadPlaylistToQueue(pl.id);
                    }}
                    className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.5)] hover:scale-110 transition-transform"
                  >
                    <Play size={32} fill="currentColor" className="ml-2" />
                  </button>
                  <p className="text-xs font-black tracking-widest text-white uppercase">REPRODUCIR TODO</p>
                </div>
                <div className="absolute top-6 right-6">
                   <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                     {pl.source}
                   </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-black text-white truncate pr-4">{pl.title}</h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlaylist(pl.id);
                    }} 
                    className="text-gray-700 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Importado el {new Date(pl.importDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const IntegrationsView = ({ onAuditor }: { onAuditor: () => void }) => (
  <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
    <div className="text-center mb-20">
      <h2 className="text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-emerald-400 via-white to-purple-500 bg-clip-text text-transparent">VINCULACIÓN</h2>
      <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">Conecta tus fuentes de datos musicales para una unificación total del catálogo.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
      <IntegrationCard 
        name="SPOTIFY" 
        icon={<MonitorSpeaker size={40} />} 
        color="#1DB954" 
        desc="Importa listas públicas (Top Hits, Lo-Fi, etc.) al instante usando su ID o enlace sin credenciales."
        onImport={(id: string) => usePlayerStore.getState().importSpotifyPlaylist(id)}
      />
      <IntegrationCard 
        name="DEEZER" 
        icon={<MonitorSpeaker size={40} />} 
        color="#00C7FF" 
        desc="Sincronización de favoritos y playlists de Deezer."
        onImport={(id: string) => usePlayerStore.getState().importDeezerPlaylist(id)}
      />
      <IntegrationCard 
        name="YOUTUBE" 
        icon={<Music size={40} />} 
        color="#FF0000" 
        desc="Búsqueda global en el catálogo más grande del mundo sin publicidad."
        isSearchable
      />
    </div>

    {/* Curated Spotify Playlists - Premium live feel */}
    <div className="mt-24">
      <div className="mb-10">
        <h3 className="text-4xl font-black tracking-tight mb-2 uppercase">Listas de Spotify en Directo</h3>
        <p className="text-gray-500 font-medium uppercase tracking-[0.2em] text-xs">Haz clic en cualquier colección para importarla al instante sin configurar claves</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          onClick={() => usePlayerStore.getState().importSpotifyPlaylist("37i9dQZF1DXcBWIGnz7v7F")}
          className="bg-[#121620]/40 border border-white/5 rounded-3xl p-6 hover:border-[#1DB954]/50 cursor-pointer transition-all duration-500 group relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden mb-5 relative bg-emerald-950">
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play size={28} fill="white" className="text-white" />
            </div>
          </div>
          <h4 className="font-bold text-lg mb-1 group-hover:text-[#1DB954] transition-colors truncate">Éxitos España</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Top 50 Spotify</p>
        </div>

        <div 
          onClick={() => usePlayerStore.getState().importSpotifyPlaylist("37i9dQZF1DWWQRwui0ExPn")}
          className="bg-[#121620]/40 border border-white/5 rounded-3xl p-6 hover:border-[#1DB954]/50 cursor-pointer transition-all duration-500 group relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden mb-5 relative bg-purple-950">
            <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play size={28} fill="white" className="text-white" />
            </div>
          </div>
          <h4 className="font-bold text-lg mb-1 group-hover:text-[#1DB954] transition-colors truncate">Lo-Fi Beats</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Lofi Instrumental</p>
        </div>

        <div 
          onClick={() => usePlayerStore.getState().importSpotifyPlaylist("37i9dQZF1DX88tOphg21go")}
          className="bg-[#121620]/40 border border-white/5 rounded-3xl p-6 hover:border-[#1DB954]/50 cursor-pointer transition-all duration-500 group relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden mb-5 relative bg-blue-950">
            <img src="https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play size={28} fill="white" className="text-white" />
            </div>
          </div>
          <h4 className="font-bold text-lg mb-1 group-hover:text-[#1DB954] transition-colors truncate">Chillout Lounge</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Ambient & Lounge</p>
        </div>

        <div 
          onClick={() => usePlayerStore.getState().importSpotifyPlaylist("37i9dQZF1DX2Nc1t0w7x0I")}
          className="bg-[#121620]/40 border border-white/5 rounded-3xl p-6 hover:border-[#1DB954]/50 cursor-pointer transition-all duration-500 group relative"
        >
          <div className="aspect-square rounded-2xl overflow-hidden mb-5 relative bg-red-950">
            <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play size={28} fill="white" className="text-white" />
            </div>
          </div>
          <h4 className="font-bold text-lg mb-1 group-hover:text-[#1DB954] transition-colors truncate">Rock Classics</h4>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Himnos del Rock</p>
        </div>
      </div>
    </div>

    <div className="mt-24 p-12 rounded-[48px] bg-blue-500/5 border border-blue-500/10 flex items-center justify-between group">
      <div className="flex items-center gap-10">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
          <ShieldCheck className="text-blue-400" size={36} />
        </div>
        <div>
          <h3 className="text-3xl font-black mb-2 italic">AUDITOR DE ECOSISTEMA</h3>
          <p className="text-gray-500 font-medium">Compara catálogos, latencias y calidad de audio entre servicios.</p>
        </div>
      </div>
      <button 
        onClick={onAuditor}
        className="px-10 py-5 bg-blue-500 text-black font-black rounded-3xl hover:scale-105 transition-transform shadow-2xl shadow-blue-500/20"
      >
        EJECUTAR AUDITORÍA SÍNCRONA
      </button>
    </div>
  </div>
);

const IntegrationCard = ({ name, icon, color, desc, onConnect, onImport, isSearchable }: any) => {
  const [val, setVal] = useState('');
  return (
    <div className="bg-[#121620]/60 backdrop-blur-xl border border-white/5 rounded-[48px] p-10 flex flex-col items-center group hover:border-white/10 transition-all shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: color }}></div>
      <div className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-500" style={{ color: color }}>
        {icon}
      </div>
      <h3 className="text-3xl font-black mb-4 tracking-tighter">{name}</h3>
      <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-10">{desc}</p>
      
      <div className="w-full space-y-4">
        {onConnect && (
          <button 
            onClick={onConnect}
            className="w-full py-5 rounded-3xl font-black tracking-widest text-xs uppercase transition-all shadow-xl hover:scale-105 active:scale-95"
            style={{ backgroundColor: color, color: '#000' }}
          >
            CONECTAR CUENTA
          </button>
        )}
        
        <div className="relative">
          <input 
            type="text" 
            placeholder={isSearchable ? "Buscar contenido..." : "ID de Playlist..."}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-mono outline-none focus:border-white/20"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button 
            onClick={() => {
              if (val) {
                if (isSearchable) usePlayerStore.getState().searchYouTube(val);
                else onImport(val.split('?')[0].split('/').pop() || val);
              }
            }}
            className="absolute right-2 top-2 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ isIAReady }: { isIAReady: boolean }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-4xl">
      <h2 className="text-5xl font-black tracking-tighter mb-12">SISTEMA</h2>

      <div className="space-y-10">
        <section className="bg-[#121620]/60 backdrop-blur-md rounded-[40px] border border-white/5 p-10 shadow-2xl">
          <h3 className="text-lg font-black text-emerald-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <Cpu size={24} /> NÚCLEO NEURONAL INTEGRADO
          </h3>
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-sm font-bold text-emerald-400 mb-2">IA LOCAL: GEMMA-2B</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Neurid está operando en modo local completo. No se requieren claves externas ni conexión a la nube para las funciones de IA. 
                El modelo se carga directamente en tu hardware para máxima privacidad y velocidad.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isIAReady ? 'bg-emerald-500 shadow-[0_0_10px_#34d399]' : 'bg-yellow-500 animate-pulse'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                ESTADO: {isIAReady ? 'SISTEMA OPERATIVO' : 'CARGANDO PESOS NEURONALES...'}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-[#121620]/60 backdrop-blur-md rounded-[40px] border border-white/5 p-10 shadow-2xl">
          <h3 className="text-lg font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
            <ShieldCheck size={24} /> SEGURIDAD Y PRIVACIDAD
          </h3>
          <div className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5">
            <div>
              <p className="font-bold">Modo Incógnito</p>
              <p className="text-xs text-gray-500 mt-1">No registrar historial de IA en el servidor.</p>
            </div>
            <div className="w-14 h-8 bg-gray-800 rounded-full relative p-1 cursor-pointer">
               <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [aiQuery, setAiQuery] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [showInsights, setShowInsights] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [showDevModal, setShowDevModal] = useState(false);
  const [devInput, setDevInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [isIAReady, setIsIAReady] = useState(false);

  const { 
    isPlaying, pause, resume, queue, currentIndex, nextTrack, prevTrack, 
    volume, setVolume, isResolving, loadSavedPlaylists, 
    activeTab, setActiveTab, library, currentTime
  } = usePlayerStore();

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;

  const aiWorkerRef = useRef<Worker | null>(null);
  const workerPendingCallback = useRef<((handled: boolean) => void) | null>(null);

  useEffect(() => {
    // Inicializar Web Worker para comandos locales de IA
    const worker = new Worker(new URL('./ai/aiWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = async (e) => {
      const { type, status, bestMatch, score, command, error } = e.data;
      if (type === 'status' && status) {
        setAiStatus(status);
      } else if (type === 'error') {
        console.error("AI Worker Error:", error);
        setAiStatus("Error en la IA local.");
        setTimeout(() => setAiStatus(""), 3000);
        if (workerPendingCallback.current) {
          workerPendingCallback.current(false);
        }
      } else if (type === 'result') {
        setAiStatus("");
        if (score > 0.35) {
          const store = usePlayerStore.getState();
          switch (bestMatch) {
            case 'play music':
              await store.resume();
              setAiStatus('Acción: Reproduciendo...');
              break;
            case 'pause music':
              await store.pause();
              setAiStatus('Acción: Pausando...');
              break;
            case 'next track':
              await store.nextTrack();
              setAiStatus('Acción: Siguiente pista...');
              break;
            case 'previous track':
              if (command.includes('antes') || command.includes('anterior')) {
                  await store.prevTrack();
                  setAiStatus('Acción: Volviendo a la anterior...');
              } else {
                  await store.resume();
                  setAiStatus('Reproduciendo...');
              }
              break;
            case 'create playlist': {
              const title = command.toLowerCase()
                .replace('crea', '')
                .replace('crear', '')
                .replace('lista', '')
                .replace('playlist', '')
                .replace('llamada', '')
                .trim();
              if (title) {
                await store.createPlaylist(title);
                setAiStatus(`Playlist "${title}" creada con éxito.`);
                store.setActiveTab('playlists');
              } else {
                setAiStatus('¿Cómo quieres llamar a la lista?');
              }
              break;
            }
            case 'search music': {
              const query = command.toLowerCase()
                .replace('busca', '')
                .replace('buscar', '')
                .replace('search', '')
                .replace('pon', '')
                .trim();
              
              if (query) {
                setAiStatus(`Buscando "${query}" en YouTube...`);
                await store.searchYouTube(query);
                store.setActiveTab('integrations');
              } else {
                setAiStatus('¿Qué quieres que busque?');
              }
              break;
            }
            case 'switch view': {
              const cmd = command.toLowerCase();
              if (cmd.includes('libreria') || cmd.includes('library')) store.setActiveTab('library');
              else if (cmd.includes('playlist') || cmd.includes('lista')) store.setActiveTab('playlists');
              else if (cmd.includes('letra') || cmd.includes('lyrics')) store.setActiveTab('lyrics');
              else if (cmd.includes('ajuste') || cmd.includes('config') || cmd.includes('settings')) store.setActiveTab('settings');
              else if (cmd.includes('vincular') || cmd.includes('conectar') || cmd.includes('integrations')) store.setActiveTab('integrations');
              else store.setActiveTab('neurid_ai');
              
              setAiStatus('Cambiando de vista...');
              break;
            }
            default:
              setAiStatus('Comando no reconocido por la IA.');
          }
          if (workerPendingCallback.current) {
            workerPendingCallback.current(true);
          }
        } else {
          if (workerPendingCallback.current) {
            workerPendingCallback.current(false);
          }
        }
        setTimeout(() => setAiStatus(""), 3000);
      }
    };

    aiWorkerRef.current = worker;
    return () => {
      worker.terminate();
    };
  }, []);

  const processCommandWithWorker = (command: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!aiWorkerRef.current) {
        resolve(false);
        return;
      }
      workerPendingCallback.current = (handled) => {
        resolve(handled);
      };
      aiWorkerRef.current.postMessage({ command });
    });
  };

  useEffect(() => {
    loadSavedPlaylists();
    // Auto-initialize IA
    setAiStatus("Cargando Núcleo Local...");
    localAIService.initialize().then(() => {
      setIsIAReady(true);
      setAiStatus("");
    }).catch(() => setAiStatus("Error al cargar IA Local"));
  }, [loadSavedPlaylists]);

  useEffect(() => {
    usePlayerStore.getState().setupAudioTelemetry();
  }, []);

  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    setAiStatus("Neurid buscando...");
    
    // Intentar procesar como comando local primero con Web Worker
    const wasCommand = await processCommandWithWorker(query);
    if (wasCommand) {
      return;
    }

    usePlayerStore.setState({ isResolving: true, activeTab: 'search' });
    try {
      const webResults = await localAIService.searchWeb(query);
      const aiResponse = await localAIService.query(`Encuentra canciones para: ${query}. Resultados web encontrados: ${JSON.stringify(webResults.slice(0,3))}`);
      
      const mapped = webResults.length > 0 ? webResults.map(r => ({
        id: `web_${r.title}_${r.artist}`,
        path: '',
        title: r.title,
        artist: r.artist,
        isRemote: true,
        reason: r.reason || "Encontrado en la red"
      })) : [{
        id: 'ia_suggestion',
        path: '',
        title: "Recomendación Neurid Core",
        artist: "Neurid AI",
        isRemote: true,
        reason: aiResponse.message
      }];

      usePlayerStore.setState({ searchResults: mapped, isResolving: false });
      setAiStatus("");
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
      usePlayerStore.setState({ isResolving: false });
    }
  };

  const handleLore = async (track: any) => {
    setAiStatus("Escribiendo crónica local...");
    try {
      const response = await localAIService.query(`Escribe un lore corto para la canción: ${track.title} de ${track.artist}`);
      setInsightsData({ ...track, lore: response.message });
      setShowInsights(true);
      setAiStatus("");
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
    }
  };

  const handleAlchemist = async (concept: string) => {
    setAiStatus("Destilando esencias locales...");
    try {
      const response = await localAIService.query(`Crea una playlist conceptual para: ${concept}. Responde con una lista de 5 canciones sugeridas.`);
      setInsightsData({ title: `Mezcla: ${concept}`, analysis: response.message, type: 'auditor' });
      setShowInsights(true);
      setAiStatus("");
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
    }
  };

  const handleAuditor = async () => {
    setAiStatus("Auditando ecosistema local...");
    try {
      const response = await localAIService.query("Realiza una auditoría rápida de por qué el audio local es mejor que el streaming.");
      setInsightsData({ title: "Auditoría de Ecosistema", analysis: response.message, type: 'auditor' });
      setShowInsights(true);
      setAiStatus("");
    } catch (err: any) {
      setAiStatus(`Error: ${err.message}`);
    }
  };

  const handleDevChat = async (input: string) => {
    if (!input.trim()) return;
    const cmd = input.toLowerCase().trim();
    setDevInput('');
    setTerminalHistory(prev => [...prev, `> ${input}`]);

    // Built-in commands
    if (cmd === 'status') {
      setTerminalHistory(prev => [...prev, `[SYSTEM] Status: Optimal\n[AUDIO] Engine: Rodio v0.20\n[LIBRARY] Tracks: ${library.length}\n[IA] Mode: LOCAL (Gemma-2b)\n[IA] Status: ${isIAReady ? 'Ready' : 'Initializing'}`]);
      return;
    }
    if (cmd === 'scan') {
      setTerminalHistory(prev => [...prev, `[SYSTEM] Triggering background scan...`]);
      const selected = await open({ directory: true, multiple: false });
      if (selected && typeof selected === 'string') {
        usePlayerStore.getState().scanLocalFolder(selected);
        setTerminalHistory(prev => [...prev, `[SYSTEM] Scan started on: ${selected}`]);
      }
      return;
    }
    if (cmd === 'clear') {
      setTerminalHistory([]);
      return;
    }

    try {
      // Intentar procesar como comando local primero con Web Worker
      const wasCommand = await processCommandWithWorker(input);
      if (wasCommand) {
        setTerminalHistory(prev => [...prev, `[OK] Comando local procesado y ejecutado.`]);
        return;
      }
      const response = await localAIService.query(input);
      setTerminalHistory(prev => [...prev, response.message || ""]);
    } catch (err: any) {
      setTerminalHistory(prev => [...prev, `[ERROR] ${err.message}`]);
    }
  };

const SearchResultsView = () => {
  const { searchResults, isResolving } = usePlayerStore();

  const handlePlaySearchResult = async (track: any) => {
    const store = usePlayerStore.getState();
    const existingIndex = store.queue.findIndex(t => t.id === track.id || t.path === track.path);
    if (existingIndex !== -1) {
      await store.playTrack(existingIndex);
    } else {
      const newQueue = [...store.queue, track];
      usePlayerStore.setState({ queue: newQueue });
      await store.playTrack(newQueue.length - 1);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-12 flex-shrink-0">
        <div>
          <h2 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-emerald-400 to-purple-500 bg-clip-text text-transparent italic">BÚSQUEDA</h2>
          <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Pistas y Sugerencias de Frecuencia Encontradas</p>
        </div>
      </div>

      <div className="bg-[#121620]/60 backdrop-blur-md rounded-[40px] border border-white/5 overflow-hidden flex-1 flex flex-col shadow-2xl min-h-[350px]">
        {isResolving ? (
          <div className="flex flex-col items-center justify-center flex-1 p-20">
            <div className="w-16 h-16 rounded-full border-4 border-t-emerald-400 border-r-transparent border-b-emerald-400 border-l-transparent animate-spin mb-6"></div>
            <p className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Sintonizando frecuencia...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 p-20 text-center">
            <Search size={64} className="text-gray-800 mb-8" />
            <p className="text-gray-500 font-bold uppercase tracking-widest">No se encontraron resultados.</p>
            <p className="text-xs text-gray-600 mt-2">Intenta buscar otra canción o artista en la barra superior o en Integraciones.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {searchResults.map((track: any, i: number) => (
              <div
                key={track.id || i}
                onClick={() => handlePlaySearchResult(track)}
                className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-6 min-w-0 flex-1">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex-shrink-0 flex items-center justify-center">
                    {track.coverUrl ? (
                      <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <Music size={22} className="text-gray-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base truncate text-white group-hover:text-emerald-400 transition-colors">{track.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{track.artist || "Artista Desconocido"} {track.reason ? `• ${track.reason}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-90 group-hover:scale-100">
                    <Play size={18} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView onAISearch={handleAISearch} isIAReady={isIAReady} />;
      case 'discover': return <DiscoverView onAlchemist={handleAlchemist} />;
      case 'neurid_ai': return <NeuridAIView onProcessCommand={processCommandWithWorker} />;
      case 'library': return <LibraryView />;
      case 'playlists': return <PlaylistsView />;
      case 'lyrics': return <LyricsView />;
      case 'integrations': return <IntegrationsView onAuditor={handleAuditor} />;
      case 'settings': return <SettingsView isIAReady={isIAReady} />;
      case 'search': return <SearchResultsView />;
      default: return <HomeView onAISearch={handleAISearch} isIAReady={isIAReady} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white font-sans overflow-hidden">

      {/* Sidebar - Premium Dark */}
      <aside className="w-72 bg-[#121620]/80 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between z-50 relative shadow-2xl">
        <div>
          {/* Logo Section */}
          <div className="p-8 flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:scale-110 transition-transform duration-500">
              <Zap className="text-white fill-current" size={24} />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter leading-none">NEURID</h1>
              <p className="text-[10px] font-black text-emerald-400/60 uppercase tracking-[0.3em]">Studio v2.5</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-6 space-y-2">
            <NavItem icon={<Home size={20} />} label="Inicio" active={activeTab === 'home'} onClick={() => { setActiveTab('home'); }} />
            <NavItem icon={<Compass size={20} />} label="Descubrir" active={activeTab === 'discover'} onClick={() => { setActiveTab('discover'); }} />
            <NavItem icon={<Library size={20} />} label="Biblioteca" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); }} />
            <NavItem icon={<ListMusic size={20} />} label="Playlists" active={activeTab === 'playlists'} onClick={() => { setActiveTab('playlists'); }} />
            
            <div className="py-4">
              <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Core Intelligence</p>
              <NavItem icon={<Cpu size={20} />} label="Neurid AI" active={activeTab === 'neurid_ai'} onClick={() => { setActiveTab('neurid_ai'); }} isNeon />
              <NavItem icon={<Terminal size={20} />} label="Engineering" active={showDevModal} onClick={() => { setShowDevModal(true); }} />
            </div>

            <div className="py-4 border-t border-white/5">
              <p className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Ecosystem</p>
              <NavItem icon={<Link2 size={20} />} label="Integraciones" active={activeTab === 'integrations'} onClick={() => { setActiveTab('integrations'); }} />
              <NavItem icon={<Settings size={20} />} label="Ajustes" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); }} />
            </div>
          </nav>
        </div>

        {/* User / Dev Profile */}
        <div 
          className="p-8 border-t border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group"
          onClick={() => setShowDevModal(true)}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
            <User size={24} className="text-gray-400 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">Developer_Node</p>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] text-emerald-400 font-black uppercase">System Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-[radial-gradient(circle_at_top_right,#1a1f2e,transparent)]">
        
        {/* Header - Glassmorphism Sticky */}
        <header className="sticky top-0 w-full h-24 px-12 flex items-center justify-between z-40 bg-[#0d1117]/40 backdrop-blur-2xl border-b border-white/5">
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white/5 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all">
              <Search className="text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Pregunta a la IA: 'Pon algo de jazz tranquilo' o 'Analiza mi gusto musical'..."
                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder-gray-600"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISearch(aiQuery)}
              />
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/10">CTRL + K</span>
              </div>
            </div>
            

          </div>

          <div className="flex items-center gap-6">
            {aiStatus && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{aiStatus}</span>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><History size={20} /></button>
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"><Database size={20} /></button>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-12 py-10 pb-32 custom-scrollbar">
          {renderContent()}
        </div>

        {/* Global Background Artifacts */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </main>

      {/* Track Insights Overlay */}
      {showInsights && insightsData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end p-12 bg-black/40 backdrop-blur-md animate-in fade-in duration-500">
          <div className="w-[500px] h-full bg-[#161b26] rounded-[40px] border border-white/10 p-12 shadow-2xl relative overflow-hidden flex flex-col">
            <button 
              onClick={() => setShowInsights(false)}
              className="absolute top-8 right-8 p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-12">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-2xl mb-8">
                <Info size={40} className="text-white" />
              </div>
              <h2 className="text-4xl font-black mb-2">{insightsData.title}</h2>
              <p className="text-emerald-400 font-black uppercase tracking-[0.3em]">{insightsData.artist}</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-12 pr-4">
              {insightsData.type === 'auditor' ? (
                <section>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-blue-400" /> ANÁLISIS DEL AUDITOR
                  </h3>
                  <div className="p-8 rounded-[32px] bg-blue-400/5 border border-blue-400/10 text-gray-300 leading-relaxed whitespace-pre-line">
                    {insightsData.analysis}
                  </div>
                </section>
              ) : insightsData.type === 'alchemist' ? (
                <section>
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Flame size={14} className="text-orange-400" /> MEZCLA DESTILADA
                  </h3>
                  <div className="space-y-4">
                    {insightsData.tracks?.map((t: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                        <div>
                          <p className="font-bold">{t.title}</p>
                          <p className="text-xs text-gray-500">{t.artist} • <span className="text-orange-400/60 italic">{t.vibe}</span></p>
                        </div>
                        <Play size={16} className="text-gray-700 group-hover:text-white transition-all cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <>
                  <section>
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-400" /> CRÓNICA NEURONAL
                    </h3>
                    <div className="p-8 rounded-[32px] bg-emerald-400/5 border border-emerald-400/10 relative">
                      <p className="text-lg leading-relaxed text-gray-300 font-medium italic">
                        "{insightsData.lore || "Analizando el alma de la canción..."}"
                      </p>
                    </div>
                  </section>

                  <section className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-2 tracking-widest">VIBRA</p>
                      <p className="text-xl font-black">INMERSIVA</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase mb-2 tracking-widest">DENSIDAD</p>
                      <p className="text-xl font-black">MEDIA</p>
                    </div>
                  </section>
                </>
              )}
            </div>

            <button className="w-full mt-8 py-5 bg-white text-black font-black rounded-3xl hover:scale-105 transition-transform flex items-center justify-center gap-3 shadow-2xl">
              <Plus size={20} /> {insightsData.type === 'alchemist' ? 'GUARDAR MEZCLA' : 'AGREGAR A MI ESTUDIO'}
            </button>
          </div>
        </div>
      )}

      {/* Engineering Console Modal */}
      {showDevModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-24 bg-black/80 backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="w-full max-w-6xl h-full bg-[#0d1117] rounded-[40px] border border-white/10 overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            <header className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Terminal size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tighter">ENGINEERING_CONSOLE</h2>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural Link: Established</p>
                </div>
              </div>
              <button onClick={() => setShowDevModal(false)} className="p-4 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all"><X size={24} /></button>
            </header>
            
            <div className="flex-1 p-10 overflow-y-auto font-mono text-xs space-y-6 custom-scrollbar bg-black/20">
              <div className="text-emerald-500/40">
                [SYSTEM_BOOT] Initialize Neurid Core... OK<br/>
                [DEVICES] Scanning Audio Engines... OK<br/>
                [AI_LINK] Connecting to Gemini API... OK<br/>
                [READY] Waiting for engineering commands.
              </div>
              {terminalHistory.map((line, i) => (
                <div key={i} className={line.startsWith('>') ? 'text-white font-bold' : 'text-emerald-400 bg-emerald-400/5 p-8 rounded-[32px] border border-emerald-500/10 leading-relaxed'}>
                  {line}
                </div>
              ))}
            </div>

            <div className="p-10 border-t border-white/5 bg-white/5">
              <div className="bg-black/40 border border-white/10 rounded-[32px] p-6 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all">
                <Code size={20} className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Introduce un comando o pregunta al núcleo..."
                  className="bg-transparent border-none outline-none w-full font-mono text-emerald-400"
                  value={devInput}
                  onChange={(e) => setDevInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDevChat(devInput)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Player Bar - Ultra Premium Sleek Dock */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0d1117]/95 backdrop-blur-3xl border-t border-white/5 z-[60] flex items-center px-12 justify-between">
        
        {/* Left Side: Track Info */}
        <div className="flex items-center gap-5 w-[350px] min-w-0">
          <div 
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 overflow-hidden relative group/cover cursor-pointer flex-shrink-0"
            onClick={() => currentTrack && handleLore(currentTrack)}
          >
            {currentTrack?.coverUrl ? (
              <img src={currentTrack.coverUrl} className="w-full h-full object-cover group-hover/cover:scale-110 transition-transform duration-1000" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-700 bg-black/40">
                <Music size={24} />
              </div>
            )}
            <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={20} className="text-white animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate text-white hover:text-emerald-400 transition-colors cursor-pointer leading-tight mb-1" onClick={() => currentTrack && handleLore(currentTrack)}>
              {isResolving ? "Sintonizando..." : (currentTrack?.title || "En espera")}
            </h3>
            <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-widest truncate opacity-70">
              {currentTrack?.artist || "Sistema Inactivo"}
            </p>
          </div>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex-1 max-w-xl flex flex-col items-center gap-2">
          <div className="flex items-center gap-8">
            <button className="text-gray-600 hover:text-white transition-colors hover:scale-110"><Shuffle size={16} /></button>
            <button onClick={prevTrack} className="text-gray-400 hover:text-white hover:scale-125 transition-all"><SkipBack size={20} fill="currentColor" /></button>
            <button 
              onClick={isPlaying ? pause : resume}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md group/play flex-shrink-0"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
            </button>
            <button onClick={nextTrack} className="text-gray-400 hover:text-white hover:scale-125 transition-all"><SkipForward size={20} fill="currentColor" /></button>
            <button className="text-gray-600 hover:text-white transition-colors hover:scale-110"><Repeat size={16} /></button>
          </div>
          
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] font-bold text-gray-500 w-10 text-right font-mono">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full relative group cursor-pointer overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-purple-500 shadow-[0_0_10px_#34d399]" 
                style={{ width: `${(currentTime / (currentTrack?.duration || 180)) * 100}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 w-10 font-mono">{formatTime(currentTrack?.duration || 0)}</span>
          </div>
        </div>

        {/* Right Side: Volume & Extra Actions */}
        <div className="flex items-center gap-6 w-[350px] justify-end">
          <button 
            onClick={() => setActiveTab('lyrics')}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 ${activeTab === 'lyrics' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            <Mic size={18} />
          </button>
          <div className="flex items-center gap-3 w-32 group/vol flex-shrink-0">
            <Volume2 size={18} className="text-gray-500 group-hover/vol:text-white transition-colors flex-shrink-0" />
            <div className="flex-1 h-1 bg-white/10 rounded-full relative overflow-hidden">
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
              <div className="h-full bg-white group-hover/vol:bg-emerald-400 transition-all" style={{ width: `${volume * 100}%` }}></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const NeuridAIView = ({ onProcessCommand }: { onProcessCommand: (text: string) => Promise<boolean> }) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: '¡Hola! Soy el núcleo de Inteligencia Artificial local Neurid (Gemma-2b). ¿Qué te gustaría crear o buscar hoy? Puedo diseñar playlists, escribir lore para canciones o hablar de música.' }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isAiTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setIsAiTyping(true);
    try {
      const wasCommand = await onProcessCommand(text);
      if (wasCommand) {
        setMessages(prev => [...prev, { role: 'assistant', content: `[Comando Ejecutado] Ejecuté la instrucción localmente en el reproductor.` }]);
        setIsAiTyping(false);
        return;
      }
      const response = await localAIService.query(text);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `[ERROR] No se pudo comunicar con el núcleo local: ${err.message}` }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col gap-10">
      {/* Dynamic Header */}
      <div className="relative h-[240px] w-full rounded-[48px] overflow-hidden border border-white/5 bg-[#121620]/40 backdrop-blur-md group shadow-2xl flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-[#0d1117]/20 to-transparent z-10"></div>
        <div className="absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity">
          <Visualizer />
        </div>
        <div className="absolute bottom-8 left-12 z-20">
          <div className="flex items-center gap-8 mb-4">
            <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_40px_rgba(52,211,153,0.2)] animate-pulse-neon">
              <Cpu className="text-emerald-400" size={32} />
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tighter leading-none italic text-white">NEURID <span className="text-emerald-400">CORE</span></h2>
              <p className="text-emerald-400/60 text-xs mt-2 uppercase tracking-[0.4em] font-black italic">Neural Processing Engine v2.5.0_BETA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1 min-h-[400px]">
        {/* Chat window - taking 2 cols */}
        <div className="lg:col-span-2 flex flex-col bg-[#121620]/40 backdrop-blur-md border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-hidden h-[520px]">
          {/* Conversation history */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-6 mb-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Cpu size={18} />
                  </div>
                )}
                <div
                  className={`p-6 rounded-[24px] max-w-[80%] text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-black font-semibold rounded-tr-none'
                      : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            {isAiTyping && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Cpu size={18} />
                </div>
                <div className="p-6 rounded-[24px] bg-white/5 border border-white/5 text-gray-400 text-sm italic flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>Neurid está generando respuesta...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt quick items */}
          <div className="flex flex-wrap gap-2.5 mb-6 flex-shrink-0">
            <button
              onClick={() => handleSend("Escribe un poema corto sobre música lo-fi")}
              className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-400/5 border border-emerald-500/10 px-4 py-2.5 rounded-full hover:bg-emerald-400 hover:text-black transition-all"
            >
              🎵 Poema Lo-Fi
            </button>
            <button
              onClick={() => handleSend("Dime por qué el formato FLAC suena mejor que el MP3")}
              className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-400/5 border border-purple-500/10 px-4 py-2.5 rounded-full hover:bg-purple-400 hover:text-black transition-all"
            >
              💿 FLAC vs MP3
            </button>
            <button
              onClick={() => handleSend("Inventa 3 nombres ingeniosos para playlists de rock psicodélico")}
              className="text-[10px] font-black uppercase tracking-wider text-orange-400 bg-orange-400/5 border border-orange-500/10 px-4 py-2.5 rounded-full hover:bg-orange-400 hover:text-black transition-all"
            >
              ⚡ Playlists Psicodélicas
            </button>
          </div>

          {/* Prompt input */}
          <div className="bg-black/40 border border-white/10 rounded-[24px] p-2 flex items-center gap-4 focus-within:border-emerald-500/50 transition-all flex-shrink-0">
            <input
              type="text"
              placeholder="Hazle una consulta al núcleo local (Gemma-2b)..."
              className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-sm text-white placeholder-gray-600"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(chatInput)}
              disabled={isAiTyping}
            />
            <button
              onClick={() => handleSend(chatInput)}
              disabled={isAiTyping || !chatInput.trim()}
              className="p-4 rounded-xl bg-white text-black hover:scale-105 transition-all shadow-lg hover:bg-emerald-400 hover:text-black disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right side - status cards & info */}
        <div className="flex flex-col gap-6 justify-between h-[520px]">
          <AIStatusCard label="MOTOR DE INFERENCIA" value="LLAMA.CPP v2" color="emerald" icon={<Zap size={20} />} />
          <AIStatusCard label="MEMORIA SINÁPTICA" value="1.7 GB / GEMMA-2B" color="purple" icon={<Database size={20} />} />
          <AIStatusCard label="NÚCLEO DE CÓMPUTO" value="MINILM-L6-V2" color="blue" icon={<ShieldCheck size={20} />} />
          
          <div className="bg-gradient-to-br from-emerald-500/5 to-purple-500/5 border border-white/5 rounded-[40px] p-8 flex-1 flex flex-col justify-center">
            <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles size={16} /> MODELO TOTALMENTE LOCAL
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              A diferencia de otros reproductores, Neurid ejecuta su inteligencia artificial <strong>Gemma-2b</strong> directamente en tu procesador, garantizando privacidad absoluta y funcionamiento sin conexión a internet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIStatusCard = ({ label, value, color, icon }: any) => {
  const colorMap: any = {
    emerald: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/5 border-purple-500/10',
    blue: 'text-blue-400 bg-blue-500/5 border-blue-500/10',
  };
  return (
    <div className={`backdrop-blur-md border rounded-[30px] p-6 shadow-2xl transition-all group ${colorMap[color] || 'text-white border-white/5'}`}>
      <div className="flex items-center gap-4 mb-3 opacity-60">
        <div>{icon}</div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em]">{label}</p>
      </div>
      <p className="text-xl font-black tracking-tighter text-white">{value}</p>
    </div>
  );
};

export default App;