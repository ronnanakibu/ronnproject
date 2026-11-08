/**
 * Retro 8-Bit Web Audio Synthesizer
 * Zero external audio assets (0 KB download).
 * Pure mathematical oscillators generating authentic arcade SFX.
 */

class SoundFx {
  private ctx: AudioContext | null = null;
  private enabled: boolean;

  constructor() {
    // Enabled by default unless user opted out
    try {
      this.enabled = localStorage.getItem('sound_fx') !== 'false';
    } catch {
      this.enabled = true;
    }
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    try {
      localStorage.setItem('sound_fx', val ? 'true' : 'false');
    } catch {}
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playEnter();
    }
    return this.enabled;
  }

  /**
   * Mechanical keypress / retro typing click
   */
  public playKeypress(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  }

  /**
   * Arcade coin insert / command success chime
   */
  public playEnter(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Retro 8-bit error buzz
   */
  public playError(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.setValueAtTime(95, now + 0.06);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /**
   * Triumphant 8-bit Konami / Power-up arpeggio
   */
  public playPowerUp(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.07, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    });
  }

  /**
   * Glitch / explosion noise for system self-destruct
   */
  public playGlitch(): void {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.25);
  }
}

export const soundFx = new SoundFx();

