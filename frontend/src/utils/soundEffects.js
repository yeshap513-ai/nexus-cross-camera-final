// Web Audio API Tactical Sound Synthesizer (No external asset dependency required)
class TacticalSoundController {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.preset = 'standard'; // 'standard' | 'critical' | 'silence'
    this.volume = 0.4;
  }

  initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!muted) {
      this.playChirp(600, 900, 0.08);
    } else {
      this.playChirp(900, 400, 0.08);
    }
  }

  setPreset(preset) {
    this.preset = preset;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playChirp(startFreq, endFreq, duration = 0.1) {
    if (this.isMuted || this.preset === 'silence') return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(this.volume * 0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Routine Scan detected (soft ping)
  playScanPing() {
    if (this.isMuted || this.preset === 'silence' || this.preset === 'critical') return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      // ignore
    }
  }

  // High-Priority / Critical Watchlist Match Alert (dual-frequency tactical warble)
  playThreatAlert() {
    if (this.isMuted || this.preset === 'silence') return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const duration = 0.55;

      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Tactical warble frequency modulation
      osc1.frequency.setValueAtTime(780, now);
      osc1.frequency.setValueAtTime(520, now + 0.12);
      osc1.frequency.setValueAtTime(880, now + 0.24);
      osc1.frequency.setValueAtTime(620, now + 0.36);

      osc2.frequency.setValueAtTime(390, now);
      osc2.frequency.setValueAtTime(260, now + 0.12);
      osc2.frequency.setValueAtTime(440, now + 0.24);
      osc2.frequency.setValueAtTime(310, now + 0.36);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch (e) {
      console.warn('Audio alert error:', e);
    }
  }

  // Tactical click sound for UI buttons
  playClick() {
    if (this.isMuted || this.preset === 'silence') return;
    this.playChirp(1200, 800, 0.03);
  }
}

export const soundManager = new TacticalSoundController();
