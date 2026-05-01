import { useCallback, useMemo } from 'react';

/**
 * Production-ready sound hook with high-availability CDN links.
 * Uses a persistent audio pool and cross-browser priming.
 */

const audioPool = {};

export default function useSound() {
  // Using high-availability CDN links (Pixabay/standard UI sounds)
  // These are more reliable for production environments like Render.
  const soundMap = useMemo(() => ({
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',   // Subtle click
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2568-preview.mp3',     // UI pop
    success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Chime success
    remove: 'https://assets.mixkit.co/active_storage/sfx/256/256-preview.mp3',    // Swish/delete
    error: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'    // Alert error
  }), []);

  const playSound = useCallback((soundType) => {
    const path = soundMap[soundType];
    if (!path) return;

    try {
      if (!audioPool[soundType]) {
        audioPool[soundType] = new Audio(path);
        audioPool[soundType].volume = 1.0; // Maximize volume for better audibility
        audioPool[soundType].preload = 'auto';
      }
      
      const audio = audioPool[soundType];
      
      // Reset if playing
      if (!audio.paused) {
        audio.currentTime = 0;
      }

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log(`%c[Sound System] Playing: ${soundType}`, "color: #2196F3;");
        }).catch(err => {
          if (err.name === "NotAllowedError") {
            console.warn(`[Sound System] Interaction needed for "${soundType}"`);
          }
        });
      }
    } catch (e) {
      console.warn("[Sound System] Error:", e);
    }
  }, [soundMap]);

  return { playSound };
}
