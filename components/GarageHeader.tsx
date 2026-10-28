import React from 'react';
import { OrderState } from '../services/paypalSdkService';

export type GarageTab =
  | 'showcase'
  | 'dyno'
  | 'tuning'
  | 'blueprints'
  | 'planetary'
  | 'nighthud'
  | 'invoicing'
  | 'pittelemetry'
  | 'validator'
  | 'banksync'
  | 'cartography'
  | 'heritage'
  | 'proprietorship';

interface GarageHeaderProps {
  activeTab: GarageTab;
  onSelectTab: (tab: GarageTab) => void;
  onOpenConfigure: () => void;
  onOpenGeminiQr: () => void;
  onOpenCheckout?: () => void;
  orderStatus?: OrderState | 'IDLE';
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const GarageHeader: React.FC<GarageHeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenConfigure,
  onOpenGeminiQr,
  onOpenCheckout,
  orderStatus,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-[#0B0F17] border-b border-white/10 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSelectTab('showcase')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="font-['Barlow_Condensed',sans-serif] text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
            DESERT RACING GARAGE
          </span>
        </button>
      </div>

      {/* Zone 2: Clean single-line nav links */}
      <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 text-xs xl:text-sm font-medium overflow-x-auto">
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
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Drafting Board
        </button>
        <button
          onClick={() => onSelectTab('planetary')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1 ${
            activeTab === 'planetary'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Planetary Gearbox</span>
        </button>
        <button
          onClick={() => onSelectTab('nighthud')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'nighthud'
              ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Night HUD
        </button>
        <button
          onClick={() => onSelectTab('invoicing')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1 ${
            activeTab === 'invoicing'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Parts & Tow Invoicing</span>
        </button>
        <button
          onClick={() => onSelectTab('pittelemetry')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
            activeTab === 'pittelemetry'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pit Comms
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
          onClick={() => onSelectTab('banksync')}
          className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1 ${
            activeTab === 'banksync'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-semibold'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>BankSync & CI Provenance</span>
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
        <button
          onClick={() => onSelectTab('proprietorship')}
          className={`whitespace-nowrap transition-all cursor-pointer py-1 px-2 rounded flex items-center gap-1.5 ${
            activeTab === 'proprietorship'
              ? 'bg-amber-400/20 text-amber-300 border-b-2 border-amber-400 font-bold'
              : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-400/10'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>Proprietorship & Defense</span>
        </button>
      </nav>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Private Build & Proprietorship Badge */}
        <button
          onClick={() => onSelectTab('proprietorship')}
          title="13 Aerospace Defense Company · Shawn Patrick Cooper Gardner Sole Proprietorship"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>13ADC PRIVATE BUILD</span>
        </button>
        <button
          onClick={onOpenGeminiQr}
          title="Scan QR Code to open official Gemini portal"
          className="px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-5 5h2v3h-2v-3zm5 0h3v3h-3v-3zm-2-3h2v2h-2v-2zm-3-2h3v2h-3v-2z"/>
          </svg>
          <span className="hidden sm:inline">Gemini QR</span>
        </button>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute 400cu V8 Engine Audio' : 'Start Chain-Blown 400cu V8 Sound'}
          className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            soundEnabled
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-md shadow-amber-500/20'
              : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${soundEnabled ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {soundEnabled ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            )}
          </svg>
          <span className="hidden sm:inline">{soundEnabled ? 'Blown 400cu: Active' : 'Start 400cu Sound'}</span>
        </button>

        <button
          onClick={onOpenCheckout}
          title="Open Secure PayPal Checkout (Sandbox)"
          className="px-3 py-2 text-xs font-bold uppercase tracking-wider rounded border border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 shadow-sm shadow-amber-500/10"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>⚡ Checkout</span>
          {orderStatus && orderStatus !== 'IDLE' && (
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-black font-extrabold uppercase ml-0.5">
              {orderStatus}
            </span>
          )}
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
