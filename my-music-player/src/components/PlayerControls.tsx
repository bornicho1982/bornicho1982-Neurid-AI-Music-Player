import { open } from '@tauri-apps/plugin-dialog';
import { Play, Pause, SkipBack, SkipForward, Volume2, Plus } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export const PlayerControls = () => {
  const {
    isPlaying,
    volume,
    currentIndex,
    queue,
    pause,
    resume,
    nextTrack,
    prevTrack,
    setVolume,
    addToQueue
  } = usePlayerStore();

  const handleAddFile = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Audio',
          extensions: ['mp3', 'wav', 'flac', 'ogg']
        }]
      });

      if (selected) {
        const files = Array.isArray(selected) ? selected : [selected];
        for (const file of files) {
          // Extraemos el nombre del archivo de la ruta
          const fileName = file.split(/[\\/]/).pop() || 'Unknown Track';
          await addToQueue(file, fileName);
        }
      }
    } catch (err) {
      console.error("Failed to open file dialog", err);
    }
  };

  const currentTrack = currentIndex !== null ? queue[currentIndex] : null;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-900 rounded-xl shadow-2xl flex flex-col gap-6">

      {/* Header / Info */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {currentTrack ? currentTrack.title : "No track playing"}
          </h2>
          <p className="text-zinc-400 text-sm">
            {currentTrack ? "Local File" : "Select a file to start"}
          </p>
        </div>

        <button
          onClick={handleAddFile}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Track
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => prevTrack()}
            className="p-3 text-zinc-400 hover:text-white transition-colors"
            disabled={currentIndex === null || currentIndex === 0}
          >
            <SkipBack size={24} />
          </button>

          <button
            onClick={() => isPlaying ? pause() : resume()}
            className="p-4 bg-white text-black rounded-full hover:scale-105 transition-transform"
            disabled={queue.length === 0}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
          </button>

          <button
            onClick={() => nextTrack()}
            className="p-3 text-zinc-400 hover:text-white transition-colors"
            disabled={currentIndex === null || currentIndex >= queue.length - 1}
          >
            <SkipForward size={24} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-64">
          <Volume2 size={20} className="text-zinc-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Queue */}
      <div className="mt-4 border-t border-zinc-800 pt-4">
        <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Queue</h3>
        <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
          {queue.length === 0 ? (
            <p className="text-zinc-500 text-sm italic">Queue is empty</p>
          ) : (
            queue.map((track, idx) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${idx === currentIndex ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-zinc-800/50 text-zinc-300'}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-xs text-zinc-500 w-4">{idx + 1}</span>
                  <span className="truncate">{track.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
