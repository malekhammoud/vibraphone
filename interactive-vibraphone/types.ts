
export interface Note {
  name: string;
  frequency: number;
  isSharp: boolean;
  keyboardKey: string;
}

export interface ActiveOscillator {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
}
