import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { invoke } from '@tauri-apps/api/core';

export interface TrackMetadata {
  path: string;
  title: string | null;
  artist: string | null;
  album: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  year: number | null;
  genre: string | null;
  durationSeconds: number | null;
  coverArtBase64: string | null;
  coverArtMime: string | null;
  fileName: string;
  format: string;
  bitrateKbps: number | null;
  sampleRateHz: number | null;
}

interface ScanResult {
  tracks: TrackMetadata[];
  totalFiles: number;
  errors: string[];
  scanDurationMs: number;
}

interface LibraryState {
  // State
  folders: string[];
  tracks: TrackMetadata[];
  isScanning: boolean;
  scanProgress: string;
  lastScanDate: string | null;
  scanStats: { totalFiles: number; errors: number; durationMs: number } | null;

  // Actions
  addFolder: (path: string) => Promise<void>;
  removeFolder: (path: string) => void;
  scanAllFolders: () => Promise<void>;
  searchLocal: (query: string) => TrackMetadata[];
  clearLibrary: () => void;
  getDefaultMusicDir: () => Promise<string | null>;
  getAlbums: () => AlbumGroup[];
  getArtists: () => string[];
}

export interface AlbumGroup {
  album: string;
  artist: string;
  year: number | null;
  coverArtBase64: string | null;
  coverArtMime: string | null;
  tracks: TrackMetadata[];
  trackCount: number;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      folders: [],
      tracks: [],
      isScanning: false,
      scanProgress: '',
      lastScanDate: null,
      scanStats: null,

      addFolder: async (path: string) => {
        const { folders } = get();
        if (folders.includes(path)) return;

        set({ folders: [...folders, path] });

        set({ isScanning: true, scanProgress: `Scanning ${path}...` });
        try {
          const result = await invoke<ScanResult>('scan_music_directory', {
            path,
          });
          set((state) => ({
            tracks: [...state.tracks, ...result.tracks],
            isScanning: false,
            scanProgress: '',
            lastScanDate: new Date().toISOString(),
            scanStats: {
              totalFiles: result.totalFiles,
              errors: result.errors.length,
              durationMs: result.scanDurationMs,
            },
          }));
        } catch (error) {
          set({ isScanning: false, scanProgress: '' });
          throw error;
        }
      },

      removeFolder: (path: string) => {
        set((state) => ({
          folders: state.folders.filter((f) => f !== path),
          tracks: state.tracks.filter((t) => !t.path.startsWith(path)),
        }));
      },

      scanAllFolders: async () => {
        const { folders } = get();
        set({ isScanning: true, tracks: [] });

        let totalFiles = 0;
        let totalErrors = 0;
        let totalDuration = 0;

        for (const folder of folders) {
          set({ scanProgress: `Scanning ${folder}...` });
          try {
            const result = await invoke<ScanResult>('scan_music_directory', {
              path: folder,
            });
            set((state) => ({
              tracks: [...state.tracks, ...result.tracks],
            }));
            totalFiles += result.totalFiles;
            totalErrors += result.errors.length;
            totalDuration += result.scanDurationMs;
          } catch (error) {
            console.error(`Error scanning ${folder}:`, error);
          }
        }

        set({
          isScanning: false,
          scanProgress: '',
          lastScanDate: new Date().toISOString(),
          scanStats: {
            totalFiles,
            errors: totalErrors,
            durationMs: totalDuration,
          },
        });
      },

      searchLocal: (query: string) => {
        const { tracks } = get();
        if (!query.trim()) return tracks;
        const q = query.toLowerCase();
        return tracks.filter(
          (t) =>
            t.title?.toLowerCase().includes(q) ||
            t.artist?.toLowerCase().includes(q) ||
            t.album?.toLowerCase().includes(q) ||
            t.fileName.toLowerCase().includes(q),
        );
      },

      clearLibrary: () => {
        set({ tracks: [], folders: [], lastScanDate: null, scanStats: null });
      },

      getDefaultMusicDir: async () => {
        try {
          return await invoke<string | null>('get_default_music_dir');
        } catch {
          return null;
        }
      },

      getAlbums: () => {
        const { tracks } = get();
        const albumMap = new Map<string, AlbumGroup>();

        for (const track of tracks) {
          const key = `${track.album ?? 'Unknown Album'}|||${track.artist ?? 'Unknown Artist'}`;
          if (!albumMap.has(key)) {
            albumMap.set(key, {
              album: track.album ?? 'Unknown Album',
              artist: track.artist ?? 'Unknown Artist',
              year: track.year,
              coverArtBase64: track.coverArtBase64,
              coverArtMime: track.coverArtMime,
              tracks: [],
              trackCount: 0,
            });
          }
          const group = albumMap.get(key)!;
          group.tracks.push(track);
          group.trackCount++;
          // Use the first available cover art
          if (!group.coverArtBase64 && track.coverArtBase64) {
            group.coverArtBase64 = track.coverArtBase64;
            group.coverArtMime = track.coverArtMime;
          }
        }

        return Array.from(albumMap.values()).sort((a, b) =>
          a.artist.localeCompare(b.artist) || a.album.localeCompare(b.album),
        );
      },

      getArtists: () => {
        const { tracks } = get();
        const artists = new Set<string>();
        for (const track of tracks) {
          if (track.artist) artists.add(track.artist);
        }
        return Array.from(artists).sort();
      },
    }),
    {
      name: 'neurid-local-library',
      partialize: (state) => ({
        folders: state.folders,
        tracks: state.tracks.map((t) => ({
          ...t,
          // Don't persist cover art base64 to avoid huge localStorage
          coverArtBase64: null,
          coverArtMime: null,
        })),
        lastScanDate: state.lastScanDate,
      }),
    },
  ),
);
