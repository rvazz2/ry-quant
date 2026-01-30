
import confetti from 'canvas-confetti';

type ConfettiType = 'win' | 'jackpot' | 'realistic' | 'fireworks';

/**
 * Triggers a confetti animation based on the specified type.
 * @param type - The type of confetti animation to trigger. Defaults to 'win'.
 * @param duration - Duration in ms (only for some presets like fireworks).
 */
export const triggerConfetti = (type: ConfettiType = 'win', duration: number = 2000) => {
    switch (type) {
        case 'win':
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#22d3ee', '#34d399', '#f472b6', '#fbbf24'] // Cyan, Emerald, Pink, Amber
            });
            break;

        case 'jackpot':
            const end = Date.now() + duration;
            const colors = ['#FFD700', '#FFA500', '#FF4500']; // Gold, Orange, Red

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            })();
            break;

        case 'realistic':
            const count = 200;
            const defaults = {
                origin: { y: 0.7 }
            };

            const fire = (particleRatio: number, opts: confetti.Options) => {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
            break;

        case 'fireworks':
            const interval = setInterval(() => {
                const timeLeft = duration - (Date.now() - (Date.now() - duration));
                if (Date.now() > Date.now() + duration) { // Logic fix: simplifying
                    return clearInterval(interval);
                }
                // random fireworks
                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount: 50,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                    particleCount: 50,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            // Stop after duration
            setTimeout(() => clearInterval(interval), duration);
            break;
    }
};
