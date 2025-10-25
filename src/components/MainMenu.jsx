import { useState } from 'react';
import Spline from '@splinetool/react-spline';
import { Play, Settings, Car, Image as ImageIcon, Volume2, VolumeX } from 'lucide-react';

export default function MainMenu({ highest, onStart, soundOn, setSoundOn, onOpenGarage, onOpenEnv }) {
  const [mode, setMode] = useState('endless');

  return (
    <div className="relative w-full h-dvh overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/m8wpIQzXWhEh9Yek/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80 pointer-events-none" />

      <div className="relative z-10 h-full w-full flex flex-col">
        <header className="flex items-center justify-between px-6 md:px-10 py-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">Realistic Drive India</h1>
            <p className="text-xs md:text-sm text-white/70">Created by Manmohan | Instagram @manxpaa</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSoundOn(!soundOn)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}<span className="hidden md:inline">{soundOn ? 'Sound On' : 'Muted'}</span>
            </button>
            <button onClick={onOpenEnv} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">
              <ImageIcon size={18} /> <span className="hidden md:inline">Backgrounds</span>
            </button>
            <button onClick={onOpenGarage} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">
              <Car size={18} /> <span className="hidden md:inline">Garage</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-2xl w-full space-y-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-widest text-white/70">Highest Score</p>
              <p className="text-4xl md:text-6xl font-bold">{highest}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 w-full">
              <button onClick={() => setMode('endless')} className={`px-4 py-3 rounded-lg backdrop-blur ${mode==='endless' ? 'bg-emerald-500/80' : 'bg-white/10 hover:bg-white/20'}`}>Endless Drive</button>
              <button onClick={() => setMode('timed')} className={`px-4 py-3 rounded-lg backdrop-blur ${mode==='timed' ? 'bg-emerald-500/80' : 'bg-white/10 hover:bg-white/20'}`}>Timed Challenge</button>
              <button onClick={onOpenGarage} className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">Select Car</button>
              <button onClick={onOpenEnv} className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">Select Background</button>
            </div>

            <div className="pt-2">
              <button onClick={() => onStart(mode)} className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold shadow-lg">
                <Play size={20} /> Start Game
              </button>
            </div>
          </div>
        </main>

        <footer className="px-6 md:px-10 pb-4 text-xs text-white/60">
          <div className="flex items-center justify-between">
            <p>Controls: PC - Arrow keys to steer, W accelerate, S brake, Space Nitro | Mobile - On-screen controls</p>
            <p>Watermark: Created by Manmohan | Instagram @manxpaa</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
