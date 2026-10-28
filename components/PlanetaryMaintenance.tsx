import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export type OperationMode = 'mechanical' | 'scorpius_resonance';

interface GearToleranceMetric {
  name: string;
  nominal: string;
  measured: string;
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'ATTENTION';
  stressMpa: number;
  tempF: number;
}

export const PlanetaryMaintenance: React.FC = () => {
  // Operational Mode
  const [mode, setMode] = useState<OperationMode>('mechanical');

  // Gearbox Dynamics Controls
  const [inputRpm, setInputRpm] = useState<number>(2400); // 0 to 4500 RPM
  const [torqueLoadPct, setTorqueLoadPct] = useState<number>(68); // 0 to 100%
  const [harmonicDamping, setHarmonicDamping] = useState<number>(0.72); // 0.1 to 1.0
  const [selectedGear, setSelectedGear] = useState<'sun' | 'planet1' | 'planet2' | 'planet3' | 'planet4' | 'ring' | 'carrier'>('sun');

  // Diagnostics & Fluid Health
  const [lubePressurePsi, setLubePressurePsi] = useState<number>(64.8);
  const [lubeTempF, setLubeTempF] = useState<number>(196.4);
  const [sealHealthPct, setSealHealthPct] = useState<number>(94);
  const [particulatePpm, setParticulatePpm] = useState<number>(14.2);
  const [purgeValveOpen, setPurgeValveOpen] = useState<boolean>(false);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);
  const [flushProgress, setFlushProgress] = useState<number>(0);

  // Rotation Animation State
  const [sunAngle, setSunAngle] = useState<number>(0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Interactive Mechanical Checklist
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Gear Geometry Constants
  // Z_sun = 24 teeth, Z_planet = 16 teeth, Z_ring = 56 teeth (24 + 2*16 = 56)
  // Gear Ratio (Fixed Ring, Carrier Output): Ratio = 1 + (Z_ring / Z_sun) = 1 + (56 / 24) = 3.333:1
  const Z_sun = 24;
  const Z_planet = 16;
  const Z_ring = 56;
  const gearRatio = 1 + Z_ring / Z_sun; // 3.333

  // Animation Loop for Gear Rotation
  useEffect(() => {
    const updateRotation = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      if (inputRpm > 0) {
        // Speed scaling for visually comfortable rendering (1 rev/sec per 600 RPM)
        const rotationSpeed = (inputRpm / 60) * 360 * 0.15; // deg/sec
        setSunAngle((prev) => (prev + rotationSpeed * deltaTime) % 360);
      }
      animRef.current = requestAnimationFrame(updateRotation);
    };

    animRef.current = requestAnimationFrame(updateRotation);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [inputRpm]);

  // Derived Carrier & Planet Angles
  const carrierAngle = sunAngle / gearRatio;
  // Planet relative spin angle on its own pin
  const planetSpinAngle = -(carrierAngle * (Z_ring / Z_planet));

  // Dynamic telemetry simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isFlushing) return;
      // Slight natural fluctuations based on RPM and load
      const rpmFactor = inputRpm / 3000;
      const targetPsi = 42 + rpmFactor * 28 + (torqueLoadPct / 100) * 8;
      setLubePressurePsi((prev) => {
        const delta = (targetPsi - prev) * 0.15 + (Math.random() - 0.5) * 0.4;
        return Number((prev + delta).toFixed(1));
      });

      const targetTemp = 175 + (torqueLoadPct / 100) * 45 + rpmFactor * 25;
      setLubeTempF((prev) => {
        const delta = (targetTemp - prev) * 0.05 + (Math.random() - 0.5) * 0.2;
        return Number((prev + delta).toFixed(1));
      });
    }, 500);

    return () => clearInterval(interval);
  }, [inputRpm, torqueLoadPct, isFlushing]);

  // Flush sequence logic
  const handleTriggerFlush = useCallback(() => {
    if (isFlushing) return;
    setIsFlushing(true);
    setFlushProgress(0);
    setPurgeValveOpen(true);

    let progress = 0;
    const flushInterval = setInterval(() => {
      progress += 10;
      setFlushProgress(progress);
      setLubePressurePsi(88 + Math.sin(progress) * 12);
      if (progress >= 100) {
        clearInterval(flushInterval);
        setIsFlushing(false);
        setPurgeValveOpen(false);
        setParticulatePpm(2.1);
        setSealHealthPct(100);
        setLubePressurePsi(68.5);
        setLubeTempF(182.0);
      }
    }, 350);
  }, [isFlushing]);

  // Gear Mesh Frequency calculation (GMF = Z_sun * (RPM / 60))
  const gearMeshFrequency = Math.round(Z_sun * (inputRpm / 60));
  const carrierOutputRpm = Math.round(inputRpm / gearRatio);
  const resonanceHarmonicDrift = ((1 - harmonicDamping) * 0.18).toFixed(3);

  // Selected Component Metrics
  const gearMetrics: Record<string, GearToleranceMetric> = useMemo(() => ({
    sun: {
      name: 'Sun Pinion Gear (24T Billet 4340)',
      nominal: '0.0060 in Backlash',
      measured: '0.0062 in (Mesh Verified)',
      status: 'OPTIMAL',
      stressMpa: Math.round(420 + torqueLoadPct * 4.8),
      tempF: Math.round(lubeTempF + 12),
    },
    planet1: {
      name: 'Planet Gear Alpha (16T Cryo-Hardened)',
      nominal: '0.0055 in Backlash',
      measured: '0.0057 in (Torque Aligned)',
      status: 'OPTIMAL',
      stressMpa: Math.round(390 + torqueLoadPct * 4.2),
      tempF: Math.round(lubeTempF + 8),
    },
    planet2: {
      name: 'Planet Gear Bravo (16T Cryo-Hardened)',
      nominal: '0.0055 in Backlash',
      measured: '0.0056 in (Torque Aligned)',
      status: 'OPTIMAL',
      stressMpa: Math.round(392 + torqueLoadPct * 4.1),
      tempF: Math.round(lubeTempF + 7),
    },
    planet3: {
      name: 'Planet Gear Charlie (16T Cryo-Hardened)',
      nominal: '0.0055 in Backlash',
      measured: '0.0058 in (Torque Aligned)',
      status: 'OPTIMAL',
      stressMpa: Math.round(388 + torqueLoadPct * 4.3),
      tempF: Math.round(lubeTempF + 9),
    },
    planet4: {
      name: 'Planet Gear Delta (16T Cryo-Hardened)',
      nominal: '0.0055 in Backlash',
      measured: '0.0056 in (Torque Aligned)',
      status: 'OPTIMAL',
      stressMpa: Math.round(391 + torqueLoadPct * 4.2),
      tempF: Math.round(lubeTempF + 8),
    },
    ring: {
      name: 'Internal Annulus Ring Gear (56T Case Hardened)',
      nominal: '0.0070 in Axial Float',
      measured: '0.0068 in (Reaction Anchored)',
      status: 'OPTIMAL',
      stressMpa: Math.round(340 + torqueLoadPct * 3.1),
      tempF: Math.round(lubeTempF - 5),
    },
    carrier: {
      name: 'Planet Carrier Drivetrain Flange (C.O.R.E. Output)',
      nominal: '0.0015 in Radial Runout',
      measured: '0.0009 in (Balanced)',
      status: 'OPTIMAL',
      stressMpa: Math.round(280 + torqueLoadPct * 2.8),
      tempF: Math.round(lubeTempF - 2),
    },
  }), [torqueLoadPct, lubeTempF]);

  // Toggle checklist step
  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  // SVG dimensions for the Planetary System
  const centerX = 200;
  const centerY = 200;
  const sunRadius = 45;
  const planetRadius = 30;
  const orbitRadius = sunRadius + planetRadius; // 75px
  const ringInnerRadius = orbitRadius + planetRadius; // 105px
  const ringOuterRadius = ringInnerRadius + 24; // 129px

  // Generate Gear Teeth Path helper
  const generateGearPath = (
    cx: number,
    cy: number,
    numTeeth: number,
    innerR: number,
    outerR: number
  ) => {
    const points: string[] = [];
    const step = (Math.PI * 2) / numTeeth;

    for (let i = 0; i < numTeeth; i++) {
      const angle = i * step;
      const halfStep = step / 4;

      // Tooth base 1
      const a1 = angle - halfStep * 1.4;
      const x1 = cx + innerR * Math.cos(a1);
      const y1 = cy + innerR * Math.sin(a1);

      // Tooth tip 1
      const a2 = angle - halfStep * 0.6;
      const x2 = cx + outerR * Math.cos(a2);
      const y2 = cy + outerR * Math.sin(a2);

      // Tooth tip 2
      const a3 = angle + halfStep * 0.6;
      const x3 = cx + outerR * Math.cos(a3);
      const y3 = cy + outerR * Math.sin(a3);

      // Tooth base 2
      const a4 = angle + halfStep * 1.4;
      const x4 = cx + innerR * Math.cos(a4);
      const y4 = cy + innerR * Math.sin(a4);

      if (i === 0) {
        points.push(`M ${x1} ${y1}`);
      } else {
        points.push(`L ${x1} ${y1}`);
      }
      points.push(`L ${x2} ${y2}`);
      points.push(`L ${x3} ${y3}`);
      points.push(`L ${x4} ${y4}`);
    }
    points.push('Z');
    return points.join(' ');
  };

  // 4 Planet Positions along the Carrier Orbit
  const planets = [
    { id: 'planet1', label: 'α', name: 'Planet 1 (Alpha)', offsetDeg: 0 },
    { id: 'planet2', label: 'β', name: 'Planet 2 (Bravo)', offsetDeg: 90 },
    { id: 'planet3', label: 'γ', name: 'Planet 3 (Charlie)', offsetDeg: 180 },
    { id: 'planet4', label: 'δ', name: 'Planet 4 (Delta)', offsetDeg: 270 },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#070A0F] text-slate-100 overflow-y-auto">
      {/* Top Banner & Mode Selector */}
      <div className="bg-[#0B0F17] border-b border-white/10 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="font-['Barlow_Condensed',sans-serif] text-2xl font-black uppercase tracking-wider text-white">
              PLANETARY GEARINGULAR DIAGNOSIS & SERVICE CONSOLE
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold uppercase border border-amber-500/30">
              C.O.R.E. EPICYCLIC 3.33:1 · SPEC-711
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Heavy Machinery Reduction Ratio · High-Torque Mesh Resonance & Dynamic Seal Purge Unit
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-lg border border-white/10">
          <button
            onClick={() => setMode('mechanical')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mode === 'mechanical'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${mode === 'mechanical' ? 'bg-black' : 'bg-slate-600'}`} />
            <span>MECHANICAL DRIVETRAIN</span>
          </button>
          <button
            onClick={() => setMode('scorpius_resonance')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mode === 'scorpius_resonance'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/25'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${mode === 'scorpius_resonance' ? 'bg-black' : 'bg-cyan-500'}`} />
            <span>PROJECT SCORPIUS (THEORETICAL)</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="flex-1 p-4 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Interactive Planetary Gearbox SVG Stage (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Header / Orbit Telemetry */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-amber-400">
                  {mode === 'mechanical' ? 'Epicyclic Mesh Visualizer' : 'Magnetrymnomic Axis Realignment'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-cyan-400 border border-cyan-500/20">
                  Zs=24 | Zp=16 | Zr=56
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400">Input Sun: </span>
                  <span className="text-amber-400 font-bold">{inputRpm} RPM</span>
                </div>
                <div>
                  <span className="text-slate-400">Carrier Out: </span>
                  <span className="text-cyan-400 font-bold">{carrierOutputRpm} RPM</span>
                </div>
                <div>
                  <span className="text-slate-400">Ratio: </span>
                  <span className="text-white font-bold">{gearRatio.toFixed(2)}:1</span>
                </div>
              </div>
            </div>

            {/* SVG Visualizer Canvas */}
            <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center bg-black/60 rounded-xl border border-white/5 p-2">
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full select-none cursor-pointer"
              >
                {/* Background Grid & Coordinate Reticle */}
                <defs>
                  <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="60%" stopColor="#0B1320" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
                  </radialGradient>
                  <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                  <linearGradient id="planetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <filter id="gearShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Concentric Calibration Reticles */}
                <circle cx={centerX} cy={centerY} r={ringOuterRadius + 18} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
                <circle cx={centerX} cy={centerY} r={orbitRadius} fill="none" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 5" opacity="0.3" />
                <line x1={centerX - ringOuterRadius - 15} y1={centerY} x2={centerX + ringOuterRadius + 15} y2={centerY} stroke="#1e293b" strokeWidth="1" />
                <line x1={centerX} y1={centerY - ringOuterRadius - 15} x2={centerX} y2={centerY + ringOuterRadius + 15} stroke="#1e293b" strokeWidth="1" />

                {/* Outer Stationary Ring Gear (Zr = 56) */}
                <g onClick={() => setSelectedGear('ring')} className="transition-opacity hover:opacity-90">
                  <path
                    d={`M ${centerX - ringOuterRadius} ${centerY} A ${ringOuterRadius} ${ringOuterRadius} 0 1 0 ${centerX + ringOuterRadius} ${centerY} A ${ringOuterRadius} ${ringOuterRadius} 0 1 0 ${centerX - ringOuterRadius} ${centerY} Z M ${centerX - ringInnerRadius} ${centerY} A ${ringInnerRadius} ${ringInnerRadius} 0 1 1 ${centerX + ringInnerRadius} ${centerY} A ${ringInnerRadius} ${ringInnerRadius} 0 1 1 ${centerX - ringInnerRadius} ${centerY} Z`}
                    fill="url(#ringGlow)"
                    stroke={selectedGear === 'ring' ? '#38bdf8' : '#334155'}
                    strokeWidth={selectedGear === 'ring' ? 2.5 : 1.5}
                  />
                  {/* Internal Ring Teeth */}
                  <path
                    d={generateGearPath(centerX, centerY, Z_ring, ringInnerRadius, ringInnerRadius - 6)}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {/* Outer Housing Studs */}
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
                    const rad = (deg * Math.PI) / 180;
                    const bx = centerX + (ringOuterRadius - 8) * Math.cos(rad);
                    const by = centerY + (ringOuterRadius - 8) * Math.sin(rad);
                    return <circle key={deg} cx={bx} cy={by} r="2.5" fill="#64748b" />;
                  })}
                </g>

                {/* Planet Carrier Spider Arm (Rotates at carrierAngle) */}
                <g
                  transform={`rotate(${carrierAngle}, ${centerX}, ${centerY})`}
                  onClick={() => setSelectedGear('carrier')}
                >
                  <circle cx={centerX} cy={centerY} r="22" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                  {/* Carrier Cross Arms connecting the 4 planet pins */}
                  <path
                    d={`M ${centerX - orbitRadius} ${centerY} L ${centerX + orbitRadius} ${centerY} M ${centerX} ${centerY - orbitRadius} L ${centerX} ${centerY + orbitRadius}`}
                    stroke={selectedGear === 'carrier' ? '#38bdf8' : '#1e293b'}
                    strokeWidth="7"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  <path
                    d={`M ${centerX - orbitRadius} ${centerY} L ${centerX + orbitRadius} ${centerY} M ${centerX} ${centerY - orbitRadius} L ${centerX} ${centerY + orbitRadius}`}
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                {/* 4 Planet Gears (Alpha, Bravo, Charlie, Delta) */}
                {planets.map((planet) => {
                  const currentOrbitDeg = carrierAngle + planet.offsetDeg;
                  const rad = (currentOrbitDeg * Math.PI) / 180;
                  const px = centerX + orbitRadius * Math.cos(rad);
                  const py = centerY + orbitRadius * Math.sin(rad);
                  const isSelected = selectedGear === planet.id;

                  // Planet rotates about its own pin
                  const selfRotationDeg = planetSpinAngle + (planet.offsetDeg * (Z_ring / Z_planet));

                  return (
                    <g
                      key={planet.id}
                      onClick={() => setSelectedGear(planet.id as any)}
                      className="cursor-pointer"
                    >
                      {/* Carrier Pin Boss */}
                      <circle cx={px} cy={py} r={planetRadius + 3} fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />

                      {/* Planet Gear Body */}
                      <g transform={`rotate(${selfRotationDeg}, ${px}, ${py})`}>
                        <path
                          d={generateGearPath(px, py, Z_planet, planetRadius - 6, planetRadius + 3)}
                          fill="url(#planetGradient)"
                          stroke={isSelected ? '#ffffff' : '#0891b2'}
                          strokeWidth={isSelected ? 2 : 1}
                        />
                        <circle cx={px} cy={py} r={planetRadius - 8} fill="#092736" stroke="#22d3ee" strokeWidth="1" />
                        {/* Needle Roller Bearing Simulation Holes */}
                        {[0, 60, 120, 180, 240, 300].map((hDeg) => {
                          const hRad = (hDeg * Math.PI) / 180;
                          const hx = px + 12 * Math.cos(hRad);
                          const hy = py + 12 * Math.sin(hRad);
                          return <circle key={hDeg} cx={hx} cy={hy} r="2.2" fill="#021c27" stroke="#38bdf8" strokeWidth="0.8" />;
                        })}
                      </g>

                      {/* Hardened Center Pin Pinion */}
                      <circle cx={px} cy={py} r="5" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.5" />
                      <text
                        x={px}
                        y={py - 12}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        {planet.label}
                      </text>
                    </g>
                  );
                })}

                {/* Central Sun Gear (Zs = 24) - Rotates at sunAngle */}
                <g
                  onClick={() => setSelectedGear('sun')}
                  transform={`rotate(${sunAngle}, ${centerX}, ${centerY})`}
                  className="cursor-pointer"
                >
                  <path
                    d={generateGearPath(centerX, centerY, Z_sun, sunRadius - 7, sunRadius + 4)}
                    fill="url(#sunGradient)"
                    stroke={selectedGear === 'sun' ? '#ffffff' : '#b45309'}
                    strokeWidth={selectedGear === 'sun' ? 2 : 1.2}
                    filter="url(#gearShadow)"
                  />
                  {/* Central Involute Spline Shaft Bore */}
                  <circle cx={centerX} cy={centerY} r="18" fill="#1e1b18" stroke="#f59e0b" strokeWidth="1.5" />
                  {/* Spline Keyways */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((sDeg) => {
                    const sRad = (sDeg * Math.PI) / 180;
                    const sx = centerX + 18 * Math.cos(sRad);
                    const sy = centerY + 18 * Math.sin(sRad);
                    return <circle key={sDeg} cx={sx} cy={sy} r="1.8" fill="#fbbf24" />;
                  })}
                  <circle cx={centerX} cy={centerY} r="8" fill="#000000" stroke="#f59e0b" strokeWidth="1" />
                </g>

                {/* Mesh Pressure Contact Points (Torque Load Heatmap) */}
                {planets.map((planet) => {
                  const currentOrbitDeg = carrierAngle + planet.offsetDeg;
                  const rad = (currentOrbitDeg * Math.PI) / 180;
                  // Contact point between Sun & Planet
                  const contactX = centerX + sunRadius * Math.cos(rad);
                  const contactY = centerY + sunRadius * Math.sin(rad);

                  const heatColor =
                    torqueLoadPct > 80 ? '#ef4444' : torqueLoadPct > 50 ? '#f59e0b' : '#22d3ee';

                  return (
                    <g key={`mesh-${planet.id}`}>
                      <circle
                        cx={contactX}
                        cy={contactY}
                        r={3 + (torqueLoadPct / 100) * 3}
                        fill={heatColor}
                        opacity={0.8}
                        className="animate-ping"
                      />
                      <circle cx={contactX} cy={contactY} r="2.5" fill="#ffffff" />
                    </g>
                  );
                })}
              </svg>

              {/* In-Canvas Component Inspector Badge */}
              <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md rounded-lg p-2.5 border border-white/10 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400">Selected Target: </span>
                  <span className="text-amber-400 font-bold uppercase">{selectedGear}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Mesh Backlash: </span>
                  <span className="text-cyan-400 font-bold">{gearMetrics[selectedGear]?.nominal || 'VERIFIED'}</span>
                </div>
              </div>
            </div>

            {/* Interactive Drivetrain Controls Panel */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              {/* Input RPM Slider */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">INPUT SUN SHAFT</span>
                  <span className="text-amber-400 font-bold">{inputRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4500"
                  step="50"
                  value={inputRpm}
                  onChange={(e) => setInputRpm(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <button onClick={() => setInputRpm(0)} className="hover:text-amber-300">0 (Lock)</button>
                  <button onClick={() => setInputRpm(1200)} className="hover:text-amber-300">1.2k</button>
                  <button onClick={() => setInputRpm(2400)} className="hover:text-amber-300">2.4k (Nom)</button>
                  <button onClick={() => setInputRpm(4200)} className="hover:text-amber-300">4.2k (Max)</button>
                </div>
              </div>

              {/* Dynamic Torque Load */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">DRIVETRAIN TORQUE LOAD</span>
                  <span className={`font-bold ${torqueLoadPct > 80 ? 'text-red-400' : torqueLoadPct > 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {torqueLoadPct}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={torqueLoadPct}
                  onChange={(e) => setTorqueLoadPct(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
                  <span>Pinion Contact: {Math.round(torqueLoadPct * 18.4)} ft-lbs</span>
                  <span>{torqueLoadPct > 85 ? 'HEAVY STRESS' : 'RATED SPEC'}</span>
                </div>
              </div>

              {/* Harmonic Damping Ratio */}
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">HARMONIC DAMPING (ζ)</span>
                  <span className="text-cyan-300 font-bold">{harmonicDamping.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.02"
                  value={harmonicDamping}
                  onChange={(e) => setHarmonicDamping(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
                  <span>Drift: ±{resonanceHarmonicDrift} Hz</span>
                  <span className="text-emerald-400">HARMONIC LOCK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Resonance & Oscillation Oscilloscope Panel */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-['Barlow_Condensed',sans-serif] text-base font-bold uppercase tracking-wider text-cyan-400">
                  {mode === 'mechanical' ? 'Gear Mesh Spectral Frequency (GMF)' : 'Magnetrymnomic Darkstar Resonance'}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {gearMeshFrequency} Hz
                </span>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Fundamental (1x) · 2nd Harmonic ({gearMeshFrequency * 2} Hz)
              </span>
            </div>

            {/* Simulated Live Spectral Waveform Canvas */}
            <div className="h-28 bg-black/70 rounded-lg border border-cyan-500/20 p-2 flex items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 600 100" className="w-full h-full">
                {/* Horizontal Zero-line */}
                <line x1="0" y1="50" x2="600" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                {/* Harmonic Oscillation Wave Path */}
                <path
                  d={Array.from({ length: 60 }).map((_, i) => {
                    const x = i * 10;
                    // Oscillating sinusoidal combination of GMF and damping
                    const t = (sunAngle * Math.PI) / 180;
                    const primary = Math.sin(i * 0.4 + t) * (26 * (1 - harmonicDamping * 0.5));
                    const secondary = Math.cos(i * 0.8 + t * 2) * (12 * (torqueLoadPct / 100));
                    const noise = (Math.sin(i * 3 + t) * 4) * (1 - harmonicDamping);
                    const y = 50 + primary + secondary + noise;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
                {/* Envelope Glow Path */}
                <path
                  d={Array.from({ length: 60 }).map((_, i) => {
                    const x = i * 10;
                    const t = (sunAngle * Math.PI) / 180;
                    const primary = Math.sin(i * 0.4 + t) * (26 * (1 - harmonicDamping * 0.5));
                    const y = 50 + primary;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                  opacity="0.7"
                />
              </svg>
              {/* Telemetry Stamp */}
              <div className="absolute top-2 right-3 font-mono text-[10px] text-cyan-400 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">
                ACTIVE VIBRATION SENSOR · ACCEL 3.42 G-RMS
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Gauges, Flush Controls, & Mechanical Checklist (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          {/* Lube Pressure & Seal Contamination Card */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-amber-400">
                Hydraulic Lube & Viton Seal Integrity
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SUMP SEALED
              </span>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Oil Pressure */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-slate-400">LUBE OIL PRESSURE</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-mono font-bold ${lubePressurePsi < 35 ? 'text-red-400' : 'text-amber-400'}`}>
                    {lubePressurePsi}
                  </span>
                  <span className="text-xs font-mono text-slate-400">PSI</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${lubePressurePsi < 35 ? 'bg-red-500' : 'bg-amber-400'}`}
                    style={{ width: `${Math.min(100, (lubePressurePsi / 100) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">Norm: 45 - 85 PSI</span>
              </div>

              {/* Oil Temp */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-slate-400">BULK SUMP TEMP</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-mono font-bold ${lubeTempF > 240 ? 'text-red-400' : 'text-cyan-400'}`}>
                    {lubeTempF}
                  </span>
                  <span className="text-xs font-mono text-slate-400">°F</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, ((lubeTempF - 100) / 160) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">Max Continuous: 260°F</span>
              </div>

              {/* Seal Health */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-slate-400">VITON SEAL HEALTH</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className="text-2xl font-mono font-bold text-emerald-400">
                    {sealHealthPct}
                  </span>
                  <span className="text-xs font-mono text-slate-400">%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${sealHealthPct}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">Dual-Lip Dust Barrier</span>
              </div>

              {/* Particulate Contamination */}
              <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex flex-col justify-between">
                <span className="text-[11px] font-mono text-slate-400">FERROUS PARTICLES</span>
                <div className="my-1 flex items-baseline gap-1">
                  <span className={`text-2xl font-mono font-bold ${particulatePpm > 30 ? 'text-amber-400' : 'text-slate-200'}`}>
                    {particulatePpm}
                  </span>
                  <span className="text-xs font-mono text-slate-400">PPM</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (particulatePpm / 50) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 mt-1">ISO 4406: 15/13/10</span>
              </div>
            </div>

            {/* Purge Valve Status & High Pressure Flush Trigger */}
            <div className="bg-black/50 p-3.5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${purgeValveOpen ? 'bg-amber-400 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono font-bold text-white">
                    CONTAMINATION PURGE FLUSH VALVE
                  </span>
                </div>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${purgeValveOpen ? 'bg-amber-400 text-black' : 'bg-white/10 text-slate-400'}`}>
                  {purgeValveOpen ? 'VALVE OPEN (PURGING)' : 'VALVE SEALED'}
                </span>
              </div>

              {isFlushing && (
                <div className="mb-3">
                  <div className="flex justify-between text-[11px] font-mono text-amber-300 mb-1">
                    <span>SOLVENT CAVITY FLUSHING IN PROGRESS...</span>
                    <span>{flushProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${flushProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleTriggerFlush}
                  disabled={isFlushing}
                  className="flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 disabled:text-slate-500 text-black font-mono font-bold text-xs uppercase tracking-wider rounded transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isFlushing ? 'Executing Flush...' : 'Cycle High-Pressure Lube Flush'}</span>
                </button>
                <button
                  onClick={() => setPurgeValveOpen(!purgeValveOpen)}
                  disabled={isFlushing}
                  className="px-3 py-2 bg-white/10 hover:bg-white/15 text-slate-200 font-mono text-xs rounded border border-white/10 cursor-pointer"
                >
                  {purgeValveOpen ? 'Close Valve' : 'Open Valve'}
                </button>
              </div>
            </div>
          </div>

          {/* Literal Mechanical Service Steps Checklist */}
          <div className="bg-[#0B0F17] rounded-xl border border-white/10 p-5 shadow-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div>
                  <span className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-wider text-cyan-400">
                    Heavy Machinery Service Procedure
                  </span>
                  <p className="text-[11px] font-mono text-slate-400">
                    Standard Workshop SOP for Epicyclic Planetary Gearboxes
                  </p>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  {completedCount} / 6 VERIFIED
                </span>
              </div>

              {/* Steps List */}
              <div className="space-y-2.5 text-xs font-mono">
                {[
                  {
                    step: 1,
                    title: 'Lockout/Tagout & Magnetic Sump Inspection',
                    detail: 'Inspect magnetic drain plug for spalling flakes, pinion micro-pitting, or bronze carrier washer shrapnel.',
                  },
                  {
                    step: 2,
                    title: 'High-Pressure Solvent Flush & Cavity Evacuation',
                    detail: 'Connect purge coupling, circulate filtered ISO-4406 flushing solvent at 85 PSI, and blow clear with dry N₂.',
                  },
                  {
                    step: 3,
                    title: 'Backlash & Prussian Blue Mesh Pattern Check',
                    detail: 'Verify 0.0055"-0.0065" backlash on sun-to-planet mesh using dial indicator; verify central tooth contact crown.',
                  },
                  {
                    step: 4,
                    title: 'Dual Viton Shaft Seal & O-Ring Overhaul',
                    detail: 'Extract worn radial lip seals, inspect ceramic sleeve wear track, press in new Viton fluoroelastomer seals.',
                  },
                  {
                    step: 5,
                    title: 'Planet Carrier Pin Retention Torque Spec',
                    detail: 'Torque carrier retainer bolts to 145 ft-lbs with high-strength Loctite 271 Red; verify carrier axial float.',
                  },
                  {
                    step: 6,
                    title: 'SAE 75W-140 Synthetic Hypoid Lube Refill',
                    detail: 'Refill 4.5 quarts of severe-duty hypoid gear lubricant with friction modifier; run 10-min bench break-in.',
                  },
                ].map(({ step, title, detail }) => {
                  const isChecked = completedSteps[step];
                  return (
                    <div
                      key={step}
                      onClick={() => toggleStep(step)}
                      className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'bg-cyan-950/20 border-cyan-500/40 text-slate-200'
                          : 'bg-black/30 border-white/5 hover:border-white/20 text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by parent div
                        className="mt-0.5 accent-cyan-400 cursor-pointer rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${isChecked ? 'text-cyan-300 line-through' : 'text-slate-200'}`}>
                            STEP {step}: {title}
                          </span>
                          {isChecked && (
                            <span className="text-[10px] text-emerald-400 font-bold">DONE</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reset / Sign-off Button */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                13ADC Workshop Service Standard Rev 2026.08
              </span>
              <button
                onClick={() => setCompletedSteps({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true })}
                className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-xs rounded transition cursor-pointer"
              >
                Mark All Steps Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Target Component Detailed Inspection Modal / Drawer when a gear is clicked */}
      <div className="bg-[#0B0F17] border-t border-white/10 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h3 className="font-['Barlow_Condensed',sans-serif] text-base font-bold uppercase tracking-wider text-white">
              Target Component Focus: {gearMetrics[selectedGear]?.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
            <div>
              <span className="text-slate-400">Tooth Stress: </span>
              <span className="text-amber-400 font-bold">{gearMetrics[selectedGear]?.stressMpa} MPa</span>
            </div>
            <div>
              <span className="text-slate-400">Pinion Temp: </span>
              <span className="text-cyan-300 font-bold">{gearMetrics[selectedGear]?.tempF} °F</span>
            </div>
            <div>
              <span className="text-slate-400">Backlash Tolerance: </span>
              <span className="text-emerald-400 font-bold">{gearMetrics[selectedGear]?.measured}</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              STATUS: {gearMetrics[selectedGear]?.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
