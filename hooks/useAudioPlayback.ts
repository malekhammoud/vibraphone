import { useRef, useCallback, useState } from 'react';
import { Note, ActiveOscillator } from '../types';

const useAudioPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Map<string, ActiveOscillator>>(new Map());
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const initializeAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setIsAudioInitialized(true);
      } catch (error) {
        console.error("Failed to initialize AudioContext:", error);
      }
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
  }, []);

  const playNote = useCallback((note: Note, sustainActive: boolean, onEnded?: () => void) => {
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
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(note.frequency, audioContextRef.current.currentTime);

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(note.frequency * 3, audioContextRef.current.currentTime);
    filterNode.Q.setValueAtTime(1, audioContextRef.current.currentTime);

    const now = audioContextRef.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);

    const decayTime = sustainActive ? 4 : 0.8;
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decayTime);

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start(now);

    oscillator.onended = () => {
      activeOscillatorsRef.current.delete(note.name);
      try {
        filterNode.disconnect();
        gainNode.disconnect();
      } catch (e) { /* Fails silently if already disconnected */ }
      if (onEnded) onEnded();
    };

    activeOscillatorsRef.current.set(note.name, { oscillator, gainNode, filterNode });
    oscillator.stop(now + decayTime + 0.1);
  }, []);

  const stopAllNotes = useCallback(() => {
    if (!audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    activeOscillatorsRef.current.forEach(({ oscillator, gainNode }) => {
      try {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        oscillator.stop(now + 0.25);
      } catch (e) { /* Fails silently */ }
    });
  }, []);

  return { initializeAudio, playNote, stopAllNotes, isAudioInitialized, audioContextRef };
};

export default useAudioPlayback;

