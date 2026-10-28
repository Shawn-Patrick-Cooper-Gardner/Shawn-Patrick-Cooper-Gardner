import React, { useState, useEffect, useRef } from 'react';
import {
  audioEngine,
  AudioTelemetry,
  SOUND_PROFILES,
  SoundProfileId,
} from '../services/AudioEngine';

interface EngineSoundConsoleProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  compact?: boolean;
}

export const EngineSoundConsole: React.FC<EngineSoundConsoleProps> = ({
  soundEnabled,
  onToggleSound,
  compact = false,
}) => {
  const [telemetry, setTelemetry] = useState<AudioTelemetry>({
    rpm: 920,
    boostPsi: 0.5,
    blowerFreqHz: 662,
    throttlePercent: 0,
    isCranking: false,
    isTwoStep: false,
    isRunning: false,
    profileId: 'chain-blown-400-trick',
  });

  const [selectedProfile, setSelectedProfile] = useState<SoundProfileId>('chain-blown-400-trick');
  const [isHoldingThrottle, setIsHoldingThrottle] = useState<boolean>(false);
  const [isHoldingTwoStep, setIsHoldingTwoStep] = useState<boolean>(false);
  const [recentPopTriggered, setRecentPopTriggered] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to real-time audio telemetry
  useEffect(() => {
    const unsubscribe = audioEngine.onTelemetry((t) => {
      setTelemetry(t);
    });
    return unsubscribe;
  }, []);

  // Sync profile selection
  const handleSelectProfile = (id: SoundProfileId) => {
    setSelectedProfile(id);
    audioEngine.setProfile(id);
  };

  // Ignition Starter Crank Handler
  const handleIgnitionStart = async () => {
    if (telemetry.isRunning) {
      audioEngine.stop();
      if (soundEnabled) onToggleSound();
    } else {
      if (!soundEnabled) onToggleSound();
      await audioEngine.startWithCrank();
    }
  };

  // Throttle Rev Handlers
  const startRev = () => {
    setIsHoldingThrottle(true);
    if (!telemetry.isRunning) {
      audioEngine.start();
      if (!soundEnabled) onToggleSound();
    }
    audioEngine.setRpm(6800);
  };

  const endRev = () => {
    setIsHoldingThrottle(false);
    if (telemetry.isRunning) {
      audioEngine.setRpm(audioEngine.getActiveProfile().idleRpm);
    }
  };

  // Throttle Blip
  const handleBlip = () => {
    if (!soundEnabled) onToggleSound();
    audioEngine.throttleBlip();
    setRecentPopTriggered(true);
    setTimeout(() => setRecentPopTriggered(false), 400);
  };

  // Two-step Launch Control
  const startTwoStep = () => {
    setIsHoldingTwoStep(true);
    if (!soundEnabled) onToggleSound();
    audioEngine.setTwoStep(true);
  };

  const endTwoStep = () => {
    setIsHoldingTwoStep(false);
    audioEngine.setTwoStep(false);
    setRecentPopTriggered(true);
    setTimeout(() => setRecentPopTriggered(false), 600);
  };

  // Manual Backfire Crackle
  const handleBackfire = () => {
    audioEngine.playBackfirePop(1.0);
    setRecentPopTriggered(true);
    setTimeout(() => setRecentPopTriggered(false), 300);
  };

  // Live Canvas Audio Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!telemetry.isRunning) {
        // Flatline idle wave
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      // Draw real cylinder firing pulses + blower whine waveform
      const currentRpm = telemetry.rpm;
      const firingFreq = (currentRpm / 60) * 4;
      const boost = telemetry.boostPsi;

      phase += (firingFreq / 60) * 0.12;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = telemetry.isTwoStep
        ? '#ef4444'
        : recentPopTriggered
        ? '#f97316'
        : boost > 10
        ? '#fbbf24'
        : '#eab308';

      const amplitude = Math.min(height * 0.42, 12 + (currentRpm / 7000) * 26);

      for (let x = 0; x < width; x++) {
        const normX = x / width;
        // Asymmetric crossplane V8 pulse
        const cylinderPulse =
          Math.sin(normX * Math.PI * 8 + phase) * 0.6 +
          Math.sin(normX * Math.PI * 16 + phase * 1.5) * 0.25;

        // 8-71 Roots blower high-frequency whine ripple
        const blowerRipple = Math.sin(normX * Math.PI * 64 + phase * 4) * (0.15 + boost * 0.015);

        // Cam lope modulation ripple
        const lope = Math.sin(phase * 0.4) * (currentRpm < 1500 ? 0.35 : 0.05);

        const y = height / 2 + (cylinderPulse + blowerRipple + lope) * amplitude;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [telemetry.isRunning, telemetry.rpm, telemetry.boostPsi, telemetry.isTwoStep, recentPopTriggered]);

  const tachPercent = Math.min(100, Math.max(0, (telemetry.rpm / 8000) * 100));
  const isRedline = telemetry.rpm >= 6600;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md border border-amber-500/30 rounded-lg p-2.5">
        <button
          onClick={handleIgnitionStart}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1.5 ${
            telemetry.isRunning
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${telemetry.isRunning ? 'bg-black animate-pulse' : 'bg-red-500'}`} />
          {telemetry.isCranking ? 'Cranking...' : telemetry.isRunning ? 'V8 Loping' : 'Start 400cu'}
        </button>

        <button
          onMouseDown={startRev}
          onMouseUp={endRev}
          onMouseLeave={endRev}
          onTouchStart={startRev}
          onTouchEnd={endRev}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded transition-all cursor-pointer ${
            isHoldingThrottle ? 'bg-red-600 text-white' : 'bg-white/5 hover:bg-white/10 text-amber-300'
          }`}
        >
          {isHoldingThrottle ? 'W.O.T.!' : 'Rev Engine'}
        </button>

        <div className="flex items-center gap-2 font-mono text-xs tabular-nums text-slate-300">
          <span className="text-amber-400 font-bold">{telemetry.rpm} RPM</span>
          <span className="text-slate-500">·</span>
          <span>{telemetry.boostPsi} PSI Boost</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#101520] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>C.O.R.E. ACOUSTIC DYNAMICS · LAYERED ASSET SOUNDBOARD</span>
          </div>
          <h2 className="font-['Barlow_Condensed',sans-serif] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mt-0.5">
            Chain-Blown 400cu Trick-Fueled V8
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Layered high-fidelity sample assets: Starter crank & ignition catch flare, cam idle lope with Roots surge, 7000 RPM high-boost combustion roar, and overrun backfire pops.
          </p>
        </div>

        {/* Master Ignition Push-to-Start Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleIgnitionStart}
            className={`px-5 py-3 rounded-xl font-['Barlow_Condensed',sans-serif] text-sm uppercase font-extrabold tracking-wider transition-all shadow-xl cursor-pointer flex items-center gap-2.5 border select-none ${
              telemetry.isCranking
                ? 'bg-amber-500 text-black border-amber-400 animate-pulse'
                : telemetry.isRunning
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-500/30'
                : 'bg-red-950/80 hover:bg-red-900 text-red-200 border-red-700/60'
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full ${
                telemetry.isCranking
                  ? 'bg-black animate-ping'
                  : telemetry.isRunning
                  ? 'bg-black'
                  : 'bg-red-500'
              }`}
            />
            <span>
              {telemetry.isCranking
                ? 'Cranking Starter...'
                : telemetry.isRunning
                ? 'Ignition: ACTIVE (Cut Engine)'
                : 'Ignition: Push To Start'}
            </span>
          </button>
        </div>
      </div>

      {/* Profile Selector Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono uppercase text-slate-400 mr-1">Acoustic Calibration:</span>
        {Object.values(SOUND_PROFILES).map((p) => {
          const isSelected = selectedProfile === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectProfile(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                  : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:bg-white/5'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Main Gauges & Waveform Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Tachometer & Boost Telemetry Card */}
        <div className="md:col-span-4 bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>CRAWLER TACHOMETER</span>
            <span className={isRedline ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'}>
              REDLINE 7400
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div>
              <div className="text-4xl font-extrabold font-mono tabular-nums text-white flex items-baseline gap-1">
                {telemetry.rpm}
                <span className="text-xs font-normal text-slate-400">RPM</span>
              </div>
              <div className="text-[11px] font-mono text-amber-400">
                {telemetry.rpm < 1200 ? 'Roots Idle Surge Hunting' : 'Full Cylinder Pressure'}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-400 flex items-baseline justify-end gap-1">
                {telemetry.boostPsi}
                <span className="text-xs font-normal text-slate-400">PSI</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">8-71 Roots Boost</div>
            </div>
          </div>

          {/* RPM Bar Meter */}
          <div className="space-y-1">
            <div className="w-full bg-black/80 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  isRedline
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : telemetry.rpm > 4500
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${tachPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-0.5">
              <span>0</span>
              <span>2000</span>
              <span>4000</span>
              <span>6000</span>
              <span className="text-red-400">8000</span>
            </div>
          </div>
        </div>

        {/* Live Audio Oscilloscope Canvas */}
        <div className="md:col-span-8 bg-black/80 border border-white/10 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 z-10">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${telemetry.isRunning ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span>COMBUSTION HARMONICS & 8-71 COG MESH SCOPE</span>
            </span>
            <span className="text-amber-400 font-bold tabular-nums">
              Blower Whine: {telemetry.blowerFreqHz} Hz
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={640}
            height={110}
            className="w-full h-24 rounded bg-black/90 border border-white/5"
          />

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 z-10">
            <span>Primary Exhaust Bark: 160 Hz (32" Equal-Length Runners)</span>
            <span>Fuel: Trick 110 Leaded (34° Magneto Advance)</span>
          </div>
        </div>
      </div>

      {/* Interactive Soundboard Control Triggers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Hold for W.O.T. Throttle Rev */}
        <button
          onMouseDown={startRev}
          onMouseUp={endRev}
          onMouseLeave={endRev}
          onTouchStart={startRev}
          onTouchEnd={endRev}
          className={`p-4 rounded-xl font-['Barlow_Condensed',sans-serif] text-sm uppercase font-bold tracking-wider transition-all border select-none cursor-pointer flex flex-col items-center justify-center text-center gap-1 shadow-lg ${
            isHoldingThrottle
              ? 'bg-red-600 text-white border-red-400 scale-95 shadow-red-600/50'
              : 'bg-black/60 hover:bg-black/90 text-amber-300 border-amber-500/30'
          }`}
        >
          <span className="text-xs font-mono text-slate-400">HOLD PEDAL</span>
          <span className="text-base font-extrabold">W.O.T. Full Throttle</span>
          <span className="text-[10px] font-mono text-amber-400">Screaming Blower Whine</span>
        </button>

        {/* Quick Throttle Blip */}
        <button
          onClick={handleBlip}
          className="p-4 rounded-xl font-['Barlow_Condensed',sans-serif] text-sm uppercase font-bold tracking-wider transition-all border select-none cursor-pointer flex flex-col items-center justify-center text-center gap-1 bg-black/60 hover:bg-black/90 text-white border-white/10 hover:border-amber-500/40 shadow-lg active:scale-95"
        >
          <span className="text-xs font-mono text-slate-400">TAP TRIGGER</span>
          <span className="text-base font-extrabold text-amber-400">Throttle Blip (Braap!)</span>
          <span className="text-[10px] font-mono text-slate-400">Instant Off-Idle Flare</span>
        </button>

        {/* Hold Two-Step Launch Limiter */}
        <button
          onMouseDown={startTwoStep}
          onMouseUp={endTwoStep}
          onMouseLeave={endTwoStep}
          onTouchStart={startTwoStep}
          onTouchEnd={endTwoStep}
          className={`p-4 rounded-xl font-['Barlow_Condensed',sans-serif] text-sm uppercase font-bold tracking-wider transition-all border select-none cursor-pointer flex flex-col items-center justify-center text-center gap-1 shadow-lg ${
            isHoldingTwoStep
              ? 'bg-amber-500 text-black border-amber-300 scale-95 shadow-amber-500/50'
              : 'bg-black/60 hover:bg-black/90 text-white border-white/10 hover:border-amber-500/40'
          }`}
        >
          <span className="text-xs font-mono text-slate-400">HOLD TRANSBRAKE</span>
          <span className="text-base font-extrabold text-amber-300">2-Step Limiter (Bap-Bap!)</span>
          <span className="text-[10px] font-mono text-slate-400">Ignition Cut @ 4600 RPM</span>
        </button>

        {/* Exhaust Backfire Pop / Bang */}
        <button
          onClick={handleBackfire}
          className={`p-4 rounded-xl font-['Barlow_Condensed',sans-serif] text-sm uppercase font-bold tracking-wider transition-all border select-none cursor-pointer flex flex-col items-center justify-center text-center gap-1 shadow-lg active:scale-95 ${
            recentPopTriggered
              ? 'bg-orange-600 text-white border-orange-400'
              : 'bg-black/60 hover:bg-black/90 text-white border-white/10 hover:border-amber-500/40'
          }`}
        >
          <span className="text-xs font-mono text-slate-400">INSTANT POP</span>
          <span className="text-base font-extrabold text-orange-400">Overrun Crackle / Bang</span>
          <span className="text-[10px] font-mono text-slate-400">Trick Fuel Exhaust Detonation</span>
        </button>
      </div>
    </div>
  );
};
