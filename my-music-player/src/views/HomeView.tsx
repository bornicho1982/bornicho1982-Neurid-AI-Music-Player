import React, { useState } from 'react';
import { usePlayerStore, Track } from '../store/playerStore';
import { spotifyConnector } from '../services/spotifyConnector';
import { deezerConnector } from '../services/deezerConnector';
import { pipedResolver } from '../services/pipedResolver';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { 
  Search, 
  Sparkles, 
  Play, 
  Music, 
  TrendingUp, 
  Disc, 
  FolderPlus, 
  Layers, 
  Loader2,
  ListMusic
} from 'lucide-react';

interface HomeViewProps {
  onAISearch: (query: string) => Promise<void>;
  isIAReady: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onAISearch, isIAReady }) => {
  const { library, importSingleFile, loadLibrary } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCard, setLoadingCard] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filter last 5 scanned local tracks
  const recentTracks = [...library]
    .sort((a, b) => (b.scanDate || 0) - (a.scanDate || 0))
    .slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && isIAReady) {
      onAISearch(searchQuery);
    }
  };

  const handleImportSingleFile = async () => {
    try {
      setIsImporting(true);
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Audio Files',
          extensions: ['mp3', 'flac', 'wav', 'm4a', 'ogg']
        }]
      });

      if (selected && typeof selected === 'string') {
        const track = await importSingleFile(selected);
        alert(`¡Canción importada con éxito!\n"${track.title}" agregada a la biblioteca.`);
        await loadLibrary();
      }
    } catch (e) {
      console.error("Error importing file:", e);
      alert("Error al importar el archivo.");
    } finally {
      setIsImporting(false);
    }
  };

  const loadTrend = async (type: 'spotify' | 'yt' | 'deezer' | 'aimix') => {
    if (loadingCard) return;
    setLoadingCard(type);
    try {
      let tracksToPlay: Track[] = [];

      if (type === 'spotify') {
        // Fetch Spotify Global Top 50
        const data = await spotifyConnector.getPlaylistMetadataAndTracks('37i9dQZEVXbMDoHDGih2tA');
        tracksToPlay = data.tracks.map(t => ({
          id: `spotify-${t.id}`,
          path: `${t.name} ${t.artists.join(' ')}`,
          title: t.name,
          artist: t.artists.join(', '),
          isRemote: true,
          coverUrl: t.coverUrl
        }));
      } else if (type === 'deezer') {
        // Fetch Deezer Top Global (playlist ID 3155776842)
        const data = await deezerConnector.getPlaylistTracks('3155776842');
        tracksToPlay = data.map(t => ({
          id: `deezer-${t.id}`,
          path: `${t.title} ${t.artist}`,
          title: t.title,
          artist: t.artist,
          isRemote: true,
          coverUrl: t.albumCover
        }));
      } else if (type === 'yt') {
        // Fetch YT Music trends through Piped search
        const data = await pipedResolver.search('trending hit music videos');
        tracksToPlay = data.map(t => ({
          id: `yt-${t.videoId}`,
          path: t.videoId,
          title: t.title,
          artist: t.uploaderName,
          isRemote: true,
          coverUrl: t.thumbnail,
          duration: t.duration
        }));
      } else if (type === 'aimix') {
        // Fetch custom AI radio mix
        const data = await pipedResolver.search('cyberpunk synthwave chill mix');
        tracksToPlay = data.map(t => ({
          id: `yt-${t.videoId}`,
          path: t.videoId,
          title: t.title,
          artist: t.uploaderName,
          isRemote: true,
          coverUrl: t.thumbnail,
          duration: t.duration
        }));
      }

      if (tracksToPlay.length > 0) {
        usePlayerStore.setState({ queue: tracksToPlay, currentIndex: 0 });
        await invoke('replace_queue', { tracks: tracksToPlay });
        await usePlayerStore.getState().playTrack(0);
      } else {
        alert("No se encontraron canciones en esta tendencia en este momento.");
      }
    } catch (e) {
      console.error("Error loading trend:", e);
      alert("No se pudo cargar la tendencia. Revisa tu conexión a internet.");
    } finally {
      setLoadingCard(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-12 animate-in fade-in duration-700">
      
      {/* SECTION 1: HERO BANNER (Animated Gradient) */}
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-r from-emerald-500/10 via-purple-600/10 to-indigo-500/10 animate-gradient-shift p-10 md:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        {/* Decorative Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
            <Sparkles size={14} />
            Motor Neurid AI Activo
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Descubre música guiada por la <span className="bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent">Inteligencia Artificial</span>
          </h1>
          
          <p className="text-gray-300 text-base md:text-lg font-light leading-relaxed">
            Pídele a Neurid que sintonice pistas, filtre tu biblioteca o genere clasificaciones personalizadas con solo describir tu estado de ánimo o actividad.
          </p>

          {/* AI Search input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-[#0d1117]/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300">
            <div className="pl-4 text-gray-400 flex-shrink-0">
              {isIAReady ? <Search size={20} /> : <Loader2 className="animate-spin text-emerald-400" size={20} />}
            </div>
            <input 
              type="text" 
              placeholder={isIAReady ? 'Prueba con "Ponme algo de synthwave retro" o "Música instrumental acústica"...' : 'Cargando cerebro neuronal...'}
              disabled={!isIAReady}
              className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-3 outline-none text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!isIAReady || !searchQuery.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-black font-semibold rounded-xl px-6 py-3 transition-all duration-200 flex items-center gap-2 flex-shrink-0 shadow-lg shadow-emerald-500/20 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {isIAReady ? (
                <>
                  <Sparkles size={16} />
                  Preguntar
                </>
              ) : (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Cargando...
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* SECTION 2: TRENDS GRID */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={22} />
              Tendencias Globales
            </h2>
            <p className="text-gray-400 text-sm">Escucha las tendencias mundiales al instante en tu reproductor</p>
          </div>
          
          {/* Importer Button */}
          <button 
            onClick={handleImportSingleFile}
            disabled={isImporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 transition-all duration-300 text-sm font-semibold shadow-md disabled:opacity-50"
          >
            {isImporting ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <FolderPlus size={16} />
            )}
            Importar Canción
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Spotify */}
          <div 
            onClick={() => loadTrend('spotify')}
            className="group relative overflow-hidden bg-[#121620]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:border-emerald-500/30 shadow-xl cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Music size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Top Spotify Global</h3>
                <p className="text-gray-400 text-xs mt-1">Los 50 éxitos más escuchados del planeta</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-emerald-500/80 text-xs font-semibold">50 Canciones</span>
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  {loadingCard === 'spotify' ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: YouTube Music */}
          <div 
            onClick={() => loadTrend('yt')}
            className="group relative overflow-hidden bg-[#121620]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:border-red-500/30 shadow-xl cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform">
                <ListMusic size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">Trends YouTube Music</h3>
                <p className="text-gray-400 text-xs mt-1">Videoclips y sencillos de moda en YouTube</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-red-500/80 text-xs font-semibold">Éxitos de vídeo</span>
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  {loadingCard === 'yt' ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Deezer */}
          <div 
            onClick={() => loadTrend('deezer')}
            className="group relative overflow-hidden bg-[#121620]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:border-blue-500/30 shadow-xl cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Disc size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Lo más top en Deezer</h3>
                <p className="text-gray-400 text-xs mt-1">Listas de reproducción globales recomendadas</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-blue-500/80 text-xs font-semibold">Deezer Hits</span>
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  {loadingCard === 'deezer' ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AI Cyber Mix */}
          <div 
            onClick={() => loadTrend('aimix')}
            className="group relative overflow-hidden bg-[#121620]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:border-purple-500/30 shadow-xl cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Sparkles size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">IA Cyber Synth Mix</h3>
                <p className="text-gray-400 text-xs mt-1">Mix seleccionado de ambientación synthwave</p>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-purple-500/80 text-xs font-semibold">Clasificación IA</span>
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  {loadingCard === 'aimix' ? (
                    <Loader2 className="animate-spin" size={14} />
                  ) : (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: RECENT LOCAL ALBUMS/TRACKS CAROUSEL */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="text-emerald-400" size={22} />
          Importaciones Recientes
        </h2>
        
        {recentTracks.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#121620]/30 p-10 text-center space-y-4">
            <div className="text-gray-500 text-sm">Aún no has importado canciones locales a tu biblioteca.</div>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {recentTracks.map((track, i) => (
              <div 
                key={track.id || i}
                onClick={async () => {
                  const trackIndex = library.findIndex(t => t.id === track.id);
                  if (trackIndex !== -1) {
                    const mappedQueue = library.map(t => ({
                      id: t.id,
                      path: t.path,
                      title: t.title || t.filename,
                      artist: t.artist,
                      album: t.album,
                      duration: t.duration
                    }));
                    usePlayerStore.setState({ queue: mappedQueue, currentIndex: trackIndex });
                    await invoke('replace_queue', { tracks: mappedQueue });
                    await usePlayerStore.getState().playTrack(trackIndex);
                  }
                }}
                className="flex-shrink-0 w-48 bg-[#121620]/40 hover:bg-[#121620]/80 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer space-y-3 group animate-in fade-in slide-in-from-bottom-8"
              >
                <div className="aspect-square w-full rounded-xl bg-white/5 flex items-center justify-center text-gray-500 overflow-hidden relative shadow-md">
                  <Disc size={40} className="text-gray-600 group-hover:rotate-45 transition-transform duration-700" />
                  
                  {/* Hover play button */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm truncate group-hover:text-emerald-400 transition-colors">
                    {track.title || track.filename}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {track.artist || 'Artista Desconocido'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
