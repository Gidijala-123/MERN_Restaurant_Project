import { useCallback, useMemo } from 'react';

/**
 * Enhanced sound hook with a persistent audio pool.
 * This approach helps bypass browser "NotAllowedError" by reusing audio objects 
 * once the user has performed at least one interaction.
 */

// Shared audio instances to bypass "new Audio()" blocking in some browsers
const audioPool = {};

export default function useSound() {
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
      // Reuse existing audio object if available in pool
      if (!audioPool[soundType]) {
        audioPool[soundType] = new Audio(path);
      }
      
      const audio = audioPool[soundType];
      audio.volume = 0.6; // Slightly higher volume for better feedback
      
      // Reset sound to beginning if it's already playing
      if (!audio.paused) {
        audio.currentTime = 0;
      }

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // If blocked, we log a more helpful message for the user
          if (err.name === "NotAllowedError") {
            console.warn(`[Sound System] Playback of "${soundType}" was blocked. Please click anywhere on the page to enable sounds.`);
          }
        });
      }
    } catch (e) {
      console.warn("[Sound System] Initialization error:", e);
    }
  }, [soundMap]);

  return { playSound };
}
