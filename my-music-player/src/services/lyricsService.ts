export interface LyricLine {
  time: number;
  text: string;
}

export interface LyricsData {
  plain: string;
  synced: LyricLine[];
}

export const lyricsService = {
  getLyrics: async (title: string, artist: string, duration?: number): Promise<LyricsData | null> => {
    try {
      let url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`;
      if (duration) url += `&duration=${Math.round(duration)}`;

      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();

      if (data.syncedLyrics) {
        const lines = data.syncedLyrics.split('\n').map((line: string) => {
          const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseFloat(match[2]);
            return {
              time: minutes * 60 + seconds,
              text: match[3].trim()
            };
          }
          return null;
        }).filter((l: any) => l !== null);

        return {
          plain: data.plainLyrics || '',
          synced: lines
        };
      }

      return {
        plain: data.plainLyrics || '',
        synced: []
      };
    } catch (error) {
      console.error('Lyrics fetch error:', error);
      return null;
    }
  }
};
