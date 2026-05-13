// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;
use walkdir::WalkDir;
use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use tauri_plugin_opener::OpenerExt;

mod audio;
mod oauth;

use audio::{AudioPlayer, Track};

struct AppState {
    player: Mutex<AudioPlayer>,
}

#[tauri::command]
async fn authenticate_spotify(app_handle: tauri::AppHandle) -> Result<String, String> {
    // 1. URL de autorización de Spotify (Client ID falso para estructura)
    let client_id = "YOUR_SPOTIFY_CLIENT_ID";
    let redirect_uri = "http://127.0.0.1:8888/callback";
    let auth_url = format!(
        "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope=playlist-read-private%20user-library-read",
        client_id, redirect_uri
    );

    // 2. Abrir navegador
    let opener = app_handle.opener();
    opener.open_url(auth_url, None::<&str>).map_err(|e| e.to_string())?;

    // 3. Levantar servidor local en un hilo para no bloquear Tauri
    let code = tauri::async_runtime::spawn_blocking(|| {
        oauth::listen_for_oauth_callback(8888)
    })
    .await
    .map_err(|e| format!("Task failed: {}", e))??;

    // TODO: Usar el `code` con reqwest para obtener el Access Token.
    // Retornamos el código capturado a modo de prueba.
    Ok(code)
}

#[tauri::command]
fn add_to_queue(state: State<'_, AppState>, path: String, title: String) -> Result<Vec<Track>, String> {
    let player = state.player.lock().unwrap();
    let mut queue = player.queue.lock().unwrap();
    let track = Track {
        id: uuid::Uuid::new_v4().to_string(),
        path,
        title,
    };
    queue.push(track);
    Ok(queue.clone())
}

#[tauri::command]
fn scan_local_folder(state: State<'_, AppState>, folder_path: String) -> Result<Vec<Track>, String> {
    let player = state.player.lock().unwrap();
    let mut queue = player.queue.lock().unwrap();

    // Clear current queue to replace with new folder content
    queue.clear();

    for entry in WalkDir::new(folder_path).into_iter().filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                let ext_str = ext.to_string_lossy().to_lowercase();
                if ext_str == "mp3" || ext_str == "flac" || ext_str == "wav" || ext_str == "ogg" {
                    let mut track_title = path.file_stem().unwrap_or_default().to_string_lossy().into_owned();

                    // Try to extract metadata
                    if let Ok(tagged_file) = Probe::open(path).and_then(|p| p.read()) {
                        if let Some(tag) = tagged_file.primary_tag() {
                            if let Some(title) = tag.title() {
                                track_title = title.into_owned();
                            }
                        } else if let Some(tag) = tagged_file.first_tag() {
                            if let Some(title) = tag.title() {
                                track_title = title.into_owned();
                            }
                        }
                    }

                    let track = Track {
                        id: uuid::Uuid::new_v4().to_string(),
                        path: path.to_string_lossy().into_owned(),
                        title: track_title,
                    };
                    queue.push(track);
                }
            }
        }
    }

    Ok(queue.clone())
}


#[tauri::command]
fn play_track(state: State<'_, AppState>, index: usize) -> Result<(), String> {
    let player = state.player.lock().unwrap();
    let queue = player.queue.lock().unwrap();

    if index < queue.len() {
        let track = &queue[index];
        player.play_track(&track.path)?;
        *player.current_index.lock().unwrap() = Some(index);
        Ok(())
    } else {
        Err("Index out of bounds".to_string())
    }
}

#[tauri::command]
fn pause_audio(state: State<'_, AppState>) -> Result<(), String> {
    state.player.lock().unwrap().pause();
    Ok(())
}

#[tauri::command]
fn resume_audio(state: State<'_, AppState>) -> Result<(), String> {
    state.player.lock().unwrap().resume();
    Ok(())
}

#[tauri::command]
fn stop_audio(state: State<'_, AppState>) -> Result<(), String> {
    state.player.lock().unwrap().stop();
    Ok(())
}

#[tauri::command]
fn set_volume(state: State<'_, AppState>, volume: f32) -> Result<(), String> {
    state.player.lock().unwrap().set_volume(volume);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            player: Mutex::new(AudioPlayer::new()),
        })
        .invoke_handler(tauri::generate_handler![
            add_to_queue,
            scan_local_folder,
            play_track,
            pause_audio,
            resume_audio,
            stop_audio,
            set_volume,
            authenticate_spotify
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
