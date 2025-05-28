import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Note } from '../types';
import { NOTES, NATURAL_NOTES, SHARP_NOTES, KEY_MAP } from '../constants';
import useAudioPlayback from '../hooks/useAudioPlayback';
import VibraphoneKey from './VibraphoneKey';
import SustainIndicator from './SustainIndicator';
import KeyboardGuide from './KeyboardGuide';

const MAX_NATURAL_KEY_HEIGHT_PX = 100;
const MIN_NATURAL_KEY_HEIGHT_PX = 200;
const SHARP_KEY_HEIGHT_RATIO = 0.75;

const getKeyVisualHeight = (note: Note): string => {
  // Find the note's position in the frequency range
  const allFrequencies = NOTES.map(n => n.frequency);
  const minFreq = Math.min(...allFrequencies);
  const maxFreq = Math.max(...allFrequencies);
  const freqRange = maxFreq - minFreq;

  // Calculate normalized position based on frequency
  const normalizedPosition = (note.frequency - minFreq) / freqRange;

  // Calculate height
  const maxHeight = note.isSharp ? MAX_NATURAL_KEY_HEIGHT_PX * SHARP_KEY_HEIGHT_RATIO : MAX_NATURAL_KEY_HEIGHT_PX;
  const minHeight = note.isSharp ? MIN_NATURAL_KEY_HEIGHT_PX * SHARP_KEY_HEIGHT_RATIO : MIN_NATURAL_KEY_HEIGHT_PX;
  const heightRange = maxHeight - minHeight;

  // Apply exponential curve for more dramatic size difference
  const heightRatio = Math.pow(normalizedPosition, 0.8); // Less aggressive curve
  const height = minHeight + (heightRange * heightRatio);

  // Return in Tailwind arbitrary value syntax
  return `h-[${Math.round(height)}px]`;
};

const Vibraphone: React.FC = () => {
  const { initializeAudio, playNote, stopAllNotes, isAudioInitialized, audioContextRef } = useAudioPlayback();
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [sustainActive, setSustainActive] = useState(false);
  const [showInstructions] = useState(false);

  const naturalKeyContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);

  const handleInteractionStart = useCallback((note: Note) => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }

    setPressedKeys((prev) => new Set(prev).add(note.name));
    playNote(note, sustainActive, () => {
      setPressedKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(note.name);
        return newSet;
      });
    });
  }, [playNote, sustainActive, audioContextRef]);

  const handleInteractionEnd = useCallback(() => {
    // Empty callback since key release is handled by the sound end callback
  }, []);

  useEffect(() => {
    const keyToNoteMap = new Map<string, Note>();
    NOTES.forEach(note => {
        keyToNoteMap.set(note.keyboardKey.toUpperCase(), note);
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
        if (!pressedKeys.has(note.name)) {
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
          setPressedKeys(new Set());
        }
        return;
      }

      const keyId = event.code.toUpperCase().startsWith('KEY') || event.code.toUpperCase().startsWith('DIGIT') ? event.code.toUpperCase() : event.key.toUpperCase();
      const note = keyToNoteMap.get(keyId) || keyToNoteMap.get(event.key.toUpperCase()) || keyToNoteMap.get(event.code.toUpperCase());
      
      if (note) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInteractionStart, handleInteractionEnd, sustainActive, stopAllNotes, pressedKeys, showInstructions, isAudioInitialized]);

  const naturalKeyBaseWidth = "w-16 md:w-20 lg:w-24";
  const sharpKeyBaseWidth = "w-12 md:w-14 lg:w-16";
  const keyLabelSize = "text-[8px] md:text-[10px]";
  const noteNameSize = "text-xs md:text-sm";

  const getSharpKeyOffsetStyle = (sharpNoteName: string): React.CSSProperties => {
    if (!naturalKeyContainerRef.current) return { display: 'none' };

    const sharpNoteBase = sharpNoteName.substring(0, 1);
    let precedingNaturalNoteIndex = -1;

    if (sharpNoteBase === 'C' || sharpNoteBase === 'F') {
        precedingNaturalNoteIndex = NATURAL_NOTES.findIndex(n => n.name.startsWith(sharpNoteBase) && n.name.slice(-1) === sharpNoteName.slice(-1));
    } else if (sharpNoteBase === 'D' || sharpNoteBase === 'G' || sharpNoteBase === 'A') {
        precedingNaturalNoteIndex = NATURAL_NOTES.findIndex(n => n.name.startsWith(sharpNoteBase) && n.name.slice(-1) === sharpNoteName.slice(-1));
    }

    if (precedingNaturalNoteIndex === -1 && (sharpNoteName === 'F#3' || sharpNoteName === 'G#3' || sharpNoteName === 'A#3')) {
      const targetNatural = NATURAL_NOTES.find(n => n.name.startsWith(sharpNoteBase) && n.name.endsWith(sharpNoteName.slice(-1)));
      if (targetNatural) {
        precedingNaturalNoteIndex = NATURAL_NOTES.indexOf(targetNatural);
      }
    }

    if (precedingNaturalNoteIndex !== -1 && naturalKeyContainerRef.current.children.length > precedingNaturalNoteIndex) {
        const naturalKeyElement = naturalKeyContainerRef.current.children[precedingNaturalNoteIndex] as HTMLElement;
        const naturalKeyRect = naturalKeyElement.getBoundingClientRect();
        const containerRect = naturalKeyContainerRef.current.getBoundingClientRect();
        const offsetLeft = (naturalKeyRect.right - containerRect.left) - (naturalKeyRect.width * 0.6) + 8;
        return {
            position: 'absolute',
            left: `${offsetLeft}px`,
            bottom: 0,
            transform: 'translateX(-10%)',
            zIndex: 2
        };
    }

    return { position: 'absolute', left: '0px', bottom: 0, visibility: 'hidden', zIndex: 2 };
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900">
      <header className="text-center mb-4 sm:mb-6 text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-amber-400 tracking-tight">
          Virtual Vibraphone
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Click or use keyboard to play. Spacebar for sustain.
        </p>
      </header>

      <div className="w-full max-w-7xl mx-auto p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <div className="relative min-h-[400px]">
          {/* Sharp Keys Row (Upper) */}
          <div className="relative mb-0">
            {SHARP_NOTES.map((note) => {
              return (
                <div
                  key={note.name}
                  style={{...getSharpKeyOffsetStyle(note.name)}}
                  className="inline-block"
                >
                  <VibraphoneKey
                    note={note}
                    isPressed={pressedKeys.has(note.name)}
                    onInteractionStart={handleInteractionStart}
                    heightStyle={getKeyVisualHeight(note)}
                    baseWidthClass={sharpKeyBaseWidth}
                    keyLabelSize={keyLabelSize}
                    noteNameSize={noteNameSize}
                  />
                </div>
              );
            })}
          </div>

          {/* Natural Keys Row (Lower) */}
          <div ref={naturalKeyContainerRef} className="flex justify-center gap-1 sm:gap-2 p-1 rounded-md mt-32">
            {NATURAL_NOTES.map((note) => {
              return (
                <VibraphoneKey
                  key={note.name}
                  note={note}
                  isPressed={pressedKeys.has(note.name)}
                  onInteractionStart={handleInteractionStart}
                  heightStyle={getKeyVisualHeight(note)}
                  baseWidthClass={naturalKeyBaseWidth}
                  keyLabelSize={keyLabelSize}
                  noteNameSize={noteNameSize}
                />
              );
            })}
          </div>
        </div>
        <div className="mt-0">
          <SustainIndicator sustainActive={sustainActive} />
          <KeyboardGuide notes={NOTES} />
        </div>
      </div>
    </div>
  );
};

export default Vibraphone;
