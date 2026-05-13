import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Track {
  id: string;
  path: string;
  title: string;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number | null;
  isPlaying: boolean;
  volume: number;

  // Acciones
  addToQueue: (path: string, title: string) => Promise<void>;
  scanLocalFolder: (folderPath: string) => Promise<void>;
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
  currentIndex: null,
  isPlaying: false,
  volume: 1.0,

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

  scanLocalFolder: async (folderPath) => {
    try {
      const newQueue = await invoke<Track[]>('scan_local_folder', { folderPath });
      set({ queue: newQueue, currentIndex: null, isPlaying: false });
    } catch (error) {
      console.error("Error scanning folder:", error);
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
