import { FC, useState, useRef, useEffect } from 'react';
import { SendIcon, SparklesIcon, BotIcon, UserIcon } from 'lucide-react';
import { neuridAI } from '../../services/aiService';

export const AIView: FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I am Neurid AI. How can I help you with your music today?' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsProcessing(true);

    try {
      const response = await neuridAI.processQuery(userQuery);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-8 animate-in slide-in-from-bottom-8 duration-700">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-neurid-purple rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(176,106,179,0.4)]">
          <SparklesIcon size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Neurid AI</h1>
          <p className="text-white/40 text-sm font-medium">Your personal studio assistant</p>
        </div>
      </header>

      <div className="flex-1 flex flex-col glass-panel rounded-3xl overflow-hidden border-white/5 relative">
        {/* Messages area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-neurid-purple/20 text-neurid-purple' : 'bg-white/10 text-white/40'
              }`}>
                {msg.role === 'assistant' ? <BotIcon size={20} /> : <UserIcon size={20} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant' ? 'bg-white/5 text-white/90' : 'bg-neurid-teal/10 text-white border border-neurid-teal/20'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="self-start flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-neurid-purple/20 flex items-center justify-center">
                <BotIcon size={20} className="text-neurid-purple" />
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce delay-75" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-md">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me to play something or discover new music..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 pr-16 outline-none focus:border-neurid-purple/50 transition-all text-white placeholder:text-white/20"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-neurid-purple rounded-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(176,106,179,0.3)]"
            >
              <SendIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
