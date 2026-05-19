use std::sync::{Arc, Mutex};
use tauri::State;
use tauri::Manager;
use tauri::Emitter;
use walkdir::WalkDir;
use lofty::file::TaggedFileExt;
use lofty::probe::Probe;
use lofty::tag::Accessor;
use tauri_plugin_opener::OpenerExt;

// AI Imports
use llama_cpp_2::model::{LlamaModel, AddBos, Special};
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::model::params::LlamaModelParams;
use llama_cpp_2::context::params::LlamaContextParams;
use llama_cpp_2::llama_batch::LlamaBatch;
use llama_cpp_2::sampling::LlamaSampler;
use std::path::PathBuf;
use lofty::file::AudioFile;

mod audio;
mod oauth;

use audio::{AudioPlayer, Track};

struct AppState {
    player: Mutex<AudioPlayer>,
    ai_backend: Arc<Mutex<Option<LlamaBackend>>>,
    ai_model: Arc<Mutex<Option<LlamaModel>>>,
}

#[tauri::command]
async fn initialize_ia(app_handle: tauri::AppHandle, state: State<'_, AppState>) -> Result<String, String> {
    let ai_backend = state.ai_backend.clone();
    let ai_model = state.ai_model.clone();

    // Verificación rápida del estado antes de spawnear el hilo
    {
        let model_lock = ai_model.lock().unwrap();
        if model_lock.is_some() {
            return Ok("IA ya inicializada".to_string());
        }
    }

    let mut model_path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&model_path).map_err(|e| format!("Error creando el directorio de datos: {:?}", e))?;
    model_path.push("gemma-2b-it-q4_k_m.gguf");

    if !model_path.exists() {
        return Err(format!(
            "No se encuentra el archivo 'gemma-2b-it-q4_k_m.gguf'. Por favor, colócalo en la siguiente ruta absoluta de tu sistema operativo: {:?}",
            model_path
        ));
    }

    tauri::async_runtime::spawn_blocking(move || {
        let mut backend_lock = ai_backend.lock().unwrap();
        let mut model_lock = ai_model.lock().unwrap();

        if model_lock.is_some() {
            return Ok("IA ya inicializada".to_string());
        }

        // Inicializar Backend
        let backend = LlamaBackend::init().map_err(|e| format!("Error backend: {:?}", e))?;
        *backend_lock = Some(backend);

        let model_params = LlamaModelParams::default();
        let model = LlamaModel::load_from_file(backend_lock.as_ref().unwrap(), &model_path, &model_params)
            .map_err(|e| format!("Error cargando modelo: {:?}", e))?;

        *model_lock = Some(model);
        Ok("Núcleo Neuronal (Llama.cpp) cargado correctamente".to_string())
    })
    .await
    .map_err(|e| format!("Error en ejecución del hilo de inicialización: {:?}", e))?
}

#[tauri::command]
async fn query_ia(state: State<'_, AppState>, prompt: String) -> Result<String, String> {
    let ai_backend = state.ai_backend.clone();
    let ai_model = state.ai_model.clone();

    tauri::async_runtime::spawn_blocking(move || {
        let model_lock = ai_model.lock().unwrap();
        let model = model_lock.as_ref().ok_or("La IA no ha sido inicializada.")?;
        let backend_lock = ai_backend.lock().unwrap();
        let backend = backend_lock.as_ref().unwrap();

        let ctx_params = LlamaContextParams::default();
        let mut ctx = model.new_context(backend, ctx_params).map_err(|e| format!("Error contexto: {:?}", e))?;

        // Tokenizar prompt
        let tokens = model.str_to_token(&prompt, AddBos::Always).map_err(|e| format!("Error tokens: {:?}", e))?;
        
        // Preparar batch
        let mut batch = LlamaBatch::new(512, 1);
        let last_index = (tokens.len() - 1) as i32;
        for (i, token) in tokens.into_iter().enumerate() {
            batch.add(token, i as i32, &[0], i as i32 == last_index);
        }

        ctx.decode(&mut batch).map_err(|e| format!("Error decode: {:?}", e))?;

        // Loop de generación simple (max 100 tokens)
        let mut response = String::new();
        let mut sampler = LlamaSampler::chain_simple([
            LlamaSampler::dist(0),
            LlamaSampler::temp(0.8),
        ]);

        let mut current_pos = last_index + 1;
        for _ in 0..100 {
            let token = sampler.sample(&ctx, batch.n_tokens() - 1);
            if model.is_eog_token(token) { break; }
            
            let piece = model.token_to_str(token, Special::Plaintext).map_err(|e| e.to_string())?;
            response.push_str(&piece);

            batch.clear();
            batch.add(token, current_pos, &[0], true);
            ctx.decode(&mut batch).map_err(|e| format!("Error decode loop: {:?}", e))?;
            current_pos += 1;
        }

        Ok(response.trim().to_string())
    })
    .await
    .map_err(|e| format!("Error en ejecución del hilo de consulta: {:?}", e))?
}

#[tauri::command]
async fn search_web_music(query: String) -> Result<Vec<serde_json::Value>, String> {
    // Implementación simplificada de búsqueda web usando reqwest
    // En una versión final, usaríamos un motor de búsqueda real o un plugin de Kalosm
    let client = reqwest::Client::new();
    let url = format!("https://api.deezer.com/search?q={}", urlencoding::encode(&query));
    
    let resp = client.get(url).send().await.map_err(|e| e.to_string())?;
    let data: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
    
    Ok(data["data"].as_array().cloned().unwrap_or_default())
}

#[tauri::command]
fn save_token(app_handle: tauri::AppHandle, key: String, token: String) -> Result<(), String> {
    let mut path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    path.push("config.json");

    let mut config: serde_json::Value = if path.exists() {
        let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
        serde_json::from_reader(file).unwrap_or(serde_json::json!({}))
    } else {
        serde_json::json!({})
    };

    config[key] = serde_json::Value::String(token);

    let file = std::fs::File::create(&path).map_err(|e| e.to_string())?;
    serde_json::to_writer_pretty(file, &config).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_token(app_handle: tauri::AppHandle, key: String) -> Result<Option<String>, String> {
    let mut path = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    path.push("config.json");

    if !path.exists() {
        return Ok(None);
    }

    let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let config: serde_json::Value = serde_json::from_reader(file).unwrap_or(serde_json::json!({}));
    
    let token = config.get(&key).and_then(|v| v.as_str()).map(|s| s.to_string());
    Ok(token)
}

#[tauri::command]
async fn authenticate_spotify(app_handle: tauri::AppHandle, client_id: String, client_secret: String) -> Result<String, String> {
    // 1. URL de autorización de Spotify
    let redirect_uri = "http://127.0.0.1:8888/callback";
    let auth_url = format!(
        "https://accounts.spotify.com/authorize?client_id={}&response_type=code&redirect_uri={}&scope=playlist-read-private%20user-library-read",
        client_id, redirect_uri
    );

    // 2. Abrir navegador
    let opener = app_handle.opener();
    opener.open_url(auth_url, None::<&str>).map_err(|e| format!("Error abriendo navegador: {}", e))?;
    println!("Navegador abierto correctamente.");

    // 3. Levantar servidor local en un hilo para no bloquear Tauri
    let code = tauri::async_runtime::spawn_blocking(|| {
        oauth::listen_for_oauth_callback(8888)
    })
    .await
    .map_err(|e| format!("Error en ejecución del hilo de inicialización: {}", e))?
    .map_err(|e| format!("Error escuchando callback: {}", e))?;

    // 4. Intercambiar code por token en Rust
    let client = reqwest::Client::new();
    let token_url = "https://accounts.spotify.com/api/token";
    
    let params = [
        ("grant_type", "authorization_code"),
        ("code", &code),
        ("redirect_uri", redirect_uri),
        ("client_id", &client_id),
        ("client_secret", &client_secret),
    ];

    let resp = client
        .post(token_url)
        .form(&params)
        .send()
        .await
        .map_err(|e| format!("Error en POST de token: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let err_text = resp.text().await.unwrap_or_default();
        return Err(format!("Error en respuesta de token (status {}): {}", status, err_text));
    }

    let token_data: serde_json::Value = resp
        .json()
        .await
        .map_err(|e| format!("Error deserializando JSON de token: {}", e))?;

    let access_token = token_data["access_token"]
        .as_str()
        .ok_or_else(|| "No access_token found in response".to_string())?;

    // Guardar tokens de manera de persistencia local
    save_token(app_handle.clone(), "spotify_access_token".to_string(), access_token.to_string())?;
    
    if let Some(refresh_token) = token_data["refresh_token"].as_str() {
        save_token(app_handle.clone(), "spotify_refresh_token".to_string(), refresh_token.to_string())?;
    }

    Ok(access_token.to_string())
}

#[tauri::command]
fn add_to_queue(state: State<'_, AppState>, path: String, title: String) -> Result<Vec<Track>, String> {
    let player = state.player.lock().unwrap();
    let mut queue = player.queue.lock().unwrap();
    let track = Track {
        id: uuid::Uuid::new_v4().to_string(),
        path,
        title,
        artist: None,
        album: None,
        duration: None,
    };
    queue.push(track);
    Ok(queue.clone())
}

#[tauri::command]
fn replace_queue(state: State<'_, AppState>, tracks: Vec<Track>) -> Result<(), String> {
    let player = state.player.lock().unwrap();
    let mut queue = player.queue.lock().unwrap();
    queue.clear();
    queue.extend(tracks);
    Ok(())
}

#[tauri::command]
fn scan_single_file(path: String) -> Result<Track, String> {
    let path_buf = std::path::Path::new(&path);
    if !path_buf.is_file() {
        return Err("Ruta no es un archivo válido".to_string());
    }

    let mut track_title = path_buf.file_stem().unwrap_or_default().to_string_lossy().into_owned();
    let mut track_artist = None;
    let mut track_album = None;
    let mut track_duration = None;

    // Try to extract metadata using Lofty
    if let Ok(tagged_file) = Probe::open(path_buf).and_then(|p| p.read()) {
        let properties = tagged_file.properties();
        track_duration = Some(properties.duration().as_secs_f32());

        if let Some(tag) = tagged_file.primary_tag() {
            if let Some(title) = tag.title() {
                track_title = title.into_owned();
            }
            track_artist = tag.artist().map(|a| a.into_owned());
            track_album = tag.album().map(|a| a.into_owned());
        } else if let Some(tag) = tagged_file.first_tag() {
            if let Some(title) = tag.title() {
                track_title = title.into_owned();
            }
            track_artist = tag.artist().map(|a| a.into_owned());
            track_album = tag.album().map(|a| a.into_owned());
        }
    }

    Ok(Track {
        id: uuid::Uuid::new_v4().to_string(),
        path,
        title: track_title,
        artist: track_artist,
        album: track_album,
        duration: track_duration,
    })
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
                if ext_str == "mp3" || ext_str == "flac" || ext_str == "wav" || ext_str == "ogg" || ext_str == "m4a" {
                    let mut track_title = path.file_stem().unwrap_or_default().to_string_lossy().into_owned();
                    let mut track_artist = None;
                    let mut track_album = None;
                    let mut track_duration = None;

                    // Try to extract metadata
                    if let Ok(tagged_file) = Probe::open(path).and_then(|p| p.read()) {
                        let properties = tagged_file.properties();
                        track_duration = Some(properties.duration().as_secs_f32());

                        if let Some(tag) = tagged_file.primary_tag() {
                            if let Some(title) = tag.title() {
                                track_title = title.into_owned();
                            }
                            track_artist = tag.artist().map(|a| a.into_owned());
                            track_album = tag.album().map(|a| a.into_owned());
                        } else if let Some(tag) = tagged_file.first_tag() {
                            if let Some(title) = tag.title() {
                                track_title = title.into_owned();
                            }
                            track_artist = tag.artist().map(|a| a.into_owned());
                            track_album = tag.album().map(|a| a.into_owned());
                        }
                    }

                    let track = Track {
                        id: uuid::Uuid::new_v4().to_string(),
                        path: path.to_string_lossy().into_owned(),
                        title: track_title,
                        artist: track_artist,
                        album: track_album,
                        duration: track_duration,
                    };
                    queue.push(track);
                }
            }
        }
    }

    Ok(queue.clone())
}


#[tauri::command]
fn play_track(state: State<'_, AppState>, index: usize, path: Option<String>) -> Result<(), String> {
    let player = state.player.lock().unwrap();
    
    let play_path = if let Some(p) = path {
        p
    } else {
        let queue = player.queue.lock().unwrap();
        if index < queue.len() {
            queue[index].path.clone()
        } else {
            return Err("Index out of bounds".to_string());
        }
    };

    player.play_track(&play_path)?;
    *player.current_index.lock().unwrap() = Some(index);
    Ok(())
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

#[tauri::command]
fn get_playback_position(state: State<'_, AppState>) -> f32 {
    state.player.lock().unwrap().get_pos().as_secs_f32()
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .manage(AppState {
            player: Mutex::new(AudioPlayer::new()),
            ai_backend: Arc::new(Mutex::new(None)),
            ai_model: Arc::new(Mutex::new(None)),
        })
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            tauri::async_runtime::spawn(async move {
                loop {
                    // Check if playing
                    let is_playing = {
                        let state = app_handle.state::<AppState>();
                        let player = state.player.lock().unwrap();
                        let is_playing_guard = player.is_playing.lock().unwrap();
                        *is_playing_guard
                    };

                    if !is_playing {
                        // Wait until notified that a track has started/resumed playing
                        let notify = {
                            let state = app_handle.state::<AppState>();
                            let player = state.player.lock().unwrap();
                            player.notify_play.clone()
                        };
                        notify.notified().await;
                        continue;
                    }

                    // Get current position
                    let current_time = {
                        let state = app_handle.state::<AppState>();
                        let player = state.player.lock().unwrap();
                        let pos = player.get_pos();
                        pos.as_secs_f32()
                    };

                    #[derive(serde::Serialize, Clone)]
                    struct AudioTickPayload {
                        #[serde(rename = "currentTime")]
                        current_time: f32,
                    }

                    let _ = app_handle.emit("audio_tick", AudioTickPayload { current_time });

                    // Sleep for 250ms
                    tokio::time::sleep(std::time::Duration::from_millis(250)).await;
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            add_to_queue,
            replace_queue,
            scan_local_folder,
            scan_single_file,
            play_track,
            pause_audio,
            resume_audio,
            stop_audio,
            set_volume,
            authenticate_spotify,
            save_token,
            get_token,
            get_playback_position,
            initialize_ia,
            query_ia,
            search_web_music
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
