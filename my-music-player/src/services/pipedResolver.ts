import { fetch } from '@tauri-apps/plugin-http';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.victr.me',
  'https://piped-api.garudalinux.org'
];

let currentInstance = PIPED_INSTANCES[0];

export interface PipedTrack {
  videoId: string;
  title: string;
  uploaderName: string;
  duration: number;
  thumbnail: string;
}

export const pipedResolver = {
  search: async (query: string): Promise<PipedTrack[]> => {
    try {
      const response = await fetch(`${currentInstance}/search?q=${encodeURIComponent(query)}&filter=music_videos`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Piped search error:', error);
      // Fallback to next instance if search fails
      currentInstance = PIPED_INSTANCES[(PIPED_INSTANCES.indexOf(currentInstance) + 1) % PIPED_INSTANCES.length];
      return [];
    }
  },

  resolve: async (videoId: string): Promise<string | null> => {
    try {
      const response = await fetch(`${currentInstance}/streams/${videoId}`);
      if (!response.ok) throw new Error('Resolve failed');
      const data = await response.json();
      
      // We prefer audio streams only to save bandwidth and avoid video issues
      const audioStream = data.audioStreams.find((s: any) => s.format === 'M4A' || s.format === 'WEBM') || data.audioStreams[0];
      return audioStream?.url || null;
    } catch (error) {
      console.error('Piped resolve error:', error);
      return null;
    }
  },

  findBestMatch: async (title: string, artist: string): Promise<string | null> => {
    const query = `${title} ${artist}`;
    const results = await pipedResolver.search(query);
    if (results.length > 0) {
      // Return the first videoId for now
      return results[0].videoId;
    }
    return null;
  }
};
