use rodio::{OutputStream, OutputStreamHandle, Sink, Decoder};
use std::fs::File;
use std::io::BufReader;
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Track {
    pub id: String,
    pub path: String,
    pub title: String,
}

pub struct AudioPlayer {
    stream_handle: OutputStreamHandle,
    sink: Arc<Mutex<Sink>>,
    pub queue: Arc<Mutex<Vec<Track>>>,
    pub current_index: Arc<Mutex<Option<usize>>>,
    pub is_playing: Arc<Mutex<bool>>,
}

impl AudioPlayer {
    pub fn new() -> Self {
        let (tx, rx) = std::sync::mpsc::channel();
        std::thread::spawn(move || {
            let (_stream, stream_handle) = OutputStream::try_default().unwrap();
            tx.send(stream_handle).unwrap();
            loop {
                std::thread::sleep(std::time::Duration::from_secs(3600));
            }
        });

        let stream_handle = rx.recv().unwrap();
        let sink = Sink::try_new(&stream_handle).unwrap();

        AudioPlayer {
            stream_handle,
            sink: Arc::new(Mutex::new(sink)),
            queue: Arc::new(Mutex::new(Vec::new())),
            current_index: Arc::new(Mutex::new(None)),
            is_playing: Arc::new(Mutex::new(false)),
        }
    }

    pub fn play_track(&self, path: &str) -> Result<(), String> {
        let file = File::open(path).map_err(|e| e.to_string())?;
        let reader = BufReader::new(file);
        let decoder = Decoder::new(reader).map_err(|e| e.to_string())?;

        let sink = self.sink.lock().unwrap();
        let current_volume = sink.volume();
        sink.stop();

        let new_sink = Sink::try_new(&self.stream_handle).unwrap();
        new_sink.set_volume(current_volume);
        new_sink.append(decoder);
        new_sink.play();

        *self.is_playing.lock().unwrap() = true;
        drop(sink);
        *self.sink.lock().unwrap() = new_sink;

        Ok(())
    }

    pub fn pause(&self) {
        self.sink.lock().unwrap().pause();
        *self.is_playing.lock().unwrap() = false;
    }

    pub fn resume(&self) {
        self.sink.lock().unwrap().play();
        *self.is_playing.lock().unwrap() = true;
    }

    pub fn stop(&self) {
        self.sink.lock().unwrap().stop();
        *self.is_playing.lock().unwrap() = false;
    }

    pub fn set_volume(&self, volume: f32) {
        self.sink.lock().unwrap().set_volume(volume);
    }
}