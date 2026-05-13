use std::path::Path;
use lofty::prelude::*;
use lofty::probe::Probe;
use serde::{Deserialize, Serialize};
use base64::Engine;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TrackMetadata {
    pub path: String,
    pub title: Option<String>,
    pub artist: Option<String>,
    pub album: Option<String>,
    pub album_artist: Option<String>,
    pub track_number: Option<u32>,
    pub disc_number: Option<u32>,
    pub year: Option<u32>,
    pub genre: Option<String>,
    pub duration_seconds: Option<f64>,
    pub cover_art_base64: Option<String>,
    pub cover_art_mime: Option<String>,
    pub file_name: String,
    pub format: String,
    pub bitrate_kbps: Option<u32>,
    pub sample_rate_hz: Option<u32>,
}

/// Extracts comprehensive metadata from an audio file using lofty.
/// Supports ID3v2 (MP3), Vorbis Comments (FLAC/OGG), MP4 atoms (M4A/AAC),
/// and other tag formats automatically detected by lofty.
pub fn extract_metadata(file_path: &Path) -> Result<TrackMetadata, String> {
    let tagged_file = Probe::open(file_path)
        .map_err(|e| format!("Cannot open file {}: {}", file_path.display(), e))?
        .read()
        .map_err(|e| format!("Cannot read tags from {}: {}", file_path.display(), e))?;

    let properties = tagged_file.properties();
    let tag = tagged_file
        .primary_tag()
        .or_else(|| tagged_file.first_tag());

    let (title, artist, album, album_artist, track_number, disc_number, year, genre) =
        if let Some(tag) = tag {
            (
                tag.title().map(|s| s.to_string()),
                tag.artist().map(|s| s.to_string()),
                tag.album().map(|s| s.to_string()),
                tag.get_string(&ItemKey::AlbumArtist)
                    .map(|s| s.to_string()),
                tag.track(),
                tag.disk(),
                tag.year(),
                tag.genre().map(|s| s.to_string()),
            )
        } else {
            (None, None, None, None, None, None, None, None)
        };

    // Extract cover art (first picture found)
    let (cover_art_base64, cover_art_mime) = tag
        .and_then(|t| t.pictures().first())
        .map(|pic| {
            let b64 = base64::engine::general_purpose::STANDARD.encode(pic.data());
            let mime = pic
                .mime_type()
                .map(|m| m.to_string())
                .unwrap_or_else(|| "image/jpeg".to_string());
            (Some(b64), Some(mime))
        })
        .unwrap_or((None, None));

    let file_name = file_path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();

    let format = file_path
        .extension()
        .unwrap_or_default()
        .to_string_lossy()
        .to_uppercase();

    Ok(TrackMetadata {
        path: file_path.to_string_lossy().into_owned(),
        title,
        artist,
        album,
        album_artist,
        track_number,
        disc_number,
        year,
        genre,
        duration_seconds: Some(properties.duration().as_secs_f64()),
        cover_art_base64,
        cover_art_mime,
        file_name,
        format,
        bitrate_kbps: properties.audio_bitrate(),
        sample_rate_hz: properties.sample_rate(),
    })
}
