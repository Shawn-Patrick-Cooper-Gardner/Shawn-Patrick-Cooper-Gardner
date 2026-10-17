import React, { useState, useEffect, useCallback } from 'react';
import { VEHICLES, Vehicle } from './data/vehicles';
import { GarageHeader } from './components/GarageHeader';
import { VehicleStage } from './components/VehicleStage';
import { TuningBench, TuningConfig, DEFAULT_TUNING } from './components/TuningBench';
import { DynoChart } from './components/DynoChart';
import { BlueprintGallery } from './components/BlueprintGallery';
import { PayloadValidator } from './components/PayloadValidator';
import { CartographyHelper } from './components/CartographyHelper';
import { RaceHeritage } from './components/RaceHeritage';
import { SpecSheetModal } from './components/SpecSheetModal';
import { GeminiQrModal } from './components/GeminiQrModal';
import { audioEngine } from './services/AudioEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'showcase' | 'dyno' | 'tuning' | 'blueprints' | 'validator' | 'cartography' | 'heritage'>('showcase');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(VEHICLES[0].id);
  const [tuning, setTuning] = useState<TuningConfig>(DEFAULT_TUNING);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isGeminiQrOpen, setIsGeminiQrOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isRevving, setIsRevving] = useState<boolean>(false);

  const selectedVehicle: Vehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];

  // Calculate horsepower delta from tuning
  const boostBonus = (tuning.boostPsi - 12) * 22;
  const timingBonus = (tuning.timingAdvanceDeg - 34) * 6;
  const octaneBonus = tuning.raceFuelOctane === 110 ? 30 : tuning.raceFuelOctane === 100 ? 10 : -20;
  const tuningHpDelta = Math.round(boostBonus + timingBonus + octaneBonus);

  // Sound toggle handler
  const handleToggleSound = useCallback(() => {
    if (soundEnabled) {
      audioEngine.stop();
      setSoundEnabled(false);
    } else {
      audioEngine.start();
      setSoundEnabled(true);
    }
  }, [soundEnabled]);

  // Throttle rev handlers
  const handleRevStart = useCallback(() => {
    setIsRevving(true);
    if (!soundEnabled) {
      audioEngine.start();
      setSoundEnabled(true);
    }
    audioEngine.setRpm(6600);
  }, [soundEnabled]);

  const handleRevEnd = useCallback(() => {
    setIsRevving(false);
    if (soundEnabled) {
      audioEngine.setRpm(900);
    }
  }, [soundEnabled]);

  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1-Row 3-Zone Top Bar Contract */}
      <GarageHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenConfigure={() => setIsSpecModalOpen(true)}
        onOpenGeminiQr={() => setIsGeminiQrOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'showcase' && (
          <VehicleStage
            vehicle={selectedVehicle}
            allVehicles={VEHICLES}
            onSelectVehicle={setSelectedVehicleId}
            onOpenSpecs={() => setIsSpecModalOpen(true)}
            tuningHpDelta={tuningHpDelta}
            onRevStart={handleRevStart}
            onRevEnd={handleRevEnd}
            isRevving={isRevving}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'dyno' && (
          <DynoChart
            vehicle={selectedVehicle}
            tuning={tuning}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'tuning' && (
          <TuningBench
            vehicle={selectedVehicle}
            tuning={tuning}
            onChangeTuning={setTuning}
            onReset={() => setTuning(DEFAULT_TUNING)}
          />
        )}

        {activeTab === 'blueprints' && <BlueprintGallery />}

        {activeTab === 'validator' && <PayloadValidator />}

        {activeTab === 'cartography' && <CartographyHelper />}

        {activeTab === 'heritage' && <RaceHeritage />}
      </main>

      {/* Spec Sheet & Build Customizer Modal */}
      <SpecSheetModal
        vehicle={selectedVehicle}
        tuning={tuning}
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />

      {/* Gemini Enterprise Portal QR Modal */}
      <GeminiQrModal
        isOpen={isGeminiQrOpen}
        onClose={() => setIsGeminiQrOpen(false)}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-center text-xs text-slate-500 font-mono">
        <div>Desert Racing Garage · Off-Road Endurance Engineering · Mojave Desert Basin</div>
      </footer>
    </div>
  );
};

export default App;
