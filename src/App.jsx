import { useEffect, useMemo, useState } from 'react';
import MainMenu from './components/MainMenu.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import GarageModal from './components/GarageModal.jsx';
import EnvironmentSelectorModal from './components/EnvironmentSelectorModal.jsx';

const HIGHEST_KEY = 'rd_highest_score_v1';

export default function App() {
  const [view, setView] = useState('menu'); // 'menu' | 'game'
  const [mode, setMode] = useState('endless'); // 'endless' | 'timed'
  const [highest, setHighest] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [showGarage, setShowGarage] = useState(false);
  const [showEnv, setShowEnv] = useState(false);
  const [selectedCar, setSelectedCar] = useState('Porsche');
  const [selectedEnv, setSelectedEnv] = useState('City');
  const [weather, setWeather] = useState('Sunny'); // 'Sunny' | 'Cloudy' | 'Rainy'
  const [timeOfDay, setTimeOfDay] = useState('Day'); // 'Day' | 'Night'

  useEffect(() => {
    const saved = Number(localStorage.getItem(HIGHEST_KEY) || '0');
    if (!Number.isNaN(saved)) setHighest(saved);
  }, []);

  const handleStart = (m) => {
    if (m) setMode(m);
    setView('game');
  };

  const handleUpdateHighest = (score) => {
    if (score > highest) {
      setHighest(score);
      localStorage.setItem(HIGHEST_KEY, String(score));
    }
  };

  const envSettings = useMemo(() => ({ selectedEnv, weather, timeOfDay }), [selectedEnv, weather, timeOfDay]);

  return (
    <div className="w-full h-dvh bg-black text-white">
      {view === 'menu' && (
        <MainMenu
          highest={highest}
          onStart={handleStart}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
          onOpenGarage={() => setShowGarage(true)}
          onOpenEnv={() => setShowEnv(true)}
        />
      )}

      {view === 'game' && (
        <GameCanvas
          mode={mode}
          selectedCar={selectedCar}
          envSettings={envSettings}
          soundOn={soundOn}
          onExit={() => setView('menu')}
          onBackToMenu={() => setView('menu')}
          onUpdateHighest={handleUpdateHighest}
          highest={highest}
        />
      )}

      <GarageModal
        open={showGarage}
        onClose={() => setShowGarage(false)}
        selectedCar={selectedCar}
        onSelect={(c) => {
          setSelectedCar(c);
          setShowGarage(false);
        }}
      />

      <EnvironmentSelectorModal
        open={showEnv}
        onClose={() => setShowEnv(false)}
        selectedEnv={selectedEnv}
        weather={weather}
        timeOfDay={timeOfDay}
        onApply={(env, wthr, time) => {
          setSelectedEnv(env);
          setWeather(wthr);
          setTimeOfDay(time);
          setShowEnv(false);
        }}
      />
    </div>
  );
}
