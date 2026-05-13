import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

type AIStore = {
  messages: Message[];
  isThinking: boolean;
  addMessage: (message: Omit<Message, 'timestamp'>) => void;
  clearHistory: () => void;
  setThinking: (thinking: boolean) => void;
};

export const useAIStore = create<AIStore>()(
  persist(
    (set) => ({
      messages: [
        {
          role: 'assistant',
          content: 'Hola, soy Neurid AI. ¿En qué puedo ayudarte hoy? Puedo buscar música por estados de ánimo, crear listas de reproducción o recomendarte artistas.',
          timestamp: Date.now(),
        },
      ],
      isThinking: false,
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, timestamp: Date.now() }],
        })),
      clearHistory: () =>
        set({
          messages: [
            {
              role: 'assistant',
              content: 'Historial borrado. ¿En qué más puedo ayudarte?',
              timestamp: Date.now(),
            },
          ],
        }),
      setThinking: (thinking) => set({ isThinking: thinking }),
    }),
    {
      name: 'neurid-ai-storage',
    },
  ),
);
