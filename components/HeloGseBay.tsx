import React, { useState } from 'react';
import { GroundSupportEquipment, GSE_INVENTORY } from '../data/heloCrew';

interface HeloGseBayProps {
  onPlaySquelch?: () => void;
  onBroadcastLog?: (action: string, detail: string) => void;
}

export const HeloGseBay: React.FC<HeloGseBayProps> = ({
  onPlaySquelch,
  onBroadcastLog,
}) => {
  const [gseList, setGseList] = useState<GroundSupportEquipment[]>(GSE_INVENTORY);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'POWER & START', 'PNEUMATICS', 'REFUELING', 'TOOLING & DIAG', 'LIFT & EXTRACTION'];

  const filteredGse = selectedCategory === 'ALL'
    ? gseList
    : gseList.filter((g) => g.category === selectedCategory);

  const handleToggleGse = (id: string) => {
    onPlaySquelch?.();
    setGseList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus =
          item.status === 'DEPLOYED'
            ? 'ACTIVE'
            : item.status === 'ACTIVE'
            ? 'STAGED'
            : 'DEPLOYED';

        onBroadcastLog?.(
          item.quickActionLabel,
          `${item.name} status transitioned to [${nextStatus}].`
        );
        return { ...item, status: nextStatus };
      })
    );
  };

  const getOperatorDetails = (operatorId: string) => {
    if (operatorId === 'crew-blossom-red') {
      return { name: 'Blossom', color: '#DC2626', badge: 'RED-1' };
    }
    if (operatorId === 'crew-buttercup-brunette') {
      return { name: 'Buttercup', color: '#16A34A', badge: 'GREEN-2' };
    }
    return { name: 'Bubbles', color: '#EAB308', badge: 'GOLD-3' };
  };

  return (
    <div className="bg-[#0B0F17] border border-cyan-800/50 rounded-2xl p-5 shadow-2xl flex flex-col gap-6 font-mono text-slate-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">MH-55 Rotary Airborne Pit Ground-Support Equipment (GSE)</span>
            <span className="text-slate-600">·</span>
            <span>7 PRIMARY UNITS</span>
          </div>
          <h3 className="text-xl font-bold uppercase text-white font-['Barlow_Condensed',sans-serif] tracking-wider mt-0.5">
            Heavy Tactical Support Equipment Bay &amp; Field Umbilicals
          </h3>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded transition uppercase cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-400 text-black font-bold'
                  : 'bg-[#080C13] border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GSE Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGse.map((gse) => {
          const op = getOperatorDetails(gse.operatorId);
          const isDeployed = gse.status === 'DEPLOYED';
          const isActive = gse.status === 'ACTIVE';

          return (
            <div
              key={gse.id}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isDeployed
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                  : isActive
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-[#080C13] border-white/5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {gse.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isDeployed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {gse.status}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {gse.name}
                </h4>

                <div className="text-[11px] text-cyan-300/90 font-mono mb-2 bg-[#050810] p-2 rounded border border-white/5">
                  <span className="text-slate-500 block text-[9px] uppercase">Technical Specs:</span>
                  {gse.specs}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {gse.operationalDetail}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: op.color }}
                  />
                  <span className="text-slate-400">{op.name}</span>
                  <span className="text-slate-500 text-[10px]">({op.badge})</span>
                </div>

                <button
                  onClick={() => handleToggleGse(gse.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                >
                  {gse.quickActionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
