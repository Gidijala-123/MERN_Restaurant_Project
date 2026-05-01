import { useCallback, useMemo } from 'react';

/**
 * Custom hook to manage project-wide audio feedback.
 * Pre-loads audio objects for faster response and handles browser autoplay restrictions.
 */
export default function useSound() {
  // Mapping of sound types to paths.
  const soundMap = useMemo(() => ({
    click: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
    pop: 'https://www.soundjay.com/buttons/sounds/button-37.mp3',
    success: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
    remove: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
    error: 'https://www.soundjay.com/buttons/sounds/button-11.mp3'
  }), []);

  const playSound = useCallback((soundType) => {
    const path = soundMap[soundType];
    if (!path) return;

    try {
      const audio = new Audio(path);
      audio.volume = 0.5; // Increased volume slightly for better audibility
      
      // Pre-load the sound
      audio.load();

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name === "NotAllowedError") {
            console.warn(`[useSound] Playback blocked for "${soundType}". Browser requires a user gesture (click/tap) on the page first.`);
          } else {
            console.error(`[useSound] Error playing "${soundType}":`, err);
          }
        });
      }
    } catch (e) {
      console.warn("[useSound] Audio initialization failed", e);
    }
  }, [soundMap]);

  return { playSound };
}
