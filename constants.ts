
import { Note } from './types';

export const NOTES: Note[] = [
  { name: "F3", frequency: 174.61, isSharp: false, keyboardKey: "Z" },
  { name: "F#3", frequency: 185.00, isSharp: true, keyboardKey: "S" },
  { name: "G3", frequency: 196.00, isSharp: false, keyboardKey: "X" },
  { name: "G#3", frequency: 207.65, isSharp: true, keyboardKey: "D" },
  { name: "A3", frequency: 220.00, isSharp: false, keyboardKey: "C" },
  { name: "A#3", frequency: 233.08, isSharp: true, keyboardKey: "F" },
  { name: "B3", frequency: 246.94, isSharp: false, keyboardKey: "V" },
  { name: "C4", frequency: 261.63, isSharp: false, keyboardKey: "B" },
  { name: "C#4", frequency: 277.18, isSharp: true, keyboardKey: "H" },
  { name: "D4", frequency: 293.66, isSharp: false, keyboardKey: "N" },
  { name: "D#4", frequency: 311.13, isSharp: true, keyboardKey: "J" },
  { name: "E4", frequency: 329.63, isSharp: false, keyboardKey: "M" },
  { name: "F4", frequency: 349.23, isSharp: false, keyboardKey: "," },
  { name: "F#4", frequency: 369.99, isSharp: true, keyboardKey: "L" },
  { name: "G4", frequency: 392.00, isSharp: false, keyboardKey: "." },
  { name: "G#4", frequency: 415.30, isSharp: true, keyboardKey: ";" },
  { name: "A4", frequency: 440.00, isSharp: false, keyboardKey: "/" },
  { name: "A#4", frequency: 466.16, isSharp: true, keyboardKey: "'" },
  { name: "B4", frequency: 493.88, isSharp: false, keyboardKey: "ShiftRight" }, // Using Right Shift, might need mapping
  { name: "C5", frequency: 523.25, isSharp: false, keyboardKey: "Q" },
  { name: "C#5", frequency: 554.37, isSharp: true, keyboardKey: "2" },
  { name: "D5", frequency: 587.33, isSharp: false, keyboardKey: "W" },
  { name: "D#5", frequency: 622.25, isSharp: true, keyboardKey: "3" },
  { name: "E5", frequency: 659.25, isSharp: false, keyboardKey: "E" },
  { name: "F5", frequency: 698.46, isSharp: false, keyboardKey: "R" },
  { name: "F#5", frequency: 739.99, isSharp: true, keyboardKey: "5" },
  { name: "G5", frequency: 783.99, isSharp: false, keyboardKey: "T" },
  { name: "G#5", frequency: 830.61, isSharp: true, keyboardKey: "6" },
  { name: "A5", frequency: 880.00, isSharp: false, keyboardKey: "Y" },
  { name: "A#5", frequency: 932.33, isSharp: true, keyboardKey: "7" },
  { name: "B5", frequency: 987.77, isSharp: false, keyboardKey: "U" },
  { name: "C6", frequency: 1046.50, isSharp: false, keyboardKey: "I" },
];

export const NATURAL_NOTES = NOTES.filter(note => !note.isSharp);
export const SHARP_NOTES = NOTES.filter(note => note.isSharp);

// Keyboard key mapping customization (e.g. for 'ShiftRight' or other specific keys)
// This maps event.key or event.code to the keyboardKey in NOTES
export const KEY_MAP: { [key: string]: string } = {
  "SHIFT": "ShiftRight", // if event.key is "Shift" and we mean "ShiftRight"
  "COMMA": ",",
  "PERIOD": ".",
  "SLASH": "/",
  "SEMICOLON": ";",
  "QUOTE": "'",
  "DIGIT2": "2",
  "DIGIT3": "3",
  "DIGIT5": "5",
  "DIGIT6": "6",
  "DIGIT7": "7"
};
