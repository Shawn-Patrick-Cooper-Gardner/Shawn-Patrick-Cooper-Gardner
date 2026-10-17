import React, { useState } from 'react';

interface BlueprintDetail {
  id: string;
  title: string;
  subtitle: string;
  material: string;
  measurements: string;
  notes: string;
  points: { label: string; x: number; y: number; detail: string }[];
}

export const BlueprintGallery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chassis' | 'suspension' | 'induction' | 'footprint'>('chassis');
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  const blueprints: Record<'chassis' | 'suspension' | 'induction' | 'footprint', BlueprintDetail> = {
    chassis: {
      id: 'chassis',
      title: '4130 Chromoly Tube-Frame Roll Cage Architecture',
      subtitle: 'Full Triangulated Safety Cell & Chassis Reinforcement',
      material: '1.75" x 0.120" DOM 4130 Seamless Chromoly Tubing',
      measurements: 'Full perimeter cage · 6-point floor tie-ins · Dual roof diagonals',
      notes: 'TIG-welded using ER70S-2 rod with integrated engine bay shock towers and rear subframe bypass hoops.',
      points: [
        { label: 'A-Pillar Halo Gusset', x: 260, y: 110, detail: '1/8" dimple-died gusset linking roof halo to front cowl for rollover crush resistance.' },
        { label: 'Door Bar X-Brace', x: 380, y: 190, detail: 'Triangulated side-intrusion protection clearing competition bucket seats.' },
        { label: 'Rear Shock Hoop Node', x: 580, y: 120, detail: 'Integrated 2.0" crossover tube stabilizing Fox 3.5 bypass shock upper mounts.' },
        { label: 'Subframe Interlink', x: 180, y: 220, detail: 'Ties front radiator support directly into main frame rails to eliminate torsional flex.' },
      ],
    },
    suspension: {
      id: 'suspension',
      title: 'Equal-Length Long-Travel Front Beam Geometry',
      subtitle: 'Desert Whoop & Wash Articulation System',
      material: '4130 Fabricated Boxed Plate with Billet Snouts',
      measurements: '22 Inches Measured Wheel Travel · 0-Degree Camber Change at Mid-Stroke',
      notes: 'Custom boxed arms valved to soak up 3-foot square-edge G-outs at 85+ MPH without chassis bottoming.',
      points: [
        { label: 'Fox 3.0 Bypass Mount', x: 320, y: 90, detail: 'Position-sensitive internal bypass damping with 3 compression and 2 rebound stages.' },
        { label: 'Billet 2.5" Snout', x: 490, y: 220, detail: '4340 heat-treated steel spindle snout with Timken tapered roller bearings.' },
        { label: 'Hydraulic Bump Stop Pad', x: 280, y: 160, detail: '2.0" stroke King hydraulic bump stop contact point for harsh bottom-out cushion.' },
        { label: 'Chromoly Heim Pivot', x: 160, y: 210, detail: '1-inch FK heavy-duty spherical rod ends with misalignment spacers.' },
      ],
    },
    induction: {
      id: 'induction',
      title: 'Roots 8-71 Positive Displacement Supercharger Induction',
      subtitle: 'Forced Induction Plenary & Dual Holley Fuel Delivery',
      material: 'Billet 6061-T6 Aluminum Casing · Teflon-Stripped 3-Lobe Rotors',
      measurements: '12 PSI Boost @ 1:1.15 Pulley Ratio · 1,500 Total CFM Capacity',
      notes: 'Twin 750 CFM Holley Double-Pumpers sitting on high-rise blower base with progressive throttle linkage.',
      points: [
        { label: 'Roots Billet Casing', x: 370, y: 150, detail: 'Polished positive displacement supercharger generating instantaneous off-idle boost.' },
        { label: 'Dual Holley 750 CFM Carbs', x: 370, y: 80, detail: 'Dual 4-barrel carburetors with high-flow needle and seats and mechanical secondary linkage.' },
        { label: '3-Inch Gilmer Drive Belt', x: 510, y: 180, detail: 'Kevlar-reinforced cogged drive belt with billet manual tensioner pulley.' },
        { label: 'Burst Panel Safety Plate', x: 260, y: 170, detail: 'Spring-loaded intake backfire relief valve preventing manifold overpressure.' },
      ],
    },
    footprint: {
      id: 'footprint',
      title: 'Desert Track Width & Wheelbase Footprint',
      subtitle: 'High-Speed Stability & Stance Dimensions',
      material: 'Fabricated Track Stance & Weight Distribution',
      measurements: 'Wheelbase: 112.5" · Front Track: 84.0" · Rear Track: 82.5" · Belly Clearance: 19.5"',
      notes: 'Wide stance ensures cornering stability in high-G berm berms and minimizes rollover risk in deep ruts.',
      points: [
        { label: 'Front Track: 84.0"', x: 190, y: 140, detail: 'Extended track width provides roll resistance on aggressive off-camber desert trails.' },
        { label: 'Wheelbase: 112.5"', x: 370, y: 240, detail: 'Optimal length balancing high-speed whoop tracking and tight sand wash agility.' },
        { label: '42-Gal Fuel Cell Bay', x: 550, y: 140, detail: 'Placed over rear axle to keep center of gravity balanced across fuel burn stages.' },
      ],
    },
  };

  const currentBp = blueprints[activeTab];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            Engineering Blueprints · Fabrication Schematics
          </div>
          <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
            Mechanical Blueprint & Chassis Schematics
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mt-1">
            Detailed technical drawings of the 4130 chromoly tube chassis, equal-length long-travel suspension, and Roots 8-71 blower layout.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-[#121824] p-1 rounded-lg border border-white/10">
          {(['chassis', 'suspension', 'induction', 'footprint'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedPoint(null);
              }}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-400 text-black font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Drawing Canvas Box */}
      <div className="bg-[#0A1220] border-2 border-cyan-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl flex flex-col gap-6">
        {/* Subtle Engineering Grid Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00E5FF 1px, transparent 1px), linear-gradient(to bottom, #00E5FF 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Blueprint Title Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-500/30 pb-4 relative z-10 gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
              Drawing DWG: EX-1970-CORE-{currentBp.id.toUpperCase()} · Revision 4.2
            </div>
            <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase text-white tracking-wide">
              {currentBp.title}
            </h3>
            <div className="text-xs text-slate-300 font-mono mt-0.5">
              {currentBp.subtitle}
            </div>
          </div>
          <div className="text-right text-xs font-mono text-cyan-300/80">
            Scale: 1:10 Engineering CAD · Boulder City Fab
          </div>
        </div>

        {/* SVG Schematic Drawing */}
        <div className="relative aspect-[16/9] w-full bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden flex items-center justify-center p-4">
          <svg
            viewBox="0 0 760 320"
            className="w-full h-full text-cyan-400"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.25))' }}
          >
            {/* Schematic Geometry Drawing per category */}
            {activeTab === 'chassis' && (
              <g stroke="#00E5FF" strokeWidth="2.5" fill="none">
                {/* Main Chassis rails */}
                <path d="M 80 240 L 220 230 L 520 230 L 680 240" />
                <path d="M 120 210 L 240 210 L 500 210 L 640 210" strokeWidth="1.5" />
                {/* Front Bumper & Subframe */}
                <path d="M 80 240 L 60 180 L 140 160 L 220 230" />
                <path d="M 60 180 L 110 140 L 180 140 L 240 210" />
                {/* Roll Cage A-Pillar, Roof Halo, B-Pillar */}
                <path d="M 220 210 L 270 90 L 460 90 L 560 210" strokeWidth="3" />
                <path d="M 270 90 L 460 90" strokeWidth="3.5" />
                {/* Diagonal Windshield Support */}
                <path d="M 220 210 L 360 90" strokeDasharray="6 4" strokeWidth="1.5" />
                {/* B-Pillar & Main Hoop */}
                <path d="M 440 90 L 440 220" strokeWidth="3" />
                <path d="M 270 90 L 440 220" strokeWidth="2" strokeDasharray="4 4" />
                {/* Door X-Brace */}
                <path d="M 280 210 L 430 140" strokeWidth="2" />
                <path d="M 280 140 L 430 210" strokeWidth="2" />
                {/* Rear Shock Hoops & Cage Stanchions */}
                <path d="M 460 90 L 590 130 L 620 230" strokeWidth="2.5" />
                <path d="M 440 160 L 590 130" strokeWidth="2" />
                {/* Center of Gravity Marker */}
                <circle cx="370" cy="190" r="14" stroke="#F59E0B" strokeWidth="2" fill="none" />
                <path d="M 370 176 L 370 204 M 356 190 L 384 190" stroke="#F59E0B" strokeWidth="2" />
              </g>
            )}

            {activeTab === 'suspension' && (
              <g stroke="#00E5FF" strokeWidth="2.5" fill="none">
                {/* Frame Center Crossmember */}
                <rect x="140" y="80" width="80" height="150" stroke="#00E5FF" strokeWidth="2" />
                {/* Upper & Lower Control Arms */}
                <path d="M 200 110 L 480 90 L 500 130 L 200 130 Z" strokeWidth="2" />
                <path d="M 200 180 L 510 210 L 490 240 L 200 210 Z" strokeWidth="2.5" />
                {/* Spindle & Hub */}
                <circle cx="500" cy="160" r="28" stroke="#F59E0B" strokeWidth="3" />
                <path d="M 500 110 L 500 210" strokeWidth="3.5" />
                {/* Coilover Shock Cylinder & Reservoir */}
                <line x1="310" y1="50" x2="430" y2="190" stroke="#FFFFFF" strokeWidth="4" />
                <circle cx="310" cy="50" r="7" fill="#00E5FF" />
                <circle cx="430" cy="190" r="7" fill="#00E5FF" />
                {/* Bypass Tubes */}
                <path d="M 340 90 Q 370 70 380 120" stroke="#F59E0B" strokeWidth="1.5" />
                <path d="M 360 120 Q 390 100 400 150" stroke="#F59E0B" strokeWidth="1.5" />
                {/* Articulation Arc */}
                <path d="M 540 80 A 100 100 0 0 1 540 240" stroke="#00E5FF" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="560" y="165" fill="#00E5FF" fontSize="12" fontFamily="monospace">22" TRAVEL ARC</text>
              </g>
            )}

            {activeTab === 'induction' && (
              <g stroke="#00E5FF" strokeWidth="2" fill="none">
                {/* Engine V-Block Silhouette */}
                <path d="M 220 260 L 370 200 L 520 260 L 480 300 L 260 300 Z" strokeWidth="2.5" />
                {/* Intake Manifold Plenum */}
                <rect x="290" y="160" width="160" height="40" stroke="#00E5FF" strokeWidth="2" />
                {/* Roots 8-71 Supercharger Case */}
                <rect x="280" y="100" width="180" height="60" rx="8" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="330" cy="130" r="20" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="410" cy="130" r="20" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
                {/* Dual Holley Carburetors */}
                <rect x="300" y="50" width="60" height="50" stroke="#00E5FF" strokeWidth="2" />
                <rect x="380" y="50" width="60" height="50" stroke="#00E5FF" strokeWidth="2" />
                {/* Velocity Air Scoops */}
                <path d="M 290 50 L 270 20 L 470 20 L 450 50 Z" stroke="#F59E0B" strokeWidth="2.5" />
                {/* Gilmer Drive Belt */}
                <ellipse cx="500" cy="130" rx="14" ry="24" stroke="#FFFFFF" strokeWidth="3" />
                <ellipse cx="500" cy="270" rx="20" ry="20" stroke="#FFFFFF" strokeWidth="3" />
                <line x1="486" y1="130" x2="480" y2="270" stroke="#FFFFFF" strokeWidth="2.5" />
                <line x1="514" y1="130" x2="520" y2="270" stroke="#FFFFFF" strokeWidth="2.5" />
              </g>
            )}

            {activeTab === 'footprint' && (
              <g stroke="#00E5FF" strokeWidth="2" fill="none">
                {/* Vehicle Outline Top-down */}
                <path d="M 120 70 L 240 60 L 500 60 L 620 70 L 640 160 L 620 250 L 500 260 L 240 260 L 120 250 L 100 160 Z" strokeWidth="2.5" />
                {/* Four Tires */}
                <rect x="150" y="30" width="80" height="36" rx="4" fill="#121824" stroke="#F59E0B" strokeWidth="2.5" />
                <rect x="150" y="254" width="80" height="36" rx="4" fill="#121824" stroke="#F59E0B" strokeWidth="2.5" />
                <rect x="510" y="34" width="80" height="36" rx="4" fill="#121824" stroke="#F59E0B" strokeWidth="2.5" />
                <rect x="510" y="250" width="80" height="36" rx="4" fill="#121824" stroke="#F59E0B" strokeWidth="2.5" />
                {/* Track Width Dimension Arrows */}
                <line x1="190" y1="48" x2="190" y2="272" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="200" y="165" fill="#FFFFFF" fontSize="11" fontFamily="monospace">FRONT TRACK: 84.0"</text>
                {/* Wheelbase Dimension Arrow */}
                <line x1="190" y1="304" x2="550" y2="304" stroke="#FFFFFF" strokeWidth="1.5" />
                <text x="330" y="318" fill="#FFFFFF" fontSize="11" fontFamily="monospace">WHEELBASE: 112.5"</text>
              </g>
            )}

            {/* Interactive Callout Points */}
            {currentBp.points.map((pt) => {
              const isSelected = selectedPoint === pt.label;
              return (
                <g
                  key={pt.label}
                  className="cursor-pointer"
                  onClick={() => setSelectedPoint(isSelected ? null : pt.label)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 10 : 8}
                    fill={isSelected ? '#F59E0B' : '#00E5FF'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all hover:scale-125"
                  />
                  <text
                    x={pt.x + 12}
                    y={pt.y - 8}
                    fill={isSelected ? '#F59E0B' : '#FFFFFF'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pt.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Callout Popover / Explanation */}
        {selectedPoint ? (
          <div className="bg-black/60 border border-amber-400/40 rounded-lg p-4 relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Point Callout: {selectedPoint}
              </span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-slate-200">
              {currentBp.points.find((p) => p.label === selectedPoint)?.detail}
            </p>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-cyan-300/70 text-center relative z-10">
            Click any schematic node for detailed engineering and fabrication specifications.
          </div>
        )}

        {/* Blueprint Specs Footer Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-cyan-500/20 pt-4 relative z-10 text-xs font-mono">
          <div>
            <div className="text-slate-400 uppercase">Material Spec</div>
            <div className="text-white mt-0.5">{currentBp.material}</div>
          </div>
          <div>
            <div className="text-slate-400 uppercase">Key Tolerance</div>
            <div className="text-cyan-400 mt-0.5">{currentBp.measurements}</div>
          </div>
          <div>
            <div className="text-slate-400 uppercase">Engineering Notes</div>
            <div className="text-slate-300 mt-0.5">{currentBp.notes}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
