import React, { useState } from 'react';
import { Vehicle } from '../data/vehicles';
import { TuningConfig } from './TuningBench';

interface SpecSheetModalProps {
  vehicle: Vehicle;
  tuning: TuningConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const SpecSheetModal: React.FC<SpecSheetModalProps> = ({
  vehicle,
  tuning,
  isOpen,
  onClose,
}) => {
  const [teamName, setTeamName] = useState('C.O.R.E. Desert Racing');
  const [customRaceNumber, setCustomRaceNumber] = useState(vehicle.raceNumber);
  const [driverName, setDriverName] = useState('S. Gardner');
  const [coDriverName, setCoDriverName] = useState('Navigator / Pit Lead');
  const [liveryColor, setLiveryColor] = useState<'black' | 'sand' | 'crimson' | 'steel'>('black');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Compute live tuned HP & Torque
  const boostBonus = (tuning.boostPsi - 12) * 22;
  const timingBonus = (tuning.timingAdvanceDeg - 34) * 6;
  const octaneBonus = tuning.raceFuelOctane === 110 ? 30 : tuning.raceFuelOctane === 100 ? 10 : -20;
  const tunedHp = vehicle.baseHp + boostBonus + timingBonus + octaneBonus;
  const tunedTorque = vehicle.baseTorque + Math.round((boostBonus + timingBonus + octaneBonus) * 0.92);

  const exportSpecText = () => {
    const spec = `=====================================================
DESERT RACING GARAGE - ENGINEERING BUILD SPEC SHEET
=====================================================
Vehicle: ${vehicle.name} (${vehicle.year})
Team: ${teamName}
Race Number: #${customRaceNumber}
Driver / Navigator: ${driverName} / ${coDriverName}
Livery Theme: ${liveryColor.toUpperCase()}

POWERTRAIN & INDUCTION:
- Displacement: ${vehicle.displacement}
- Induction: ${vehicle.induction}
- Ignition: ${vehicle.ignition}
- Exhaust: ${vehicle.exhaust}
- Calibrated Output: ${tunedHp} BHP @ ${tuning.boostPsi} PSI Boost
- Calibrated Torque: ${tunedTorque} LB-FT
- Air-Fuel Ratio: ${tuning.airFuelRatio}:1
- Timing Advance: ${tuning.timingAdvanceDeg} deg BTC
- Fuel Blend: ${tuning.raceFuelOctane} Octane

CHASSIS & RUNNING GEAR:
- Transmission: ${vehicle.transmission}
- Rear Axle: ${vehicle.rearEnd}
- Front Suspension: ${vehicle.frontSuspension}
- Rear Suspension: ${vehicle.rearSuspension}
- Tires: ${vehicle.tires} (Pressure: ${tuning.tirePsi} PSI)
- Weight: ${vehicle.weightLbs} LBS
- Fuel Cell: ${vehicle.fuelCapacity}

SANCTIONED ENDURANCE EVENTS:
${vehicle.enduranceRaces.map((r) => `- ${r}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(spec).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0E131F] border border-white/20 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#0E131F] z-10">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-amber-500">
              Technical Specification Docket
            </div>
            <h2 className="font-['Barlow_Condensed',sans-serif] text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              {vehicle.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6 text-sm">
          {/* Custom Livery & Team Customizer Strip */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            <div className="flex-1">
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Racing Team Designation
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="w-28">
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Race No.
              </label>
              <input
                type="text"
                value={customRaceNumber}
                onChange={(e) => setCustomRaceNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400 text-center font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                Livery Finish
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'black', color: 'bg-black border-white/30' },
                  { id: 'sand', color: 'bg-amber-600 border-amber-400' },
                  { id: 'crimson', color: 'bg-red-700 border-red-500' },
                  { id: 'steel', color: 'bg-slate-500 border-slate-300' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setLiveryColor(item.id as typeof liveryColor)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${item.color} ${
                      liveryColor === item.id ? 'scale-125 ring-2 ring-amber-400' : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Select ${item.id} livery`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Spec Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-black/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold border-b border-white/5 pb-1">
                Powertrain & Architecture
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Displacement:</span>
                <span className="text-white font-mono text-right">{vehicle.displacement}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Induction:</span>
                <span className="text-white font-mono text-right">{vehicle.induction}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Ignition System:</span>
                <span className="text-white font-mono text-right">{vehicle.ignition}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-400">Exhaust Layout:</span>
                <span className="text-white font-mono text-right">{vehicle.exhaust}</span>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 rounded-lg p-4 flex flex-col gap-2">
              <div className="text-xs font-mono uppercase text-amber-400 font-bold border-b border-white/5 pb-1">
                Chassis & Suspension
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Front Travel:</span>
                <span className="text-white font-mono text-right">{vehicle.frontSuspension}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Rear Geometry:</span>
                <span className="text-white font-mono text-right">{vehicle.rearSuspension}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 text-xs">
                <span className="text-slate-400">Tires & Beadlocks:</span>
                <span className="text-white font-mono text-right">{vehicle.tires}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-slate-400">Fuel Storage:</span>
                <span className="text-white font-mono text-right">{vehicle.fuelCapacity}</span>
              </div>
            </div>
          </div>

          {/* Endurance Race Sanctioning */}
          <div className="bg-black/30 border border-white/5 rounded-lg p-4">
            <div className="text-xs font-mono uppercase text-amber-400 font-bold mb-2">
              Sanctioned Desert Races
            </div>
            <div className="flex flex-wrap gap-2">
              {vehicle.enduranceRaces.map((race) => (
                <div
                  key={race}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                >
                  {race}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[#0E131F]">
          <button
            onClick={exportSpecText}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>{copied ? 'Copied To Clipboard!' : 'Copy Build Docket'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
