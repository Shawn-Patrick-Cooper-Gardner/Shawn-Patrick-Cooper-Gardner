/**
 * Web Audio API V8 Combustion & Supercharger Sound Synthesizer
 * Generates procedural muscle V8 idle lope and throttle revs without external audio files.
 */

class V8AudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private masterGain: GainNode | null = null;

  // Synthesis nodes
  private oscSub: OscillatorNode | null = null;
  private oscMain: OscillatorNode | null = null;
  private oscWhine: OscillatorNode | null = null;
  private whineGain: GainNode | null = null;
  private mainFilter: BiquadFilterNode | null = null;

  // Cam lope modulator
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private currentRpm: number = 900;
  private targetRpm: number = 900;
  private animFrameId: number | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  public start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isRunning) return;

    const now = this.ctx.currentTime;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 0.1);
    this.masterGain.connect(this.ctx.destination);

    // Filter - lowpass for deep exhaust note
    this.mainFilter = this.ctx.createBiquadFilter();
    this.mainFilter.type = 'lowpass';
    this.mainFilter.frequency.setValueAtTime(260, now);
    this.mainFilter.Q.setValueAtTime(4.0, now);
    this.mainFilter.connect(this.masterGain);

    // LFO for Cam Lope (the lumpy V8 race cam idle)
    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.setValueAtTime(4.2, now); // ~4.2 Hz idle pulse

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(14.0, now);

    this.lfoNode.connect(this.lfoGain);

    // Sub Bass Oscillator (Thump)
    this.oscSub = this.ctx.createOscillator();
    this.oscSub.type = 'triangle';
    this.oscSub.frequency.setValueAtTime(28, now);
    this.lfoGain.connect(this.oscSub.frequency);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.6, now);
    this.oscSub.connect(subGain);
    subGain.connect(this.mainFilter);

    // Main Exhaust Bark Oscillator
    this.oscMain = this.ctx.createOscillator();
    this.oscMain.type = 'sawtooth';
    this.oscMain.frequency.setValueAtTime(56, now);
    this.lfoGain.connect(this.oscMain.frequency);

    const mainOscGain = this.ctx.createGain();
    mainOscGain.gain.setValueAtTime(0.4, now);
    this.oscMain.connect(mainOscGain);
    mainOscGain.connect(this.mainFilter);

    // Supercharger Blower Whine Oscillator (Gilmer belt drive)
    this.oscWhine = this.ctx.createOscillator();
    this.oscWhine.type = 'sine';
    this.oscWhine.frequency.setValueAtTime(550, now);

    this.whineGain = this.ctx.createGain();
    this.whineGain.gain.setValueAtTime(0.04, now); // subtle at idle
    this.oscWhine.connect(this.whineGain);
    this.whineGain.connect(this.masterGain);

    // Start oscillators
    this.oscSub.start(now);
    this.oscMain.start(now);
    this.oscWhine.start(now);
    this.lfoNode.start(now);

    this.isRunning = true;
    this.loopUpdate();
  }

  public setRpm(rpm: number) {
    this.targetRpm = Math.max(800, Math.min(rpm, 7200));
  }

  private loopUpdate = () => {
    if (!this.isRunning || !this.ctx) return;

    // Smooth RPM interpolation
    this.currentRpm += (this.targetRpm - this.currentRpm) * 0.12;

    const baseFiringFreq = (this.currentRpm / 60) * 4; // 8 cyl 4 stroke = 4 fires/rev
    const subFreq = baseFiringFreq * 0.5;
    const filterFreq = 180 + (this.currentRpm / 7000) * 850;
    const whineFreq = 420 + (this.currentRpm / 7000) * 1900;
    const whineVol = 0.03 + Math.pow(this.currentRpm / 7000, 2) * 0.18;

    const now = this.ctx.currentTime;
    if (this.oscMain && this.oscSub && this.mainFilter && this.oscWhine && this.whineGain) {
      this.oscMain.frequency.setTargetAtTime(baseFiringFreq, now, 0.05);
      this.oscSub.frequency.setTargetAtTime(subFreq, now, 0.05);
      this.mainFilter.frequency.setTargetAtTime(filterFreq, now, 0.05);
      this.oscWhine.frequency.setTargetAtTime(whineFreq, now, 0.05);
      this.whineGain.gain.setTargetAtTime(whineVol, now, 0.05);
    }

    this.animFrameId = requestAnimationFrame(this.loopUpdate);
  };

  public stop() {
    if (!this.isRunning || !this.ctx) return;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const now = this.ctx.currentTime;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
    }

    setTimeout(() => {
      try {
        this.oscSub?.stop();
        this.oscMain?.stop();
        this.oscWhine?.stop();
        this.lfoNode?.stop();
        this.oscSub?.disconnect();
        this.oscMain?.disconnect();
        this.oscWhine?.disconnect();
        this.lfoNode?.disconnect();
      } catch (err) {
        // already stopped
      }
      this.isRunning = false;
    }, 180);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const audioEngine = new V8AudioEngine();
