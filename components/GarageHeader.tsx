import React from 'react';

interface GarageHeaderProps {
  activeTab: 'showcase' | 'dyno' | 'tuning' | 'blueprints' | 'validator' | 'cartography' | 'heritage';
  onSelectTab: (tab: 'showcase' | 'dyno' | 'tuning' | 'blueprints' | 'validator' | 'cartography' | 'heritage') => void;
  onOpenConfigure: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GarageHeader: React.FC<GarageHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenConfigure,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-4 bg-[#0B0F17] border-b border-white/10 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('showcase')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-['Barlow_Condensed',sans-serif] text-2xl font-extrabold uppercase tracking-wider text-white group-hover:text-amber-500 transition-colors whitespace-nowrap">
            DESERT RACING GARAGE
          </span>
        </button>
      </div>

      {/* Zone 2: Clean single-line nav links */}
      <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-sm font-medium">
        <button
          onClick={() => onSelectTab('showcase')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'showcase'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Showcase
        </button>
        <button
          onClick={() => onSelectTab('dyno')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'dyno'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dyno Bench
        </button>
        <button
          onClick={() => onSelectTab('tuning')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'tuning'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tuning Rack
        </button>
        <button
          onClick={() => onSelectTab('blueprints')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'blueprints'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Blueprints
        </button>
        <button
          onClick={() => onSelectTab('validator')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'validator'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Payload Validator
        </button>
        <button
          onClick={() => onSelectTab('cartography')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'cartography'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          GIS & Coordinates
        </button>
        <button
          onClick={() => onSelectTab('heritage')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'heritage'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Race Heritage
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute V8 Engine Audio' : 'Start V8 Engine Audio'}
          className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            soundEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {soundEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            )}
          </svg>
          <span className="hidden sm:inline">{soundEnabled ? 'Engine Active' : 'Start Audio'}</span>
        </button>

        <button
          onClick={onOpenConfigure}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 transition-colors rounded shadow whitespace-nowrap cursor-pointer"
        >
          Configure Build
        </button>
      </div>
    </header>
  );
};
