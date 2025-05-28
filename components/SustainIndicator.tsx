
import React from 'react';

interface SustainIndicatorProps {
  sustainActive: boolean;
}

const SustainIndicator: React.FC<SustainIndicatorProps> = ({ sustainActive }) => {
  return (
    <div
      className={`
        px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out
        shadow-md border-2
        ${
          sustainActive
            ? 'bg-green-500 text-white border-green-600'
            : 'bg-gray-600 text-gray-300 border-gray-700'
        }
      `}
    >
      Sustain: {sustainActive ? 'ON' : 'OFF'}
    </div>
  );
};

export default SustainIndicator;
