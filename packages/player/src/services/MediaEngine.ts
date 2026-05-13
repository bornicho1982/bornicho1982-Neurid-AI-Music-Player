import { spotifyConnector } from './connectors/SpotifyConnector';
import { deezerConnector } from './connectors/DeezerConnector';
import { youtubeConnector } from './connectors/YouTubeConnector';

export interface TrackResult {
  id: string;
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  coverUrl?: string;
  source: 'Spotify' | 'Deezer' | 'YouTube' | 'Local';
  streamUrl?: string;
}

class MediaEngine {
  async searchAll(query: string): Promise<TrackResult[]> {
    if (!query) return [];

    try {
      const [spotify, deezer, youtube] = await Promise.all([
        spotifyConnector.search(query).catch(() => []),
        deezerConnector.search(query).catch(() => []),
        youtubeConnector.search(query).catch(() => [])
      ]);

      return [...spotify, ...deezer, ...youtube];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async resolveStream(track: TrackResult): Promise<string | null> {
    if (track.source === 'YouTube') {
      return youtubeConnector.resolve(track.id);
    }
    // Fallback to YouTube search for Spotify/Deezer tracks if no direct stream
    const ytResults = await youtubeConnector.search(`${track.title} ${track.artist}`);
    if (ytResults.length > 0) {
      return youtubeConnector.resolve(ytResults[0].id);
    }
    return null;
  }
}

export const mediaEngine = new MediaEngine();
