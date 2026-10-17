import React from 'react';
import { Vehicle } from '../data/vehicles';

export interface TuningConfig {
  boostPsi: number; // 6 to 18 PSI
  airFuelRatio: number; // 11.2 to 13.6
  timingAdvanceDeg: number; // 28 to 38 deg
  tirePsi: number; // 14 to 32 PSI
  raceFuelOctane: 91 | 100 | 110;
}

export const DEFAULT_TUNING: TuningConfig = {
  boostPsi: 12,
  airFuelRatio: 12.5,
  timingAdvanceDeg: 34,
  tirePsi: 18,
  raceFuelOctane: 110,
};

interface TuningBenchProps {
  vehicle: Vehicle;
  tuning: TuningConfig;
  onChangeTuning: (newTuning: TuningConfig) => void;
  onReset: () => void;
}

export const TuningBench: React.FC<TuningBenchProps> = ({
  vehicle,
  tuning,
  onChangeTuning,
  onReset,
}) => {
  // Mechanical horsepower delta calculation
  // Base is tuned at 12 PSI, 12.5 AFR, 34 deg timing
  const boostDelta = (tuning.boostPsi - 12) * 22; // ~22 hp per PSI on big block
  const afrEfficiency = 1 - Math.abs(tuning.airFuelRatio - 12.4) * 0.08;
  const timingDelta = (tuning.timingAdvanceDeg - 34) * 6;
  const octaneBonus = tuning.raceFuelOctane === 110 ? 30 : tuning.raceFuelOctane === 100 ? 10 : -20;

  const totalHpDelta = Math.round(boostDelta + timingDelta + octaneBonus + (afrEfficiency - 1) * 100);
  const currentHp = Math.max(450, vehicle.baseHp + totalHpDelta);
  const currentTorque = Math.max(400, vehicle.baseTorque + Math.round(totalHpDelta * 0.92));

  // Secondary metrics
  const estimated0to60 = Math.max(3.1, Number((4.6 - (currentHp - 600) * 0.0035).toFixed(2)));
  const topSpeedMph = Math.round(115 + (currentHp / 10));
  const maxClimbAngleDeg = Math.min(54, Math.round(38 + (currentTorque / 100) + (25 - tuning.tirePsi) * 0.3));

  const update = <K extends keyof TuningConfig>(key: K, val: TuningConfig[K]) => {
    onChangeTuning({ ...tuning, [key]: val });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            Mechanical Workbench · Calibrated Parameters
          </div>
          <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Performance Tuning Rack
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mt-1">
            Tune blower boost, carburetor fuel curve, and ignition advance to calibrate powertrain output for desert endurance racing.
          </p>
        </div>

        <button
          onClick={onReset}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
        >
          Reset Baseline
        </button>
      </div>

      {/* Grid: Tuning Sliders (Left) & Realtime Telemetry Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6 bg-[#121824] border border-white/10 rounded-xl p-6">
          {/* Blower Boost Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-white uppercase tracking-wider">
                Roots Blower Supercharger Boost
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {tuning.boostPsi} PSI
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="18"
              step="0.5"
              value={tuning.boostPsi}
              onChange={(e) => update('boostPsi', parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-black/40 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>6 PSI (Mild Endurance)</span>
              <span>12 PSI (Race Default)</span>
              <span>18 PSI (Full Comp)</span>
            </div>
          </div>

          {/* Carburetor Air-Fuel Ratio */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-white uppercase tracking-wider">
                Holley Dual Carb Air-Fuel Ratio (AFR)
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {tuning.airFuelRatio.toFixed(1)}:1
              </span>
            </div>
            <input
              type="range"
              min="11.2"
              max="13.6"
              step="0.1"
              value={tuning.airFuelRatio}
              onChange={(e) => update('airFuelRatio', parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-black/40 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>11.2:1 (Rich / Cylinder Cooling)</span>
              <span>12.5:1 (Peak Power)</span>
              <span>13.6:1 (Lean)</span>
            </div>
          </div>

          {/* Magneto Timing Advance */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-white uppercase tracking-wider">
                Mallory Magneto Timing Advance
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {tuning.timingAdvanceDeg}° BTC
              </span>
            </div>
            <input
              type="range"
              min="28"
              max="38"
              step="1"
              value={tuning.timingAdvanceDeg}
              onChange={(e) => update('timingAdvanceDeg', parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-black/40 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>28° (Safe Retard)</span>
              <span>34° (Optimal)</span>
              <span>38° (Aggressive Advance)</span>
            </div>
          </div>

          {/* Tire Pressure */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold text-white uppercase tracking-wider">
                Off-Road Beadlock Tire Pressure
              </span>
              <span className="font-mono text-amber-400 font-bold tabular-nums">
                {tuning.tirePsi} PSI
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="32"
              step="1"
              value={tuning.tirePsi}
              onChange={(e) => update('tirePsi', parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-black/40 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>14 PSI (Deep Silt / Dunes)</span>
              <span>18 PSI (Mixed Wash)</span>
              <span>32 PSI (Hardpack Lake Bed)</span>
            </div>
          </div>

          {/* Fuel Octane Grade Selector */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
            <span className="font-bold text-white uppercase tracking-wider text-sm">
              Fuel Octane Blend
            </span>
            <div className="grid grid-cols-3 gap-3">
              {([91, 100, 110] as const).map((octane) => (
                <button
                  key={octane}
                  onClick={() => update('raceFuelOctane', octane)}
                  className={`py-2 px-3 text-xs font-semibold font-mono rounded-lg border transition-colors cursor-pointer ${
                    tuning.raceFuelOctane === octane
                      ? 'bg-amber-400 text-black border-amber-300 font-bold shadow'
                      : 'bg-black/30 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {octane} Octane {octane === 110 ? '(Sunoco Pro)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Readout Box (Right) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#121824] border border-white/10 rounded-xl p-6 flex flex-col gap-6">
            <div className="text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-white/10 pb-3">
              Predicted Telemetry Output
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-xs text-slate-400 font-mono uppercase">Calculated Output</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-400 mt-1">
                  {currentHp} <span className="text-xs text-slate-400 font-sans font-normal">BHP</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {totalHpDelta >= 0 ? `+${totalHpDelta}` : totalHpDelta} from baseline
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-xs text-slate-400 font-mono uppercase">Wheel Torque</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
                  {currentTorque} <span className="text-xs text-slate-400 font-sans font-normal">LB-FT</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  At 4,800 RPM Peak
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-xs text-slate-400 font-mono uppercase">0 - 60 MPH Acceleration</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
                  {estimated0to60} <span className="text-xs text-slate-400 font-sans font-normal">SEC</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Dry dirt surface
                </div>
              </div>

              <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="text-xs text-slate-400 font-mono uppercase">Max Dune Incline</div>
                <div className="text-3xl font-extrabold font-mono tabular-nums text-white mt-1">
                  {maxClimbAngleDeg}° <span className="text-xs text-slate-400 font-sans font-normal">SLOPE</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  At {tuning.tirePsi} PSI floatation
                </div>
              </div>
            </div>

            {/* Estimated Top Speed Meter */}
            <div className="p-4 bg-black/40 rounded-lg border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 font-mono uppercase">Mojave Lake Bed Top Speed</div>
                <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-0.5">
                  {topSpeedMph} MPH
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                4.56 Final Drive · 37" Tire Roll
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
