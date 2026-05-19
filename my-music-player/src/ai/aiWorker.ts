import { pipeline, env } from '@xenova/transformers';

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

self.onmessage = async (event: MessageEvent) => {
  const { command } = event.data;
  if (!command || !command.trim()) return;

  self.postMessage({ type: 'status', status: 'Pensando...' });
  try {
    const classifier = await AIWorker.getInstance((progress) => {
      if (progress.status === 'downloading') {
         self.postMessage({ 
           type: 'status', 
           status: `Descargando modelo local: ${Math.round(progress.progress)}%` 
         });
      }
    });

    const candidateLabels = ['play music', 'pause music', 'next track', 'previous track', 'search music', 'switch view', 'create playlist'];

    // Ejecutamos la clasificación
    const output = await classifier(command, candidateLabels);

    // Obtener la predicción con mayor puntuación
    const bestMatch = output.labels[0];
    const score = output.scores[0];

    self.postMessage({
      type: 'result',
      bestMatch,
      score,
      command
    });
  } catch (error: any) {
    console.error("AI Worker Error:", error);
    self.postMessage({ type: 'error', error: error.message || 'Error en la IA local.' });
  }
};
