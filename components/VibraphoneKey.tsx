import React from 'react';
import { Note } from '../types';

interface VibraphoneKeyProps {
  note: Note;
  isPressed: boolean;
  onInteractionStart: (note: Note) => void;
  heightStyle: string; // e.g., "h-64" or "h-[256px]"
  baseWidthClass: string; // e.g., "w-12"
  keyLabelSize: string; // e.g., "text-xs"
  noteNameSize: string; // e.g., "text-sm"
}

const VibraphoneKey: React.FC<VibraphoneKeyProps> = ({
  note,
  isPressed,
  onInteractionStart,
  heightStyle,
  baseWidthClass,
  keyLabelSize,
  noteNameSize,
}) => {
  const commonKeyClasses = `
    relative flex flex-col justify-between items-center
    border-2 rounded-lg shadow-xl transition-all duration-75 cursor-pointer
    hover:opacity-95 active:opacity-100 select-none
    overflow-hidden
  `;

  const naturalKeyClasses = `
    ${baseWidthClass} ${heightStyle}
    bg-gradient-to-br from-yellow-200 via-amber-400 to-amber-500
    border-amber-700
    text-amber-900
    hover:from-yellow-100 hover:via-amber-300 hover:to-amber-400
  `;

  const sharpKeyClasses = `
    ${baseWidthClass} ${heightStyle}
    bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800
    border-gray-900
    text-gray-200
    hover:from-gray-500 hover:via-gray-600 hover:to-gray-700
    z-10
  `;

  const pressedNaturalClasses = `
    from-yellow-100 via-amber-300 to-amber-400 
    shadow-inner transform scale-[0.98] translate-y-0.5
    border-amber-500
  `;

  const pressedSharpClasses = `
    from-gray-500 via-gray-600 to-gray-700
    shadow-inner transform scale-[0.98] translate-y-0.5
    border-gray-800
  `;

  const keySpecificClasses = note.isSharp ? sharpKeyClasses : naturalKeyClasses;
  const pressedSpecificClasses = note.isSharp ? pressedSharpClasses : pressedNaturalClasses;

  // Extract pixel value from heightStyle (e.g., h-[800px] => 800)
  let pixelHeight = 0;
  const match = heightStyle.match(/\d+/);
  if (match) pixelHeight = parseInt(match[0], 10);

  return (
    <div
      className={`
        ${commonKeyClasses}
        ${note.isSharp ? sharpKeyClasses : naturalKeyClasses}
        ${isPressed && !note.isSharp ? pressedNaturalClasses : ''}
        ${isPressed && note.isSharp ? 'from-gray-500 via-gray-600 to-gray-700 shadow-inner transform scale-[0.98] translate-y-0.5' : ''}
      `}
      onMouseDown={() => onInteractionStart(note)}
      onTouchStart={() => onInteractionStart(note)}
    >
      <span className={`${noteNameSize} font-semibold mt-2`}>
        {note.name}
      </span>
      <div className="flex flex-col items-center mb-2">
        <span className={`${keyLabelSize} opacity-60`}>
          {note.keyboardKey === 'ShiftRight' ? 'Shift' : note.keyboardKey}
        </span>
        <span className={`${keyLabelSize} opacity-50 mt-1`}>
          {Math.round(note.frequency)}Hz
        </span>
      </div>
    </div>
  );
};

export default VibraphoneKey;
