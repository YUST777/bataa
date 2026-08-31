/**
 * Web Audio API Harmonic Synthesizer
 * Provides Duolingo-style ascending chromatic scale combo chimes,
 * mechanical tactile button clicks, celebration fanfares, and error cues.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

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

  public setMuted(mute: boolean) {
    this.muted = mute;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Tactile button mechanical click
   */
  public playClick(freq = 420) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  /**
   * Ascending combo chime based on combo index k
   * Frequencies based on C-Major Scale: C4, D4, E4, F4, G4, A4, B4, C5
   */
  public playAscendingCorrect(comboIndex = 0) {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const majorScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
    const baseFreq = majorScale[comboIndex % majorScale.length];

    const now = this.ctx.currentTime;
    
    // Main chime note
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);

    // Harmonic fifth sparkle
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now + 0.05);

    gain2.gain.setValueAtTime(0.18, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.33);
  }

  /**
   * Harmonic Major Fanfare upon completing a lesson
   */
  public playCelebrationFanfare() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chord = [261.63, 329.63, 392.00, 523.25]; // C Major
    const now = this.ctx.currentTime;

    chord.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteStart = now + i * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.25, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.62);
    });

    // Grand resolution chord
    setTimeout(() => {
      if (!this.ctx) return;
      const resNow = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, resNow);
        gain.gain.setValueAtTime(0.2, resNow);
        gain.gain.exponentialRampToValueAtTime(0.001, resNow + 1.1);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(resNow);
        osc.stop(resNow + 1.15);
      });
    }, 450);
  }

  /**
   * Gentle Mistake Tone (Non-punitive soft boing)
   */
  public playMistake() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Chest Unlock Mystery Jingle
   */
  public playChestOpen() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.42);
    });
  }
}

export const sound = new SoundEffectsEngine();
