
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
    border-b-4 rounded-md shadow-lg transition-all duration-75 cursor-pointer
    hover:opacity-90 active:opacity-100 select-none
    overflow-hidden
  `;

  const naturalKeyClasses = `
    ${baseWidthClass} ${heightStyle}
    bg-gradient-to-br from-amber-300 to-amber-500
    border-amber-600
    text-amber-900
    hover:from-amber-200 hover:to-amber-400
  `;

  const sharpKeyClasses = `
    ${baseWidthClass} ${heightStyle}
    bg-gradient-to-br from-neutral-700 to-neutral-800
    border-neutral-900
    text-neutral-200
    hover:from-neutral-600 hover:to-neutral-700
    z-10
  `;

  const pressedNaturalClasses = `
    from-amber-200 to-amber-400 shadow-inner transform scale-[0.98] translate-y-0.5
  `;
  const pressedSharpClasses = `
    from-neutral-600 to-neutral-700 shadow-inner transform scale-[0.98] translate-y-0.5
  `;

  const keySpecificClasses = note.isSharp ? sharpKeyClasses : naturalKeyClasses;
  const pressedSpecificClasses = note.isSharp ? pressedSharpClasses : pressedNaturalClasses;

  return (
    <button
      type="button"
      onMouseDown={() => onInteractionStart(note)}
      onTouchStart={(e) => {
        e.preventDefault(); // Prevent mouse event firing after touch
        onInteractionStart(note);
      }}
      className={`
        ${commonKeyClasses}
        ${keySpecificClasses}
        ${isPressed ? pressedSpecificClasses : ''}
      `}
      aria-label={`Play note ${note.name}`}
    >
      <span className={`pt-1 font-semibold ${noteNameSize}`}>
        {note.name.replace(/[0-9]/g, '')} {/* Display C, C#, D etc. */}
      </span>
      <span className={`pb-1 font-mono ${keyLabelSize} opacity-80`}>
        {note.keyboardKey.length === 1 ? note.keyboardKey : note.keyboardKey.startsWith('Shift') ? '⇧' : note.keyboardKey.startsWith('Digit') ? note.keyboardKey.slice(-1) : note.keyboardKey}
      </span>
    </button>
  );
};

export default VibraphoneKey;
