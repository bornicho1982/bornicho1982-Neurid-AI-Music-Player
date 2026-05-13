import { http_fetch } from '../../utils';
import { TrackResult } from '../MediaEngine';

interface DeezerTrack {
  id: number;
  title: string;
  artist: { name: string };
  album: { title: string; cover_medium: string };
  duration: number;
}

class DeezerConnector {
  async search(query: string): Promise<TrackResult[]> {
    try {
      const response = await http_fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response as { data: DeezerTrack[] };
      return data.data.map(t => ({
        id: String(t.id),
        title: t.title,
        artist: t.artist.name,
        album: t.album.title,
        durationMs: t.duration * 1000,
        coverUrl: t.album.cover_medium,
        source: 'Deezer'
      }));
    } catch (e) {
      console.error('Deezer search failed', e);
      return [];
    }
  }
}

export const deezerConnector = new DeezerConnector();
