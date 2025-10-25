import { Image as ImageIcon, Cloud, Sun, Moon, X, Check } from 'lucide-react';

const ENVS = [
  { key: 'City', desc: 'Modern city with tall buildings and traffic' },
  { key: 'Village', desc: 'Indian village road with trees and huts' },
  { key: 'Highway', desc: 'Highway with barriers and trucks' },
  { key: 'Market', desc: 'Area with people and local markets' },
];

const WEATHERS = ['Sunny','Cloudy','Rainy'];
const TIME_OF_DAY = ['Day','Night'];

export default function EnvironmentSelectorModal({ open, onClose, selectedEnv, weather, timeOfDay, onApply }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-[92vw] max-w-3xl rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2"><ImageIcon size={18}/> <h3 className="font-semibold">Select Background</h3></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X size={16}/></button>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {ENVS.map(env => (
              <button key={env.key} onClick={() => onApply(env.key, weather, timeOfDay)} className={`w-full text-left px-4 py-3 rounded-xl border ${selectedEnv===env.key?'border-emerald-500':'border-white/10'} bg-gradient-to-b from-neutral-800 to-neutral-900`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{env.key}</div>
                    <div className="text-xs text-white/70">{env.desc}</div>
                  </div>
                  {selectedEnv===env.key && <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 text-black text-xs"><Check size={14}/> Selected</span>}
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm mb-2">Weather</div>
              <div className="flex flex-wrap gap-2">
                {WEATHERS.map(w => (
                  <button key={w} onClick={() => onApply(selectedEnv, w, timeOfDay)} className={`px-3 py-2 rounded-lg border ${weather===w?'border-emerald-500':'border-white/10'} bg-white/5 hover:bg-white/10 inline-flex items-center gap-2`}>
                    {w==='Sunny' && <Sun size={16}/>} {w==='Cloudy' && <Cloud size={16}/>} {w==='Rainy' && <Cloud size={16}/>} {w}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm mb-2">Time</div>
              <div className="flex gap-2">
                {TIME_OF_DAY.map(t => (
                  <button key={t} onClick={() => onApply(selectedEnv, weather, t)} className={`px-3 py-2 rounded-lg border ${timeOfDay===t?'border-emerald-500':'border-white/10'} bg-white/5 hover:bg-white/10 inline-flex items-center gap-2`}>
                    {t==='Day' ? <Sun size={16}/> : <Moon size={16}/>} {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-white/60">Weather affects visuals subtly; rainy adds darker contrast, night lowers brightness.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
