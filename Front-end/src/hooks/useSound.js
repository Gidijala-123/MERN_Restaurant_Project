import { useCallback } from 'react';

/**
 * Custom hook to manage project-wide audio feedback.
 * Uses standard HTML5 Audio API for maximum compatibility.
 */
export default function useSound() {
  const playSound = useCallback((soundType) => {
    // Mapping of sound types to paths. 
    // We use reliable CDN links as primary so it works IMMEDIATELY.
    // If you add local files to /public/sounds/, you can change these paths.
    const sounds = {
      click: 'https://www.soundjay.com/buttons/sounds/button-16.mp3',
      pop: 'https://www.soundjay.com/buttons/sounds/button-37.mp3',
      success: 'https://www.soundjay.com/buttons/sounds/button-09.mp3',
      remove: 'https://www.soundjay.com/buttons/sounds/button-10.mp3',
      error: 'https://www.soundjay.com/buttons/sounds/button-11.mp3'
    };

    const path = sounds[soundType];
    if (!path) return;

    try {
      const audio = new Audio(path);
      audio.volume = 0.3; // Very subtle
      
      // Attempt to play
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // Browsers block audio until the user interacts with the page (click/tap)
          console.log("Audio playback waiting for user interaction...");
        });
      }
    } catch (e) {
      console.warn("Audio initialization failed", e);
    }
  }, []);

  return { playSound };
}
