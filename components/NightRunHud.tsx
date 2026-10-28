import React, { useState, useEffect } from 'react';
import { Vehicle } from '../data/vehicles';

interface NightRunHudProps {
  vehicle: Vehicle;
  soundEnabled: boolean;
  onNavigatePlanetary?: () => void;
}

export type LightingCondition = 'daylight' | 'twilight' | 'midnight';
export type VisionMode = 'standard' | 'nvg' | 'flir';

export const NightRunHud: React.FC<NightRunHudProps> = ({ vehicle, onNavigatePlanetary }) => {
  const [lighting, setLighting] = useState<LightingCondition>('midnight');
  const [visionMode, setVisionMode] = useState<VisionMode>('standard');
  const [planetaryOverlayActive, setPlanetaryOverlayActive] = useState<boolean>(true);
  const [roofBarActive, setRoofBarActive] = useState<boolean>(true);
  const [amberDustPodsActive, setAmberDustPodsActive] = useState<boolean>(true);
  const [ditchLightsActive, setDitchLightsActive] = useState<boolean>(true);
  const [chaseStrobeActive, setChaseStrobeActive] = useState<boolean>(false);
  const [strobeRate, setStrobeRate] = useState<number>(4); // Hz
  const [beamSpread, setBeamSpread] = useState<number>(35); // degrees
  const [lumensIntensity, setLumensIntensity] = useState<number>(85); // %
  const [pitch, setPitch] = useState<number>(-4.2);
  const [roll, setRoll] = useState<number>(3.1);
  const [compassHeading, setCompassHeading] = useState<number>(218);
  const [strobeTick, setStrobeTick] = useState<boolean>(false);
  const [gearSyncAngle, setGearSyncAngle] = useState<number>(0);

  // Micro-rotation for Planetary Gear Sync overlay
  useEffect(() => {
    const timer = setInterval(() => {
      setGearSyncAngle((prev) => (prev + 4) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  // Strobe animation tick
  useEffect(() => {
    if (!chaseStrobeActive) {
      setStrobeTick(false);
      return;
    }
    const interval = setInterval(() => {
      setStrobeTick((prev) => !prev);
    }, 1000 / (strobeRate * 2));
    return () => clearInterval(interval);
  }, [chaseStrobeActive, strobeRate]);

  // Subtle simulated vehicle suspension pitch/roll jitter during night run
  useEffect(() => {
    const timer = setInterval(() => {
      setPitch((prev) => {
        const delta = (Math.random() - 0.5) * 1.2;
        return Number((Math.max(-12, Math.min(8, prev + delta))).toFixed(1));
      });
      setRoll((prev) => {
        const delta = (Math.random() - 0.5) * 1.5;
        return Number((Math.max(-15, Math.min(15, prev + delta))).toFixed(1));
      });
    }, 400);
    return () => clearInterval(timer);
  }, []);

  // Calculate simulated total lumens output
  const calculatedLumens = Math.round(
    ((roofBarActive ? 32000 : 0) +
      (amberDustPodsActive ? 12000 : 0) +
      (ditchLightsActive ? 8500 : 0)) *
      (lumensIntensity / 100)
  );

  return (
    <div className="flex-1 flex flex-col bg-[#070A0F] text-slate-100 overflow-y-auto">
      {/* Top Banner / HUD Status */}
      <div className="bg-[#0B0F17] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="font-['Barlow_Condensed',sans-serif] text-2xl font-black uppercase tracking-wider text-white">
              NIGHT-RUN TELEMETRY HUD & SPOTTER CONSOLE
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-amber-300 font-semibold uppercase">
              {vehicle.name} · #{vehicle.number}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Mojave Desert Night Stage · 45,000+ Lumens High-Speed Silt Penetration System
          </p>
        </div>

        {/* Vision Mode & Planetary Telemetry Switcher */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setPlanetaryOverlayActive(!planetaryOverlayActive)}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              planetaryOverlayActive
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/25'
                : 'text-amber-400/70 hover:text-amber-300'
            }`}
            title="Toggle Epicyclic Planetary Gear Mesh Diagnostics"
          >
            <span className={`w-2 h-2 rounded-full ${planetaryOverlayActive ? 'bg-black animate-pulse' : 'bg-amber-500'}`} />
            <span>PLANETARY SYNC</span>
          </button>

          <div className="w-[1px] h-4 bg-white/20 my-auto" />

          <button
            onClick={() => setVisionMode('standard')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              visionMode === 'standard'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            STANDARD OPTICS
          </button>
          <button
            onClick={() => setVisionMode('nvg')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              visionMode === 'nvg'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            NVG PHOSPHOR (GEN-3)
          </button>
          <button
            onClick={() => setVisionMode('flir')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
              visionMode === 'flir'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            FLIR THERMAL HEAT
          </button>
        </div>
      </div>

      {/* Main Staging Display */}
      <div className="p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Stage (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div
            className={`relative rounded-xl overflow-hidden border transition-colors aspect-video flex items-center justify-center ${
              visionMode === 'nvg'
                ? 'border-emerald-500/60 bg-[#021408]'
                : visionMode === 'flir'
                ? 'border-rose-500/60 bg-[#16050b]'
                : lighting === 'midnight'
                ? 'border-slate-800 bg-[#040608]'
                : lighting === 'twilight'
                ? 'border-amber-900/50 bg-[#150e0d]'
                : 'border-slate-700 bg-[#0f172a]'
            }`}
          >
            {/* Background vehicle render */}
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                visionMode === 'nvg'
                  ? 'filter contrast-150 brightness-110 sepia hue-rotate-[90deg] saturate-[300%]'
                  : visionMode === 'flir'
                  ? 'filter invert contrast-200 hue-rotate-[180deg] saturate-[250%]'
                  : lighting === 'midnight'
                  ? 'filter brightness-[0.35] contrast-125'
                  : lighting === 'twilight'
                  ? 'filter brightness-[0.75] sepia-[0.35] contrast-110'
                  : 'filter brightness-100'
              }`}
            />

            {/* Dynamic Light Beams Overlays */}
            {lighting !== 'daylight' && visionMode === 'standard' && (
              <>
                {/* Roof Light Bar Beam */}
                {roofBarActive && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: (lumensIntensity / 100) * 0.95,
                      background: `radial-gradient(ellipse ${beamSpread * 2.2}% 65% at 50% 32%, rgba(255,255,255,0.7) 0%, rgba(220,235,255,0.35) 45%, transparent 75%)`,
                      mixBlendMode: 'screen',
                    }}
                  />
                )}

                {/* Amber Silt Dust Pods Beam */}
                {amberDustPodsActive && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: (lumensIntensity / 100) * 0.85,
                      background:
                        'radial-gradient(ellipse 90% 50% at 50% 65%, rgba(245,158,11,0.55) 0%, rgba(217,119,6,0.2) 50%, transparent 80%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                )}

                {/* Ditch Lights Lateral Spotters */}
                {ditchLightsActive && (
                  <>
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 18% 48%, rgba(255,250,220,0.5) 0%, transparent 40%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at 82% 48%, rgba(255,250,220,0.5) 0%, transparent 40%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  </>
                )}

                {/* Chase Strobe Indicator */}
                {chaseStrobeActive && strobeTick && (
                  <div
                    className="absolute inset-0 pointer-events-none bg-amber-500/20 mix-blend-overlay transition-opacity"
                    style={{ opacity: 0.7 }}
                  />
                )}
              </>
            )}

            {/* NVG Scanlines & Reticle Overlay */}
            {visionMode === 'nvg' && (
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,30,10,0.8)_95%)] flex flex-col justify-between p-4">
                <div className="flex justify-between font-mono text-[11px] text-emerald-400 font-bold tracking-wider">
                  <span>NVG-OPTICS // GAIN +48dB</span>
                  <span>IR-ILLUM: ACTIVE</span>
                  <span>FOV 40°</span>
                </div>
                {/* NVG Reticle */}
                <div className="self-center flex flex-col items-center gap-1 opacity-75">
                  <div className="w-16 h-16 border border-emerald-400/60 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-300">TARGET LOCKED</span>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-emerald-400 font-bold tracking-wider">
                  <span>BATT: 98%</span>
                  <span>T-PHOSPHOR</span>
                  <span>35°58&apos;41&quot; N · 114°50&apos;04&quot; W</span>
                </div>
              </div>
            )}

            {/* FLIR Thermal Hotspots Overlay */}
            {visionMode === 'flir' && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(20,0,10,0.8)_95%)]">
                <div className="flex justify-between font-mono text-[11px] text-rose-400 font-bold tracking-wider">
                  <span>FLIR THERMAL RADIOMETRY</span>
                  <span>SP-1: 1,150°F (HEADERS)</span>
                  <span>SP-2: 850°F (BRAKES)</span>
                </div>
                {/* Thermal Target Markers */}
                <div className="relative w-full h-full">
                  <div className="absolute top-[42%] left-[48%] -translate-x-1/2 bg-red-600/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-red-300 shadow-md">
                    EXHAUST COLLECTOR: 1,150°F [CRITICAL HEAT]
                  </div>
                  <div className="absolute top-[32%] left-[45%] -translate-x-1/2 bg-amber-500/80 text-black font-mono text-[9px] px-1.5 py-0.5 rounded border border-amber-200">
                    8-71 SUPERCHARGER: 185°F [OPTIMAL]
                  </div>
                  <div className="absolute bottom-[22%] left-[32%] bg-orange-600/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded border border-orange-300">
                    FRONT BRAKE ROTOR: 850°F
                  </div>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-rose-400 font-bold tracking-wider">
                  <span>PALETTE: IRONBOW</span>
                  <span>EMISSIVITY: 0.95</span>
                  <span>AMBIENT: 64°F</span>
                </div>
              </div>
            )}

            {/* Planetary Gear Sync Diagnostic Overlay */}
            {planetaryOverlayActive && (
              <div className="absolute top-3 right-3 w-80 bg-black/90 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/40 font-mono text-xs shadow-2xl z-20 transition-all">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-['Barlow_Condensed',sans-serif] text-sm font-bold uppercase tracking-wider text-amber-400">
                      PLANETARY GEAR SYNC
                    </span>
                  </div>
                  <button
                    onClick={() => setPlanetaryOverlayActive(false)}
                    className="text-slate-400 hover:text-white text-xs px-1"
                    title="Hide Overlay"
                  >
                    ✕
                  </button>
                </div>

                {/* Mini SVG Rotating Epicyclic Reticle & Mesh Frequency */}
                <div className="flex items-center gap-3 bg-black/60 p-2 rounded-lg border border-white/5 mb-2.5">
                  <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Outer Ring */}
                      <circle cx="50" cy="50" r="44" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="3 3" />
                      {/* Orbit Path */}
                      <circle cx="50" cy="50" r="28" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
                      {/* Center Sun */}
                      <g transform={`rotate(${gearSyncAngle}, 50, 50)`}>
                        <circle cx="50" cy="50" r="14" fill="#f59e0b" />
                        <circle cx="50" cy="50" r="6" fill="#0b0f17" />
                      </g>
                      {/* 4 Orbiting Planets */}
                      {[0, 90, 180, 270].map((deg) => {
                        const currentDeg = (gearSyncAngle / 3.33) + deg;
                        const rad = (currentDeg * Math.PI) / 180;
                        const px = 50 + 28 * Math.cos(rad);
                        const py = 50 + 28 * Math.sin(rad);
                        return (
                          <circle
                            key={deg}
                            cx={px}
                            cy={py}
                            r="7"
                            fill="#22d3ee"
                            stroke="#0f172a"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="flex-1 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ratio:</span>
                      <span className="text-amber-400 font-bold">3.33:1 Reduction</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mesh Freq:</span>
                      <span className="text-cyan-400 font-bold">480 Hz GMF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Drift:</span>
                      <span className="text-emerald-400 font-bold">±0.02 Hz (LOCKED)</span>
                    </div>
                  </div>
                </div>

                {/* 4-Planet Torque Distribution */}
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>TORQUE LOAD SPLIT</span>
                    <span className="text-cyan-400 font-bold">ALPHA / BRAVO / CHARLIE / DELTA</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center">
                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-1 rounded text-cyan-300">
                      α: 25.1%
                    </div>
                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-1 rounded text-cyan-300">
                      β: 24.9%
                    </div>
                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-1 rounded text-cyan-300">
                      γ: 25.0%
                    </div>
                    <div className="bg-cyan-950/40 border border-cyan-500/30 p-1 rounded text-cyan-300">
                      δ: 25.0%
                    </div>
                  </div>
                </div>

                {/* Hydraulic & Seal Quick Stats */}
                <div className="flex justify-between text-[11px] pt-1.5 border-t border-white/10 mb-2.5">
                  <div>
                    <span className="text-slate-400">Lube: </span>
                    <span className="text-amber-400 font-bold">66.4 PSI</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Seal: </span>
                    <span className="text-emerald-400 font-bold">94% VITON</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Sump: </span>
                    <span className="text-slate-300 font-bold">196°F</span>
                  </div>
                </div>

                {onNavigatePlanetary && (
                  <button
                    onClick={onNavigatePlanetary}
                    className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Open Planetary Service Console</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            )}

            {/* Standard HUD Overlay Data */}
            <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 font-mono text-xs">
              <div className="text-slate-400 text-[10px]">TOTAL LUMENS OUTPUT</div>
              <div className="text-xl font-bold text-amber-400 tracking-tight">
                {calculatedLumens.toLocaleString()} <span className="text-xs text-slate-300">LM</span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 font-mono text-xs text-right">
              <div className="text-slate-400 text-[10px]">CHOP SPEED / ATTITUDE</div>
              <div className="text-white font-semibold">
                PITCH: <span className={pitch < 0 ? 'text-amber-400' : 'text-emerald-400'}>{pitch}°</span> · ROLL:{' '}
                <span className={Math.abs(roll) > 5 ? 'text-amber-400' : 'text-slate-300'}>{roll}°</span>
              </div>
            </div>
          </div>

          {/* Environmental Time Selector Bar */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono text-xs uppercase text-slate-400 font-semibold tracking-wider">
              Desert Lighting Environment:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLighting('daylight')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-all ${
                  lighting === 'daylight'
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                DAYLIGHT PADDOCK
              </button>
              <button
                onClick={() => setLighting('twilight')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-all ${
                  lighting === 'twilight'
                    ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                TWILIGHT DUST RUN
              </button>
              <button
                onClick={() => setLighting('midnight')}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold cursor-pointer transition-all ${
                  lighting === 'midnight'
                    ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/40'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                MIDNIGHT BLACKOUT
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tactical Spotter Controls & Sensors (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Light Pod Controls Card */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-4">
            <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
              Spotter Lightbank Switchboard
            </h2>

            {/* Switch 1: 50" Roof Light Bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <div className="font-mono text-xs font-bold text-white">50&quot; CURVED ROOF LIGHT BAR</div>
                <div className="font-mono text-[10px] text-slate-400">32,000 LM · 6000K Daylight Hyper-White</div>
              </div>
              <button
                onClick={() => setRoofBarActive(!roofBarActive)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  roofBarActive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    roofBarActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Switch 2: Amber Silt Pods */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <div className="font-mono text-xs font-bold text-amber-400">AMBER SILT DUST PODS (BAJA SPEC)</div>
                <div className="font-mono text-[10px] text-slate-400">12,000 LM · 3000K Silt Bed Penetration</div>
              </div>
              <button
                onClick={() => setAmberDustPodsActive(!amberDustPodsActive)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  amberDustPodsActive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    amberDustPodsActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Switch 3: A-Pillar Ditch Lights */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <div className="font-mono text-xs font-bold text-white">A-PILLAR DITCH PERIPHERAL LIGHTS</div>
                <div className="font-mono text-[10px] text-slate-400">8,500 LM · 45° Outrigger Spread</div>
              </div>
              <button
                onClick={() => setDitchLightsActive(!ditchLightsActive)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  ditchLightsActive ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    ditchLightsActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Switch 4: Rear Chase Strobe */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
              <div>
                <div className="font-mono text-xs font-bold text-blue-400">REAR DUST CHASE STROBE</div>
                <div className="font-mono text-[10px] text-slate-400">Safety Beacon for Zero-Visibility Wake</div>
              </div>
              <button
                onClick={() => setChaseStrobeActive(!chaseStrobeActive)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  chaseStrobeActive ? 'bg-blue-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    chaseStrobeActive ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Beam Spread Angle Slider */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400">PENCIL SPOT / FLOOD SPREAD</span>
                <span className="text-amber-400 font-bold">{beamSpread}° FOV</span>
              </div>
              <input
                type="range"
                min="15"
                max="65"
                value={beamSpread}
                onChange={(e) => setBeamSpread(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>15° (Pencil High-Speed)</span>
                <span>65° (Wide Canyon Flood)</span>
              </div>
            </div>

            {/* Lumens Power Output Slider */}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400">ALTERNATORS POWER LEVEL</span>
                <span className="text-amber-400 font-bold">{lumensIntensity}% (240A DUAL ALT)</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={lumensIntensity}
                onChange={(e) => setLumensIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Heading & Sensor Compass */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 flex flex-col gap-3">
            <h2 className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-white border-b border-white/10 pb-2">
              Telemetry Compass & Terrain Heading
            </h2>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="text-slate-500 text-[10px]">HEADING GYRO</div>
                <div className="text-lg font-bold text-white mt-1">{compassHeading}° SW</div>
                <div className="text-[10px] text-amber-400 mt-0.5">JEAN DRY LAKE BEARING</div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <div className="text-slate-500 text-[10px]">TERRAIN ELEVATION</div>
                <div className="text-lg font-bold text-white mt-1">2,840 FT</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">CAL-NEV-ARI BASIN</div>
              </div>
            </div>

            {/* Active Hazard Monitor */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping mt-1 shrink-0" />
              <div className="text-xs">
                <span className="font-mono font-bold text-amber-400 uppercase">TERRAIN RADAR NOTICE: </span>
                <span className="text-slate-300">
                  Approaching 3-foot whoop series at Mile Marker 44. Ditch lights active for wash verge identification.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
