/**
 * C.O.R.E. (Company Off-road Racing Engines)
 * Layered Asset High-Fidelity Audio Engine: Chain-Blown 400cu Trick-Fueled V8
 * 13 Aerospace Defense Company · Directorate Shawn Patrick Cooper Gardner
 *
 * Replaces procedural synthesizers with realistic high-fidelity sound sample assets:
 * 1. Ignition & Starter Crank Flare (/audio/400cu_ignition_crank_catch.wav)
 * 2. Idle Cam Lope & Roots Surge (/audio/400cu_idle_cam_lope.wav)
 * 3. High-RPM Blown Combustion Roar (/audio/400cu_high_rpm_combustion.wav)
 * 4. Decel Overrun Unburnt Race Fuel Pops (/audio/400cu_decel_overrun_pops.wav)
 * 5. Two-Step Launch Limiter Stutter Box (/audio/400cu_twostep_limiter.wav)
 */

export type SoundProfileId = 'chain-blown-400-trick' | 'open-zoomies-nitro-trick' | 'desert-wash-18psi';

export interface SoundProfile {
  id: SoundProfileId;
  name: string;
  tagline: string;
  idleRpm: number;
  maxRpm: number;
  blowerRatio: number;
  whineBoostDb: number;
  headerSnapLevel: number;
}

export const SOUND_PROFILES: Record<SoundProfileId, SoundProfile> = {
  'chain-blown-400-trick': {
    id: 'chain-blown-400-trick',
    name: 'Chain-Blown 400cu C.O.R.E. V8 (Trick 110 Race Fuel)',
    tagline: 'High-fidelity sample assets of 8-71 Roots blower, radical cam chop & open zoomies',
    idleRpm: 920,
    maxRpm: 7400,
    blowerRatio: 1.35,
    whineBoostDb: 3.5,
    headerSnapLevel: 0.45,
  },
  'open-zoomies-nitro-trick': {
    id: 'open-zoomies-nitro-trick',
    name: 'Open Zoomies Nitro-Trick Blend (13.5:1 Comp)',
    tagline: 'Raw header shockwaves, aggressive compression cackle, fast flame front',
    idleRpm: 1020,
    maxRpm: 7800,
    blowerRatio: 1.42,
    whineBoostDb: 5.0,
    headerSnapLevel: 0.65,
  },
  'desert-wash-18psi': {
    id: 'desert-wash-18psi',
    name: 'Desert Wash High-Boost Pull (18 PSI W.O.T.)',
    tagline: 'Full positive displacement scream, carb scoop vacuum roar, sand wash blast',
    idleRpm: 880,
    maxRpm: 7200,
    blowerRatio: 1.30,
    whineBoostDb: 6.0,
    headerSnapLevel: 0.40,
  },
};

export interface AudioTelemetry {
  rpm: number;
  boostPsi: number;
  blowerFreqHz: number;
  throttlePercent: number;
  isCranking: boolean;
  isTwoStep: boolean;
  isRunning: boolean;
  profileId: SoundProfileId;
}

class V8AudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isCranking: boolean = false;
  private isTwoStep: boolean = false;

  // Master Nodes
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Layered Asset Buffers
  private idleBuffer: AudioBuffer | null = null;
  private highRpmBuffer: AudioBuffer | null = null;
  private ignitionBuffer: AudioBuffer | null = null;
  private decelBuffer: AudioBuffer | null = null;
  private twoStepBuffer: AudioBuffer | null = null;
  private assetsLoaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  // Active Looping Layer Source Nodes
  private idleSource: AudioBufferSourceNode | null = null;
  private idleGain: GainNode | null = null;
  private highRpmSource: AudioBufferSourceNode | null = null;
  private highRpmGain: GainNode | null = null;
  private twoStepSource: AudioBufferSourceNode | null = null;
  private twoStepGain: GainNode | null = null;

  // Supercharger Boost Emphasis Filter
  private blowerBiquad: BiquadFilterNode | null = null;
  private headerBiquad: BiquadFilterNode | null = null;

  // Active State
  private activeProfile: SoundProfile = SOUND_PROFILES['chain-blown-400-trick'];
  private currentRpm: number = 920;
  private targetRpm: number = 920;
  private previousRpm: number = 920;
  private animFrameId: number | null = null;

  // Telemetry listeners
  private telemetryListeners: Array<(telemetry: AudioTelemetry) => void> = [];

  public init() {
    if (this.ctx) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.preloadAssets();
  }

  public getContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  /**
   * Preload high-fidelity layered sound sample WAV assets
   */
  public preloadAssets(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      if (!this.ctx) return;

      const loadBuffer = async (url: string): Promise<AudioBuffer | null> => {
        try {
          const resp = await fetch(url);
          if (!resp.ok) {
            console.warn(`Failed to fetch audio asset: ${url}`);
            return null;
          }
          const arrayBuffer = await resp.arrayBuffer();
          if (this.ctx) {
            return await this.ctx.decodeAudioData(arrayBuffer);
          }
        } catch (err) {
          console.warn(`Error decoding audio asset ${url}:`, err);
        }
        return null;
      };

      const [idle, highRpm, ignition, decel, twoStep] = await Promise.all([
        loadBuffer('/audio/400cu_idle_cam_lope.wav'),
        loadBuffer('/audio/400cu_high_rpm_combustion.wav'),
        loadBuffer('/audio/400cu_ignition_crank_catch.wav'),
        loadBuffer('/audio/400cu_decel_overrun_pops.wav'),
        loadBuffer('/audio/400cu_twostep_limiter.wav'),
      ]);

      this.idleBuffer = idle;
      this.highRpmBuffer = highRpm;
      this.ignitionBuffer = ignition;
      this.decelBuffer = decel;
      this.twoStepBuffer = twoStep;
      this.assetsLoaded = true;
    })();

    return this.loadPromise;
  }

  public setProfile(profileId: SoundProfileId) {
    if (SOUND_PROFILES[profileId]) {
      this.activeProfile = SOUND_PROFILES[profileId];
      if (this.isRunning && !this.isCranking) {
        this.targetRpm = Math.max(this.targetRpm, this.activeProfile.idleRpm);
        this.updateProfileAcoustics();
      }
    }
  }

  public getActiveProfile(): SoundProfile {
    return this.activeProfile;
  }

  public onTelemetry(cb: (t: AudioTelemetry) => void): () => void {
    this.telemetryListeners.push(cb);
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== cb);
    };
  }

  private broadcastTelemetry() {
    const boostPsi = this.calculateBoostPsi(this.currentRpm);
    const blowerFreq = Math.round((this.currentRpm / 60) * this.activeProfile.blowerRatio * 32);
    const telemetry: AudioTelemetry = {
      rpm: Math.round(this.currentRpm),
      boostPsi: Number(boostPsi.toFixed(1)),
      blowerFreqHz: blowerFreq,
      throttlePercent: Math.round(
        Math.max(
          0,
          Math.min(
            100,
            ((this.currentRpm - this.activeProfile.idleRpm) /
              (this.activeProfile.maxRpm - this.activeProfile.idleRpm)) *
              100
          )
        )
      ),
      isCranking: this.isCranking,
      isTwoStep: this.isTwoStep,
      isRunning: this.isRunning,
      profileId: this.activeProfile.id,
    };
    for (const listener of this.telemetryListeners) {
      listener(telemetry);
    }
  }

  private calculateBoostPsi(rpm: number): number {
    const idle = this.activeProfile.idleRpm;
    const max = this.activeProfile.maxRpm;
    if (rpm <= idle + 100) return 0.5;
    const progress = (rpm - idle) / (max - idle);
    return 1.0 + Math.pow(progress, 0.85) * (this.activeProfile.id === 'desert-wash-18psi' ? 17.0 : 13.5);
  }

  /**
   * Authentic Starter Motor Crank & Trick Fuel Ignition Catch
   * Uses high-fidelity /audio/400cu_ignition_crank_catch.wav layered asset
   */
  public async startWithCrank(): Promise<void> {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isRunning) return;

    await this.preloadAssets();

    this.isCranking = true;
    const now = this.ctx.currentTime;

    if (this.ignitionBuffer) {
      const ignitionSource = this.ctx.createBufferSource();
      ignitionSource.buffer = this.ignitionBuffer;

      const ignitionGain = this.ctx.createGain();
      ignitionGain.gain.setValueAtTime(0.85, now);

      ignitionSource.connect(ignitionGain);
      ignitionGain.connect(this.ctx.destination);
      ignitionSource.start(now);

      // At 1.15s, Trick fuel ignites and flares! Start the continuous looping engine layers
      setTimeout(() => {
        this.isCranking = false;
        this.startContinuousLayers(2400); // start at flare RPM
        this.targetRpm = 2400;

        // Settle smoothly to idle over 1.2s
        setTimeout(() => {
          this.targetRpm = this.activeProfile.idleRpm;
        }, 500);
      }, 1150);
    } else {
      // Fallback if asset still loading
      this.isCranking = false;
      this.startContinuousLayers(this.activeProfile.idleRpm);
    }
  }

  /**
   * Start continuous engine combustion layers (Idle Cam Lope + High-RPM Blown Combustion)
   */
  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isRunning) return;

    await this.preloadAssets();
    this.startContinuousLayers(this.activeProfile.idleRpm);
  }

  private startContinuousLayers(initialRpm: number) {
    if (!this.ctx || this.isRunning) return;

    const now = this.ctx.currentTime;
    this.currentRpm = initialRpm;
    this.targetRpm = initialRpm;
    this.previousRpm = initialRpm;

    // 1. Dynamics Compressor for analog mastering
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-12, now);
    this.compressor.knee.setValueAtTime(10, now);
    this.compressor.ratio.setValueAtTime(6.0, now);
    this.compressor.attack.setValueAtTime(0.002, now);
    this.compressor.release.setValueAtTime(0.06, now);
    this.compressor.connect(this.ctx.destination);

    // 2. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.55, now + 0.1);
    this.masterGain.connect(this.compressor);

    // 3. Acoustic Filters (Roots Blower Gilmer Whine & Header Bark Peaking)
    this.blowerBiquad = this.ctx.createBiquadFilter();
    this.blowerBiquad.type = 'peaking';
    this.blowerBiquad.frequency.setValueAtTime(3200, now);
    this.blowerBiquad.Q.setValueAtTime(3.5, now);
    this.blowerBiquad.gain.setValueAtTime(this.activeProfile.whineBoostDb, now);
    this.blowerBiquad.connect(this.masterGain);

    this.headerBiquad = this.ctx.createBiquadFilter();
    this.headerBiquad.type = 'peaking';
    this.headerBiquad.frequency.setValueAtTime(160, now);
    this.headerBiquad.Q.setValueAtTime(2.8, now);
    this.headerBiquad.gain.setValueAtTime(6.0, now);
    this.headerBiquad.connect(this.masterGain);

    // 4. Idle Cam Lope Layer (400cu_idle_cam_lope.wav)
    if (this.idleBuffer) {
      this.idleSource = this.ctx.createBufferSource();
      this.idleSource.buffer = this.idleBuffer;
      this.idleSource.loop = true;
      this.idleSource.playbackRate.setValueAtTime(this.currentRpm / 920.0, now);

      this.idleGain = this.ctx.createGain();
      this.idleGain.gain.setValueAtTime(0.85, now);

      this.idleSource.connect(this.headerBiquad);
      this.idleSource.connect(this.idleGain);
      this.idleGain.connect(this.masterGain);
      this.idleSource.start(now);
    }

    // 5. High-RPM Combustion & Blower Roar Layer (400cu_high_rpm_combustion.wav)
    if (this.highRpmBuffer) {
      this.highRpmSource = this.ctx.createBufferSource();
      this.highRpmSource.buffer = this.highRpmBuffer;
      this.highRpmSource.loop = true;
      this.highRpmSource.playbackRate.setValueAtTime(this.currentRpm / 7000.0, now);

      this.highRpmGain = this.ctx.createGain();
      this.highRpmGain.gain.setValueAtTime(0.01, now); // starts quiet at idle

      this.highRpmSource.connect(this.blowerBiquad);
      this.highRpmSource.connect(this.highRpmGain);
      this.highRpmGain.connect(this.masterGain);
      this.highRpmSource.start(now);
    }

    this.isRunning = true;
    this.loopUpdate();
  }

  private updateProfileAcoustics() {
    if (!this.ctx || !this.isRunning) return;
    const now = this.ctx.currentTime;
    if (this.blowerBiquad) {
      this.blowerBiquad.gain.setValueAtTime(this.activeProfile.whineBoostDb, now);
    }
  }

  public setRpm(rpm: number) {
    this.targetRpm = Math.max(
      this.activeProfile.idleRpm,
      Math.min(rpm, this.activeProfile.maxRpm)
    );
  }

  public getRpm(): number {
    return this.currentRpm;
  }

  /**
   * Fast Throttle Blip (Instant throttle snap `BRAAAP!`)
   */
  public throttleBlip() {
    if (!this.isRunning) {
      this.start();
    }
    this.targetRpm = 6000;
    setTimeout(() => {
      this.targetRpm = this.activeProfile.idleRpm;
    }, 380);
  }

  /**
   * Two-Step Launch Limiter Mode
   * Uses /audio/400cu_twostep_limiter.wav layered asset
   */
  public setTwoStep(active: boolean) {
    if (this.isTwoStep === active) return;
    this.isTwoStep = active;

    if (active) {
      if (!this.isRunning) this.start();
      this.targetRpm = 4600;

      // Start looping 2-step asset
      if (this.ctx && this.twoStepBuffer && !this.twoStepSource) {
        const now = this.ctx.currentTime;
        this.twoStepSource = this.ctx.createBufferSource();
        this.twoStepSource.buffer = this.twoStepBuffer;
        this.twoStepSource.loop = true;

        this.twoStepGain = this.ctx.createGain();
        this.twoStepGain.gain.setValueAtTime(0.85, now);

        this.twoStepSource.connect(this.twoStepGain);
        if (this.masterGain) {
          this.twoStepGain.connect(this.masterGain);
        } else {
          this.twoStepGain.connect(this.ctx.destination);
        }
        this.twoStepSource.start(now);
      }
    } else {
      if (this.twoStepSource) {
        try {
          this.twoStepSource.stop();
          this.twoStepSource.disconnect();
        } catch (e) {
          // ignore
        }
        this.twoStepSource = null;
        this.twoStepGain = null;
      }
      this.targetRpm = this.activeProfile.idleRpm;
      // Releasing launch control triggers a massive unburnt fuel backfire
      this.playBackfirePop(1.0);
    }
  }

  /**
   * Decel Overrun Backfire & Pops
   * Plays layered sample asset /audio/400cu_decel_overrun_pops.wav
   */
  public playBackfirePop(intensity: number = 0.8) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    if (this.decelBuffer) {
      const popSource = this.ctx.createBufferSource();
      popSource.buffer = this.decelBuffer;

      // Randomize playback rate slightly for organic variation (+/- 8%)
      popSource.playbackRate.setValueAtTime(0.92 + Math.random() * 0.16, now);

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(Math.min(1.0, 0.45 + intensity * 0.5), now);

      popSource.connect(popGain);
      if (this.masterGain) {
        popGain.connect(this.masterGain);
      } else {
        popGain.connect(this.ctx.destination);
      }

      // Pick a random offset into the multi-pop asset
      const popOffsets = [0.0, 0.22, 0.62, 0.90, 1.40];
      const offset = popOffsets[Math.floor(Math.random() * popOffsets.length)];
      popSource.start(now, offset, 0.45);
    }
  }

  /**
   * Main Real-Time 60 FPS Audio Layer Cross-Fader & Pitch Interpolator
   */
  private loopUpdate = () => {
    if (!this.isRunning || !this.ctx) return;

    // Instant acceleration response, smooth mechanical deceleration
    const isAccelerating = this.targetRpm > this.currentRpm;
    const lerpRate = isAccelerating ? 0.20 : 0.09;
    this.currentRpm += (this.targetRpm - this.currentRpm) * lerpRate;

    // Automated decel overrun backfires on rapid throttle drop
    const rpmDrop = this.previousRpm - this.currentRpm;
    if (rpmDrop > 160 && this.currentRpm > 2400 && Math.random() > 0.68) {
      this.playBackfirePop(Math.min(1.0, rpmDrop / 450));
    }
    this.previousRpm = this.currentRpm;

    const rpm = this.currentRpm;
    const idleRpm = this.activeProfile.idleRpm;
    const maxRpm = this.activeProfile.maxRpm;

    // Calculate cross-fade curve between idle and high-RPM combustion assets
    // 920 RPM -> 100% idle, 0% high RPM
    // 3800 RPM -> 50% idle, 50% high RPM
    // 6500+ RPM -> 0% idle, 100% high RPM
    const normalizedProgress = Math.max(0, Math.min(1, (rpm - idleRpm) / (maxRpm - idleRpm)));
    const idleVolume = Math.max(0, 1.0 - normalizedProgress * 1.5);
    const highRpmVolume = Math.min(1.0, Math.pow(normalizedProgress, 0.8) * 1.15);

    // Pitch ratios relative to sample recordings
    const idlePitch = Math.max(0.75, Math.min(2.2, rpm / 920.0));
    const highRpmPitch = Math.max(0.65, Math.min(1.35, rpm / 7000.0));

    const now = this.ctx.currentTime;
    const smoothTime = 0.04;

    // Update Idle Layer Source
    if (this.idleSource && this.idleGain) {
      this.idleSource.playbackRate.setTargetAtTime(idlePitch, now, smoothTime);
      this.idleGain.gain.setTargetAtTime(idleVolume * 0.85, now, smoothTime);
    }

    // Update High-RPM Screaming Layer Source
    if (this.highRpmSource && this.highRpmGain) {
      this.highRpmSource.playbackRate.setTargetAtTime(highRpmPitch, now, smoothTime);
      this.highRpmGain.gain.setTargetAtTime(highRpmVolume * 0.90, now, smoothTime);
    }

    // Dynamic 8-71 Supercharger Blower Peaking frequency tracks engine RPM
    if (this.blowerBiquad) {
      const blowerFreq = (rpm / 60) * this.activeProfile.blowerRatio * 32;
      this.blowerBiquad.frequency.setTargetAtTime(Math.min(6500, blowerFreq), now, smoothTime);
    }

    this.broadcastTelemetry();
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
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    }

    setTimeout(() => {
      try {
        this.idleSource?.stop();
        this.highRpmSource?.stop();
        this.twoStepSource?.stop();
        this.idleSource?.disconnect();
        this.highRpmSource?.disconnect();
        this.twoStepSource?.disconnect();
      } catch (err) {
        // already stopped
      }
      this.idleSource = null;
      this.highRpmSource = null;
      this.twoStepSource = null;
      this.isRunning = false;
      this.isCranking = false;
      this.isTwoStep = false;
      this.broadcastTelemetry();
    }, 200);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsCranking(): boolean {
    return this.isCranking;
  }

  public getIsTwoStep(): boolean {
    return this.isTwoStep;
  }

  /**
   * Procedural Pit Radio Squelch & Transmission Audio Burst
   */
  public playRadioBurst() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const radioFilter = this.ctx.createBiquadFilter();
    radioFilter.type = 'bandpass';
    radioFilter.frequency.setValueAtTime(1400, now);
    radioFilter.Q.setValueAtTime(3.0, now);

    const squelchGain = this.ctx.createGain();
    squelchGain.gain.setValueAtTime(0.18, now);
    squelchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    whiteNoise.connect(radioFilter);
    radioFilter.connect(squelchGain);
    squelchGain.connect(this.ctx.destination);

    whiteNoise.start(now);

    const chirp = this.ctx.createOscillator();
    const chirpGain = this.ctx.createGain();
    chirp.type = 'sine';
    chirp.frequency.setValueAtTime(1800, now + 0.08);
    chirp.frequency.exponentialRampToValueAtTime(950, now + 0.14);

    chirpGain.gain.setValueAtTime(0.08, now + 0.08);
    chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    chirp.connect(chirpGain);
    chirpGain.connect(this.ctx.destination);

    chirp.start(now + 0.08);
    chirp.stop(now + 0.16);
  }

  public playRogerBeep() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1209, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playAlertBeep() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1760, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const audioEngine = new V8AudioEngine();
