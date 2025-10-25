import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Home, LogOut, Gauge, Camera } from 'lucide-react';

// Simple synth sounds via WebAudio
function useSound(enabled) {
  const ctxRef = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, [enabled]);

  const beep = useCallback((freq = 440, dur = 0.05, type = 'sine', gain = 0.05) => {
    if (!enabled) return;
    const ctx = ctxRef.current; if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  }, [enabled]);

  const engine = useCallback((speed = 0) => {
    if (!enabled) return;
    const ctx = ctxRef.current; if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.value = 80 + speed * 40; // pitch rises with speed
    g.gain.value = 0.02;
    lfo.frequency.value = 20; lfoGain.gain.value = 20;
    lfo.connect(lfoGain); lfoGain.connect(o.frequency);
    o.connect(g); g.connect(ctx.destination);
    o.start(); lfo.start();
    return () => { try { o.stop(); lfo.stop(); } catch(_){} };
  }, [enabled]);

  return { beep, engine };
}

const CAR_COLORS = {
  Porsche: '#bdbdbd',
  BMW: '#4f7cff',
  'G-Wagon': '#1f2937',
  Supra: '#f59e0b',
  Bolero: '#10b981',
  'Mahindra Marshal': '#ef4444',
};

const ENV_PRESETS = {
  City: {
    roadColor: '#1a1a1a',
    linesColor: '#ffffff',
    sideColor: '#0b0b0b',
    traffic: ['#888', '#aaa', '#666'],
  },
  Village: {
    roadColor: '#2b2b1f',
    linesColor: '#f8f8d0',
    sideColor: '#1f2d1f',
    traffic: ['#7c6', '#585', '#8a7'],
  },
  Highway: {
    roadColor: '#101010',
    linesColor: '#e0e0e0',
    sideColor: '#161616',
    traffic: ['#bbb', '#ddd', '#999'],
  },
  Market: {
    roadColor: '#2a1d1c',
    linesColor: '#ffd7b5',
    sideColor: '#3a2b2a',
    traffic: ['#c96', '#b76', '#d87'],
  },
};

export default function GameCanvas({ mode, selectedCar, envSettings, soundOn, onExit, onBackToMenu, onUpdateHighest, highest }) {
  const containerRef = useRef(null);
  const playerRef = useRef({ x: 0, lane: 1 }); // lane: 0..3
  const [running, setRunning] = useState(true);
  const [camera, setCamera] = useState('third'); // 'third' | 'cockpit'
  const [speed, setSpeed] = useState(24);
  const [nitro, setNitro] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const trafficRef = useRef([]);
  const lastTimeRef = useRef(0);
  const engineStopRef = useRef(null);
  const { beep, engine } = useSound(soundOn);

  const { roadColor, linesColor, sideColor, traffic } = useMemo(() => {
    const base = ENV_PRESETS[envSettings.selectedEnv] || ENV_PRESETS.City;
    return base;
  }, [envSettings]);

  // Engine sound reactive to speed
  useEffect(() => {
    if (!running || gameOver) return;
    if (engineStopRef.current) {
      engineStopRef.current(); engineStopRef.current = null;
    }
    engineStopRef.current = engine(speed / 30);
    return () => { if (engineStopRef.current) { engineStopRef.current(); engineStopRef.current = null; } };
  }, [speed, running, gameOver, engine]);

  const resetGame = useCallback(() => {
    trafficRef.current = [];
    setScore(0);
    setGameOver(false);
    setTimeLeft(60);
    playerRef.current.lane = 1;
    setSpeed(24);
    setRunning(true);
  }, []);

  const lanes = [0, 1, 2, 3];

  // Spawning traffic
  useEffect(() => {
    let spawnTimer; let raf;
    const spawn = () => {
      if (!running || gameOver) return;
      const lane = Math.floor(Math.random() * 4);
      const v = 12 + Math.random() * 18; // opposite direction speed
      const color = traffic[Math.floor(Math.random() * traffic.length)];
      trafficRef.current.push({ id: Math.random(), lane, y: -200, v, color, w: 56, h: 110 });
    };
    spawnTimer = setInterval(spawn, 600);

    const step = (t) => {
      if (!lastTimeRef.current) lastTimeRef.current = t;
      const dt = Math.min(50, t - lastTimeRef.current);
      lastTimeRef.current = t;
      if (running && !gameOver) {
        // Move traffic
        const mySpeed = speed + (nitro ? 14 : 0);
        for (const car of trafficRef.current) {
          car.y += (car.v + mySpeed * 0.4) * (dt / 16);
        }
        // Remove off-screen
        trafficRef.current = trafficRef.current.filter(c => c.y < 1100);
        // Score
        const ds = (mySpeed * (dt / 1000)) * 10; // meters proxy
        setScore(s => Math.floor(s + (mode === 'endless' ? (dt / 1000) : (ds / 10))));
        // Timed mode countdown
        if (mode === 'timed') setTimeLeft(tl => Math.max(0, tl - dt / 1000));
        if (mode === 'timed' && timeLeft <= 0.05) {
          // Time up - treat as game over without crash
          setGameOver(true); setRunning(false);
          onUpdateHighest(score);
        }
        // Collision detection
        const playerLane = playerRef.current.lane;
        const playerRect = laneRect(playerLane);
        for (const car of trafficRef.current) {
          const r = { x: laneX(car.lane) + 12, y: car.y, w: car.w, h: car.h };
          if (rectsOverlap(playerRect, r)) {
            beep(120, 0.2, 'square', 0.1);
            setGameOver(true); setRunning(false);
            onUpdateHighest(score);
            break;
          }
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => { clearInterval(spawnTimer); cancelAnimationFrame(raf); };
  }, [running, gameOver, speed, nitro, mode, timeLeft, beep, onUpdateHighest, score, traffic]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') { playerRef.current.lane = Math.max(0, playerRef.current.lane - 1); beep(660, 0.03, 'triangle', 0.02); }
      if (e.key === 'ArrowRight') { playerRef.current.lane = Math.min(3, playerRef.current.lane + 1); beep(660, 0.03, 'triangle', 0.02); }
      if (e.key === 'w' || e.key === 'W') setSpeed(s => Math.min(50, s + 4));
      if (e.key === 's' || e.key === 'S') setSpeed(s => Math.max(8, s - 6));
      if (e.code === 'Space') setNitro(true);
      if (e.key === 'p' || e.key === 'P') setRunning(r => !r);
      if (e.key === 'c' || e.key === 'C') setCamera(c => c === 'third' ? 'cockpit' : 'third');
    };
    const onKeyUp = (e) => { if (e.code === 'Space') setNitro(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [gameOver, beep]);

  const laneX = (lane) => {
    const w = containerRef.current?.clientWidth || 360;
    const roadW = Math.min(480, Math.max(320, Math.floor(w * 0.9)));
    const laneW = roadW / 4;
    const startX = (w - roadW) / 2;
    return startX + lane * laneW;
  };

  const laneRect = (lane) => {
    const x = laneX(lane);
    const y = (containerRef.current?.clientHeight || 640) - 180;
    return { x: x + 12, y, w: 56, h: 110 };
  };

  const rectsOverlap = (a, b) => !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);

  const perspectiveClass = useMemo(() => {
    return camera === 'third' ? 'perspective-[900px] [transform-style:preserve-3d]' : 'perspective-[600px] [transform-style:preserve-3d]';
  }, [camera]);

  return (
    <div ref={containerRef} className={`relative w-full h-dvh overflow-hidden bg-gradient-to-b from-black via-neutral-900 to-black ${perspectiveClass}`}>
      {/* Background sky and environment tint */}
      <div className="absolute inset-0" style={{
        background: envSettings.timeOfDay === 'Night'
          ? 'radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.9) 60%), linear-gradient(#020617, #0b0f18)'
          : 'radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%), linear-gradient(#87CEEB, #e2e8f0)'
      }} />

      {/* Road */}
      <div className="absolute left-1/2 -translate-x-1/2 h-[140%] top-[-20%]" style={{ width: '90%' }}>
        <div className="absolute inset-0 mx-auto rounded-b-3xl" style={{ background: roadColor, maxWidth: 480, minWidth: 320 }} />
        {/* Sidewalk */}
        <div className="absolute -left-4 top-0 h-full w-4" style={{ background: sideColor }} />
        <div className="absolute -right-4 top-0 h-full w-4" style={{ background: sideColor }} />
        {/* Lane lines */}
        {[1,2,3].map(i => (
          <div key={i} className="absolute top-0 h-full w-1" style={{ left: `calc(${i}/4*100%)`, backgroundImage: `repeating-linear-gradient( to bottom, ${linesColor}, ${linesColor} 20px, transparent 20px, transparent 46px)` }} />
        ))}
      </div>

      {/* Traffic cars */}
      {trafficRef.current.map((c) => (
        <div key={c.id} className="absolute rounded-xl shadow-lg" style={{
          left: laneX(c.lane) + 12, top: c.y, width: c.w, height: c.h,
          background: c.color, boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
        }} />
      ))}

      {/* Player car */}
      {(() => {
        const r = laneRect(playerRef.current.lane);
        return (
          <div className={`absolute rounded-xl transition-[transform] duration-200 ${camera==='cockpit' ? 'scale-125' : ''}`} style={{ left: r.x, top: r.y, width: r.w, height: r.h, background: CAR_COLORS[selectedCar] || '#999', boxShadow:'0 8px 24px rgba(0,0,0,0.6)' }}>
            {/* Windshield glow */}
            <div className="absolute inset-x-2 top-2 h-8 rounded-md" style={{ background: 'linear-gradient( to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.05))' }} />
          </div>
        );
      })()}

      {/* HUD */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur">Score: <span className="font-semibold">{score}</span></div>
          <div className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur">Highest: <span className="font-semibold">{highest}</span></div>
          {mode === 'timed' && (
            <div className="px-3 py-2 rounded-lg bg-white/10 backdrop-blur">Time: <span className="font-semibold">{Math.ceil(timeLeft)}</span>s</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCamera(c => c==='third'?'cockpit':'third')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur"><Camera size={16}/> {camera === 'third' ? 'Third' : 'Cockpit'}</button>
          <button onClick={() => setRunning(r => !r)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur">{running ? <Pause size={16}/> : <Play size={16}/>} {running ? 'Pause' : 'Resume'}</button>
        </div>
      </div>

      {/* Speed control */}
      <div className="absolute bottom-28 left-3 right-3 flex items-center gap-3">
        <Gauge size={16} />
        <input type="range" min="8" max="60" step="1" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
        <div className={`px-2 py-1 rounded ${nitro ? 'bg-amber-500 text-black' : 'bg-white/10'}`}>Nitro: {nitro ? 'ON' : 'OFF'}</div>
      </div>

      {/* Mobile controls */}
      <div className="md:hidden absolute bottom-3 left-0 right-0 px-3 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button onTouchStart={() => { playerRef.current.lane = Math.max(0, playerRef.current.lane - 1); }} className="px-4 py-4 rounded-xl bg-white/10 backdrop-blur active:bg-white/20">←</button>
          <button onTouchStart={() => { playerRef.current.lane = Math.min(3, playerRef.current.lane + 1); }} className="px-4 py-4 rounded-xl bg-white/10 backdrop-blur active:bg-white/20">→</button>
        </div>
        <div className="flex gap-2">
          <button onTouchStart={() => setSpeed(s => Math.min(60, s + 6))} className="px-4 py-4 rounded-xl bg-emerald-500 text-black">Speed</button>
          <button onTouchStart={() => setSpeed(s => Math.max(8, s - 8))} className="px-4 py-4 rounded-xl bg-white/10 backdrop-blur">Brake</button>
          <button onTouchStart={() => setNitro(true)} onTouchEnd={() => setNitro(false)} className="px-4 py-4 rounded-xl bg-amber-400 text-black">Nitro</button>
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-[90%] max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 text-center space-y-4">
            <div className="text-2xl md:text-3xl font-bold">💥 You Crashed! – Game Over</div>
            <div className="text-sm text-white/70">Score: {score} | Highest: {highest}</div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button onClick={() => { resetGame(); }} className="px-4 py-3 rounded-lg bg-emerald-500 text-black font-semibold inline-flex items-center justify-center gap-2"><RotateCcw size={16}/> Restart</button>
              <button onClick={() => onBackToMenu()} className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 inline-flex items-center justify-center gap-2"><Home size={16}/> Main Menu</button>
              <button onClick={() => onExit()} className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 inline-flex items-center justify-center gap-2"><LogOut size={16}/> Exit</button>
            </div>
          </div>
        </div>
      )}

      {/* Watermark */}
      <div className="absolute bottom-2 right-2 text-[10px] md:text-xs text-white/70">Created by Manmohan | Instagram @manxpaa</div>
    </div>
  );
}
