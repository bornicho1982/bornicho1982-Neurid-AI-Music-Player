import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { addOrUpdateTracks, getAllTracks, TrackEntity } from '../db';

export interface Track {
  id: string;
  path: string;
  title: string;
}

interface PlayerState {
  queue: Track[];
  library: TrackEntity[];
  currentIndex: number | null;
  isPlaying: boolean;
  volume: number;

  // Library Actions
  loadLibrary: () => Promise<void>;
  scanLocalFolder: (folderPath: string) => Promise<void>;

  // Queue Actions
  addToQueue: (path: string, title: string) => Promise<void>;
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
  currentIndex: null,
  isPlaying: false,
  volume: 1.0,

  loadLibrary: async () => {
    try {
      const tracks = await getAllTracks();
      set({ library: tracks });

      // Also reconstruct the queue and send to backend so they stay in sync
      // We will just clear the queue in Rust and add all.
      // But we don't have a clear_queue method in Rust.
      // Wait, we can just set the Zustand queue to match the library for UI purposes
      // and when they click playTrack we ensure it's in the queue?
      // Actually, if we use `addToQueue` for every loaded track, it will flood Tauri commands.
      // Let's just set the queue state to the library for UI, and when `playTrack` is called on the library, it needs to work.

      // We need to map TrackEntity to Track for the queue.
      const mappedQueue = tracks.map(t => ({ id: t.path, path: t.path, title: t.title || t.filename }));
      set({ queue: mappedQueue });

      // We have to add to the backend queue to make index play work. Let's do it sequentially or maybe just rely on users queuing explicitly?
      // The original scanLocalFolder sets the Rust queue. If we restart, the Rust queue is empty.
      // We can add a simple `sync_queue` command or just queue them one by one?
      // A better way is to just do a loop of addToQueue.
      for (const t of mappedQueue) {
         await invoke('add_to_queue', { path: t.path, title: t.title });
      }

    } catch (e) {
      console.error("Failed to load library from IndexedDB", e);
    }
  },

  scanLocalFolder: async (folderPath) => {
    try {
      // Fetch new tracks via Rust backend scanner (this also sets Rust queue!)
      const backendTracks = await invoke<Track[]>('scan_local_folder', { folderPath });

      const now = Date.now();
      const newEntities: TrackEntity[] = backendTracks.map(t => ({
        id: t.path,
        path: t.path,
        filename: t.title,
        title: t.title,
        scanDate: now
      }));

      // Persist to Dexie
      await addOrUpdateTracks(newEntities);

      // Update Zustand library state AND queue state to fix UI controls
      const updatedLibrary = await getAllTracks();
      set({
        library: updatedLibrary,
        queue: backendTracks, // update queue for the player UI
        currentIndex: null,
        isPlaying: false
      });

    } catch (error) {
      console.error("Error scanning folder:", error);
    }
  },

  addToQueue: async (path, title) => {
    try {
      const newQueue = await invoke<Track[]>('add_to_queue', { path, title });
      set({ queue: newQueue });

      if (get().currentIndex === null && newQueue.length === 1) {
        await get().playTrack(0);
      }
    } catch (error) {
      console.error("Error adding to queue:", error);
    }
  },

  playTrack: async (index) => {
    try {
      await invoke('play_track', { index });
      set({ currentIndex: index, isPlaying: true });
    } catch (error) {
      console.error("Error playing track:", error);
    }
  },

  pause: async () => {
    try {
      await invoke('pause_audio');
      set({ isPlaying: false });
    } catch (error) {
      console.error("Error pausing:", error);
    }
  },

  resume: async () => {
    try {
      await invoke('resume_audio');
      set({ isPlaying: true });
    } catch (error) {
      console.error("Error resuming:", error);
    }
  },

  stop: async () => {
    try {
      await invoke('stop_audio');
      set({ isPlaying: false, currentIndex: null });
    } catch (error) {
      console.error("Error stopping:", error);
    }
  },

  setVolume: async (volume) => {
    try {
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
