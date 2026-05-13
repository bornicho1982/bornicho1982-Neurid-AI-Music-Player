import { http_fetch } from '../../utils';
import { TrackResult } from '../MediaEngine';

interface YoutubeTrack {
  videoId: string;
  title: string;
  uploaderName: string;
  duration: number;
  thumbnail: string;
}

class YouTubeConnector {
  private instance = 'https://pipedapi.kavin.rocks';

  async search(query: string): Promise<TrackResult[]> {
    try {
      const response = await http_fetch(`${this.instance}/search?q=${encodeURIComponent(query)}&filter=music_videos`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response as { items: YoutubeTrack[] };
      return data.items.map(t => ({
        id: t.videoId,
        title: t.title,
        artist: t.uploaderName,
        durationMs: t.duration * 1000,
        coverUrl: t.thumbnail,
        source: 'YouTube'
      }));
    } catch (e) {
      console.error('YouTube search failed', e);
      return [];
    }
  }

  async resolve(videoId: string): Promise<string | null> {
    try {
      const response = await http_fetch(`${this.instance}/streams/${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = response as { audioStreams: { url: string }[] };
      return data.audioStreams[0]?.url || null;
    } catch (e) {
      console.error('YouTube resolve failed', e);
      return null;
    }
  }
}

export const youtubeConnector = new YouTubeConnector();
