import React from 'react';

interface ResonatorTubeProps {
  heightStyle: string;
  baseWidthClass: string;
}

const ResonatorTube: React.FC<ResonatorTubeProps> = ({ heightStyle, baseWidthClass }) => {
  return (
    <div className="relative">
      <div
        className={`
          ${baseWidthClass} ${heightStyle}
          bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500
          rounded-b-2xl border-[1.5px] border-zinc-600
          shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),_0_1px_3px_rgba(0,0,0,0.1)]
          mx-auto overflow-hidden
        `}
        aria-hidden="true"
      >
        {/* Metallic highlight effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10" />
      </div>
    </div>
  );
};

export default ResonatorTube;
