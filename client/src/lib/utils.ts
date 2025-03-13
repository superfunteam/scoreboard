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

  constructor() {
    // Initialize audio only once and only in browser environment
    if (typeof window !== 'undefined') {
      this.initAudio();
    }
  }

  private initAudio() {
    if (this.audioInitialized) return;
    
    try {
      // Create audio elements
      this.plusSound = new Audio('/attached_assets/plus.mp3');
      this.minusSound = new Audio('/attached_assets/minus.mp3');
      
      // Preload sounds
      this.plusSound.load();
      this.minusSound.load();
      
      this.audioInitialized = true;
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }

  playPlusSound() {
    this.playSound(this.plusSound);
  }

  playMinusSound() {
    this.playSound(this.minusSound);
  }

  private playSound(sound: HTMLAudioElement | null) {
    if (!sound) return;
    
    try {
      // Reset audio to start and play
      sound.currentTime = 0;
      sound.play().catch(error => {
        // Autoplay might be blocked by browser policy
        console.warn('Audio playback failed:', error);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }
}

export const audioManager = new AudioManager();