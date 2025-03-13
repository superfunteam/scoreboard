import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Helper for combining Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Audio player for score increment/decrement sounds
class AudioManager {
  private plusSound: HTMLAudioElement | null = null;
  private minusSound: HTMLAudioElement | null = null;
  private audioInitialized = false;
  private attemptedPaths: string[] = [];

  constructor() {
    // Initialize audio only once and only in browser environment
    if (typeof window !== 'undefined') {
      // Slight delay to ensure DOM is fully loaded in static builds
      setTimeout(() => this.initAudio(), 500);
    }
  }

  private initAudio() {
    if (this.audioInitialized) return;
    
    // Potential paths to try for audio files
    // This handles both development and static build scenarios
    const possiblePaths = [
      // Standard path for dev server
      '/attached_assets/plus.mp3',
      '/attached_assets/minus.mp3',
      // Root-relative paths for static build
      './attached_assets/plus.mp3',
      './attached_assets/minus.mp3',
      // Absolute paths from root
      `${window.location.origin}/attached_assets/plus.mp3`,
      `${window.location.origin}/attached_assets/minus.mp3`,
      // Fallback to relative paths
      'attached_assets/plus.mp3',
      'attached_assets/minus.mp3'
    ];
    
    try {
      // Create audio elements with first path option
      this.plusSound = new Audio(possiblePaths[0]);
      this.minusSound = new Audio(possiblePaths[1]);
      
      // Store attempted paths for debugging
      this.attemptedPaths = [possiblePaths[0], possiblePaths[1]];
      
      // Add error handlers to try alternative paths if loading fails
      this.plusSound.addEventListener('error', () => {
        console.warn(`Failed to load audio from ${this.attemptedPaths[0]}, trying alternatives...`);
        this.tryAlternativePaths(possiblePaths.slice(2), true);
      });
      
      this.minusSound.addEventListener('error', () => {
        console.warn(`Failed to load audio from ${this.attemptedPaths[1]}, trying alternatives...`);
        this.tryAlternativePaths(possiblePaths.slice(3), false);
      });
      
      // Preload sounds
      this.plusSound.load();
      this.minusSound.load();
      
      this.audioInitialized = true;
      console.log('Audio initialized with paths:', this.attemptedPaths);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  // Try alternative paths if the initial ones fail
  private tryAlternativePaths(paths: string[], isPlus: boolean) {
    if (paths.length === 0) {
      console.error('All audio paths failed. Audio will not play.');
      return;
    }
    
    try {
      const path = paths[0];
      const sound = new Audio(path);
      
      sound.addEventListener('error', () => {
        console.warn(`Failed to load audio from ${path}, trying next alternative...`);
        this.tryAlternativePaths(paths.slice(1), isPlus);
      });
      
      sound.addEventListener('loadeddata', () => {
        console.log(`Successfully loaded audio from ${path}`);
        if (isPlus) {
          this.plusSound = sound;
          this.attemptedPaths[0] = path;
        } else {
          this.minusSound = sound;
          this.attemptedPaths[1] = path;
        }
      });
      
      sound.load();
    } catch (error) {
      console.error('Error trying alternative audio path:', error);
      this.tryAlternativePaths(paths.slice(1), isPlus);
    }
  }

  playPlusSound() {
    this.playSound(this.plusSound);
  }

  playMinusSound() {
    this.playSound(this.minusSound);
  }

  private playSound(sound: HTMLAudioElement | null) {
    if (!sound) {
      console.warn('No audio available to play');
      return;
    }
    
    try {
      // Reset audio to start and play
      sound.currentTime = 0;
      const playPromise = sound.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Autoplay might be blocked by browser policy
          console.warn('Audio playback failed:', error);
          
          // If autoplay is blocked, try playing on next user interaction
          const handleInteraction = () => {
            sound.play().catch(e => console.warn('Still failed to play audio:', e));
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
          };
          
          window.addEventListener('click', handleInteraction, { once: true });
          window.addEventListener('keydown', handleInteraction, { once: true });
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }
}

export const audioManager = new AudioManager();