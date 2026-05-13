use super::scanner;
use super::metadata::{self, TrackMetadata};
use rayon::prelude::*;
use std::path::PathBuf;
use tauri::command;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResult {
    pub tracks: Vec<TrackMetadata>,
    pub total_files: usize,
    pub errors: Vec<String>,
    pub scan_duration_ms: u128,
}

/// Scans a directory for audio files and extracts metadata from all of them.
/// Uses rayon for parallel processing to handle large libraries efficiently.
#[command]
pub async fn scan_music_directory(path: String) -> Result<ScanResult, String> {
    let dir = PathBuf::from(&path);
    if !dir.exists() || !dir.is_dir() {
        return Err(format!("Directory does not exist or is not a directory: {}", path));
    }

    let start = std::time::Instant::now();

    // Scan for audio files
    let files = scanner::scan_directory(&dir);
    let total_files = files.len();

    log::info!("Found {} audio files in {}", total_files, path);

    // Extract metadata in parallel using rayon
    let results: Vec<Result<TrackMetadata, String>> = files
        .par_iter()
        .map(|f| metadata::extract_metadata(&f.path))
        .collect();

    let mut tracks = Vec::new();
    let mut errors = Vec::new();

    for result in results {
        match result {
            Ok(track) => tracks.push(track),
            Err(err) => {
                log::warn!("Failed to read metadata: {}", err);
                errors.push(err);
            }
        }
    }

    // Sort by artist → album → disc → track number
    tracks.sort_by(|a, b| {
        a.artist
            .cmp(&b.artist)
            .then(a.album.cmp(&b.album))
            .then(a.disc_number.cmp(&b.disc_number))
            .then(a.track_number.cmp(&b.track_number))
    });

    let scan_duration_ms = start.elapsed().as_millis();
    log::info!(
        "Scanned {} tracks ({} errors) in {}ms",
        tracks.len(),
        errors.len(),
        scan_duration_ms
    );

    Ok(ScanResult {
        tracks,
        total_files,
        errors,
        scan_duration_ms,
    })
}

/// Retrieves metadata for a single audio file.
#[command]
pub async fn get_track_metadata(path: String) -> Result<TrackMetadata, String> {
    let file_path = PathBuf::from(&path);
    if !file_path.exists() {
        return Err(format!("File does not exist: {}", path));
    }
    metadata::extract_metadata(&file_path)
}

/// Returns the default music directory for the current platform.
/// Falls back to the user's home directory if the music directory is not found.
#[command]
pub async fn get_default_music_dir() -> Result<Option<String>, String> {
    if let Some(music_dir) = dirs_next_or_fallback() {
        Ok(Some(music_dir.to_string_lossy().into_owned()))
    } else {
        Ok(None)
    }
}

/// Platform-specific music directory detection
fn dirs_next_or_fallback() -> Option<PathBuf> {
    // Try common music directory locations
    #[cfg(target_os = "windows")]
    {
        if let Ok(user_profile) = std::env::var("USERPROFILE") {
            let music = PathBuf::from(&user_profile).join("Music");
            if music.exists() {
                return Some(music);
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = std::env::var("HOME") {
            let music = PathBuf::from(&home).join("Music");
            if music.exists() {
                return Some(music);
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Ok(home) = std::env::var("HOME") {
            let music = PathBuf::from(&home).join("Music");
            if music.exists() {
                return Some(music);
            }
        }
    }

    None
}
