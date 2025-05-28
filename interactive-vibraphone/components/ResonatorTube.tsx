
import React from 'react';

interface ResonatorTubeProps {
  heightStyle: string; // e.g. "h-48"
  baseWidthClass: string; // e.g. "w-10"
}

const ResonatorTube: React.FC<ResonatorTubeProps> = ({ heightStyle, baseWidthClass }) => {
  return (
    <div
      className={`
        ${baseWidthClass} ${heightStyle}
        bg-gradient-to-b from-gray-400 to-gray-600
        rounded-b-lg border border-gray-500 shadow-inner
        mx-auto
      `}
      aria-hidden="true"
    />
  );
};

export default ResonatorTube;
