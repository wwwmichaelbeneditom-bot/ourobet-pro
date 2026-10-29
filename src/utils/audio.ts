// Web Audio API Synthesizer for high-fidelity casino & arcade sound effects and soft ambient melody
class SoundController {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private isMusicActive: boolean = false;
  private musicTimer: number | null = null;
  private rocketOscillator: OscillatorNode | null = null;
  private rocketGain: GainNode | null = null;
  private masterMusicGain: GainNode | null = null;

  constructor() {
    // Lazy init on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stopRocketSound();
      this.stopAmbientMusic();
    } else if (this.musicEnabled) {
      this.startAmbientMusic();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopAmbientMusic();
    } else if (this.soundEnabled) {
      this.startAmbientMusic();
    }
  }

  public isMusicOn(): boolean {
    return this.musicEnabled && this.isMusicActive;
  }

  // Soft and attractive casino lounge ambient melody
  // Warm ethereal chords with gentle pentatonic bell/chime arpeggios
  public startAmbientMusic() {
    if (!this.musicEnabled || !this.soundEnabled || this.isMusicActive) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicActive = true;

    // Chord progressions in Key of C/A minor (Fmaj7 -> Em7 -> Dm7 -> Gsus4 / Am)
    // Relaxing, luxurious casino lounge frequency palette
    const chords = [
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [164.81, 196.00, 246.94, 293.66], // Em7 (E3, G3, B3, D4)
      [146.83, 174.61, 220.00, 261.63], // Dm7 (D3, F3, A3, C4)
      [196.00, 246.94, 293.66, 392.00], // G/B (G3, B3, D4, G4)
    ];

    // Delicate soothing arpeggio notes
    const melodyNotes = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99]; // E4, G4, A4, C5, D5, E5, G5

    let chordIndex = 0;
    let step = 0;

    const playStep = () => {
      if (!this.isMusicActive || !this.ctx || !this.soundEnabled || !this.musicEnabled) return;

      const now = this.ctx.currentTime;

      // Play soft warm pad chord every 8 steps (4 seconds)
      if (step % 8 === 0) {
        const chord = chords[chordIndex % chords.length];
        chordIndex++;

        chord.forEach((freq) => {
          if (!this.ctx) return;
          try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, now);

            // Very soft, ambient volume
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.022, now + 1.2);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.9);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 4.0);
          } catch {
            // Audio error ignored
          }
        });
      }

      // Gentle acoustic bell/chime arpeggio note
      if (Math.random() > 0.35) {
        const noteFreq = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        try {
          const mOsc = this.ctx.createOscillator();
          const mGain = this.ctx.createGain();
          const mFilter = this.ctx.createBiquadFilter();

          mOsc.type = 'triangle';
          mOsc.frequency.setValueAtTime(noteFreq, now);

          mFilter.type = 'lowpass';
          mFilter.frequency.setValueAtTime(1400, now);

          mGain.gain.setValueAtTime(0.001, now);
          mGain.gain.linearRampToValueAtTime(0.025, now + 0.05);
          mGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

          mOsc.connect(mFilter);
          mFilter.connect(mGain);
          mGain.connect(this.ctx.destination);

          mOsc.start(now);
          mOsc.stop(now + 1.5);
        } catch {
          // Audio error ignored
        }
      }

      step++;
      this.musicTimer = window.setTimeout(playStep, 500);
    };

    playStep();
  }

  public stopAmbientMusic() {
    this.isMusicActive = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  public toggleAmbientMusic(): boolean {
    if (this.isMusicActive) {
      this.setMusicEnabled(false);
      return false;
    } else {
      this.setMusicEnabled(true);
      this.startAmbientMusic();
      return true;
    }
  }

  // Haptic feedback for Android phones
  public haptic(pattern: number | number[] = 30) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if not supported or disabled
      }
    }
  }

  // Button tap sound
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Start background music seamlessly on first click if not started
    if (this.musicEnabled && !this.isMusicActive) {
      this.startAmbientMusic();
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
      this.haptic(15);
    } catch {
      // Audio fallback silent
    }
  }

  // Win / Cashout sound
  public playWin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });

      this.haptic([40, 60, 80]);
    } catch {
      // Audio fallback silent
    }
  }

  // Crash / Explosion sound
  public playCrash() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Noise buffer for explosion
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(now);
      this.haptic([80, 50, 150]);
    } catch {
      // Audio fallback silent
    }
  }

  // Gem reveal sound in Mines
  public playGem() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
      this.haptic(25);
    } catch {
      // Audio fallback silent
    }
  }

  // Roulette tick
  public playRouletteTick(pitch: number = 400) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // Audio fallback silent
    }
  }

  // Rocket pitch rise sound during flight
  public startRocketSound(multiplier: number = 1.0) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      if (!this.rocketOscillator) {
        this.rocketOscillator = this.ctx.createOscillator();
        this.rocketGain = this.ctx.createGain();
        this.rocketOscillator.type = 'sawtooth';
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);

        this.rocketGain.gain.setValueAtTime(0.05, this.ctx.currentTime);

        this.rocketOscillator.connect(filter);
        filter.connect(this.rocketGain);
        this.rocketGain.connect(this.ctx.destination);

        this.rocketOscillator.start();
      }

      if (this.rocketOscillator) {
        const freq = Math.min(600, 120 + multiplier * 35);
        this.rocketOscillator.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.1);
      }
    } catch {
      // Audio fallback silent
    }
  }

  public stopRocketSound() {
    if (this.rocketOscillator) {
      try {
        this.rocketOscillator.stop();
        this.rocketOscillator.disconnect();
      } catch {
        // Ignore
      }
      this.rocketOscillator = null;
      this.rocketGain = null;
    }
  }
}

export const soundFx = new SoundController();
