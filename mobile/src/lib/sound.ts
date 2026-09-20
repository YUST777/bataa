class SoundEngine {
  private ctx: AudioContext | null = null;
  private audioCache: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // Preload audio files if available
    if (typeof window !== 'undefined') {
      try {
        this.audioCache['correct'] = new Audio('/sounds/correct.wav');
        this.audioCache['incorrect'] = new Audio('/sounds/incorrect.wav');
        this.audioCache['finish'] = new Audio('/sounds/finish.mp3');
      } catch {
        // Fallback to Web Audio Synth
      }
    }
  }

  private init() {
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

  playClick(freq = 440) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // ignore
    }
  }

  playAscendingCorrect(combo = 0) {
    try {
      const audio = this.audioCache['correct'];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => this.playSynthCorrect(combo));
        return;
      }
    } catch {
      // fallback
    }
    this.playSynthCorrect(combo);
  }

  private playSynthCorrect(combo = 0) {
    try {
      this.init();
      if (!this.ctx) return;

      const scale = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
      const baseFreq = scale[combo % scale.length];

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(baseFreq * 1.5, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.28);
      osc2.stop(this.ctx.currentTime + 0.28);
    } catch {
      // ignore
    }
  }

  playMistake() {
    try {
      const audio = this.audioCache['incorrect'];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => this.playSynthMistake());
        return;
      }
    } catch {
      // fallback
    }
    this.playSynthMistake();
  }

  private playSynthMistake() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(95, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // ignore
    }
  }

  playCelebrationFanfare() {
    try {
      const audio = this.audioCache['finish'];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => this.playSynthFanfare());
        return;
      }
    } catch {
      // fallback
    }
    this.playSynthFanfare();
  }

  private playSynthFanfare() {
    const notes = [
      { freq: 261.63, time: 0, dur: 0.12 },
      { freq: 329.63, time: 0.12, dur: 0.12 },
      { freq: 392.0, time: 0.24, dur: 0.12 },
      { freq: 523.25, time: 0.36, dur: 0.4 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      setTimeout(() => {
        try {
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + dur);
        } catch {
          // ignore
        }
      }, time * 1000);
    });
  }

  playChestOpen() {
    this.playCelebrationFanfare();
  }
}

export const sound = new SoundEngine();
