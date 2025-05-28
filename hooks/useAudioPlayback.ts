
import { useRef, useCallback, useState } from 'react';
import { Note, ActiveOscillator } from '../types';

const useAudioPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Map<string, ActiveOscillator>>(new Map());
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const initializeAudio = useCallback(() => {
    if (audioContextRef.current) {
       if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      return;
    }
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      setIsAudioInitialized(true);
      if (context.state === "suspended") {
        context.resume();
      }
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
      alert("Your browser does not support Web Audio API. Please try a modern browser.");
    }
  }, []);

  const playNote = useCallback((note: Note, sustainActive: boolean) => {
    if (!audioContextRef.current) {
      console.warn("AudioContext not initialized. Call initializeAudio first.");
      return;
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const existing = activeOscillatorsRef.current.get(note.name);
    if (existing) {
      try {
        existing.gainNode.gain.cancelScheduledValues(audioContextRef.current.currentTime);
        existing.gainNode.gain.setValueAtTime(existing.gainNode.gain.value, audioContextRef.current.currentTime);
        existing.gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.02);
        existing.oscillator.stop(audioContextRef.current.currentTime + 0.02);
      } catch (e) { /* Fails silently if already stopped */ }
      activeOscillatorsRef.current.delete(note.name);
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    const filterNode = audioContextRef.current.createBiquadFilter();
    
    oscillator.type = 'sine'; // Vibraphones have a very pure tone, sine is good.
    oscillator.frequency.setValueAtTime(note.frequency, audioContextRef.current.currentTime);

    // A second oscillator for richness (optional, can be resource intensive)
    // const harmonicOscillator = audioContextRef.current.createOscillator();
    // harmonicOscillator.type = 'triangle';
    // harmonicOscillator.frequency.setValueAtTime(note.frequency * 2, audioContextRef.current.currentTime); // Octave higher
    // const harmonicGain = audioContextRef.current.createGain();
    // harmonicGain.gain.setValueAtTime(0.15, audioContextRef.current.currentTime); // Lower volume

    filterNode.type = 'lowpass'; // lowpass for warmth, or bandpass for metallic character
    filterNode.frequency.setValueAtTime(note.frequency * 3, audioContextRef.current.currentTime); // Adjust for desired brightness
    filterNode.Q.setValueAtTime(1, audioContextRef.current.currentTime); // Subtle resonance

    // Envelope
    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Quick attack

    const decayTime = sustainActive ? 4 : 0.8; // Longer decay with sustain
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);
    
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    // harmonicOscillator.connect(harmonicGain);
    // harmonicGain.connect(gainNode); // Connect harmonic to main gain

    oscillator.start(now);
    // harmonicOscillator.start(now);

    oscillator.onended = () => {
      // Clean up when note naturally ends or is stopped by sustain release
      activeOscillatorsRef.current.delete(note.name);
       try {
        filterNode.disconnect();
        gainNode.disconnect();
        // harmonicGain.disconnect();
      } catch (e) { /* Fails silently if already disconnected */ }
    };
    
    activeOscillatorsRef.current.set(note.name, { oscillator, gainNode, filterNode });
     // Ensure oscillator stops eventually to free resources
    oscillator.stop(now + decayTime + 0.1); // Stop slightly after gain reaches minimum
    // harmonicOscillator.stop(now + decayTime + 0.1);


  }, []);

  const stopAllNotes = useCallback(() => {
    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    activeOscillatorsRef.current.forEach(({ oscillator, gainNode }, noteName) => {
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now); // Start from current gain
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25); // Quick but smooth release
        oscillator.stop(now + 0.25);
      } catch (e) { /* Fails silently */ }
    });
    // Don't clear the map here, onended will handle it.
    // activeOscillatorsRef.current.clear(); // Clearing here might be too soon if onended relies on it
  }, []);

  return { initializeAudio, playNote, stopAllNotes, isAudioInitialized, audioContextRef };
};

export default useAudioPlayback;
