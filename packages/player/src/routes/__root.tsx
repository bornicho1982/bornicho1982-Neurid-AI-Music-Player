import { createRootRoute } from '@tanstack/react-router';
import {
  DiscIcon,
  ListMusicIcon,
  MusicIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
} from 'lucide-react';

import {
  PlayerShell,
  RouteTransition,
  SidebarNavigationItem,
  Toaster,
} from '@nuclearplayer/ui';

import { ConnectedPlayerBar } from '../components/ConnectedPlayerBar';
import { ConnectedQueuePanel } from '../components/ConnectedQueuePanel';
import { ConnectedSettingsModal } from '../components/ConnectedSettingsModal';
import { DevTools } from '../components/DevTools';
import { SoundProvider } from '../components/SoundProvider';
import { StreamResolver } from '../components/StreamResolver';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { useStartupStore } from '../stores/startupStore';

const RootComponent = () => {
  const openSettings = useSettingsModalStore((state) => state.open);
  const isStartingUp = useStartupStore((state) => state.isStartingUp);

  return (
    <PlayerShell className="bg-background text-foreground font-inter relative select-none">
      {!isStartingUp && <StreamResolver />}
      <SoundProvider>
        <div className="flex h-screen w-full overflow-hidden">
          {/* Minimalist Sidebar */}
          <aside className="neurid-sidebar flex-shrink-0 border-r border-white/5">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 bg-neurid-teal rounded-lg shadow-[0_0_15px_rgba(0,242,254,0.5)] flex items-center justify-center">
                <MusicIcon size={18} className="text-black" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">NEURID <span className="opacity-40">STUDIO</span></span>
            </div>

            <nav className="flex flex-col gap-8">
              <SidebarNavigationItem to="/library" icon={<MusicIcon size={20} />} label="Library" className="sidebar-link" />
              <SidebarNavigationItem to="/playlists" icon={<ListMusicIcon size={20} />} label="Playlists" className="sidebar-link" />
              <SidebarNavigationItem to="/dashboard" icon={<DiscIcon size={20} />} label="Discover" className="sidebar-link" />
              <SidebarNavigationItem to="/ai" icon={<SparklesIcon size={20} />} label="Neurid AI" className="sidebar-link" />
              <button onClick={() => openSettings()} className="sidebar-link text-left">
                <SettingsIcon size={20} />
                <span>Settings</span>
              </button>
            </nav>

            <div className="mt-auto">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                <UserIcon size={20} className="text-white/40" />
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col relative min-w-0">
            {/* Immersive Top Bar */}
            <header className="px-12 py-8 flex items-center justify-center">
              <div className="search-container">
                <input 
                  type="text" 
                  placeholder="Ask Neurid AI..." 
                  className="neurid-search"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20">
                  <MusicIcon size={24} />
                </div>
              </div>
            </header>

            {/* Scrollable View Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-12 pb-48">
              <RouteTransition />
            </div>

            {/* Floating Player Sanctuary */}
            <div className="player-sanctuary">
              <ConnectedPlayerBar />
            </div>
          </main>

          <ConnectedQueuePanel isCollapsed={false} className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-xl" />
        </div>
      </SoundProvider>

      <Toaster />
      <ConnectedSettingsModal />
      <DevTools />
    </PlayerShell>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
