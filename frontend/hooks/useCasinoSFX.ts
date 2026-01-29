import { useCallback } from 'react';

export const useCasinoSFX = () => {
    const playSound = useCallback((type: 'spin' | 'win' | 'loss' | 'deal' | 'click' | 'bell' | 'chip' | 'shatter') => {
        if (typeof window === 'undefined') return;

        try {
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            if (type === 'spin') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start();
                osc.stop(now + 0.5);
            } else if (type === 'win') {
                osc.type = 'square';
                const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
                notes.forEach((freq, i) => {
                    osc.frequency.setValueAtTime(freq, now + i * 0.08);
                });
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.6);
                osc.start();
                osc.stop(now + 0.6);
            } else if (type === 'loss') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(55, now + 0.5);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start();
                osc.stop(now + 0.5);
            } else if (type === 'deal') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start();
                osc.stop(now + 0.1);
            } else if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start();
                osc.stop(now + 0.05);
            } else if (type === 'bell') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1500, now);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
                osc.start();
                osc.stop(now + 1);
            } else if (type === 'chip') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(2000, now);
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start();
                osc.stop(now + 0.05);
            } else if (type === 'shatter') {
                // Glass break / negative effect
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start();
                osc.stop(now + 0.3);
            }
        } catch (e) {
            console.warn("Audio Context failed", e);
        }
    }, []);

    return { playSound };
};
