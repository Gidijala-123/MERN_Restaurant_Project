import { useCallback } from 'react';

/**
 * Custom hook to manage project-wide audio feedback.
 * Uses standard HTML5 Audio API for maximum compatibility.
 */
export default function useSound() {
  const playSound = useCallback((soundType) => {
    // Mapping of sound types to their public paths
    const sounds = {
      click: '/sounds/click.mp3',
      pop: '/sounds/pop.mp3',
      success: '/sounds/success.mp3',
      remove: '/sounds/remove.mp3',
      error: '/sounds/error.mp3'
    };

    const path = sounds[soundType];
    if (!path) return;

    const audio = new Audio(path);
    audio.volume = 0.4; // Keep it subtle
    
    // Play with error handling (browsers might block autoplay without user interaction)
    audio.play().catch(err => {
      console.warn(`Audio play blocked or file missing: ${path}`);
    });
  }, []);

  return { playSound };
}
