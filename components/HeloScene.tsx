import React, { useState, useCallback } from 'react';
import {
  HELO_SCENE_VIEWS,
  HELO_CREW_MEMBERS,
  MH55_AIRCRAFT_SPECS,
  MISSION_PROFILES,
  HeloCrewMember,
  HeloSceneView,
  MissionProfile,
} from '../data/heloCrew';
import { HeloHudGauges } from './HeloHudGauges';
import { HeloGseBay } from './HeloGseBay';

interface HeloSceneProps {
  soundEnabled?: boolean;
}

export const HeloScene: React.FC<HeloSceneProps> = ({ soundEnabled = false }) => {
  const [activeViewId, setActiveViewId] = useState<HeloSceneView['id']>('ground_hotpit');
  const [selectedCrewId, setSelectedCrewId] = useState<string>('crew-blossom-red');
  const [crewData, setCrewData] = useState<HeloCrewMember[]>(HELO_CREW_MEMBERS);
  const [hotPitActionLog, setHotPitActionLog] = useState<string[]>([]);
  const [radioActive, setRadioActive] = useState<boolean>(false);
  const [activeRadioMessage, setActiveRadioMessage] = useState<string>(
    'VHF Tac-1 [BLOSSOM]: MH-55 Rotary Airborne Pit standing by at 2,140 ft MSL. Telemetry sync locked.'
  );

  // Tactical Sub-Tab State
  const [heloSubTab, setHeloSubTab] = useState<'sorties' | 'hud' | 'gse' | 'crew'>('sorties');
  const [activeSortieId, setActiveSortieId] = useState<string>('profile-mojave-hotpit');

  const currentSortie =
    MISSION_PROFILES.find((s) => s.id === activeSortieId) || MISSION_PROFILES[0];

  const currentView =
    HELO_SCENE_VIEWS.find((v) => v.id === activeViewId) || HELO_SCENE_VIEWS[0];

  const selectedCrew =
    crewData.find((c) => c.id === selectedCrewId) || crewData[0];

  // Procedural synthetic radio chirp / squelch effect via Web Audio API
  const playRadioSquelch = useCallback(() => {
    if (!soundEnabled && typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Bandpass radio voice characteristic
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1750, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1240, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext unavailable or restricted
    }
  }, [soundEnabled]);

  // Toggle crew task status (Pending -> Active -> Completed)
  const handleToggleTaskStatus = (crewId: string, taskId: string) => {
    setCrewData((prev) =>
      prev.map((crew) => {
        if (crew.id !== crewId) return crew;
        return {
          ...crew,
          activeTasks: crew.activeTasks.map((t) => {
            if (t.id !== taskId) return t;
            const nextStatus =
              t.status === 'COMPLETED'
                ? 'PENDING'
                : t.status === 'PENDING'
                ? 'ACTIVE'
                : 'COMPLETED';
            return { ...t, status: nextStatus };
          }),
        };
      })
    );
  };

  // Trigger quick hot-pit action directive
  const handleTriggerDirective = (actionName: string, detail: string) => {
    playRadioSquelch();
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const logEntry = `[${timestamp}] ${actionName.toUpperCase()}: ${detail}`;
    setHotPitActionLog((prev) => [logEntry, ...prev.slice(0, 5)]);

    // Update radio readout
    setRadioActive(true);
    setActiveRadioMessage(`${selectedCrew.callsign}: Executing ${actionName} — ${detail}`);
    setTimeout(() => setRadioActive(false), 4500);
  };

  // Switch active mission sortie profile
  const handleSelectSortie = (sortieId: string) => {
    setActiveSortieId(sortieId);
    const sortie = MISSION_PROFILES.find((s) => s.id === sortieId);
    if (sortie) {
      if (sortie.id === 'profile-mojave-hotpit') setActiveViewId('ground_hotpit');
      else if (sortie.id === 'profile-nevada-pursuit') setActiveViewId('cockpit_chase');
      else if (sortie.id === 'profile-boulder-overhaul') setActiveViewId('mobile_workshop');
      else setActiveViewId('ground_hotpit');

      playRadioSquelch();
      setActiveRadioMessage(`${selectedCrew.callsign}: Sortie ${sortie.code} activated — ${sortie.title}`);
      setRadioActive(true);
      setTimeout(() => setRadioActive(false), 4500);

      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setHotPitActionLog((prev) => [
        `[${timestamp}] SORTIE ACTIVATED: ${sortie.code} (${sortie.operationType})`,
        ...prev.slice(0, 5),
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 13ADC Operational Authority & Call-Sign Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
              HELO-ROTARY WORKSHOP
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-bold">CALL-SIGN: #ooz (004)</span>
            <span className="text-slate-600">·</span>
            <span>TWIN TURBOSHAFT (8,760 SHP)</span>
            <span className="text-slate-600">·</span>
            <span>US-1 DIRECT AUTHORITY</span>
          </div>

          <h1 className="font-['Barlow_Condensed',sans-serif] text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white flex flex-wrap items-center gap-3">
            <span>MH®55 ROTARY TOOL CARRIER</span>
            <span className="text-amber-400 font-mono text-2xl sm:text-3xl font-light">
              [AIRBORNE PIT CREW]
            </span>
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl mt-1.5">
            Airborne tactical mobile workshop supporting Fastback #13 in remote desert lakebeds.
            Triple-specialist female pit crew operating dedicated avionics, mechanical running gear, and high-flow pneumatics consoles.
          </p>
        </div>

        {/* Live Airborne Telemetry Readouts */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white/[0.03] border border-white/10 rounded-xl p-3 sm:px-5 shrink-0">
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Total Lift Power</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 flex items-baseline gap-1">
              8,760
              <span className="text-xs text-slate-400 font-sans font-normal">SHP</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Rotor Mast RPM</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 flex items-baseline gap-1">
              179
              <span className="text-xs text-slate-400 font-sans font-normal">3.33:1</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Fuel Reserves</div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-1">
              1,050
              <span className="text-xs text-slate-400 font-sans font-normal">GAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewport & Interactive Hotspots */}
      <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl aspect-[16/9] w-full group">
        <img
          src={currentView.image}
          alt={currentView.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-all duration-700 brightness-95 group-hover:brightness-100"
        />

        {/* Dark Vignette & Tactical HUD Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

        {/* View Switcher Overlay (Top Left) */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/15 rounded-xl p-1.5 shadow-xl">
          {HELO_SCENE_VIEWS.map((view) => {
            const isCurrent = view.id === activeViewId;
            return (
              <button
                key={view.id}
                onClick={() => setActiveViewId(view.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-amber-400 text-black shadow-lg font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />}
                <span>{view.title}</span>
              </button>
            );
          })}
        </div>

        {/* Tactical Air-to-Ground Radio HUD Indicator (Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="bg-black/80 backdrop-blur-md border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-mono flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${radioActive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
            <span className="text-cyan-300 font-bold uppercase">{currentView.calloutBadge}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 text-[11px]">{currentView.environmentConditions.commChannel}</span>
          </div>
        </div>

        {/* Interactive Crew Hotspot Pins on Active View */}
        {crewData.map((crew) => {
          const coords = crew.viewHotspots[activeViewId];
          if (!coords) return null;
          const isSelected = crew.id === selectedCrewId;

          return (
            <div
              key={crew.id}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
            >
              <button
                onClick={() => {
                  setSelectedCrewId(crew.id);
                  playRadioSquelch();
                }}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl border-2 ${
                  isSelected
                    ? 'scale-125 ring-4 ring-white/50 text-white font-bold'
                    : 'hover:scale-110 opacity-90 hover:opacity-100 text-white'
                }`}
                style={{
                  backgroundColor: crew.flightSuitHex,
                  borderColor: isSelected ? '#FFFFFF' : crew.flightSuitHex,
                }}
                aria-label={`Select ${crew.name}`}
              >
                <span className="text-xs font-bold font-mono">
                  {crew.callsign.includes('RED') ? 'R' : crew.callsign.includes('GREEN') ? 'G' : 'B'}
                </span>
              </button>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col items-center pointer-events-none z-30">
                <div className="bg-black/90 border border-white/20 text-white text-[11px] font-mono px-2.5 py-1 rounded whitespace-nowrap shadow-2xl">
                  <span className="font-bold text-amber-300">{crew.name}</span>
                  <span className="text-slate-400 block text-[9px]">{crew.roleTitle}</span>
                </div>
                <div className="w-2 h-2 bg-black border-r border-b border-white/20 rotate-45 -mt-1" />
              </div>
            </div>
          );
        })}

        {/* Bottom Atmosphere & Flight Telemetry HUD Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#0B0F17]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:px-4 text-xs font-mono text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentView.title}
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 text-[11px]">{currentView.subtitle}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span>ALT: <strong className="text-white">{currentView.environmentConditions.altitude}</strong></span>
            <span>SPEED: <strong className="text-white">{currentView.environmentConditions.groundSpeed}</strong></span>
            <span>TEMP: <strong className="text-white">{currentView.environmentConditions.ambientTemp}</strong></span>
            <span>ROTOR: <strong className="text-amber-400">{currentView.environmentConditions.rotorRpm}</strong></span>
          </div>
        </div>
      </div>

      {/* Live Radio Message Ticker */}
      <div className="bg-[#080C13] border border-cyan-500/30 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 animate-ping" />
          <span className="text-cyan-400 font-bold uppercase shrink-0">TACTICAL RADIO:</span>
          <span className="text-slate-300 truncate">{activeRadioMessage}</span>
        </div>
        <button
          onClick={playRadioSquelch}
          className="text-xs text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 rounded cursor-pointer whitespace-nowrap transition-colors"
        >
          Radio Squelch Check
        </button>
      </div>

      {/* Tactical Theater Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080C13] border border-cyan-800/40 rounded-xl p-2 font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setHeloSubTab('sorties');
              playRadioSquelch();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              heloSubTab === 'sorties'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🎯 Tactical Sorties</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">4</span>
          </button>

          <button
            onClick={() => {
              setHeloSubTab('hud');
              playRadioSquelch();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              heloSubTab === 'hud'
                ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📊 Cockpit HUD &amp; Dials</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">LIVE</span>
          </button>

          <button
            onClick={() => {
              setHeloSubTab('gse');
              playRadioSquelch();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              heloSubTab === 'gse'
                ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🛠️ GSE Inventory Bay</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">7 UNITS</span>
          </button>

          <button
            onClick={() => {
              setHeloSubTab('crew');
              playRadioSquelch();
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              heloSubTab === 'crew'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>👩‍🔧 Specialist Crew</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono">3 LEADS</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 px-3 hidden sm:flex items-center gap-2">
          <span>Active Sortie:</span>
          <strong className="text-amber-300">{currentSortie.code}</strong>
        </div>
      </div>

      {/* VIEW PANEL 1: TACTICAL SORTIES */}
      {heloSubTab === 'sorties' && (
        <div className="bg-[#0B0F17] border border-cyan-800/50 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold">Operational Flight Sorties &amp; Remote Pit Profiles</span>
              </div>
              <h3 className="text-xl font-bold uppercase text-white font-['Barlow_Condensed',sans-serif] tracking-wider mt-0.5">
                MH-55 Rotary Aircraft Mission Matrix for Fastback #13
              </h3>
            </div>
            <span className="text-xs text-slate-400">Select sortie profile to engage aircraft telemetry</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {MISSION_PROFILES.map((sortie) => {
              const isSelected = sortie.id === activeSortieId;
              return (
                <div
                  key={sortie.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-[#121824] border-amber-400/60 shadow-xl ring-2 ring-amber-400/30'
                      : 'bg-[#080C13] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        {sortie.code}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-cyan-400">
                        {sortie.operationType}
                      </span>
                    </div>

                    <h4 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold text-white uppercase mb-1">
                      {sortie.title}
                    </h4>

                    <div className="text-xs text-slate-400 space-y-1 mb-3">
                      <div>Target Zone: <strong className="text-slate-200">{sortie.targetZone}</strong></div>
                      <div>Duration: <strong className="text-slate-200">{sortie.flightDuration}</strong></div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-[#050810] p-3 rounded-lg border border-white/5">
                      <span className="text-amber-400 font-bold block mb-1 text-[10px] uppercase">Primary Mission Directive:</span>
                      {sortie.primaryObjective}
                    </p>

                    {/* Environmental Hazards */}
                    <div className="mb-3">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">
                        Environmental Hazards:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {sortie.environmentalHazards.map((hz, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded bg-red-950/40 text-red-300 border border-red-800/40"
                          >
                            ⚠️ {hz}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Triple Crew Task Focus */}
                    <div className="space-y-1.5 text-[11px] border-t border-white/10 pt-3 mb-4">
                      <div>
                        <strong className="text-red-400">Blossom (Avionics):</strong>{' '}
                        <span className="text-slate-300">{sortie.crewFocus.blossom}</span>
                      </div>
                      <div>
                        <strong className="text-emerald-400">Buttercup (Mech):</strong>{' '}
                        <span className="text-slate-300">{sortie.crewFocus.buttercup}</span>
                      </div>
                      <div>
                        <strong className="text-amber-400">Bubbles (Pneumatics):</strong>{' '}
                        <span className="text-slate-300">{sortie.crewFocus.bubbles}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div className="text-[11px] text-slate-400">
                      Airspeed: <strong className="text-white">{sortie.defaultTelemetry.airspeedKts} KTS</strong> · Alt:{' '}
                      <strong className="text-white">{sortie.defaultTelemetry.altitudeFt} ft</strong>
                    </div>

                    <button
                      onClick={() => handleSelectSortie(sortie.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isSelected ? 'ACTIVE SORTIE' : 'ENGAGE SORTIE →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW PANEL 2: COCKPIT HUD & GAUGES */}
      {heloSubTab === 'hud' && (
        <HeloHudGauges
          airspeedKts={currentSortie.defaultTelemetry.airspeedKts}
          altitudeFt={currentSortie.defaultTelemetry.altitudeFt}
          turbineEgtC={currentSortie.defaultTelemetry.turbineEgtC}
          rotorRpm={currentSortie.defaultTelemetry.rotorRpm}
          rangeToFastbackYards={currentSortie.defaultTelemetry.rangeToFastbackYards}
          carTirePsi={currentSortie.defaultTelemetry.carTirePsi}
          onPlaySquelch={playRadioSquelch}
          onBroadcastLog={handleTriggerDirective}
        />
      )}

      {/* VIEW PANEL 3: GROUND SUPPORT EQUIPMENT BAY */}
      {heloSubTab === 'gse' && (
        <HeloGseBay
          onPlaySquelch={playRadioSquelch}
          onBroadcastLog={handleTriggerDirective}
        />
      )}

      {/* VIEW PANEL 4: TRIPLE-SPECIALIST CREW ROLES */}
      {heloSubTab === 'crew' && (
        <>
          {/* Three Crew Specialists Selection Bar */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest text-slate-400">
                13ADC Triple-Specialist Pit Crew &amp; Maintenance Workflow
              </h2>
              <span className="text-xs text-slate-500 font-mono">Select specialist to inspect role</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {crewData.map((crew) => {
                const isSelected = crew.id === selectedCrewId;
                return (
                  <button
                    key={crew.id}
                    onClick={() => {
                      setSelectedCrewId(crew.id);
                      playRadioSquelch();
                    }}
                    className={`p-4 rounded-xl text-left transition-all border cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#121824] border-white/30 shadow-xl ring-2 ring-amber-400/40'
                        : 'bg-[#0B0F17] border-white/5 hover:border-white/20 hover:bg-[#0E1420]'
                    }`}
                  >
                    {/* Top Accent Strip with Flight Suit Color */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: crew.flightSuitHex }}
                    />

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase text-white"
                          style={{ backgroundColor: `${crew.flightSuitHex}40`, border: `1px solid ${crew.flightSuitHex}` }}
                        >
                          {crew.callsign}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          Hair: {crew.hairColor}
                        </span>
                      </div>

                      <h3 className="font-['Barlow_Condensed',sans-serif] text-xl font-bold uppercase tracking-wide text-white">
                        {crew.name}
                      </h3>

                      <div className="text-xs font-semibold text-amber-400 mb-2">
                        {crew.roleTitle}
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {crew.station}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">{crew.specialtyDomain}</span>
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-amber-400' : 'text-slate-500'
                        }`}
                      >
                        {isSelected ? 'ACTIVE VIEW' : 'INSPECT →'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Crew Specialist Deep-Dive Workspace */}
          <div className="bg-[#0B0F17] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-mono text-xl font-bold shadow-lg"
                  style={{ backgroundColor: selectedCrew.flightSuitHex }}
                >
                  {selectedCrew.callsign.includes('RED') ? 'RED' : selectedCrew.callsign.includes('GREEN') ? 'GRN' : 'GLD'}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                    <span className="text-amber-400 font-bold uppercase">{selectedCrew.callsign}</span>
                    <span>·</span>
                    <span>Flight Suit: {selectedCrew.flightSuitColor}</span>
                    <span>·</span>
                    <span className="text-cyan-400">{selectedCrew.specialtyDomain}</span>
                  </div>
                  <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl sm:text-3xl font-extrabold uppercase text-white">
                    {selectedCrew.name} — {selectedCrew.roleTitle}
                  </h3>
                  <div className="text-xs font-mono text-emerald-400 mt-0.5">
                    Clearance: {selectedCrew.clearance}
                  </div>
                </div>
              </div>

              {/* Specialist Radio Quote */}
              <div className="bg-[#080C13] border border-amber-500/20 rounded-xl p-3.5 max-w-md text-xs font-mono text-amber-200/90 italic">
                {selectedCrew.quote}
              </div>
            </div>

            {/* Live Telemetry Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {selectedCrew.telemetryMetrics.map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-[#080C13] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    {metric.label}
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1 flex items-baseline gap-1">
                    {metric.value}
                    {metric.unit && (
                      <span className="text-[11px] font-sans text-slate-400 font-normal">
                        {metric.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>OPTIMAL</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Two-Column Breakdown: Operational Responsibilities & Staged Equipment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Operational Workflow Responsibilities */}
              <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>13ADC Maintenance Workflow Responsibilities</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedCrew.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-amber-400 font-bold mt-0.5">›</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Staged Tooling & Equipment Suite */}
              <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span>Assigned Aircraft &amp; Trackside Tooling</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {selectedCrew.equipment.map((eq, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="truncate">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Interactive Task Checkpoints */}
            <div className="bg-[#080C13] border border-white/5 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Active Stage Tasks &amp; Protocol Benchmarks (Click to toggle status)
                </h4>
                <span className="text-[11px] font-mono text-slate-500">Live Stage Checklist</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {selectedCrew.activeTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isActive = task.status === 'ACTIVE';

                  return (
                    <button
                      key={task.id}
                      onClick={() => handleToggleTaskStatus(selectedCrew.id, task.id)}
                      className={`p-3 rounded-lg text-left transition-all border cursor-pointer flex flex-col justify-between ${
                        isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                          : isActive
                          ? 'bg-amber-950/20 border-amber-500/50 text-amber-200'
                          : 'bg-white/[0.02] border-white/10 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isActive
                              ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          {task.status}
                        </span>
                        {task.timeBenchmark && (
                          <span className="text-[10px] font-mono text-slate-400">
                            {task.timeBenchmark}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-white mb-1">{task.name}</div>
                      <div className="text-[11px] text-slate-300 leading-snug">{task.detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick-Action Hot-Pit Directives Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() =>
                    handleTriggerDirective(
                      'Nitrogen Line Boost',
                      'High-pressure manifold pressurized to 150 PSI for 4-corner air jacks.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>⚡ Engage 150 PSI Air Jacks</span>
                </button>

                <button
                  onClick={() =>
                    handleTriggerDirective(
                      'Dry-Break Fuel Flow',
                      '50 GPM race fuel delivery engaged with secondary vapor recovery.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>⛽ Start 50 GPM Fuel Umbilical</span>
                </button>

                <button
                  onClick={() =>
                    handleTriggerDirective(
                      'Impact Torque Check',
                      'Snap-on 350 lb-ft torque multiplier verified on 35-spline wheel hubs.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>🔧 Deploy Torque Multiplier</span>
                </button>

                <button
                  onClick={() =>
                    handleTriggerDirective(
                      'Go/No-Go Launch Signal',
                      'Green flag transmission sent to Fastback #13. Driver cleared for W.O.T.'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold border border-red-400 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-red-600/30"
                >
                  <span>🏁 Transmit Launch Clearance</span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-500 self-center sm:self-auto">
                13ADC ATO PEC SL USA 00711617
              </div>
            </div>

            {/* Live Action Directive Log */}
            {hotPitActionLog.length > 0 && (
              <div className="bg-[#080C13] border border-white/5 rounded-xl p-3 font-mono text-xs flex flex-col gap-1.5">
                <span className="text-[10px] uppercase text-slate-500 font-bold">
                  Recent Hot-Pit Action Directives:
                </span>
                {hotPitActionLog.map((log, i) => (
                  <div key={i} className="text-slate-300 text-[11px] flex items-center gap-2">
                    <span className="text-amber-400">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* MH-55 Aircraft Technical Specifications Banner */}
      <div className="bg-[#080C13] border border-white/10 rounded-2xl p-5 text-xs font-mono text-slate-400 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white font-bold uppercase text-sm font-['Barlow_Condensed',sans-serif] tracking-wider">
            <span className="text-amber-400">{MH55_AIRCRAFT_SPECS.designation}</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400">{MH55_AIRCRAFT_SPECS.raceNumber}</span>
          </div>
          <div>Powerplant: <span className="text-slate-200">{MH55_AIRCRAFT_SPECS.powerplant}</span></div>
          <div>Transmission: <span className="text-slate-200">{MH55_AIRCRAFT_SPECS.mainTransmission}</span></div>
          <div>Payload: <span className="text-slate-200">{MH55_AIRCRAFT_SPECS.auxiliaryToolPayload}</span></div>
        </div>

        <div className="lg:text-right flex flex-col gap-1 shrink-0">
          <div>Authority: <span className="text-amber-300 font-bold">{MH55_AIRCRAFT_SPECS.authority}</span></div>
          <div>NAICS: <span className="text-cyan-300">{MH55_AIRCRAFT_SPECS.naicsCode}</span> · PEC: <span className="text-slate-200">{MH55_AIRCRAFT_SPECS.pecSecurityCert}</span></div>
          <div className="text-slate-500">Super Project EXCALIBUR · Cryptographic Provenance Verified</div>
        </div>
      </div>
    </div>
  );
};
