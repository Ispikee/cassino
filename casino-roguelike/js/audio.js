// Web Audio API Procedural Sound Effects Engine
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.lastTickTime = 0;
    this.lastPingTime = 0;
    // Ambient music
    this.ambientNodes = [];
    this.ambientContext = 'none';
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playChip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Quick ceramic/clay chip clink
    osc.type = 'sine';
    const pitch = 1800 + Math.random() * 600;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playCardSlide() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    // White noise swoosh for paper/card sliding
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
    filter.Q.setValueAtTime(2, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
  }

  playCardFlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  playTick(pitchMod = 1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - this.lastTickTime < 30) return;
    this.lastTickTime = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 * pitchMod, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.02);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.02);
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.45);
    });
  }

  playJackpot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880.00],
      [659.25, 830.61, 987.77],
      [783.99, 987.77, 1174.66],
      [1046.50, 1318.51, 1567.98]
    ];
    chords.forEach((chord, i) => {
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, t + i * 0.12);

        gain.gain.setValueAtTime(0.12, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.55);
      });
    });
  }

  playLoss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.55);
  }

  playLever() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  playPing() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = performance.now();
    if (now - this.lastPingTime < 55) return;
    this.lastPingTime = now;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const pitch = 900 + Math.random() * 600;
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.6, t + 0.06);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // ---- Ambient Music ----
  stopAmbient() {
    for (const node of this.ambientNodes) {
      try { node.stop(); } catch(e) {}
    }
    this.ambientNodes = [];
    this.ambientContext = 'none';
  }

  playAmbient(context) {
    if (!this.enabled) return;
    if (this.ambientContext === context) return;
    this.stopAmbient();
    this.init();
    if (!this.ctx) return;
    this.ambientContext = context;

    switch (context) {
      case 'roulette': this._ambientRoulette(); break;
      case 'blackjack': this._ambientBlackjack(); break;
      case 'slots': this._ambientSlots(); break;
      case 'plinko': this._ambientPlinko(); break;
      case 'shop': this._ambientLobby(); break;
      default: this._ambientLobby(); break;
    }
  }

  _createOscLoop(freq, type, gainVal, detune = 0) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (detune) osc.detune.setValueAtTime(detune, this.ctx.currentTime);
    g.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start();
    this.ambientNodes.push(osc);
    return { osc, gain: g };
  }

  _ambientLobby() {
    // Soft jazz chord drone — Cmaj7 voicing
    this._createOscLoop(130.81, 'sine', 0.04);  // C2
    this._createOscLoop(196.00, 'sine', 0.03);  // G2
    this._createOscLoop(261.63, 'sine', 0.025); // C3
    this._createOscLoop(329.63, 'sine', 0.02);  // E3
    this._createOscLoop(493.88, 'sine', 0.015); // B3
  }

  _ambientBlackjack() {
    // Blues bass line drone — low & moody
    this._createOscLoop(55.00, 'triangle', 0.05);   // A1
    this._createOscLoop(73.42, 'triangle', 0.035);  // D2
    this._createOscLoop(110.00, 'sine', 0.025);     // A2
    this._createOscLoop(164.81, 'sine', 0.015, -8); // E3 slight detune
  }

  _ambientSlots() {
    // Chiptune buzz — 8-bit feel
    this._createOscLoop(220, 'square', 0.03);       // A3
    this._createOscLoop(277.18, 'square', 0.02);    // C#4
    this._createOscLoop(330, 'square', 0.015);      // E4
    this._createOscLoop(440, 'square', 0.01);       // A4
  }

  _ambientRoulette() {
    // Suspense drone — rising tension
    this._createOscLoop(110, 'sawtooth', 0.02);     // A2
    this._createOscLoop(116.54, 'sawtooth', 0.015); // Bb2 (tense half-step)
    this._createOscLoop(220, 'sine', 0.03);         // A3
    this._createOscLoop(261.63, 'sine', 0.01);      // C4
  }

  _ambientPlinko() {
    // Minimal marimba-like drone
    this._createOscLoop(174.61, 'triangle', 0.035); // F3
    this._createOscLoop(261.63, 'triangle', 0.025); // C4
    this._createOscLoop(349.23, 'triangle', 0.018); // F4
    this._createOscLoop(523.25, 'triangle', 0.01);  // C5
  }
}

window.soundFX = new SoundFX();
