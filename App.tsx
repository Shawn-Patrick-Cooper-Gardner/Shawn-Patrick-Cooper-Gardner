import React, { useState, useEffect, useCallback } from 'react';
import { VEHICLES, Vehicle } from './data/vehicles';
import { GarageHeader, GarageTab } from './components/GarageHeader';
import { VehicleStage } from './components/VehicleStage';
import { TuningBench, TuningConfig, DEFAULT_TUNING } from './components/TuningBench';
import { DynoChart } from './components/DynoChart';
import { BlueprintGallery } from './components/BlueprintGallery';
import { NightRunHud } from './components/NightRunHud';
import { PitTelemetryLog } from './components/PitTelemetryLog';
import { PayloadValidator } from './components/PayloadValidator';
import { BankSyncProvenanceSection } from './components/BankSyncProvenanceSection';
import { CartographyHelper } from './components/CartographyHelper';
import { RaceHeritage } from './components/RaceHeritage';
import { ProprietorshipPortal } from './components/ProprietorshipPortal';
import { PlanetaryMaintenance } from './components/PlanetaryMaintenance';
import { PartsInvoiceSection } from './components/PartsInvoiceSection';
import { SpecSheetModal } from './components/SpecSheetModal';
import { GeminiQrModal } from './components/GeminiQrModal';
import { PayPalCheckoutModal, CheckoutCatalogItem } from './components/PayPalCheckoutModal';
import { audioEngine } from './services/AudioEngine';
import { loadPayPalSdk } from './services/paypalSdkService';
import { usePayPalOrder } from './hooks/usePayPalOrder';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GarageTab>('showcase');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(VEHICLES[0].id);
  const [tuning, setTuning] = useState<TuningConfig>(DEFAULT_TUNING);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);
  const [isGeminiQrOpen, setIsGeminiQrOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isRevving, setIsRevving] = useState<boolean>(false);

  // Default active checkout catalog item
  const [checkoutItem, setCheckoutItem] = useState<CheckoutCatalogItem>({
    sku: '13ADC-GBX-333K',
    name: 'C.O.R.E. 3.33:1 Epicyclic Planetary Overhaul Kit',
    price: 1850.0,
    description: 'Complete severe-duty epicyclic planetary overhaul kit: 24T Sun pinion, 4x 16T Cryo planets, needle bearings, carrier pins & high-temp Viton seals.',
    leadTime: 'Immediate Paddock Dispatch',
    category: 'PHYSICAL_GOODS',
  });

  // Initialize official PayPal JS SDK in App
  useEffect(() => {
    loadPayPalSdk().catch((err) => {
      console.warn('PayPal JS SDK initialization note:', err.message);
    });
  }, []);

  // Secure order state machine logic managed via usePayPalOrder hook
  const {
    order: appOrder,
    status: appOrderStatus,
    isLoading: isOrderLoading,
    isCheckingServer,
    error: orderError,
    lastServerCheck,
    createOrder,
    approveOrder,
    captureOrder,
    failOrder,
    checkServerStatus,
    resetOrder,
  } = usePayPalOrder({
    onStateChange: (newState, prevState) => {
      console.info(`[EXCALIBUR ORDER STATE MACHINE]: ${prevState} -> ${newState}`);
    },
  });

  // Handler to launch checkout modal with specific or default catalog item
  const handleOpenCheckout = useCallback((itemToCheckout?: CheckoutCatalogItem) => {
    if (itemToCheckout) {
      setCheckoutItem(itemToCheckout);
    }
    setIsCheckoutOpen(true);
  }, []);

  const selectedVehicle: Vehicle =
    VEHICLES.find((v) => v.id === selectedVehicleId) || VEHICLES[0];

  // Calculate horsepower delta from tuning
  const boostBonus = (tuning.boostPsi - 12) * 22;
  const timingBonus = (tuning.timingAdvanceDeg - 34) * 6;
  const octaneBonus = tuning.raceFuelOctane === 110 ? 30 : tuning.raceFuelOctane === 100 ? 10 : -20;
  const tuningHpDelta = Math.round(boostBonus + timingBonus + octaneBonus);

  // Sound toggle handler with authentic starter crank & ignition catch flare
  const handleToggleSound = useCallback(() => {
    if (soundEnabled) {
      audioEngine.stop();
      setSoundEnabled(false);
    } else {
      audioEngine.startWithCrank();
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
    audioEngine.setRpm(6800);
  }, [soundEnabled]);

  const handleRevEnd = useCallback(() => {
    setIsRevving(false);
    if (soundEnabled) {
      audioEngine.setRpm(audioEngine.getActiveProfile().idleRpm);
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
        onOpenCheckout={() => handleOpenCheckout()}
        orderStatus={appOrderStatus}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Mobile/Tablet Quick-Nav Strip */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-[#080C13] border-b border-white/5 scrollbar-none text-xs font-mono">
        <button
          onClick={() => setActiveTab('showcase')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'showcase' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Showcase
        </button>
        <button
          onClick={() => setActiveTab('dyno')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'dyno' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Dyno
        </button>
        <button
          onClick={() => setActiveTab('tuning')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'tuning' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Tuning
        </button>
        <button
          onClick={() => setActiveTab('blueprints')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'blueprints' ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Drafting Board
        </button>
        <button
          onClick={() => setActiveTab('planetary')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'planetary' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Planetary Gearbox
        </button>
        <button
          onClick={() => setActiveTab('nighthud')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'nighthud' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Night HUD
        </button>
        <button
          onClick={() => setActiveTab('invoicing')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'invoicing' ? 'bg-emerald-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Parts & Tow Invoicing
        </button>
        <button
          onClick={() => setActiveTab('pittelemetry')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'pittelemetry' ? 'bg-emerald-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Pit Comms
        </button>
        <button
          onClick={() => setActiveTab('validator')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'validator' ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Validator
        </button>
        <button
          onClick={() => setActiveTab('banksync')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'banksync' ? 'bg-cyan-400 text-black font-bold' : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/30'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>BankSync & CI</span>
        </button>
        <button
          onClick={() => setActiveTab('cartography')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'cartography' ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          GIS & Map
        </button>
        <button
          onClick={() => setActiveTab('heritage')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
            activeTab === 'heritage' ? 'bg-amber-400 text-black font-bold' : 'text-slate-400 bg-white/5'
          }`}
        >
          Heritage
        </button>
        <button
          onClick={() => setActiveTab('proprietorship')}
          className={`px-3 py-1 rounded whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'proprietorship' ? 'bg-amber-400 text-black font-bold' : 'text-amber-300 bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Proprietorship</span>
        </button>
      </div>

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
            onToggleSound={handleToggleSound}
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

        {activeTab === 'planetary' && <PlanetaryMaintenance />}

        {activeTab === 'nighthud' && (
          <NightRunHud
            vehicle={selectedVehicle}
            soundEnabled={soundEnabled}
            onNavigatePlanetary={() => setActiveTab('planetary')}
          />
        )}

        {activeTab === 'invoicing' && <PartsInvoiceSection />}

        {activeTab === 'pittelemetry' && (
          <PitTelemetryLog vehicle={selectedVehicle} soundEnabled={soundEnabled} />
        )}

        {activeTab === 'validator' && <PayloadValidator />}
        {activeTab === 'banksync' && <BankSyncProvenanceSection />}

        {activeTab === 'cartography' && <CartographyHelper />}

        {activeTab === 'heritage' && <RaceHeritage />}

        {activeTab === 'proprietorship' && <ProprietorshipPortal />}
      </main>

      {/* Spec Sheet & Build Customizer Modal */}
      <SpecSheetModal
        vehicle={selectedVehicle}
        tuning={tuning}
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        onCommissionBuild={(buildItem) => {
          setIsSpecModalOpen(false);
          handleOpenCheckout(buildItem);
        }}
      />

      {/* Gemini Enterprise Portal QR Modal */}
      <GeminiQrModal
        isOpen={isGeminiQrOpen}
        onClose={() => setIsGeminiQrOpen(false)}
      />

      {/* Official PayPal JS SDK Secure Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        item={checkoutItem}
        order={appOrder}
        status={appOrderStatus}
        isLoading={isOrderLoading}
        isCheckingServer={isCheckingServer}
        error={orderError}
        lastServerCheck={lastServerCheck}
        createOrder={createOrder}
        approveOrder={approveOrder}
        captureOrder={captureOrder}
        failOrder={failOrder}
        checkServerStatus={checkServerStatus}
        resetOrder={resetOrder}
      />

      {/* Private Build & Proprietorship Footer */}
      <footer className="border-t border-white/5 py-6 px-6 text-xs text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between gap-3 bg-[#080C13]">
        <div className="flex flex-wrap items-center gap-2 text-center md:text-left">
          <span className="text-amber-400 font-bold uppercase">13 Aerospace Defense Company</span>
          <span className="text-slate-600">·</span>
          <span>Shawn Patrick Cooper Gardner (Sole Proprietor)</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400">NAICS 541715 R&D</span>
          <span className="text-slate-600">·</span>
          <span>ATO PEC SL USA 00711617</span>
        </div>
        <div className="text-slate-400 text-center md:text-right">
          Super Project EXCALIBUR · Community Defense Futures & C.O.R.E. Paddock
        </div>
      </footer>
    </div>
  );
};

export default App;
