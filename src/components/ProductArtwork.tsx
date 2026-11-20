import React from 'react';

interface ProductArtworkProps {
  artworkKey?: string;
  category?: string;
  brand?: string;
  label?: string;
  className?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  artworkKey = '',
  category = 'phone',
  brand = '',
  className = '',
}) => {
  const key = artworkKey || category;

  if (key === 'repair-bench') {
    return (
      <div className={`relative w-full h-full bg-[#161618] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(106,44,145,0.22),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(228,0,43,0.14),transparent_50%)]" />
        <div className="relative flex items-center gap-4">
          <div className="w-24 h-40 rounded-2xl border border-white/20 bg-gradient-to-b from-zinc-800 to-zinc-950 p-2 shadow-2xl flex flex-col justify-between">
            <div className="w-8 h-1 rounded-full bg-white/30 mx-auto" />
            <div className="grid grid-cols-2 gap-1.5 my-auto px-1">
              <div className="h-9 rounded bg-zinc-700/80 border border-white/10" />
              <div className="h-9 rounded bg-zinc-700/80 border border-white/10" />
              <div className="col-span-2 h-11 rounded bg-[#6A2C91]/30 border border-[#6A2C91]/60 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-white/60" />
              </div>
            </div>
            <div className="w-6 h-1 rounded-full bg-white/20 mx-auto" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-2.5 h-24 rounded-full bg-gradient-to-b from-zinc-300 to-zinc-600 shadow-lg" />
            <div className="w-2.5 h-10 rounded-full bg-[#E4002B]" />
          </div>
        </div>
      </div>
    );
  }

  if (key === 'telecom-desk') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-24 h-32 rounded-xl bg-[#6A2C91] text-white p-3 shadow-lg flex flex-col justify-between -rotate-3">
            <span className="text-[11px] font-bold tracking-wider uppercase">touch</span>
            <div className="w-8 h-6 rounded-sm bg-amber-300/90 border border-amber-200" />
            <span className="text-[10px] opacity-80">SIM / 5G</span>
          </div>
          <div className="w-24 h-32 rounded-xl bg-[#E4002B] text-white p-3 shadow-lg flex flex-col justify-between rotate-3">
            <span className="text-[11px] font-bold tracking-wider uppercase">alfa</span>
            <div className="w-8 h-6 rounded-sm bg-amber-300/90 border border-amber-200" />
            <span className="text-[10px] opacity-80">SIM / 5G</span>
          </div>
        </div>
      </div>
    );
  }

  if (key === 'case' || category === 'case') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="w-24 h-44 rounded-[26px] bg-[#1A1A1D] border-[3px] border-zinc-700 shadow-xl flex flex-col items-center justify-between p-3 relative">
          <div className="self-start w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-600" />
          <div className="w-14 h-14 rounded-full border-[4px] border-white/75 flex items-center justify-center">
            <div className="w-2 h-4 rounded-full bg-white/75 translate-y-7" />
          </div>
          <div className="w-8 h-1 rounded-full bg-zinc-600" />
        </div>
      </div>
    );
  }

  if (key === 'charger' || category === 'charger') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="flex flex-col items-center">
          <div className="flex gap-3">
            <div className="w-1.5 h-5 rounded-t-sm bg-zinc-400" />
            <div className="w-1.5 h-5 rounded-t-sm bg-zinc-400" />
          </div>
          <div className="w-20 h-22 rounded-2xl bg-white border border-black/10 shadow-lg flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-2 rounded-full bg-zinc-800" />
            <span className="text-[10px] font-semibold tracking-wider text-zinc-500">PD 25W</span>
          </div>
        </div>
      </div>
    );
  }

  if (key === 'cable' || category === 'cable') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <svg viewBox="0 0 120 120" className="w-28 h-28" aria-hidden="true">
          <circle cx="60" cy="60" r="34" fill="none" stroke="#0D0D0D" strokeWidth="7" />
          <circle cx="60" cy="60" r="27" fill="none" stroke="#3F3F46" strokeWidth="2" strokeDasharray="4 4" />
          <rect x="44" y="16" width="12" height="14" rx="2" fill="#0D0D0D" />
          <rect x="47" y="10" width="6" height="6" rx="1" fill="#A1A1AA" />
          <rect x="64" y="16" width="12" height="14" rx="2" fill="#0D0D0D" />
          <rect x="67" y="10" width="6" height="6" rx="1" fill="#A1A1AA" />
        </svg>
      </div>
    );
  }

  if (key === 'earbuds' || category === 'earbuds') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="w-28 h-24 rounded-[28px] bg-[#141416] border border-black/15 shadow-xl flex flex-col items-center justify-between p-3">
          <div className="w-full h-7 rounded-t-[18px] border-b border-white/10 flex items-center justify-center gap-4">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>
      </div>
    );
  }

  if (key === 'glass' || category === 'screen_protector') {
    return (
      <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
        <div className="relative">
          <div className="w-24 h-40 rounded-2xl bg-gradient-to-br from-white via-zinc-100 to-zinc-300 border border-black/15 shadow-md rotate-6" />
          <div className="w-24 h-40 rounded-2xl bg-[#0D0D0D]/90 border border-black/20 shadow-xl -mt-36 -translate-x-3 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white/80 tracking-wider">9H GLASS</span>
          </div>
        </div>
      </div>
    );
  }

  // Smartphone studio renderers by brand/key
  const isSamsung = key.includes('samsung') || brand === 'Samsung';
  const isXiaomi = key.includes('xiaomi') || brand === 'Xiaomi';
  const isHuawei = key.includes('huawei') || brand === 'Huawei';

  return (
    <div className={`relative w-full h-full bg-[#F2F2F2] flex items-center justify-center overflow-hidden ${className}`}>
      <div className="relative flex items-end gap-2">
        {/* Back camera view */}
        <div
          className={`w-24 h-44 ${
            isSamsung ? 'rounded-xl' : 'rounded-[24px]'
          } bg-gradient-to-b ${
            isSamsung
              ? 'from-zinc-800 via-zinc-900 to-black'
              : isXiaomi
                ? 'from-slate-800 via-zinc-900 to-black'
                : isHuawei
                  ? 'from-neutral-800 via-neutral-900 to-black'
                  : 'from-stone-600 via-stone-800 to-stone-900'
          } p-2.5 shadow-2xl border border-black/20 flex flex-col justify-between`}
        >
          {isSamsung ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <div className="w-4 h-4 rounded-full bg-black border border-zinc-500" />
                <div className="w-3 h-3 rounded-full bg-black border border-zinc-600 self-center" />
              </div>
              <div className="w-4 h-4 rounded-full bg-black border border-zinc-500" />
              <div className="w-4 h-4 rounded-full bg-black border border-zinc-500" />
            </div>
          ) : isXiaomi ? (
            <div className="w-11 h-11 rounded-xl bg-black/80 border border-zinc-600 p-1 grid grid-cols-2 gap-1">
              <div className="rounded-full bg-zinc-800 border border-zinc-500" />
              <div className="rounded-full bg-zinc-800 border border-zinc-500" />
              <div className="rounded-full bg-zinc-800 border border-zinc-500" />
              <div className="rounded-full bg-amber-200/70 m-1" />
            </div>
          ) : isHuawei ? (
            <div className="w-11 h-11 rounded-2xl bg-black/80 border border-zinc-600 p-1.5 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-800 border border-zinc-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-200/70" />
              </div>
              <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-400 self-center" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/15 p-1 grid grid-cols-2 gap-1">
              <div className="rounded-full bg-black border border-zinc-400" />
              <div className="rounded-full bg-black border border-zinc-400" />
              <div className="rounded-full bg-black border border-zinc-400 col-start-2" />
            </div>
          )}
          <div className="text-[8px] font-medium tracking-widest text-white/40 text-center uppercase">
            {brand || '5G'}
          </div>
        </div>

        {/* Front screen preview slightly offset */}
        <div
          className={`w-20 h-40 -ms-8 mb-1 ${
            isSamsung ? 'rounded-lg' : 'rounded-[20px]'
          } bg-[#0D0D0D] p-1 shadow-2xl border border-zinc-700`}
        >
          <div
            className={`w-full h-full ${
              isSamsung ? 'rounded-md' : 'rounded-[16px]'
            } bg-gradient-to-br from-zinc-900 via-[#1a1026] to-[#240914] p-2 flex flex-col justify-between`}
          >
            <div className="w-7 h-1.5 rounded-full bg-black mx-auto" />
            <div className="space-y-1">
              <div className="w-8 h-1 rounded-full bg-white/30" />
              <div className="w-12 h-1 rounded-full bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
