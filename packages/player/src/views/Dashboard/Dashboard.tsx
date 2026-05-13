import { FC } from 'react';
import { PlayIcon } from 'lucide-react';

export const Dashboard: FC = () => {
  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-1000">
      {/* AI Recommendations Section */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-white/80">AI Recommendations</h2>
        <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
          <div className="ai-recommendation-card card-teal">
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-neurid-teal/20 to-neurid-purple/20 mb-4 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Synthetic Echoes" />
              <div className="absolute inset-0 bg-neurid-teal/10 mix-blend-overlay" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase">Synthetic Echoes</h3>
            <p className="text-sm text-white/40 font-medium">Chill Synth</p>
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs font-bold text-neurid-teal/60">3:45</span>
              <PlayIcon size={16} className="text-neurid-teal" />
            </div>
          </div>

          <div className="ai-recommendation-card card-purple">
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-neurid-purple/20 to-neurid-teal/20 mb-4 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Violet Dreams" />
              <div className="absolute inset-0 bg-neurid-purple/10 mix-blend-overlay" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase">Violet Dreams</h3>
            <p className="text-sm text-white/40 font-medium">Ambient</p>
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs font-bold text-neurid-purple/60">4:12</span>
              <PlayIcon size={16} className="text-neurid-purple" />
            </div>
          </div>

          <div className="ai-recommendation-card card-teal">
            <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-neurid-teal/20 to-neurid-purple/20 mb-4 overflow-hidden relative group">
              <img src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="Neon Rhythms" />
              <div className="absolute inset-0 bg-neurid-teal/10 mix-blend-overlay" />
            </div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase">Neon Rhythms</h3>
            <p className="text-sm text-white/40 font-medium">Cyber Funk</p>
            <div className="mt-auto flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-xs font-bold text-neurid-teal/60">3:58</span>
              <PlayIcon size={16} className="text-neurid-teal" />
            </div>
          </div>
        </div>
      </section>

      {/* Recently Played Section */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold text-white/40 uppercase tracking-widest">Recently Played</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col gap-3 group cursor-pointer">
              <div className="w-full aspect-square rounded-xl bg-white/5 overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-300">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
              </div>
              <div className="h-4 w-2/3 bg-white/5 rounded-full" />
              <div className="h-3 w-1/2 bg-white/5 rounded-full opacity-50" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
