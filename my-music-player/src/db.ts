import Dexie, { type EntityTable } from 'dexie';

export interface TrackEntity {
  id: string; // The full path or a unique hash
  path: string;
  filename: string;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  scanDate: number;
}

export const db = new Dexie('MusicLibrary') as Dexie & {
  tracks: EntityTable<TrackEntity, 'id'>;
};

// Schema declaration
db.version(1).stores({
  tracks: 'id, path, filename, title, artist, album'
  // Indexes for searching/sorting
});

export async function addOrUpdateTracks(tracks: TrackEntity[]) {
  return await db.tracks.bulkPut(tracks);
}

export async function getAllTracks(): Promise<TrackEntity[]> {
  return await db.tracks.toArray();
}

export async function clearLibrary() {
  return await db.tracks.clear();
}
