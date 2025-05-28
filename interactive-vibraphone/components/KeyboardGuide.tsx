
import React from 'react';
import { Note } from '../types';

interface KeyboardGuideProps {
  notes: Note[];
}

const KeyboardGuide: React.FC<KeyboardGuideProps> = ({ notes }) => {
  const naturalKeyBindings = notes.filter(n => !n.isSharp).map(n => `${n.keyboardKey.toUpperCase()}: ${n.name}`).join(', ');
  const sharpKeyBindings = notes.filter(n => n.isSharp).map(n => `${n.keyboardKey.toUpperCase()}: ${n.name}`).join(', ');

  return (
    <div className="mt-8 p-6 bg-gray-700 rounded-lg shadow-xl text-gray-300 w-full max-w-4xl text-center">
      <h3 className="text-xl font-semibold text-amber-400 mb-4">Controls</h3>
      <p className="mb-2">
        <kbd className="px-2 py-1 bg-gray-600 rounded text-amber-300 font-mono">Click</kbd> on keys or use your <kbd className="px-2 py-1 bg-gray-600 rounded text-amber-300 font-mono">Keyboard</kbd> to play.
      </p>
      <p className="mb-4">
        Press and hold <kbd className="px-2 py-1 bg-gray-600 rounded text-amber-300 font-mono">Spacebar</kbd> for sustain.
      </p>
      <div className="text-xs space-y-1">
        <p><strong className="text-amber-400">Natural Notes:</strong> {naturalKeyBindings.slice(0, 100)}...</p>
        <p><strong className="text-amber-400">Sharp Notes:</strong> {sharpKeyBindings.slice(0,100)}...</p>
      </div>
       <p className="mt-4 text-xs text-gray-400">
        Note: Some keyboard keys like 'ShiftRight' are mapped to common representations (e.g., ⇧).
        Ensure your keyboard layout matches the displayed keys.
      </p>
    </div>
  );
};

export default KeyboardGuide;
