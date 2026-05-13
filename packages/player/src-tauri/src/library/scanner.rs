use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use serde::{Deserialize, Serialize};

/// Supported audio file extensions for library scanning
const SUPPORTED_EXTENSIONS: &[&str] = &[
    "mp3", "flac", "ogg", "m4a", "wav", "aac", "opus", "wma", "aiff", "alac", "ape", "wv",
];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScannedFile {
    pub path: PathBuf,
    pub file_name: String,
    pub extension: String,
    pub size_bytes: u64,
}

/// Scans a directory recursively for supported audio files.
/// Follows symlinks and filters by known audio extensions.
pub fn scan_directory(dir: &Path) -> Vec<ScannedFile> {
    WalkDir::new(dir)
        .follow_links(true)
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().is_file())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .and_then(|ext| ext.to_str())
                .map(|ext| SUPPORTED_EXTENSIONS.contains(&ext.to_lowercase().as_str()))
                .unwrap_or(false)
        })
        .filter_map(|entry| {
            let metadata = entry.metadata().ok()?;
            Some(ScannedFile {
                path: entry.path().to_path_buf(),
                file_name: entry.file_name().to_string_lossy().into_owned(),
                extension: entry
                    .path()
                    .extension()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_lowercase(),
                size_bytes: metadata.len(),
            })
        })
        .collect()
}
