class AudioSynth {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy init handled in unlock
  }

  unlock() {
    if (!this.ctx && typeof window !== 'undefined') {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        this.ctx = new Ctx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  playTone(freq: number, type: OscillatorType, duration: number = 0.1) {
    if (!this.enabled || !this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio errors
    }
  }

  playSuccess() {
    this.playTone(440, 'sine', 0.1);
    setTimeout(() => this.playTone(880, 'sine', 0.2), 100);
  }

  playError() {
    this.playTone(150, 'sawtooth', 0.3);
  }

  playClick() {
    this.playTone(800, 'triangle', 0.05);
  }
}

export const audio = new AudioSynth();