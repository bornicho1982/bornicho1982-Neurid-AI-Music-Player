// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;
use tauri::State;
mod audio;
use audio::{AudioPlayer, Track};

struct AppState {
    player: Mutex<AudioPlayer>,
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
            play_track,
            pause_audio,
            resume_audio,
            stop_audio,
            set_volume
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
