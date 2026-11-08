import React, { useState } from 'react';

interface HeloHudGaugesProps {
  airspeedKts: number;
  altitudeFt: number;
  turbineEgtC: number;
  rotorRpm: number;
  rangeToFastbackYards: number;
  carTirePsi: number;
  onPlaySquelch?: () => void;
  onBroadcastLog?: (action: string, detail: string) => void;
}

export const HeloHudGauges: React.FC<HeloHudGaugesProps> = ({
  airspeedKts = 142,
  altitudeFt = 2185,
  turbineEgtC = 785,
  rotorRpm = 179,
  rangeToFastbackYards = 85,
  carTirePsi = 16.5,
  onPlaySquelch,
  onBroadcastLog,
}) => {
  const [throttle, setThrottle] = useState<number>(88);
  const [targetLock, setTargetLock] = useState<boolean>(true);
  const [freq, setFreq] = useState<number>(440);
  const [amp, setAmp] = useState<number>(24);
  const [tirePressures, setTirePressures] = useState<{ fl: number; fr: number; rl: number; rr: number }>({
    fl: carTirePsi,
    fr: carTirePsi,
    rl: Number((carTirePsi + 0.3).toFixed(1)),
    rr: Number((carTirePsi + 0.3).toFixed(1)),
  });

  // Calculate dynamic EGT and Torque based on throttle slider
  const liveEgt = Math.round(turbineEgtC * (throttle / 88));
  const liveTorque = Math.min(100, Math.round(throttle * 1.05));
  const liveRpm = Math.round(rotorRpm * (0.85 + (throttle / 100) * 0.15));

  const handleAdjustTire = (corner: 'fl' | 'fr' | 'rl' | 'rr', delta: number) => {
    onPlaySquelch?.();
    setTirePressures((prev) => {
      const updated = Number(Math.max(12, Math.min(32, prev[corner] + delta)).toFixed(1));
      const next = { ...prev, [corner]: updated };
      onBroadcastLog?.(
        'Tire PSI Tune',
        `${corner.toUpperCase()} adjusted to ${updated} PSI Nitrogen for Fastback #13.`
      );
      return next;
    });
  };

  // Generate SVG path for diode oscilloscope
  const generateSinePoints = () => {
    const points: string[] = [];
    const width = 280;
    const height = 70;
    const midY = height / 2;
    for (let x = 0; x <= width; x += 4) {
      const y = midY + Math.sin((x / 20) * (freq / 300)) * amp;
      points.push(`${x},${y.toFixed(1)}`);
    }
    return points.join(' ');
  };

  return (
    <div className="bg-[#0B0F17] border border-cyan-800/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-6 font-mono text-slate-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold">MH-55 Tactical Cockpit HUD &amp; Diode Telemetry</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-bold">FASTBACK #13 AIR-TO-GROUND BUS</span>
          </div>
          <h3 className="text-xl font-bold uppercase text-white font-['Barlow_Condensed',sans-serif] tracking-wider mt-0.5">
            Real-Time Turboshaft, Laser Ranging &amp; Chassis Nitrogen Sensors
          </h3>
        </div>

        {/* Throttle Control Slider */}
        <div className="flex items-center gap-3 bg-[#080C13] border border-white/10 rounded-xl px-4 py-2">
          <div className="text-[11px] text-slate-400 uppercase">
            Turbine Throttle: <strong className="text-amber-400">{throttle}%</strong>
          </div>
          <input
            type="range"
            min="40"
            max="105"
            value={throttle}
            onChange={(e) => setThrottle(Number(e.target.value))}
            className="w-24 accent-amber-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Primary SVG Circular Instrument Dials Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Dial 1: Turbine EGT (°C) */}
        <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-between relative group">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 text-center font-bold">
            Twin T64 Turbine EGT
          </div>
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * Math.min(liveEgt, 950)) / 950}
                className={liveEgt > 820 ? 'text-red-500' : liveEgt > 720 ? 'text-amber-400' : 'text-cyan-400'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-white">{liveEgt}°</span>
              <span className="text-[9px] text-slate-400 uppercase font-sans">Celsius</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${liveEgt > 820 ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>Redline: 850°C</span>
          </div>
        </div>

        {/* Dial 2: Shaft Torque % */}
        <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-between relative group">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 text-center font-bold">
            Combined Shaft Torque
          </div>
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * liveTorque) / 100}
                className={liveTorque > 95 ? 'text-amber-400' : 'text-emerald-400'}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-white">{liveTorque}%</span>
              <span className="text-[9px] text-slate-400 uppercase font-sans">8,760 SHP</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Dual Mast Epicyclic</span>
          </div>
        </div>

        {/* Dial 3: Rotor Mast RPM */}
        <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-between relative group">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 text-center font-bold">
            Main Rotor Mast RPM
          </div>
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * liveRpm) / 200}
                className="text-cyan-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-white">{liveRpm}</span>
              <span className="text-[9px] text-slate-400 uppercase font-sans">RPM (3.33:1)</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sync: 179 RPM Nom.</span>
          </div>
        </div>

        {/* Dial 4: Airspeed & Radar Alt */}
        <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-between relative group">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 text-center font-bold">
            Forward Airspeed &amp; AGL
          </div>
          <div className="relative w-28 h-28 my-1 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * Math.min(airspeedKts, 180)) / 180}
                className="text-amber-400"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-bold font-mono text-white">{airspeedKts}</span>
              <span className="text-[9px] text-slate-400 uppercase font-sans">Knots Ground</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>ALT: <strong className="text-white">{altitudeFt} ft</strong></span>
          </div>
        </div>
      </div>

      {/* Two Tactical Deep Panels: Laser Rangefinder Reticle & Fastback #13 4-Corner Nitrogen PSI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Panel A: Laser Rangefinder to Fastback #13 */}
        <div className="lg:col-span-6 bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${targetLock ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
              <span className="text-xs uppercase font-bold text-amber-400">
                Forward Laser Rangefinder &amp; FLIR Pod
              </span>
            </div>
            <button
              onClick={() => {
                setTargetLock(!targetLock);
                onPlaySquelch?.();
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300"
            >
              {targetLock ? 'LOCK ENGAGED' : 'ACQUIRING...'}
            </button>
          </div>

          {/* Tactical Crosshair Canvas */}
          <div className="relative aspect-[16/7] w-full bg-[#050810] border border-cyan-500/20 rounded-lg flex items-center justify-center overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0e2238_1px,transparent_1px),linear-gradient(to_bottom,#0e2238_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

            {/* Target Reticle */}
            <div className="relative z-10 w-24 h-24 border border-cyan-400/50 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-dashed border-amber-400 rounded-sm flex items-center justify-center animate-pulse">
                <span className="text-[9px] font-bold text-amber-300 font-mono">#13</span>
              </div>
              <div className="absolute -top-3 text-[9px] font-mono text-cyan-300">000° REL</div>
              <div className="absolute -bottom-3 text-[9px] font-mono text-emerald-400">W.O.T. TRACK</div>
            </div>

            {/* Tactical Target Readout Overlays */}
            <div className="absolute top-2 left-2 text-[10px] text-slate-400 space-y-0.5">
              <div>TARGET: <strong className="text-white">1970 FASTBACK GTA #13</strong></div>
              <div>RADAR BEARING: <strong className="text-cyan-300">084° ENE</strong></div>
              <div>GROUND SPEED: <strong className="text-white">128 MPH DUST CORRIDOR</strong></div>
            </div>

            <div className="absolute bottom-2 right-2 text-right text-[10px] text-slate-400 space-y-0.5">
              <div className="text-amber-400 font-bold text-sm">
                RANGE: {rangeToFastbackYards} YDS
              </div>
              <div>AZIMUTH: +0.4° ELEV</div>
              <div className="text-emerald-400 font-bold">80ms MAGNETO SYNC: ARMED</div>
            </div>
          </div>
        </div>

        {/* Panel B: Fastback #13 4-Corner Nitrogen Tire Pressure Tuning */}
        <div className="lg:col-span-6 bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs uppercase font-bold text-cyan-400">
                Fastback #13 4-Corner Cooper Discoverer 37" Tire PSI
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Nitrogen Reg: 150 PSI</span>
          </div>

          {/* Top-down vehicle chassis tire layout */}
          <div className="grid grid-cols-2 gap-3">
            {/* Front Left */}
            <div className="bg-[#0B0F17] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">FRONT LEFT (FL)</span>
                <span className="text-lg font-bold text-white font-mono">{tirePressures.fl} PSI</span>
                <span className="text-[9px] text-emerald-400 block">Beadlock: 145 lb-ft</span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAdjustTire('fl', 0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[11px] font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => handleAdjustTire('fl', -0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 rounded text-[11px] font-bold"
                >
                  -
                </button>
              </div>
            </div>

            {/* Front Right */}
            <div className="bg-[#0B0F17] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">FRONT RIGHT (FR)</span>
                <span className="text-lg font-bold text-white font-mono">{tirePressures.fr} PSI</span>
                <span className="text-[9px] text-emerald-400 block">Beadlock: 145 lb-ft</span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAdjustTire('fr', 0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[11px] font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => handleAdjustTire('fr', -0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 rounded text-[11px] font-bold"
                >
                  -
                </button>
              </div>
            </div>

            {/* Rear Left */}
            <div className="bg-[#0B0F17] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">REAR LEFT (RL)</span>
                <span className="text-lg font-bold text-white font-mono">{tirePressures.rl} PSI</span>
                <span className="text-[9px] text-emerald-400 block">Winters Diff: 195°F</span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAdjustTire('rl', 0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[11px] font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => handleAdjustTire('rl', -0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 rounded text-[11px] font-bold"
                >
                  -
                </button>
              </div>
            </div>

            {/* Rear Right */}
            <div className="bg-[#0B0F17] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">REAR RIGHT (RR)</span>
                <span className="text-lg font-bold text-white font-mono">{tirePressures.rr} PSI</span>
                <span className="text-[9px] text-emerald-400 block">Winters Diff: 195°F</span>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleAdjustTire('rr', 0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-cyan-300 rounded text-[11px] font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => handleAdjustTire('rr', -0.5)}
                  className="px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-amber-300 rounded text-[11px] font-bold"
                >
                  -
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Holographic Diode Matrix & Waveform Bus (Blossom's Diagnostic Console) */}
      <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase text-white font-mono">
              Blossom Holographic Diode Bus &amp; Haptic Glove Loop
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-time logic pulse oscilloscope verifying circuit continuity, ignition kill relay latency (80ms), and 12-channel haptic telemetry.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs">
            <span className="text-slate-400">Freq:</span>
            <input
              type="range"
              min="100"
              max="800"
              value={freq}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="accent-cyan-400 w-28 cursor-pointer"
            />
            <span className="text-cyan-300 font-bold">{freq} Hz</span>
          </div>
        </div>

        {/* Dynamic Waveform SVG Display */}
        <div className="w-full md:w-2/3 h-20 bg-[#050810] border border-cyan-500/30 rounded-lg flex items-center justify-center p-2 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 280 70">
            <line x1="0" y1="35" x2="280" y2="35" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <polyline
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              points={generateSinePoints()}
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute top-1.5 right-2 text-[9px] text-cyan-400 font-mono">
            LOGIC SYNC: 100% OK
          </div>
          <div className="absolute bottom-1.5 left-2 text-[9px] text-emerald-400 font-mono">
            HAPTIC DIODE MATRIX: LOCKED
          </div>
        </div>
      </div>
    </div>
  );
};
