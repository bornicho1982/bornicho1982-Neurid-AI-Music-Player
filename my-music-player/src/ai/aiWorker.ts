import { pipeline, env } from '@xenova/transformers';
import { usePlayerStore } from '../store/playerStore';

// Disable fetching models from local cache to prevent Tauri FS issues
env.allowLocalModels = false;

class AIWorker {
  static instance: any = null;

  static async getInstance(progress_callback?: (x: any) => void) {
    if (this.instance === null) {
      // Usamos un modelo muy ligero de zero-shot classification para deducir la intención del usuario
      this.instance = pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', { progress_callback });
    }
    return this.instance;
  }
}

export const processCommand = async (command: string, setStatus: (s: string) => void) => {
  if (!command.trim()) return;

  setStatus('Pensando...');
  try {
    const classifier = await AIWorker.getInstance((progress) => {
      if (progress.status === 'downloading') {
         setStatus(`Descargando modelo local: ${Math.round(progress.progress)}%`);
      }
    });

    const candidateLabels = ['play music', 'pause music', 'next track', 'previous track'];

    // Ejecutamos la clasificación
    const output = await classifier(command, candidateLabels);

    // Obtener la predicción con mayor puntuación
    const bestMatch = output.labels[0];
    const score = output.scores[0];

    // Si la confianza es alta, ejecutamos la acción
    if (score > 0.4) {
      const store = usePlayerStore.getState();
      switch (bestMatch) {
        case 'play music':
          await store.resume();
          setStatus('Acción: Reproduciendo...');
          break;
        case 'pause music':
          await store.pause();
          setStatus('Acción: Pausando...');
          break;
        case 'next track':
          await store.nextTrack();
          setStatus('Acción: Siguiente pista...');
          break;
        case 'previous track':
          await store.prevTrack();
          setStatus('Acción: Pista anterior...');
          break;
        default:
          setStatus('Comando no reconocido por la IA.');
      }
    } else {
       setStatus('No estoy seguro de qué quieres hacer.');
    }

    // Limpiamos el status después de 3s
    setTimeout(() => setStatus(''), 3000);

  } catch (error) {
    console.error("AI Error:", error);
    setStatus('Error en la IA local.');
  }
};
