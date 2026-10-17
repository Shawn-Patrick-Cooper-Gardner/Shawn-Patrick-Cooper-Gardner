import React from 'react';

export const RaceHeritage: React.FC = () => {
  const races = [
    {
      name: 'The Mint 400',
      subtitle: 'The Great American Off-Road Race',
      location: 'Mojave Desert · Primm & Jean Dry Lake Beds, Nevada',
      distance: '400 Miles',
      terrain: 'Punishing volcanic washboard, deep silt beds, and dry lake bed flats.',
      specs: 'Requires severe cooling capacity, double beadlocks, and 24+ inches of bypass suspension.',
    },
    {
      name: 'Best in the Desert: Vegas to Reno',
      subtitle: 'The Longest Off-Road Race in the United States',
      location: 'Nevada Basin & Range · Beatty to Reno, Nevada',
      distance: '550 Miles',
      terrain: 'High-speed gravel wash roads, rocky mountain passes up to 7,500 ft, and endless alkali flats.',
      specs: 'Demands tall final drive gearing (4.10–4.56), auxiliary fuel cells, and high-wattage night illumination.',
    },
    {
      name: 'SCORE Baja 1000',
      subtitle: 'The Peninsula Endurance Classic',
      location: 'Baja California Peninsula · Ensenada to La Paz, Mexico',
      distance: '1,000+ Miles Non-Stop',
      terrain: 'Coastal cliffs, deep Baja silt beds, whoop sections, and remote desert washes.',
      specs: 'Full 4130 chromoly roll cage, dual dry-break fuel fillers, and backup ignition coils.',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-10">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
          Endurance Heritage · Desert Racing Tradition
        </div>
        <h2 className="font-['Barlow_Condensed',sans-serif] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
          American Desert Off-Road Heritage
        </h2>
        <p className="text-slate-400 text-sm max-w-2xl mt-1">
          From the roaring big-block muscle conversions of the late 1960s to modern unlimited desert pre-runners, these courses demand unbreakable mechanical engineering.
        </p>
      </div>

      {/* 3 Race Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {races.map((race) => (
          <div
            key={race.name}
            className="bg-[#121824] border border-white/10 rounded-xl p-6 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 mb-1">
                {race.distance}
              </div>
              <h3 className="font-['Barlow_Condensed',sans-serif] text-2xl font-bold uppercase tracking-tight text-white">
                {race.name}
              </h3>
              <div className="text-xs text-slate-400 mt-1">
                {race.subtitle}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-3">
                {race.location}
              </div>
              <div className="h-px bg-white/5 my-4" />
              <p className="text-xs text-slate-300 leading-relaxed">
                {race.terrain}
              </p>
            </div>

            <div className="bg-black/40 rounded-lg p-3 border border-white/5 text-[11px] font-mono text-amber-300/80">
              Tech Req: {race.specs}
            </div>
          </div>
        ))}
      </div>

      {/* Garage Craftsmanship Tribute Section */}
      <div className="bg-[#121824] border border-white/10 rounded-xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="text-xs font-mono uppercase tracking-widest text-amber-500 mb-1">
            Garage Philosophy · The Human Element
          </div>
          <h3 className="font-['Barlow_Condensed',sans-serif] text-3xl font-bold uppercase tracking-tight text-white mb-3">
            Honoring American Mechanical Craft
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Custom off-road builds are more than machines—they represent late nights in the home shop, grease on the knuckles, and the bond between fathers, sons, and mentors passing down the art of the wrench.
          </p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Whether tuning the progressive throttle linkage on dual Holley carburetors, timing an engine with a timing light and a distributor wrench, or fabricating custom long-travel I-beams, real horsepower is born from hands-on dedication to the machine.
          </p>
        </div>

        <div className="w-full md:w-80 bg-black/50 border border-white/10 rounded-xl p-5 flex flex-col gap-3 font-mono text-xs">
          <div className="text-amber-400 font-bold uppercase tracking-wider border-b border-white/10 pb-2">
            Build Principles
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Air Induction:</span>
            <span className="text-white">Roots Positive Displacement</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Fuel Curve:</span>
            <span className="text-white">Mechanical Progressive Linkage</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Spark Delivery:</span>
            <span className="text-white">High-Amp Magneto</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Drivetrain:</span>
            <span className="text-white">Full-Floating 9-Inch</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Tires:</span>
            <span className="text-white">True Mechanical Beadlock</span>
          </div>
        </div>
      </div>
    </div>
  );
};
