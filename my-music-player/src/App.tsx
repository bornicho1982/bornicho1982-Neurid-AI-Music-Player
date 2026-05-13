import React, { useState } from 'react';
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
  List,
  FolderPlus,
  MonitorSpeaker,
  Mic,
  Link2,
  CheckCircle2,
  User
} from 'lucide-react';
import { usePlayerStore } from './store/playerStore';
import { processCommand } from './ai/aiWorker';

const App = () => {
  const [activeTab, setActiveTab] = useState('neurid_ai');
  const [aiQuery, setAiQuery] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const { isPlaying, pause, resume, queue, currentIndex, nextTrack, prevTrack, volume, setVolume } = usePlayerStore();

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;

  // Vistas de la aplicación
  const renderContent = () => {
    switch (activeTab) {
      case 'neurid_ai':
        return <NeuridAIView />;
      case 'library':
        return <LibraryView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <NeuridAIView />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-white font-sans overflow-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-[#121620]/50 backdrop-blur-sm border-r border-white/5 flex flex-col justify-between z-10 relative">
        <div>
          {/* Logo */}
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.4)]">
              <span className="font-bold text-white text-lg">N</span>
            </div>
            <h1 className="font-semibold text-xl tracking-wide">NEURID <span className="font-light opacity-70">STUDIO</span></h1>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4 space-y-2">
            <NavItem icon={<Library size={20} />} label="Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
            <NavItem icon={<ListMusic size={20} />} label="Playlists" active={activeTab === 'playlists'} onClick={() => setActiveTab('playlists')} />
            <NavItem icon={<Compass size={20} />} label="Discover" active={activeTab === 'discover'} onClick={() => setActiveTab('discover')} />
            <div className="my-4 border-t border-white/5"></div>
            <NavItem
              icon={<Cpu size={20} />}
              label="Neurid AI"
              active={activeTab === 'neurid_ai'}
              onClick={() => setActiveTab('neurid_ai')}
              isNeon
            />
            <NavItem icon={<Link2 size={20} />} label="Vincular Cuentas" active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} />
            <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-6 border-t border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <User size={20} className="text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Modo Desarrollador</p>
            <p className="text-xs text-emerald-400">Tauri Core Activo</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {/* Top Header / Search */}
        <header className="p-8 pb-4 flex justify-between items-center z-10 relative">
          <div className="relative w-full max-w-2xl group flex flex-col gap-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
            <div className="relative bg-[#161b26] rounded-full flex items-center px-6 py-3 border border-white/10">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    processCommand(aiQuery, setAiStatus);
                    setAiQuery('');
                  }
                }}
                placeholder="Pregunta a Neurid AI (ej: 'pausa la musica', 'siguiente cancion')..."
                className="bg-transparent border-none outline-none w-full text-gray-200 placeholder-gray-500 text-sm"
              />
              <button
                onClick={() => {
                   processCommand(aiQuery, setAiStatus);
                   setAiQuery('');
                }}
              >
                <Search size={18} className="text-gray-400 ml-2 hover:text-emerald-400 transition-colors" />
              </button>
            </div>
            {aiStatus && <p className="text-xs text-emerald-400 font-mono pl-4">{aiStatus}</p>}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 pt-4 pb-32 custom-scrollbar relative z-10">
          {renderContent()}
        </div>

        {/* Fondo decorativo principal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-0"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none -z-0"></div>
      </main>

      {/* Bottom Player (Glassmorphism) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[1200px] h-[90px] z-50 group">
        {/* Glow effect behind player */}
        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-purple-500/10 to-emerald-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 -z-10"></div>

        {/* Glass panel */}
        <div className="w-full h-full bg-[#1c212e]/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center px-6 justify-between">

          {/* Track Info */}
          <div className="flex items-center gap-4 w-1/4">
            <div className="w-14 h-14 rounded-md overflow-hidden relative group/cover cursor-pointer bg-gray-800">
              {currentTrack ? (
                 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-purple-600 text-white font-bold text-xl">
                   {currentTrack.title.substring(0, 1)}
                 </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListMusic className="text-gray-500" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 hidden group-hover/cover:flex items-center justify-center">
                <Search size={20} className="text-white" />
              </div>
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-white text-sm hover:underline cursor-pointer truncate">
                {currentTrack ? currentTrack.title : "No track playing"}
              </h3>
              <p className="text-purple-400 text-xs font-medium hover:underline cursor-pointer truncate">
                {currentTrack ? "Local Audio" : "-"}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center w-2/4 max-w-md">
            <div className="flex items-center gap-6 mb-2">
              <button className="text-gray-400 hover:text-white transition-colors"><Shuffle size={18} /></button>
              <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
              <button
                onClick={() => isPlaying ? pause() : resume()}
                disabled={queue.length === 0}
                className="w-10 h-10 rounded-full bg-transparent border-2 border-emerald-400 text-emerald-400 flex items-center justify-center hover:bg-emerald-400 hover:text-black hover:shadow-[0_0_15px_rgba(52,211,153,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPlaying ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-1" />}
              </button>
              <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
              <button className="text-gray-400 hover:text-white transition-colors"><Repeat size={18} /></button>
            </div>
            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-full text-xs text-gray-400 font-mono">
              <span>0:00</span>
              <div className="h-1 flex-1 bg-white/10 rounded-full relative cursor-pointer group/bar">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-300 w-[0%] rounded-full group-hover/bar:from-emerald-300 group-hover/bar:to-emerald-200">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] opacity-0 group-hover/bar:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <span>-:--</span>
            </div>
          </div>

          {/* Extra Controls */}
          <div className="flex items-center justify-end gap-4 w-1/4 text-gray-400">
            <button className="hover:text-emerald-400 transition-colors"><Mic size={18} /></button>
            <button className="hover:text-white transition-colors"><List size={18} /></button>
            <div className="flex items-center gap-2 group/vol cursor-pointer">
              <Volume2 size={18} className="group-hover/vol:text-white transition-colors" />
              <div className="w-20 h-1 bg-white/10 rounded-full relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="absolute top-0 left-0 h-full bg-gray-400 group-hover/vol:bg-emerald-400 rounded-full" style={{ width: `${volume * 100}%` }}></div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

// --- Sub-components (Views) ---

const NeuridAIView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center gap-3 mb-6">
      <Cpu className="text-emerald-400" size={24} />
      <h2 className="text-2xl font-bold tracking-tight">AI Recommendations</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NeonCard
        title="SYNTHETIC ECHOES"
        subtitle="Chill Synth"
        time="3:45"
        color="emerald"
        image="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400"
      />
      <NeonCard
        title="VIOLET DREAMS"
        subtitle="Ambient"
        time="4:12"
        color="purple"
        image="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=400"
      />
      <NeonCard
        title="NEON RHYTHMS"
        subtitle="Cyber Funk"
        time="3:58"
        color="emerald"
        image="https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=400"
      />
    </div>

    <h2 className="text-xl font-semibold tracking-tight mt-12 mb-6 text-gray-400">RECENTLY PLAYED</h2>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all">
          <div className="absolute inset-0 bg-gradient-to-t from-[#121620] to-transparent opacity-80 z-10"></div>
          <div className="absolute bottom-3 left-3 z-20">
            <div className="w-8 h-2 bg-white/20 rounded-full mb-1"></div>
            <div className="w-12 h-2 bg-white/10 rounded-full"></div>
          </div>
          <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="mix" />
        </div>
      ))}
    </div>
  </div>
);

import { open } from '@tauri-apps/plugin-dialog';

const LibraryView = () => {
  const { queue, playTrack, currentIndex, scanLocalFolder } = usePlayerStore();

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && typeof selected === 'string') {
        await scanLocalFolder(selected);
      }
    } catch (err) {
      console.error("Failed to select folder", err);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1">Tu Biblioteca Local</h2>
          <p className="text-gray-400 text-sm">Gestiona tus archivos escaneados por el motor de Rust.</p>
        </div>
        <button
          onClick={handleSelectFolder}
          className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all font-medium"
        >
          <FolderPlus size={18} />
          [+] AGREGAR CARPETA
        </button>
      </div>

      <div className="bg-[#161b26]/80 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-gray-400 border-b border-white/5">
            <tr>
              <th className="p-4 font-medium w-12">#</th>
              <th className="p-4 font-medium">Título</th>
              <th className="p-4 font-medium">Ruta</th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500">
                  La biblioteca está vacía. Selecciona una carpeta para escanear archivos.
                </td>
              </tr>
            ) : (
              queue.map((track, idx) => (
                <tr
                  key={track.id}
                  onClick={() => playTrack(idx)}
                  className={`border-b border-white/5 hover:bg-white/5 group cursor-pointer transition-colors ${currentIndex === idx ? 'bg-white/10' : ''}`}
                >
                  <td className="p-4 text-gray-500">
                    <span className="group-hover:hidden">{currentIndex === idx ? <Play size={14} className="text-emerald-400" /> : idx + 1}</span>
                    <Play size={14} className="hidden group-hover:block text-emerald-400" />
                  </td>
                  <td className={`p-4 font-medium flex items-center gap-3 ${currentIndex === idx ? 'text-emerald-400' : 'text-white'}`}>
                    <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                      <ListMusic size={14} className="text-gray-400" />
                    </div>
                    {track.title}
                  </td>
                  <td className="p-4 text-purple-400 truncate max-w-xs" title={track.path}>{track.path}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const IntegrationsView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
    <div className="text-center mb-12 mt-4">
      <h2 className="text-3xl font-bold tracking-tight mb-2">Conecta tu Ecosistema</h2>
      <p className="text-gray-400">Sincroniza tus playlists y favoritos mediante las APIs oficiales.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Spotify Card */}
      <div className="bg-[#161b26]/50 backdrop-blur-sm border border-[#1DB954]/30 rounded-2xl p-8 flex flex-col items-center relative overflow-hidden group hover:border-[#1DB954] hover:shadow-[0_0_30px_rgba(29,185,84,0.15)] transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#1DB954]/10 blur-3xl rounded-full"></div>
        <div className="w-20 h-20 rounded-full bg-[#1DB954]/10 flex items-center justify-center mb-6">
          <MonitorSpeaker size={32} className="text-[#1DB954]" />
        </div>
        <h3 className="text-xl font-bold mb-2">Spotify</h3>
        <p className="text-gray-400 text-sm text-center mb-8">Importa tus bibliotecas y escucha los tops mundiales en alta calidad.</p>
        <button
          onClick={async () => {
            const { invoke } = await import('@tauri-apps/api/core');
            try {
              const code = await invoke('authenticate_spotify');
              console.log("Spotify Auth Code:", code);
              alert("Autenticación exitosa! Código capturado: " + code);
            } catch (e) {
              console.error(e);
              alert("Error en autenticación");
            }
          }}
          className="w-full bg-[#1DB954] text-black font-bold py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(29,185,84,0.4)]"
        >
          VINCULAR CUENTA
        </button>
        <p className="mt-4 text-xs text-gray-500 font-mono">Estado: No Conectado</p>
      </div>

      {/* Deezer Card */}
      <div className="bg-[#161b26]/50 backdrop-blur-sm border border-[#A238FF]/30 rounded-2xl p-8 flex flex-col items-center relative overflow-hidden group hover:border-[#A238FF] hover:shadow-[0_0_30px_rgba(162,56,255,0.15)] transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#A238FF]/10 blur-3xl rounded-full"></div>
        <div className="w-20 h-20 rounded-full bg-[#A238FF]/10 flex items-center justify-center mb-6">
          <MonitorSpeaker size={32} className="text-[#A238FF]" />
        </div>
        <h3 className="text-xl font-bold mb-2">Deezer</h3>
        <p className="text-gray-400 text-sm text-center mb-8">Sincroniza tus Flow y mixes personalizados directamente en Neurid.</p>
        <button className="w-full bg-[#A238FF] text-white font-bold py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(162,56,255,0.4)]">
          VINCULAR CUENTA
        </button>
        <p className="mt-4 text-xs text-gray-500 font-mono">Estado: No Conectado</p>
      </div>

      {/* YouTube Card */}
      <div className="bg-[#161b26]/50 backdrop-blur-sm border border-[#FF0000]/30 rounded-2xl p-8 flex flex-col items-center relative overflow-hidden group hover:border-[#FF0000] hover:shadow-[0_0_30px_rgba(255,0,0,0.15)] transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF0000]/10 blur-3xl rounded-full"></div>
        <div className="w-20 h-20 rounded-full bg-[#FF0000]/10 flex items-center justify-center mb-6">
          <Play size={32} className="text-[#FF0000] fill-current" />
        </div>
        <h3 className="text-xl font-bold mb-2">YouTube Music</h3>
        <p className="text-gray-400 text-sm text-center mb-8">Accede a mixes, covers y listas de reproducción comunitarias infinitas.</p>
        <button className="w-full bg-[#FF0000] text-white font-bold py-3 rounded-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,0,0,0.4)]">
          VINCULAR CUENTA
        </button>
        <p className="mt-4 text-xs text-gray-500 font-mono">Estado: No Conectado</p>
      </div>
    </div>
  </div>
);

const SettingsView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
    <h2 className="text-3xl font-bold tracking-tight mb-8">Ajustes del Sistema y IA</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Columna 1 */}
      <div className="space-y-6">
        <div className="bg-[#161b26]/80 border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-400">
            <Cpu size={18} /> Configuración IA Local
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Modelo Integrado (Transformers.js)</label>
              <select className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:border-emerald-500 transition-colors">
                <option>Xenova/distilbert-base (Ligero)</option>
                <option>Xenova/all-MiniLM-L6-v2 (Recomendado)</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium">Habilitar IA en Buscador</p>
                <p className="text-xs text-gray-500">Ejecutar inferencia localmente</p>
              </div>
              <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161b26]/80 border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={18} /> General
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Tauri Core Status</span>
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                <CheckCircle2 size={12} /> Running (Rust)
              </span>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Idioma de Interfaz</label>
              <select className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-2.5 text-sm outline-none">
                <option>Español (España)</option>
                <option>English (US)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Columna 2 */}
      <div className="space-y-6">
        <div className="bg-[#161b26]/80 border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-400">
            <MonitorSpeaker size={18} /> Motor de Audio (Tauri/Rust)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Dispositivo de Salida</label>
              <select className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-2.5 text-sm outline-none focus:border-purple-500 transition-colors">
                <option>Predeterminado del Sistema (WASAPI)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-2">Calidad de Streaming</label>
              <div className="flex bg-[#0d1117] rounded-lg p-1 border border-white/10">
                <button className="flex-1 py-1.5 text-xs text-gray-400 hover:text-white rounded-md">Normal</button>
                <button className="flex-1 py-1.5 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-md font-medium shadow-[0_0_10px_rgba(168,85,247,0.2)]">Alta (320kbps)</button>
                <button className="flex-1 py-1.5 text-xs text-gray-400 hover:text-white rounded-md">Lossless</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- UI Helpers ---

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isNeon?: boolean;
}

const NavItem = ({ icon, label, active, onClick, isNeon }: NavItemProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
        active
          ? isNeon
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]'
            : 'bg-white/10 text-white font-medium'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
};

interface NeonCardProps {
  title: string;
  subtitle: string;
  time: string;
  color: 'emerald' | 'purple';
  image: string;
}

const NeonCard = ({ title, subtitle, time, color, image }: NeonCardProps) => {
  const borderColor = color === 'emerald' ? 'border-emerald-400/50' : 'border-purple-400/50';
  const shadowColor = color === 'emerald' ? 'hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]';

  return (
    <div className={`bg-[#161b26]/80 backdrop-blur-md rounded-2xl p-4 border ${borderColor} ${shadowColor} transition-all duration-300 group cursor-pointer relative overflow-hidden`}>
      <div className="w-full aspect-square rounded-xl overflow-hidden relative mb-4">
        <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded text-white/90">
          {time}
        </div>
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`w-12 h-12 rounded-full bg-${color}-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            <Play size={20} className="text-white fill-current ml-1" />
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-white tracking-wide text-sm truncate">{title}</h3>
        <p className="text-gray-400 text-xs mt-1">{subtitle}</p>
      </div>
    </div>
  );
};

export default App;