import React, { useState } from 'react';
import { Vehicle, VehicleComponent } from '../data/vehicles';

interface VehicleStageProps {
  vehicle: Vehicle;
  allVehicles: Vehicle[];
  onSelectVehicle: (id: string) => void;
  onOpenSpecs: () => void;
  tuningHpDelta: number;
  onRevStart: () => void;
  onRevEnd: () => void;
  isRevving: boolean;
  soundEnabled: boolean;
}

export const VehicleStage: React.FC<VehicleStageProps> = ({
  vehicle,
  allVehicles,
  onSelectVehicle,
  onOpenSpecs,
  tuningHpDelta,
  onRevStart,
  onRevEnd,
  isRevving,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<VehicleComponent | null>(null);
  const [viewMode, setViewMode] = useState<'track' | 'paddock' | 'engine' | 'night'>('track');
  const [lightbarActive, setLightbarActive] = useState<boolean>(true);

  const currentDisplayHp = vehicle.baseHp + tuningHpDelta;

  // Select image based on view mode
  const displayImage =
    viewMode === 'night'
      ? '/src/assets/images/fastback_night_spotlight_1792219160104.jpg'
      : viewMode === 'paddock'
      ? '/src/assets/images/garage_desert_paddock_1792218543411.jpg'
      : viewMode === 'engine'
      ? '/src/assets/images/blown_v8_racing_engine_1792218544783.jpg'
      : vehicle.image;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Vehicle Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            <span>Class: {vehicle.class}</span>
            <span aria-hidden="true">·</span>
            <span>Race No. #{vehicle.raceNumber}</span>
            <span aria-hidden="true">·</span>
            <span>Est. {vehicle.year}</span>
          </div>
          <h1 className="font-['Barlow_Condensed',sans-serif] text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white">
            {vehicle.name}
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            {vehicle.tagline}
          </p>
        </div>

        {/* Live Performance Figures */}
        <div className="flex items-center gap-6 bg-white/[0.03] border border-white/10 rounded-lg p-3 sm:px-5">
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Total Output</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 flex items-baseline gap-1">
              {currentDisplayHp}
              <span className="text-xs text-slate-400 font-sans font-normal">BHP</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Peak Torque</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white flex items-baseline gap-1">
              {vehicle.baseTorque}
              <span className="text-xs text-slate-400 font-sans font-normal">LB-FT</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-[11px] font-mono uppercase text-slate-400">Kerb Weight</div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white flex items-baseline gap-1">
              {vehicle.weightLbs}
              <span className="text-xs text-slate-400 font-sans font-normal">LBS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Viewport Card */}
      <div className="relative rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl aspect-[16/9] w-full group">
        {/* Viewport Image */}
        <img
          src={displayImage}
          alt={vehicle.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-500 ${
            viewMode === 'night' && !lightbarActive ? 'brightness-50' : 'brightness-100'
          }`}
        />

        {/* Ambient Dark Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* View Mode Switcher Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setViewMode('track')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
              viewMode === 'track' ? 'bg-amber-500 text-black shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Action Track
          </button>
          <button
            onClick={() => setViewMode('night')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
              viewMode === 'night' ? 'bg-amber-500 text-black shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Night Run (LEDs)
          </button>
          <button
            onClick={() => setViewMode('paddock')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
              viewMode === 'paddock' ? 'bg-amber-500 text-black shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Workshop Paddock
          </button>
          <button
            onClick={() => setViewMode('engine')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
              viewMode === 'engine' ? 'bg-amber-500 text-black shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Blower & Bay
          </button>
        </div>

        {/* Right Top Buttons: Throttle Rev & Lightbar Toggle */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {viewMode === 'night' && (
            <button
              onClick={() => setLightbarActive(!lightbarActive)}
              className={`px-3 py-2 rounded-lg font-['Barlow_Condensed',sans-serif] text-xs uppercase font-bold tracking-wider transition-colors border cursor-pointer ${
                lightbarActive
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-black/70 text-slate-400 border-white/10'
              }`}
            >
              {lightbarActive ? 'LED Lightbar: ON' : 'LED Lightbar: OFF'}
            </button>
          )}

          <button
            onMouseDown={onRevStart}
            onMouseUp={onRevEnd}
            onMouseLeave={onRevEnd}
            onTouchStart={onRevStart}
            onTouchEnd={onRevEnd}
            className={`px-4 py-2 rounded-lg font-['Barlow_Condensed',sans-serif] text-sm uppercase font-bold tracking-wider transition-all shadow-lg border select-none cursor-pointer flex items-center gap-2 ${
              isRevving
                ? 'bg-red-600 text-white border-red-400 scale-95 shadow-red-600/40'
                : 'bg-black/70 text-amber-300 border-amber-500/30 hover:bg-black/90'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isRevving ? 'bg-white animate-ping' : 'bg-amber-400'}`} />
            {isRevving ? 'W.O.T. Full Throttle!' : 'Hold To Rev Engine'}
          </button>
        </div>

        {/* Interactive Hotspots (Visible in Track View) */}
        {viewMode === 'track' &&
          vehicle.components.map((comp) => {
            const isSelected = activeHotspot?.id === comp.id;
            return (
              <div
                key={comp.id}
                style={{ left: `${comp.xPercent}%`, top: `${comp.yPercent}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <button
                  onClick={() => setActiveHotspot(isSelected ? null : comp)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-125 focus:outline-none cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-400 text-black border-white shadow-lg'
                      : 'bg-black/80 text-amber-400 border-amber-400/60 backdrop-blur'
                  }`}
                  aria-label={`Inspect ${comp.name}`}
                >
                  <span className="text-xs font-bold font-mono">+</span>
                </button>
              </div>
            );
          })}

        {/* Hotspot Inspection Popover */}
        {activeHotspot && viewMode === 'track' && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:max-w-md z-30 bg-[#0B0F17]/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500">
                  {activeHotspot.category} System
                </span>
                <h2 className="text-base font-bold text-white leading-tight">
                  {activeHotspot.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-slate-400 hover:text-white text-sm p-1 cursor-pointer"
                aria-label="Close component inspection"
              >
                ✕
              </button>
            </div>
            <div className="text-xs font-mono text-amber-300/90 mb-2">
              Spec: {activeHotspot.spec}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeHotspot.description}
            </p>
          </div>
        )}

        {/* Bottom Spec Kicker Bar */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3">
          <button
            onClick={onOpenSpecs}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider rounded-lg border border-white/10 transition-colors cursor-pointer"
          >
            Full Engineering Spec Sheet
          </button>
        </div>
      </div>

      {/* Vehicle Carousel Selector */}
      <div className="flex flex-col gap-3">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
          Select Garage Machine
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {allVehicles.map((v) => {
            const isActive = v.id === vehicle.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  onSelectVehicle(v.id);
                  setActiveHotspot(null);
                }}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500 shadow-md'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>#{v.raceNumber}</span>
                  <span>{v.year}</span>
                </div>
                <div className="font-['Barlow_Condensed',sans-serif] text-lg font-bold uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  {v.name}
                </div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {v.displacement}
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300">
                  <span className="text-amber-400 font-bold">{v.baseHp} HP</span>
                  <span aria-hidden="true">·</span>
                  <span>{v.baseTorque} LB-FT</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
