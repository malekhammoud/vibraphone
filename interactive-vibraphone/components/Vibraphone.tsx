
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '../types';
import { NOTES, NATURAL_NOTES, SHARP_NOTES, KEY_MAP } from '../constants';
import useAudioPlayback from '../hooks/useAudioPlayback';
import VibraphoneKey from './VibraphoneKey';
import ResonatorTube from './ResonatorTube';
import SustainIndicator from './SustainIndicator';
import KeyboardGuide from './KeyboardGuide';

const MAX_NATURAL_KEY_HEIGHT_PX = 280; // Max length for the longest natural bar (e.g., F3)
const MIN_NATURAL_KEY_HEIGHT_PX = 140; // Min length for the shortest natural bar (e.g., C6)
const SHARP_KEY_HEIGHT_RATIO = 0.65; // Sharps are shorter

const getKeyVisualHeight = (index: number, totalKeys: number, isSharp: boolean): string => {
  const maxHeight = isSharp ? MAX_NATURAL_KEY_HEIGHT_PX * SHARP_KEY_HEIGHT_RATIO : MAX_NATURAL_KEY_HEIGHT_PX;
  const minHeight = isSharp ? MIN_NATURAL_KEY_HEIGHT_PX * SHARP_KEY_HEIGHT_RATIO : MIN_NATURAL_KEY_HEIGHT_PX;
  const heightRange = maxHeight - minHeight;
  // Keys get shorter from left (low notes) to right (high notes)
  const ratio = index / Math.max(1, totalKeys - 1);
  const calculatedHeight = maxHeight - heightRange * ratio;
  return `${Math.round(calculatedHeight)}px`;
};


const Vibraphone: React.FC = () => {
  const { initializeAudio, playNote, stopAllNotes, isAudioInitialized, audioContextRef } = useAudioPlayback();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sustainActive, setSustainActive] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const naturalKeyContainerRef = useRef<HTMLDivElement>(null);

  const handleInteractionStart = useCallback((note: Note) => {
    if (!isAudioInitialized) {
      initializeAudio();
    }
    // Ensure context is running (e.g., after user gesture)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    playNote(note, sustainActive);
    setPressedKeys((prev) => new Set(prev).add(note.name));
  }, [playNote, sustainActive, initializeAudio, isAudioInitialized, audioContextRef]);

  const handleInteractionEnd = useCallback((noteName: string) => {
    if (!sustainActive) {
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noteName);
        return newSet;
      });
      // Note: actual sound stop is handled by envelope or stopAllNotes on sustain release
    }
  }, [sustainActive]);


  useEffect(() => {
    const keyToNoteMap = new Map<string, Note>();
    NOTES.forEach(note => {
        keyToNoteMap.set(note.keyboardKey.toUpperCase(), note);
        // For event.code based matching (e.g. Digit1, KeyA)
        if (note.keyboardKey.length === 1 && /[A-Z]/.test(note.keyboardKey)) {
            keyToNoteMap.set(`KEY${note.keyboardKey.toUpperCase()}`, note);
        } else if (note.keyboardKey.length === 1 && /[0-9]/.test(note.keyboardKey)) {
             keyToNoteMap.set(`DIGIT${note.keyboardKey}`, note);
        } else if (KEY_MAP[note.keyboardKey.toUpperCase()]) {
            keyToNoteMap.set(KEY_MAP[note.keyboardKey.toUpperCase()].toUpperCase(), note);
        }
    });
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
       if (showInstructions && isAudioInitialized) { // Hide instructions on first key press after audio init
        setShowInstructions(false);
      }

      if (event.code === 'Space') {
        event.preventDefault();
        if (!sustainActive) {
          setSustainActive(true);
        }
        return;
      }
      
      const keyId = event.code.toUpperCase().startsWith('KEY') || event.code.toUpperCase().startsWith('DIGIT') ? event.code.toUpperCase() : event.key.toUpperCase();
      const note = keyToNoteMap.get(keyId) || keyToNoteMap.get(event.key.toUpperCase()) || keyToNoteMap.get(event.code.toUpperCase());

      if (note) {
        event.preventDefault();
        if (!pressedKeys.has(note.name)) { // Play only if not already pressed by keyboard
           handleInteractionStart(note);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (sustainActive) {
          setSustainActive(false);
          stopAllNotes();
          setPressedKeys(new Set()); // Clear all visually pressed keys
        }
        return;
      }

      const keyId = event.code.toUpperCase().startsWith('KEY') || event.code.toUpperCase().startsWith('DIGIT') ? event.code.toUpperCase() : event.key.toUpperCase();
      const note = keyToNoteMap.get(keyId) || keyToNoteMap.get(event.key.toUpperCase()) || keyToNoteMap.get(event.code.toUpperCase());
      
      if (note) {
        event.preventDefault();
        handleInteractionEnd(note.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteractionStart, handleInteractionEnd, sustainActive, stopAllNotes, pressedKeys, showInstructions, isAudioInitialized]);


  // Dynamic widths (example, can be refined)
  const naturalKeyBaseWidth = "w-12 md:w-14 lg:w-16";
  const sharpKeyBaseWidth = "w-8 md:w-10 lg:w-11"; // Sharps are narrower
  const keyLabelSize = "text-[8px] md:text-[10px]";
  const noteNameSize = "text-xs md:text-sm";


  const getSharpKeyOffsetStyle = (sharpNoteName: string): React.CSSProperties => {
    if (!naturalKeyContainerRef.current) return { display: 'none' }; // Should not happen after mount

    const sharpNoteBase = sharpNoteName.substring(0, 1); // e.g., "C" from "C#4"
    
    // Find the preceding natural key's DOM element
    // This logic assumes sharps are C#, D#, F#, G#, A#
    // And naturals are C, D, E, F, G, A, B
    let precedingNaturalNoteIndex = -1;

    if (sharpNoteBase === 'C' || sharpNoteBase === 'F') { // C#, F#
        precedingNaturalNoteIndex = NATURAL_NOTES.findIndex(n => n.name.startsWith(sharpNoteBase) && n.name.slice(-1) === sharpNoteName.slice(-1));
    } else if (sharpNoteBase === 'D' || sharpNoteBase === 'G' || sharpNoteBase === 'A') { // D#, G#, A#
        precedingNaturalNoteIndex = NATURAL_NOTES.findIndex(n => n.name.startsWith(sharpNoteBase) && n.name.slice(-1) === sharpNoteName.slice(-1));
    }
    // E# and B# are not standard sharp keys, so this logic doesn't place them. F3 does not have a preceding natural for F#3 in this range.
    // This simplified model positions based on the direct natural note letter. A more complex model would use absolute positions.

    if (precedingNaturalNoteIndex === -1 && (sharpNoteName === 'F#3' || sharpNoteName === 'G#3' || sharpNoteName === 'A#3')) {
      // Handle low F#, G#, A# that might not have a perfectly matching natural in the displayed range by index.
      // For simplicity, approximate based on general position or use a fixed small offset for first few.
      // This part needs refinement for a perfect piano-like layout across wide ranges.
      // For now, let's find the general position of F, G, A of that octave.
      const targetNatural = NATURAL_NOTES.find(n => n.name.startsWith(sharpNoteBase) && n.name.endsWith(sharpNoteName.slice(-1)));
      if (targetNatural) {
        precedingNaturalNoteIndex = NATURAL_NOTES.indexOf(targetNatural);
      }
    }


    if (precedingNaturalNoteIndex !== -1 && naturalKeyContainerRef.current.children.length > precedingNaturalNoteIndex) {
        const naturalKeyElement = naturalKeyContainerRef.current.children[precedingNaturalNoteIndex] as HTMLElement;
        const naturalKeyRect = naturalKeyElement.getBoundingClientRect();
        const containerRect = naturalKeyContainerRef.current.getBoundingClientRect();
        
        // Position sharp key towards the right edge of the preceding natural key
        // This value might need tweaking depending on key widths and desired overlap
        const offsetLeft = (naturalKeyRect.right - containerRect.left) - (naturalKeyRect.width * 0.35) ; 
        return { 
            position: 'absolute', 
            left: `${offsetLeft}px`, 
            transform: 'translateX(-50%)',
            top: '0px' // Sharps are in upper row
        };
    }
    
    // Fallback or hide if no position found (should be rare with proper NOTES setup)
    // This basic positioning works for typical piano layout where C# is near C/D split, etc.
    // For a vibraphone, they might be more uniformly spaced in their own row.
    // The current implementation aims for a piano-like visual layout.
    // A simpler vibraphone layout might just space sharps evenly in their row.
    // Given the complexity of perfect piano offset, let's use a slightly simpler relative positioning for sharps.
    const sharpIndex = SHARP_NOTES.findIndex(n => n.name === sharpNoteName);
    if (sharpIndex !== -1) {
        // This creates a more gapped layout for sharps if absolute positioning is too complex.
        // This is a placeholder for a more robust piano layout calculation or a simpler vibraphone specific layout.
        const spacingFactor = 4.5; // Average natural keys per sharp group, highly approximate.
        const estimatedLeftPercent = (sharpIndex / (SHARP_NOTES.length -1)) * 100 * 0.8 + 5; // Spread them out somewhat.
        // return { position: 'absolute', left: `${estimatedLeftPercent}%`, transform: 'translateX(-50%)', top: '0px' };
        // For now, let's rely on the earlier logic, and if it fails, the key might not appear or appear at 0,0.
    }
    return { position: 'absolute', left: '0px', top: '0px', visibility: 'hidden' }; // Fallback
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 text-white bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <header className="text-center mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-400 tracking-tight">
          Virtual Vibraphone
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Click or use keyboard to play. Spacebar for sustain.
        </p>
      </header>

      {showInstructions && !isAudioInitialized && (
         <button
          onClick={() => { initializeAudio(); setShowInstructions(false); }}
          className="mb-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg shadow-lg transition-colors"
        >
          Click here to Enable Audio & Start Playing
        </button>
      )}

      <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-700 to-gray-800 rounded-xl shadow-2xl border-2 border-gray-600 w-full max-w-6xl">
        {/* Keys Container */}
        <div className="relative mb-4">
          {/* Sharp Keys Row (Upper) */}
          {/* The sharps are absolutely positioned relative to natural keys container for piano layout */}
          {/* This will be rendered on top of the natural keys visually due to z-index and absolute positioning */}
           <div className="relative h-[calc(var(--sharp-key-height,100px)_*_0.8)] mb-[-2px]"> {/* Adjusted height for sharps row */}
            {SHARP_NOTES.map((note, index) => (
              <div 
                key={note.name} 
                style={getSharpKeyOffsetStyle(note.name)}
                className="inline-block" // Helps with calculating offsets from previous logic
              >
                <VibraphoneKey
                  note={note}
                  isPressed={pressedKeys.has(note.name)}
                  onInteractionStart={handleInteractionStart}
                  // onInteractionEnd={() => handleInteractionEnd(note.name)} // Mouseup/touchend not directly on key for release
                  heightStyle={`h-[${getKeyVisualHeight(index, SHARP_NOTES.length, true).replace('px','')}]`}
                  baseWidthClass={sharpKeyBaseWidth}
                  keyLabelSize={keyLabelSize}
                  noteNameSize={noteNameSize}
                />
              </div>
            ))}
          </div>

          {/* Natural Keys Row (Lower) */}
          <div ref={naturalKeyContainerRef} className="flex justify-center gap-0.5 sm:gap-1 bg-gray-600 p-1 rounded-md">
            {NATURAL_NOTES.map((note, index) => (
              <VibraphoneKey
                key={note.name}
                note={note}
                isPressed={pressedKeys.has(note.name)}
                onInteractionStart={handleInteractionStart}
                // onInteractionEnd={() => handleInteractionEnd(note.name)}
                heightStyle={`h-[${getKeyVisualHeight(index, NATURAL_NOTES.length, false).replace('px','')}]`}
                baseWidthClass={naturalKeyBaseWidth}
                keyLabelSize={keyLabelSize}
                noteNameSize={noteNameSize}
              />
            ))}
          </div>
        </div>

        {/* Resonator Tubes (Visual) - Aligned with Natural Keys */}
        <div className="flex justify-center gap-0.5 sm:gap-1 mt-3 px-1">
          {NATURAL_NOTES.map((note, index) => {
            const keyHeight = parseFloat(getKeyVisualHeight(index, NATURAL_NOTES.length, false).replace('px',''));
            const tubeHeight = Math.max(20, keyHeight * 0.6); // Tubes are shorter
            return (
              <ResonatorTube
                key={`tube-${note.name}`}
                heightStyle={`h-[${Math.round(tubeHeight)}px]`}
                baseWidthClass={naturalKeyBaseWidth.replace('w-','w- resonator-')} // use same base width but slightly adjusted if needed
              />
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <SustainIndicator sustainActive={sustainActive} />
      </div>
      
      <KeyboardGuide notes={NOTES} />

      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Interactive Vibraphone. Inspired by real instruments.</p>
      </footer>
    </div>
  );
};

export default Vibraphone;

