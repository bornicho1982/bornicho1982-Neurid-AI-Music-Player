import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { addOrUpdateTracks, getAllTracks, TrackEntity, PlaylistEntity, savePlaylist, getAllPlaylists, getPlaylistTracks, deletePlaylist, createEmptyPlaylist, addTrackToPlaylist, removeTrackFromPlaylist } from '../db';
import { pipedResolver } from '../services/pipedResolver';
import { spotifyConnector } from '../services/spotifyConnector';
import { deezerConnector } from '../services/deezerConnector';
import { ytMusicConnector } from '../services/ytMusicConnector';
import { lyricsService, LyricsData } from '../services/lyricsService';

export interface Track {
  id: string;
  path: string;
  title: string;
  artist?: string;
  album?: string;
  isRemote?: boolean;
  coverUrl?: string;
  duration?: number;
}

interface PlayerState {
  queue: Track[];
  library: TrackEntity[];
  savedPlaylists: PlaylistEntity[];
  searchResults: Track[];
  currentIndex: number | null;
  isPlaying: boolean;
  volume: number;
  isResolving: boolean;
  currentTime: number;
  lyrics: LyricsData | null;
  quality: '128k' | '256k' | 'original';
  activeTab: string;
  analyser: AnalyserNode | null;
  resolvedNextTrackUrl: string | null;
  lastPlayedTrack: Track | null;
  isTelemetrySetup: boolean;

  // UI Actions
  setActiveTab: (tab: string) => void;

  // Library Actions
  loadLibrary: () => Promise<void>;
  scanLocalFolder: (folderPath: string) => Promise<void>;
  
  // Playlist Actions
  loadSavedPlaylists: () => Promise<void>;
  importSpotifyPlaylist: (playlistId: string) => Promise<void>;
  importDeezerPlaylist: (playlistId: string) => Promise<void>;
  loadPlaylistToQueue: (playlistId: string) => Promise<void>;
  removePlaylist: (playlistId: string) => Promise<void>;
  createPlaylist: (title: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeTrackFromPlaylist: (id: string) => Promise<void>;

  // Search Actions
  searchYouTube: (query: string) => Promise<void>;

  // Playback Actions
  updateTime: () => Promise<void>;
  setupAudioTelemetry: () => Promise<void>;
  preResolveNext: () => Promise<void>;
  fetchLyrics: () => Promise<void>;
  setQuality: (quality: '128k' | '256k' | 'original') => void;

  // Queue Actions
  addToQueue: (path: string, title: string, artist?: string, isRemote?: boolean) => Promise<void>;
  playTrack: (index: number) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  prevTrack: () => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  library: [],
  savedPlaylists: [],
  searchResults: [],
  currentIndex: null,
  isPlaying: false,
  volume: 1.0,
  isResolving: false,
  currentTime: 0,
  lyrics: null,
  quality: 'original',
  activeTab: 'neurid_ai',
  analyser: null,
  resolvedNextTrackUrl: null,
  lastPlayedTrack: null,
  isTelemetrySetup: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  loadLibrary: async () => {
    try {
      const tracks = await getAllTracks();
      set({ library: tracks });
      const mappedQueue: Track[] = tracks.map(t => ({ 
        id: t.id, 
        path: t.path, 
        title: t.title || t.filename,
        artist: t.artist,
        album: t.album,
        duration: t.duration
      }));
      set({ queue: mappedQueue });

      await invoke('replace_queue', { tracks: mappedQueue });
    } catch (e) {
      console.error("Failed to load library from IndexedDB", e);
    }
  },

  loadSavedPlaylists: async () => {
    try {
      const playlists = await getAllPlaylists();
      set({ savedPlaylists: playlists });
    } catch (e) {
      console.error("Failed to load playlists", e);
    }
  },

  scanLocalFolder: async (folderPath) => {
    try {
      const backendTracks = await invoke<Track[]>('scan_local_folder', { folder_path: folderPath });
      const now = Date.now();
      const newEntities: TrackEntity[] = backendTracks.map(t => ({
        id: t.path,
        path: t.path,
        filename: t.title,
        title: t.title,
        artist: t.artist,
        album: t.album,
        duration: t.duration,
        scanDate: now
      }));

      await addOrUpdateTracks(newEntities);
      const updatedLibrary = await getAllTracks();
      set({
        library: updatedLibrary,
        queue: backendTracks,
        currentIndex: null,
        isPlaying: false
      });
    } catch (error) {
      console.error("Error scanning folder:", error);
    }
  },

  importSpotifyPlaylist: async (playlistId) => {
    try {
      set({ isResolving: true });
      const data = await spotifyConnector.getPlaylistMetadataAndTracks(playlistId);
      
      const playlist: PlaylistEntity = {
        id: `spotify_${playlistId}`,
        title: data.name,
        source: 'Spotify',
        importDate: Date.now(),
        coverUrl: data.coverUrl || data.tracks[0]?.coverUrl
      };

      const playlistTracks = data.tracks.map((t, index) => ({
        id: `${playlist.id}_${t.id}`,
        playlistId: playlist.id,
        trackId: t.id,
        title: t.name,
        artist: t.artists.join(', '),
        isRemote: true,
        coverUrl: t.coverUrl,
        order: index
      }));

      await savePlaylist(playlist, playlistTracks);
      await get().loadSavedPlaylists();

      const newTracks: Track[] = data.tracks.map(t => ({
        id: `spotify_${t.id}`,
        path: '', 
        title: t.name,
        artist: t.artists.join(', '),
        isRemote: true,
        coverUrl: t.coverUrl
      }));

      set({ queue: [...get().queue, ...newTracks], isResolving: false });
    } catch (error) {
      console.error("Error importing Spotify playlist:", error);
      set({ isResolving: false });
    }
  },

  importDeezerPlaylist: async (playlistId) => {
    try {
      set({ isResolving: true });
      const tracks = await deezerConnector.getPlaylistTracks(playlistId);
      const meta = await deezerConnector.getPlaylistMetadata(playlistId);
      
      const playlist: PlaylistEntity = {
        id: `deezer_${playlistId}`,
        title: meta.title,
        source: 'Deezer',
        importDate: Date.now(),
        coverUrl: meta.coverUrl || tracks[0]?.albumCover
      };

      const playlistTracks = tracks.map((t, index) => ({
        id: `${playlist.id}_${t.id}`,
        playlistId: playlist.id,
        trackId: t.id,
        title: t.title,
        artist: t.artist,
        isRemote: true,
        coverUrl: t.albumCover,
        order: index
      }));

      await savePlaylist(playlist, playlistTracks);
      await get().loadSavedPlaylists();

      const newTracks: Track[] = tracks.map(t => ({
        id: `deezer_${t.id}`,
        path: '', 
        title: t.title,
        artist: t.artist,
        isRemote: true,
        coverUrl: t.albumCover
      }));

      set({ queue: [...get().queue, ...newTracks], isResolving: false });
    } catch (error) {
      console.error("Error importing Deezer playlist:", error);
      set({ isResolving: false });
    }
  },

  searchYouTube: async (query) => {
    try {
      set({ isResolving: true, activeTab: 'search' });
      const results = await ytMusicConnector.searchTracks(query);
      const mapped = results.map(t => ({
        id: t.videoId,
        path: '', 
        title: t.title,
        artist: t.uploaderName,
        isRemote: true,
        coverUrl: t.thumbnail
      }));
      set({ searchResults: mapped, isResolving: false });
    } catch (error) {
      console.error("Error searching YouTube:", error);
      set({ isResolving: false });
    }
  },

  loadPlaylistToQueue: async (playlistId) => {
    try {
      const tracks = await getPlaylistTracks(playlistId);
      const mappedTracks: Track[] = tracks.map(t => ({
        id: t.trackId,
        path: t.path || '',
        title: t.title,
        artist: t.artist,
        isRemote: t.isRemote,
        coverUrl: t.coverUrl
      }));
      
      set({ queue: mappedTracks, currentIndex: null });
      if (mappedTracks.length > 0) {
        await get().playTrack(0);
      }
    } catch (e) {
      console.error("Error loading playlist to queue", e);
    }
  },

  removePlaylist: async (playlistId) => {
    await deletePlaylist(playlistId);
    await get().loadSavedPlaylists();
  },

  createPlaylist: async (title) => {
    await createEmptyPlaylist(title);
    await get().loadSavedPlaylists();
  },

  addTrackToPlaylist: async (playlistId, track) => {
    await addTrackToPlaylist(playlistId, {
      playlistId,
      trackId: track.id,
      title: track.title,
      artist: track.artist,
      isRemote: !!track.isRemote,
      path: track.path,
      coverUrl: track.coverUrl,
      order: 0 // Will be set by DB helper
    });
    // If the currently viewed playlist is this one, we might want to refresh.
    // For now, simple refresh of playlists list.
    await get().loadSavedPlaylists();
  },

  removeTrackFromPlaylist: async (id) => {
    await removeTrackFromPlaylist(id);
    await get().loadSavedPlaylists();
  },

  addToQueue: async (path, title, artist, isRemote) => {
    try {
      if (!isRemote) {
        const newQueue = await invoke<Track[]>('add_to_queue', { path, title });
        set({ queue: newQueue });
      } else {
        const track: Track = { id: `remote_${Date.now()}`, path, title, artist, isRemote: true };
        set({ queue: [...get().queue, track] });
      }

      if (get().currentIndex === null && get().queue.length === 1) {
        await get().playTrack(0);
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  },

  playTrack: async (index) => {
    const { queue, resolvedNextTrackUrl } = get();
    const track = queue[index];
    if (!track) return;

    set({ lastPlayedTrack: track, resolvedNextTrackUrl: null });

    // Stop existing HTML audio if any
    const existingAudio = (window as any)._neuridAudio as HTMLAudioElement;
    if (existingAudio) {
      existingAudio.pause();
      existingAudio.src = '';
    }

    try {
      let playPath = track.path;

      if (track.isRemote) {
        if (resolvedNextTrackUrl) {
          playPath = resolvedNextTrackUrl;
        } else {
          set({ isResolving: true });
          const videoId = await pipedResolver.findBestMatch(track.title, track.artist || '');
          if (videoId) {
            const streamUrl = await pipedResolver.resolve(videoId);
            if (streamUrl) {
              playPath = streamUrl;
            } else {
              throw new Error("No se pudo resolver el stream de audio");
            }
          } else {
            throw new Error("No se encontró la canción en YouTube");
          }
          set({ isResolving: false });
        }

        // HTML5 Playback for Remote
        let audio = (window as any)._neuridAudio as HTMLAudioElement;
        if (!audio) {
          audio = new Audio();
          (window as any)._neuridAudio = audio;
          
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          const source = ctx.createMediaElementSource(audio);
          source.connect(analyser);
          analyser.connect(ctx.destination);
          set({ analyser });
        }
        
        audio.src = playPath;
        audio.volume = get().volume;
        await audio.play();
        
        // Notify Rust that we are playing externally so it stops its own queue
        await invoke('stop_audio'); 
        
        set({ currentIndex: index, isPlaying: true, currentTime: 0 });
        get().fetchLyrics();

        // Time polling for HTML audio
        audio.ontimeupdate = () => {
          set({ currentTime: audio.currentTime });
        };
        
      } else {
        // Rust Playback for Local
        set({ analyser: null }); // No analyser for local Rust playback for now
        await invoke('play_track', { index, path: playPath }); 
        set({ currentIndex: index, isPlaying: true, currentTime: 0 });
        get().fetchLyrics();
      }
    } catch (error) {
      console.error("Error playing track:", error);
      set({ isResolving: false });
    }
  },

  updateTime: async () => {
    if (!get().isPlaying) return;
    const { currentTime, queue, currentIndex } = get();
    const track = currentIndex !== null ? queue[currentIndex] : null;
    
    // Pre-resolve logic (if > 80% and duration known)
    if (track && track.duration && currentTime / track.duration > 0.8 && !get().resolvedNextTrackUrl) {
      get().preResolveNext();
    }

    const audio = (window as any)._neuridAudio as HTMLAudioElement;
    if (audio && audio.src && !audio.paused) {
        set({ currentTime: audio.currentTime });
        return;
    }
    
    try {
      const time = await invoke<number>('get_playback_position');
      set({ currentTime: time });
    } catch (e) {
      console.error("Error updating time", e);
    }
  },

  setupAudioTelemetry: async () => {
    if (get().isTelemetrySetup) return;

    await listen<{ currentTime: number }>('audio_tick', (event) => {
      const time = event.payload.currentTime;
      set({ currentTime: time });

      // Pre-resolve logic (if > 80% and duration known)
      const { queue, currentIndex } = get();
      const track = currentIndex !== null ? queue[currentIndex] : null;
      if (track && track.duration && time / track.duration > 0.8 && !get().resolvedNextTrackUrl) {
        get().preResolveNext();
      }
    });

    set({ isTelemetrySetup: true });
  },

  preResolveNext: async () => {
    const { queue, currentIndex } = get();
    if (currentIndex === null || currentIndex >= queue.length - 1) return;
    
    const nextTrack = queue[currentIndex + 1];
    if (!nextTrack.isRemote) return;

    try {
      const videoId = await pipedResolver.findBestMatch(nextTrack.title, nextTrack.artist || '');
      if (videoId) {
        const streamUrl = await pipedResolver.resolve(videoId);
        set({ resolvedNextTrackUrl: streamUrl });
        console.log("Pre-resolved next track:", nextTrack.title);
      }
    } catch (e) {
      console.warn("Failed to pre-resolve next track", e);
    }
  },

  fetchLyrics: async () => {
    const track = get().queue[get().currentIndex ?? -1];
    if (!track) return;
    
    set({ lyrics: null });
    const data = await lyricsService.getLyrics(track.title, track.artist || '', track.duration);
    set({ lyrics: data });
  },

  setQuality: (quality) => set({ quality }),

  pause: async () => {
    try {
      const audio = (window as any)._neuridAudio as HTMLAudioElement;
      if (audio && !audio.paused) audio.pause();
      
      await invoke('pause_audio');
      set({ isPlaying: false });
    } catch (error) {
      console.error("Error pausing:", error);
    }
  },

  resume: async () => {
    try {
      const audio = (window as any)._neuridAudio as HTMLAudioElement;
      if (audio && audio.src && audio.paused) await audio.play();
      
      await invoke('resume_audio');
      set({ isPlaying: true });
    } catch (error) {
      console.error("Error resuming:", error);
    }
  },

  stop: async () => {
    try {
      const audio = (window as any)._neuridAudio as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      await invoke('stop_audio');
      set({ isPlaying: false, currentIndex: null });
    } catch (error) {
      console.error("Error stopping:", error);
    }
  },

  setVolume: async (volume) => {
    try {
      const audio = (window as any)._neuridAudio as HTMLAudioElement;
      if (audio) audio.volume = volume;
      
      await invoke('set_volume', { volume });
      set({ volume });
    } catch (error) {
      console.error("Error setting volume:", error);
    }
  },

  nextTrack: async () => {
    const { queue, currentIndex, playTrack } = get();
    if (currentIndex !== null && currentIndex < queue.length - 1) {
      await playTrack(currentIndex + 1);
    }
  },

  prevTrack: async () => {
    const { currentIndex, playTrack } = get();
    if (currentIndex !== null && currentIndex > 0) {
      await playTrack(currentIndex - 1);
    }
  }
}));
