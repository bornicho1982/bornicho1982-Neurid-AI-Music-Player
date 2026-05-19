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

export interface SettingEntity {
  key: string;
  value: any;
}

export interface PlaylistEntity {
  id: string;
  title: string;
  source: string; // 'Spotify', 'Deezer', 'Local', etc.
  importDate: number;
  coverUrl?: string;
}

export interface PlaylistTrackEntity {
  id: string; // Composite key playlistId_trackId
  playlistId: string;
  trackId: string;
  title: string;
  artist?: string;
  isRemote: boolean;
  path?: string;
  coverUrl?: string;
  order: number;
}

export const db = new Dexie('MusicLibrary') as Dexie & {
  tracks: EntityTable<TrackEntity, 'id'>;
  settings: EntityTable<SettingEntity, 'key'>;
  playlists: EntityTable<PlaylistEntity, 'id'>;
  playlist_tracks: EntityTable<PlaylistTrackEntity, 'id'>;
};

// Schema declaration
db.version(3).stores({
  tracks: 'id, path, filename, title, artist, album',
  settings: 'key',
  playlists: 'id, title, source',
  playlist_tracks: 'id, playlistId, trackId'
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

export async function getSetting(key: string): Promise<any> {
  const setting = await db.settings.get(key);
  return setting?.value;
}

export async function saveSetting(key: string, value: any) {
  return await db.settings.put({ key, value });
}

export async function savePlaylist(playlist: PlaylistEntity, tracks: PlaylistTrackEntity[]) {
  return await db.transaction('rw', db.playlists, db.playlist_tracks, async () => {
    await db.playlists.put(playlist);
    await db.playlist_tracks.where('playlistId').equals(playlist.id).delete();
    await db.playlist_tracks.bulkPut(tracks);
  });
}

export async function getAllPlaylists(): Promise<PlaylistEntity[]> {
  return await db.playlists.toArray();
}

export async function getPlaylistTracks(playlistId: string): Promise<PlaylistTrackEntity[]> {
  return await db.playlist_tracks.where('playlistId').equals(playlistId).sortBy('order');
}

export async function deletePlaylist(playlistId: string) {
  return await db.transaction('rw', db.playlists, db.playlist_tracks, async () => {
    await db.playlists.delete(playlistId);
    await db.playlist_tracks.where('playlistId').equals(playlistId).delete();
  });
}

export async function addTrackToPlaylist(playlistId: string, track: Omit<PlaylistTrackEntity, 'id'>) {
  const count = await db.playlist_tracks.where('playlistId').equals(playlistId).count();
  await db.playlist_tracks.add({
    ...track,
    id: `${playlistId}_${Date.now()}_${track.trackId}`,
    order: count
  });
}

export async function removeTrackFromPlaylist(id: string) {
  await db.playlist_tracks.delete(id);
}

export async function createEmptyPlaylist(title: string) {
  const id = `local_${Date.now()}`;
  await db.playlists.add({
    id,
    title,
    source: 'Local',
    importDate: Date.now()
  });
  return id;
}
