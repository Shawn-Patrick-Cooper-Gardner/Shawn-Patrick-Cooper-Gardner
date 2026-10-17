import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../data/vehicles';
import { TuningConfig } from './TuningBench';
import { audioEngine } from '../services/AudioEngine';

interface DynoChartProps {
  vehicle: Vehicle;
  tuning: TuningConfig;
  soundEnabled: boolean;
}

export const DynoChart: React.FC<DynoChartProps> = ({ vehicle, tuning, soundEnabled }) => {
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullRpm, setPullRpm] = useState<number>(2000);
  const [hoverRpm, setHoverRpm] = useState<number | null>(null);
  const pullRef = useRef<number | null>(null);

  // Compute peak HP & Torque based on tuning
  const boostBonus = (tuning.boostPsi - 12) * 22;
  const timingBonus = (tuning.timingAdvanceDeg - 34) * 6;
  const octaneBonus = tuning.raceFuelOctane === 110 ? 30 : tuning.raceFuelOctane === 100 ? 10 : -20;
  const hpPeak = Math.max(500, vehicle.baseHp + boostBonus + timingBonus + octaneBonus);
  const torquePeak = Math.max(450, vehicle.baseTorque + Math.round((boostBonus + timingBonus + octaneBonus) * 0.92));

  const peakHpRpm = 6400;
  const peakTorqueRpm = 4600;

  // Dyno curve mathematical approximation
  const getHpAtRpm = (rpm: number) => {
    const x = rpm / peakHpRpm;
    const curve = Math.sin((x * Math.PI) / 2.1) * (1 - Math.pow(Math.max(0, x - 1), 2) * 1.6);
    return Math.max(120, Math.round(hpPeak * Math.max(0.2, curve)));
  };

  const getTorqueAtRpm = (rpm: number) => {
    const dist = Math.abs(rpm - peakTorqueRpm) / 3200;
    const curve = Math.max(0.4, 1 - Math.pow(dist, 1.8) * 0.65);
    return Math.max(200, Math.round(torquePeak * curve));
  };

  // Run Dyno Pull Animation
  const startDynoPull = () => {
    if (isPulling) return;
    setIsPulling(true);
    setPullRpm(2000);

    if (soundEnabled && audioEngine.getIsRunning()) {
      audioEngine.setRpm(2000);
    }

    const startTime = performance.now();
    const duration = 4000; // 4 seconds sweep

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Smooth non-linear acceleration sweep
      const current = 2000 + Math.pow(progress, 1.3) * (7000 - 2000);
      setPullRpm(Math.round(current));

      if (soundEnabled && audioEngine.getIsRunning()) {
        audioEngine.setRpm(current);
      }

      if (progress < 1) {
        pullRef.current = requestAnimationFrame(tick);
      } else {
        setIsPulling(false);
        if (soundEnabled && audioEngine.getIsRunning()) {
          audioEngine.setRpm(900); // Return to idle
        }
      }
    };

    pullRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (pullRef.current) cancelAnimationFrame(pullRef.current);
    };
  }, []);

  // Generate SVG path points
  const points = [];
  const svgWidth = 800;
  const svgHeight = 360;
  const minRpm = 2000;
  const maxRpm = 7500;
  const maxVal = Math.max(1000, hpPeak + 100);

  for (let r = minRpm; r <= maxRpm; r += 100) {
    const x = ((r - minRpm) / (maxRpm - minRpm)) * svgWidth;
    const hp = getHpAtRpm(r);
    const tq = getTorqueAtRpm(r);
    const yHp = svgHeight - (hp / maxVal) * svgHeight;
    const yTq = svgHeight - (tq / maxVal) * svgHeight;
    points.push({ r, x, yHp, yTq, hp, tq });
  }

  const hpPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yHp.toFixed(1)}`).join(' ');
  const tqPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yTq.toFixed(1)}`).join(' ');

  const activeRpm = isPulling ? pullRpm : hoverRpm ?? 5200;
  const currentActiveHp = getHpAtRpm(activeRpm);
  const currentActiveTq = getTorqueAtRpm(activeRpm);
  const markerX = ((activeRpm - minRpm) / (maxRpm - minRpm)) * svgWidth;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            Engine Dynamometer Telemetry Bench
          </div>
          <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Dyno Pull & Power Curves
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mt-1">
            Simulate a full wide-open throttle (W.O.T.) sweep from 2,000 to 7,000 RPM on the water-brake absorber.
          </p>
        </div>

        <button
          onClick={startDynoPull}
          disabled={isPulling}
          className={`px-6 py-2.5 rounded-lg font-['Barlow_Condensed',sans-serif] text-base uppercase font-bold tracking-wider transition-all cursor-pointer shadow-lg border ${
            isPulling
              ? 'bg-red-600 text-white border-red-500 animate-pulse'
              : 'bg-amber-400 text-black border-amber-300 hover:bg-amber-300'
          }`}
        >
          {isPulling ? `Pulling... ${pullRpm} RPM` : 'Run Dyno Pull'}
        </button>
      </div>

      {/* Tachometer & Live Figures Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#121824] border border-white/10 rounded-xl p-4">
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400">Current RPM</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {activeRpm} <span className="text-xs text-slate-400 font-sans font-normal">RPM</span>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-[11px] font-mono uppercase text-amber-400">Calculated Power</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {currentActiveHp} <span className="text-xs text-slate-400 font-sans font-normal">BHP</span>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-[11px] font-mono uppercase text-red-400">Wheel Torque</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-red-400 mt-1">
            {currentActiveTq} <span className="text-xs text-slate-400 font-sans font-normal">LB-FT</span>
          </div>
        </div>
        <div className="p-3 bg-black/40 rounded-lg">
          <div className="text-[11px] font-mono uppercase text-slate-400">Peak Rated Output</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {hpPeak} <span className="text-xs text-slate-400 font-sans font-normal">@ {peakHpRpm} RPM</span>
          </div>
        </div>
      </div>

      {/* Dyno Graph Card */}
      <div className="bg-[#121824] border border-white/10 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Horsepower (BHP)
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-3 h-0.5 bg-red-400 inline-block" /> Torque (LB-FT)
            </span>
          </div>
          <span>Hover graph or click 'Run Dyno Pull'</span>
        </div>

        {/* SVG Graph Container */}
        <div
          className="relative w-full aspect-[2/1] max-h-[420px] bg-black/60 rounded-lg border border-white/5 overflow-hidden cursor-crosshair"
          onMouseMove={(e) => {
            if (isPulling) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const targetR = Math.round(minRpm + ratio * (maxRpm - minRpm));
            setHoverRpm(Math.max(minRpm, Math.min(maxRpm, targetR)));
          }}
          onMouseLeave={() => setHoverRpm(null)}
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full preserve-3d"
          >
            {/* Horizontal Grid lines */}
            {[200, 400, 600, 800, 1000].map((v) => {
              const y = svgHeight - (v / maxVal) * svgHeight;
              return (
                <g key={v}>
                  <line
                    x1="0"
                    y1={y}
                    x2={svgWidth}
                    y2={y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="10"
                    y={y - 4}
                    fill="rgba(255,255,255,0.3)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {v}
                  </text>
                </g>
              );
            })}

            {/* Vertical RPM Grid lines */}
            {[3000, 4000, 5000, 6000, 7000].map((r) => {
              const x = ((r - minRpm) / (maxRpm - minRpm)) * svgWidth;
              return (
                <g key={r}>
                  <line
                    x1={x}
                    y1="0"
                    x2={x}
                    y2={svgHeight}
                    stroke="rgba(255,255,255,0.06)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x + 4}
                    y={svgHeight - 10}
                    fill="rgba(255,255,255,0.3)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {r} RPM
                  </text>
                </g>
              );
            })}

            {/* Curves */}
            <path
              d={tqPath}
              fill="none"
              stroke="#EF4444"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={hpPath}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active RPM Vertical Cursor */}
            <line
              x1={markerX}
              y1="0"
              x2={markerX}
              y2={svgHeight}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
