import { http_fetch } from '../../utils';
import { TrackResult } from '../MediaEngine';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
}

class SpotifyConnector {
  private token: string | null = null;

  private async getAccessToken() {
    if (this.token) return this.token;
    try {
      const response = await http_fetch('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response as { accessToken: string };
      this.token = data.accessToken;
      return this.token;
    } catch (e) {
      console.error('Spotify token failed', e);
      return null;
    }
  }

  async search(query: string): Promise<TrackResult[]> {
    const token = await this.getAccessToken();
    if (!token) return [];

    try {
      const response = await http_fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response as { tracks: { items: SpotifyTrack[] } };
      return data.tracks.items.map(t => ({
        id: t.id,
        title: t.name,
        artist: t.artists[0].name,
        album: t.album.name,
        durationMs: t.duration_ms,
        coverUrl: t.album.images[0]?.url,
        source: 'Spotify'
      }));
    } catch (e) {
      console.error('Spotify search failed', e);
      return [];
    }
  }
}

export const spotifyConnector = new SpotifyConnector();
