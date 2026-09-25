import React, { useState } from 'react';
import { Copy, Check, ShieldAlert } from 'lucide-react';

export const HSRPPlate = ({
  plate = 'GJ-01-AB-1234',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  threatLevel = 'CLEAR',
  showCopy = true,
  onClick,
}) => {
  const [copied, setCopied] = useState(false);

  // Normalize plate string
  const cleanPlate = plate.toUpperCase().replace(/\s+/g, '-');
  const stateCode = cleanPlate.slice(0, 2);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(cleanPlate);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const isThreat = threatLevel === 'CRITICAL' || threatLevel === 'HIGH';

  const sizeClasses = {
    sm: 'text-xs h-6 px-1.5 min-w-[120px]',
    md: 'text-sm h-8 px-2 min-w-[145px]',
    lg: 'text-base h-10 px-3 min-w-[170px]',
    xl: 'text-lg h-12 px-4 min-w-[210px]',
  };

  const textClasses = {
    sm: 'text-[11px] font-bold tracking-wider',
    md: 'text-[13px] font-bold tracking-widest',
    lg: 'text-[15px] font-bold tracking-widest',
    xl: 'text-[18px] font-extrabold tracking-widest',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none font-mono rounded border shadow-md transition-all duration-200 group relative ${
        isThreat
          ? 'bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/80 shadow-rose-950/50'
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-cyan-500/40 hover:border-cyan-400'
      } ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      title={`License Plate: ${cleanPlate} ${isThreat ? `[${threatLevel} BOLO MATCH]` : ''}`}
    >
      {/* Left Blue HSRP Strip with IND and Hologram */}
      <div className="flex flex-col items-center justify-center bg-blue-700 text-white rounded-l-[2px] -ml-[1px] h-full px-1.5 border-r border-blue-400/40 shadow-inner">
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-200/90 shadow-[0_0_4px_#00f0ff] animate-pulse"></div>
        <span className="text-[8px] font-black tracking-tighter leading-none text-blue-100 mt-0.5">
          IND
        </span>
      </div>

      {/* Main Embossed Plate Text */}
      <div className="flex items-center justify-center flex-1 px-2.5 space-x-1">
        <span className={`text-slate-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${textClasses[size]}`}>
          {cleanPlate}
        </span>
        {isThreat && (
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse ml-1 flex-shrink-0" />
        )}
      </div>

      {/* Micro Copy Button on Hover */}
      {showCopy && (
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-cyan-300 ml-1 rounded"
          title="Copy plate number"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </div>
  );
};
