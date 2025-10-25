import { Car, Check, X } from 'lucide-react';

const CARS = ['Porsche','BMW','G-Wagon','Supra','Bolero','Mahindra Marshal'];

export default function GarageModal({ open, onClose, selectedCar, onSelect }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-[92vw] max-w-3xl rounded-2xl bg-neutral-950 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2"><Car size={18}/> <h3 className="font-semibold">Garage</h3></div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X size={16}/></button>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CARS.map((c) => (
            <button key={c} onClick={() => onSelect(c)} className={`group relative aspect-[4/3] rounded-xl overflow-hidden border ${selectedCar===c?'border-emerald-500':'border-white/10'} bg-gradient-to-br from-neutral-800 to-neutral-900`}>
              <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">{c}</div>
              {selectedCar === c && (
                <div className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-500 text-black text-xs"><Check size={14}/> Selected</div>
              )}
            </button>
          ))}
        </div>
        <div className="px-5 py-4 border-t border-white/10 text-xs text-white/70">Tip: Use the car that fits your driving style. All cars handle similarly in this demo.</div>
      </div>
    </div>
  );
}
