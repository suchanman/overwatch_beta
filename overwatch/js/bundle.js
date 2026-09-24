/* OVERWATCH 2 WEB - STANDALONE UNIVERSAL BUNDLE (file:// & http:// compatible) */
(function() {
  'use strict';

// ==================== js/engine/AudioSynth.js ====================
/**
 * ============================================================================
 * OVERWATCH 2 : PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
 * - 100% Procedural Generation (Zero Missing Asset Errors)
 * - Authentic OW2 Headshot 'DINK' (Metallic high overtone chime)
 * - Elimination Chimes, Hero Abilities, Ultimate Stingers
 * - Web Speech API Announcer Integration
 * ============================================================================
 */
class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isUnlocked = false;
    this.lastHitTime = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.isUnlocked = true;
      }
    } catch (_) {}
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      try { this.ctx.resume(); } catch (_) {}
    }
  }

  playSelectClick() {
    this.unlock();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  playBattleStart() {
    this.unlock();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  // ==========================================================================
  // COMBAT HIT FEEDBACK (skill.md 13: Synchronized Audio & Headshot 'Dink')
  // ==========================================================================
  playHit(isHeadshot = false) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Throttle hits by 25ms to avoid clipping
    if (now - this.lastHitTime < 0.025) return;
    this.lastHitTime = now;

    if (isHeadshot) {
      // 1) Iconic Overwatch Headshot "DINK" Sound
      // High metallic chime bell (1800Hz + 3850Hz partials)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1850, now);
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(3920, now); // Metallic harmonic
      osc2.frequency.exponentialRampToValueAtTime(2800, now + 0.08);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.14);
      osc2.stop(now + 0.14);
    } else {
      // 2) Body Shot Hit Tick
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    }
  }

  // ==========================================================================
  // ELIMINATION CHIME (Satisfying Harmonic Triad)
  // ==========================================================================
  playElimination() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord Arpeggio

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.035);

      gain.gain.setValueAtTime(0, now + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.28, now + idx * 0.035 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.035 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.035);
      osc.stop(now + idx * 0.035 + 0.35);
    });
  }

  // ==========================================================================
  // HERO WEAPONS & ABILITIES
  // ==========================================================================
  playTracerFire() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noise = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();

    // High energy pulse blast
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playTracerBlink() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playTracerRecall() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playGenjiShuriken() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playGenjiDash() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playGenjiDeflect() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  playDragonblade() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Resonant blade draw + energy roar
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, now);
    osc1.frequency.exponentialRampToValueAtTime(640, now + 0.4);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.3);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);
  }

  playReinhardtSwing() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playEarthshatter() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  playExplosion() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playReload() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playUltReady() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // ==========================================================================
  // PLAYER DAMAGE FEEDBACK (Visceral Impact Thud & Armor Crunch)
  // ==========================================================================
  playDamage() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Low-end Sub Bass Impact (140Hz -> 38Hz)
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(38, now + 0.18);
    gain1.gain.setValueAtTime(0.55, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // 2. Armor / Flesh Crunch Transient (280Hz -> 70Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(320, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain2.gain.setValueAtTime(0.38, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now);
    osc2.stop(now + 0.13);
  }

  playReinhardtCharge() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(180, now + 0.4);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.45, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // ==========================================================================
  // WEB SPEECH API ANNOUNCER (Double Kill, Triple Kill, Team Kill, Victory!)
  // ==========================================================================
  announce(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.95;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }
}

// ==================== js/engine/CameraShaker.js ====================
/**
 * ============================================================================
 * CAMERA SHAKER & HIT STOP MANAGER (skill.md 3.1 & 3.2 Standard)
 * - Trauma-based Exponential Damping Screen Shake
 * - Authentic Weapon Recoil Pitch & Yaw Kick
 * - Micro Hit Stop (Freezes game entities for 30~60ms without freezing renderer)
 * ============================================================================
 */
class CameraShaker {
  constructor(camera) {
    this.camera = camera;
    this.trauma = 0; // 0.0 to 1.0
    this.maxShakeAngle = 0.06; // radians
    this.maxShakeOffset = 0.15; // meters

    // Recoil Pitch Kick
    this.recoilPitch = 0;
    this.recoilRecoverySpeed = 12.0;

    // Hit Stop State
    this.hitStopTimer = 0;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  addRecoil(pitchAmount) {
    this.recoilPitch += pitchAmount;
  }

  triggerHitStop(duration = 0.035) {
    this.hitStopTimer = Math.max(this.hitStopTimer, duration);
  }

  update(dt) {
    // 1. Process Hit Stop
    if (this.hitStopTimer > 0) {
      this.hitStopTimer -= dt;
    }

    // 2. Decay Trauma exponentially
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.8);
    }

    // 3. Recover Recoil Spring
    if (this.recoilPitch > 0) {
      this.recoilPitch = Math.max(0, this.recoilPitch - this.recoilPitch * this.recoilRecoverySpeed * dt);
    }
  }

  getShakeOffset() {
    if (this.trauma <= 0) return { rotX: 0, rotY: 0, rotZ: 0, posX: 0, posY: 0 };
    const shake = this.trauma * this.trauma; // Non-linear punch curve

    return {
      rotX: (Math.random() * 2 - 1) * this.maxShakeAngle * shake + this.recoilPitch,
      rotY: (Math.random() * 2 - 1) * this.maxShakeAngle * shake * 0.5,
      rotZ: (Math.random() * 2 - 1) * this.maxShakeAngle * shake * 0.7,
      posX: (Math.random() * 2 - 1) * this.maxShakeOffset * shake,
      posY: (Math.random() * 2 - 1) * this.maxShakeOffset * shake
    };
  }

  isHitStopped() {
    return this.hitStopTimer > 0;
  }
}

// ==================== js/engine/InputManager.js ====================
/**
 * ============================================================================
 * INPUT MANAGER (Desktop & Mobile 60FPS Optimization)
 * - Desktop: Mouse Pointer Lock Controls (FPS standard camera rotation)
 * - Mobile: 360-degree Virtual Joystick + Touch Aim Drag Zone + Haptic Feedback
 * - Keyboard bindings: WASD, Space, L.Shift, E, Q, R, Left/Right Click
 * - Quick Hero Switch: [1], [2], [3], [H]
 * ============================================================================
 */
class InputManager {
  constructor(domElement, camera) {
    this.domElement = domElement;
    this.camera = camera;

    // Device & Touch Detection
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;
    this.isLocked = false;

    this.mouseSensitivity = 0.0022;
    this.touchLookSensitivity = 0.0045;

    this.pitch = 0;
    this.yaw = 0;

    // Movement state
    this.touchMove = { x: 0, z: 0 };
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jump: false,
      shift: false,
      e: false,
      q: false,
      r: false,
      primaryFire: false,
      secondaryFire: false,
      tab: false
    };

    this.onHeroSwitchRequested = null;

    this.initDesktopEvents();
    if (this.isTouchDevice) {
      this.initMobileControls();
    } else {
      const onFirstTouch = () => {
        this.isTouchDevice = true;
        this.initMobileControls();
        window.removeEventListener('touchstart', onFirstTouch);
      };
      window.addEventListener('touchstart', onFirstTouch, { once: true });
    }
  }

  initDesktopEvents() {
    // Pointer Lock request (Desktop only)
    this.domElement.addEventListener('click', () => {
      if (!this.isTouchDevice && !this.isLocked) {
        this.domElement.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === this.domElement;
    });

    // Mouse Movement
    document.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;

      this.yaw -= e.movementX * this.mouseSensitivity;
      this.pitch -= e.movementY * this.mouseSensitivity;

      // Clamp vertical look to -83deg ~ +83deg
      const maxPitch = 1.45;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    });

    // Mouse Clicks
    document.addEventListener('mousedown', (e) => {
      if (!this.isLocked) return;
      if (e.button === 0) this.keys.primaryFire = true;
      if (e.button === 2) this.keys.secondaryFire = true;
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.keys.primaryFire = false;
      if (e.button === 2) this.keys.secondaryFire = false;
    });

    // Context Menu disable
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    // Keyboard bindings
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'tab') {
        e.preventDefault();
        this.keys.tab = true;
        return;
      }
      if (e.repeat) return;

      if (key === 'w' || e.key === 'ArrowUp') this.keys.forward = true;
      if (key === 's' || e.key === 'ArrowDown') this.keys.backward = true;
      if (key === 'a' || e.key === 'ArrowLeft') this.keys.left = true;
      if (key === 'd' || e.key === 'ArrowRight') this.keys.right = true;
      if (e.key === ' ') this.keys.jump = true;
      if (e.key === 'Shift') this.keys.shift = true;
      if (key === 'e') this.keys.e = true;
      if (key === 'q') this.keys.q = true;
      if (key === 'r') this.keys.r = true;

      // Hero Switch Shortcuts
      if (key === '1' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('tracer');
      if (key === '2' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('genji');
      if (key === '3' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('reinhardt');
      if (key === 'h' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('toggle_modal');
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'tab') {
        e.preventDefault();
        this.keys.tab = false;
        return;
      }

      if (key === 'w' || e.key === 'ArrowUp') this.keys.forward = false;
      if (key === 's' || e.key === 'ArrowDown') this.keys.backward = false;
      if (key === 'a' || e.key === 'ArrowLeft') this.keys.left = false;
      if (key === 'd' || e.key === 'ArrowRight') this.keys.right = false;
      if (e.key === ' ') this.keys.jump = false;
      if (e.key === 'Shift') this.keys.shift = false;
      if (key === 'e') this.keys.e = false;
      if (key === 'q') this.keys.q = false;
      if (key === 'r') this.keys.r = false;
    });
  }

  // ==========================================================================
  // MOBILE TOUCH CONTROLS (Dynamic Floating Joystick + Universal Button Drag Aim)
  // ==========================================================================
  initMobileControls() {
    if (this._mobileControlsInitialized) return;
    this._mobileControlsInitialized = true;

    const mobileContainer = document.getElementById('mobile-controls');
    if (mobileContainer) {
      mobileContainer.classList.remove('hidden');
    }

    // ------------------------------------------------------------------------
    // 1. DYNAMIC FLOATING VIRTUAL JOYSTICK (Left Half of Screen: 0% to 50% width)
    // ------------------------------------------------------------------------
    const joyZone = document.getElementById('joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    let joyTouchId = null;
    let baseCenterX = 0;
    let baseCenterY = 0;
    let maxRadius = 45; // Dynamic knob drag limit

    if (joyZone && joyBase && joyKnob) {
      joyZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        // Ignore if a joystick touch is already active
        if (joyTouchId !== null) return;

        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;

        // Position the floating joystick base exactly at touch point
        baseCenterX = touch.clientX;
        baseCenterY = touch.clientY;

        joyBase.style.left = `${baseCenterX}px`;
        joyBase.style.top = `${baseCenterY}px`;
        joyBase.classList.add('active');
        joyKnob.style.transform = 'translate(0px, 0px)';
        this.touchMove = { x: 0, z: 0 };

        // Scale max drag distance proportionally to base diameter
        const rect = joyBase.getBoundingClientRect();
        const baseRadius = (rect.width || 120) / 2;
        maxRadius = Math.max(36, Math.min(54, baseRadius * 0.75));

        if ('vibrate' in navigator) {
          try { navigator.vibrate(8); } catch (_) {}
        }
      }, { passive: false });

      // Window-level touchmove ensures steering remains fluid even if thumb slides
      const handleJoyMove = (e) => {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === joyTouchId) {
            e.preventDefault();
            let dx = touch.clientX - baseCenterX;
            let dy = touch.clientY - baseCenterY;
            const dist = Math.hypot(dx, dy);

            let knobX = dx;
            let knobY = dy;
            if (dist > maxRadius) {
              knobX = (dx / dist) * maxRadius;
              knobY = (dy / dist) * maxRadius;
            }

            joyKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
            this.touchMove = {
              x: knobX / maxRadius,
              z: knobY / maxRadius
            };
            break;
          }
        }
      };
      window.addEventListener('touchmove', handleJoyMove, { passive: false });

      const handleJoyEnd = (e) => {
        if (joyTouchId === null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joyTouchId) {
            joyTouchId = null;
            this.touchMove = { x: 0, z: 0 };
            joyKnob.style.transform = 'translate(0px, 0px)';
            joyBase.classList.remove('active');
            break;
          }
        }
      };
      window.addEventListener('touchend', handleJoyEnd, { passive: false });
      window.addEventListener('touchcancel', handleJoyEnd, { passive: false });
    }

    // ------------------------------------------------------------------------
    // 2. UNIVERSAL DRAG-TO-AIM (Right Half: Look Zone + ALL Action Buttons)
    // ------------------------------------------------------------------------
    // Map of active touch points for look/aim: touchId -> { lastX, lastY, btnId, onRelease }
    const activeLookTouches = new Map();

    const applyLookDelta = (dx, dy) => {
      this.yaw -= dx * this.touchLookSensitivity;
      this.pitch -= dy * this.touchLookSensitivity;

      // Clamp vertical pitch to -83deg ~ +83deg (-1.45 rad ~ +1.45 rad)
      const maxPitch = 1.45;
      this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
    };

    // A. Empty Right Half Look Drag Zone
    const lookZone = document.getElementById('touch-look-zone');
    if (lookZone) {
      lookZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === joyTouchId) continue;

          activeLookTouches.set(touch.identifier, {
            lastX: touch.clientX,
            lastY: touch.clientY,
            btnId: null,
            onRelease: null
          });
        }
      }, { passive: false });
    }

    // B. Action Buttons Configuration (All allow simultaneous drag-to-aim while pressed)
    const actionButtonsConfig = [
      {
        id: 'btn-touch-fire',
        vibrate: 10,
        onPress: () => { this.keys.primaryFire = true; },
        onRelease: () => { this.keys.primaryFire = false; }
      },
      {
        id: 'btn-touch-alt',
        vibrate: 10,
        onPress: () => { this.keys.secondaryFire = true; },
        onRelease: () => { this.keys.secondaryFire = false; }
      },
      {
        id: 'btn-touch-jump',
        vibrate: 12,
        onPress: () => { this.keys.jump = true; },
        onRelease: () => { this.keys.jump = false; }
      },
      {
        id: 'btn-touch-shift',
        vibrate: 20,
        onPress: () => { this.keys.shift = true; },
        onRelease: null
      },
      {
        id: 'btn-touch-e',
        vibrate: 20,
        onPress: () => { this.keys.e = true; },
        onRelease: null
      },
      {
        id: 'btn-touch-q',
        vibrate: [25, 40, 25],
        onPress: () => { this.keys.q = true; },
        onRelease: null
      },
      {
        id: 'btn-touch-reload',
        vibrate: 15,
        onPress: () => { this.keys.r = true; },
        onRelease: null
      }
    ];

    actionButtonsConfig.forEach((cfg) => {
      const btn = document.getElementById(cfg.id);
      if (!btn) return;

      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === joyTouchId) continue;

          activeLookTouches.set(touch.identifier, {
            lastX: touch.clientX,
            lastY: touch.clientY,
            btnId: cfg.id,
            onRelease: cfg.onRelease
          });

          btn.classList.add('active');
          if (cfg.onPress) cfg.onPress();

          if ('vibrate' in navigator && cfg.vibrate) {
            try { navigator.vibrate(cfg.vibrate); } catch (_) {}
          }
        }
      }, { passive: false });
    });

    // Window-level touchmove for camera look/aim across all touches
    const handleLookMove = (e) => {
      if (activeLookTouches.size === 0) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (activeLookTouches.has(touch.identifier)) {
          e.preventDefault();
          const item = activeLookTouches.get(touch.identifier);
          const dx = touch.clientX - item.lastX;
          const dy = touch.clientY - item.lastY;

          item.lastX = touch.clientX;
          item.lastY = touch.clientY;

          applyLookDelta(dx, dy);
        }
      }
    };
    window.addEventListener('touchmove', handleLookMove, { passive: false });

    // Window-level touchend / touchcancel cleans up button states and look tracking
    const handleLookEnd = (e) => {
      if (activeLookTouches.size === 0) return;

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (activeLookTouches.has(touch.identifier)) {
          const item = activeLookTouches.get(touch.identifier);
          if (item.btnId) {
            const btn = document.getElementById(item.btnId);
            if (btn) btn.classList.remove('active');
            if (item.onRelease) item.onRelease();
          }
          activeLookTouches.delete(touch.identifier);
        }
      }
    };
    window.addEventListener('touchend', handleLookEnd, { passive: false });
    window.addEventListener('touchcancel', handleLookEnd, { passive: false });

    // ------------------------------------------------------------------------
    // 3. TOP BAR UTILITY BUTTONS (HERO SWITCH & SCOREBOARD)
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // 3. TOP BAR UTILITY BUTTONS (HERO SWITCH & SCOREBOARD)
    // ------------------------------------------------------------------------
    const triggerHeroSwitch = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (this.onHeroSwitchRequested) {
        this.onHeroSwitchRequested('toggle_modal');
        if ('vibrate' in navigator) navigator.vibrate(15);
      }
    };

    const btnSwitch = document.getElementById('btn-touch-switch');
    if (btnSwitch) {
      btnSwitch.addEventListener('touchstart', triggerHeroSwitch, { passive: false });
      btnSwitch.addEventListener('click', triggerHeroSwitch);
    }

    const btnDesktopSwitch = document.getElementById('btn-desktop-hero-switch');
    if (btnDesktopSwitch) {
      btnDesktopSwitch.addEventListener('click', triggerHeroSwitch);
    }

    const portraitFrame = document.querySelector('.hero-portrait-frame');
    if (portraitFrame) {
      portraitFrame.addEventListener('click', triggerHeroSwitch);
      portraitFrame.style.cursor = 'pointer';
      portraitFrame.setAttribute('title', '클릭하여 영웅 변경');
    }

    const triggerScoreboard = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.keys.tab = !this.keys.tab;
      if ('vibrate' in navigator) navigator.vibrate(15);
    };

    const btnScoreboard = document.getElementById('btn-touch-scoreboard');
    if (btnScoreboard) {
      btnScoreboard.addEventListener('touchstart', triggerScoreboard, { passive: false });
      btnScoreboard.addEventListener('click', triggerScoreboard);
    }
  }

  updateJoystick(clientX, clientY, centerX, centerY, maxRadius, knob) {
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.touchMove = {
      x: dx / maxRadius,
      z: dy / maxRadius
    };
  }

  bindTouchButton(id, callback) {
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      callback(true);
    }, { passive: false });

    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      callback(false);
    });

    btn.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      callback(false);
    });
  }

  getMovementVector() {
    // 1. Keyboard WASD
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.forward) moveZ -= 1;
    if (this.keys.backward) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // 2. Add Mobile Touch Joystick
    if (Math.abs(this.touchMove.x) > 0.05 || Math.abs(this.touchMove.z) > 0.05) {
      moveX += this.touchMove.x;
      moveZ += this.touchMove.z;
    }

    const length = Math.hypot(moveX, moveZ);
    if (length > 1.0) {
      moveX /= length;
      moveZ /= length;
    }

    return { x: moveX, z: moveZ };
  }
}

// ==================== js/engine/NetworkManager.js ====================
/**
 * ============================================================================
 * NETWORK MANAGER (NetworkManager.js)
 * - Pure Native Browser WebSocket Client (Zero External Dependencies)
 * - 25Hz Movement Throttling for Optimized Bandwidth
 * - Automatic Ping/Pong Latency Tracking
 * - Event Dispatcher for Real-time Multiplayer Replication
 * ============================================================================
 */
class NetworkManager {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.selfId = null;
    this.ping = 0;

    // Movement send throttle (25Hz = 40ms)
    this.lastSendTime = 0;
    this.sendInterval = 40; // ms
    this.lastSentPos = [0, 0, 0];
    this.lastSentRot = [0, 0];

    // Ping interval
    this.pingIntervalTimer = null;

    // Callbacks
    this.onConnected = null;
    this.onDisconnected = null;
    this.onPlayerJoined = null;
    this.onPlayerLeft = null;
    this.onPlayerUpdated = null;
    this.onStateSync = null;
    this.onHeroSwitched = null;
    this.onPlayerAction = null;
    this.onPlayerHit = null;
    this.onPlayerEliminated = null;
    this.onPlayerRespawned = null;
    this.onPlayerHealed = null;
  }

  getDefaultServerUrl() {
    // 1. Check URL Query Parameter: ?server=ws://...
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const customServer = params.get('server');
      if (customServer) return customServer;
    }

    // 2. Browser HTTP/HTTPS environment (Unified Port & WSS for Cloudflare/Render)
    if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
      const isSecure = window.location.protocol === 'https:';
      const wsProto = isSecure ? 'wss:' : 'ws:';
      // Unified single-port: location.host automatically preserves port or domain
      return `${wsProto}//${window.location.host}`;
    }

    // 3. Fallback to Render Cloud Server
    return 'wss://overwatch-web-multiplayer.onrender.com';
  }

  connect(serverUrl = null, nickname = '플레이어', initialHero = 'tracer') {
    if (this.isConnected || this.isConnecting) return;

    const url = serverUrl || this.getDefaultServerUrl();
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.warn('[NETWORK] WebSocket connection failed:', e);
      this.isConnecting = false;
      if (this.onDisconnected) this.onDisconnected('연결 실패 (오프라인 모드)');
      return;
    }

    this.ws.onopen = () => {
      this.isConnected = true;
      this.isConnecting = false;
      console.log(`[NETWORK] Connected to server: ${url}`);

      // Send join request
      this.send({
        type: 'join',
        name: nickname,
        hero: initialHero
      });

      // Start ping loop (every 2.5s)
      this.pingIntervalTimer = setInterval(() => {
        if (this.isConnected) {
          this.send({ type: 'ping', t: performance.now() });
        }
      }, 2500);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('[NETWORK] Parse error:', err);
      }
    };

    this.ws.onerror = (err) => {
      console.warn('[NETWORK] Error:', err);
    };

    this.ws.onclose = () => {
      console.log('[NETWORK] Disconnected from server');
      this.isConnected = false;
      this.isConnecting = false;
      this.selfId = null;
      if (this.pingIntervalTimer) clearInterval(this.pingIntervalTimer);
      if (this.onDisconnected) this.onDisconnected();
    };
  }

  handleMessage(data) {
    switch (data.type) {
      case 'init':
        this.selfId = data.selfId;
        if (this.onConnected) this.onConnected(data.selfId, data.player, data.players);
        break;

      case 'player_joined':
        if (data.player && data.player.id !== this.selfId) {
          if (this.onPlayerJoined) this.onPlayerJoined(data.player);
        }
        break;

      case 'player_left':
        if (this.onPlayerLeft) this.onPlayerLeft(data.id, data.name);
        break;

      case 'player_updated':
        if (this.onPlayerUpdated) this.onPlayerUpdated(data.player);
        break;

      case 'state_sync':
        if (data.id !== this.selfId) {
          if (this.onStateSync) this.onStateSync(data.id, data.pos, data.rot);
        }
        break;

      case 'hero_switched':
        if (this.onHeroSwitched) this.onHeroSwitched(data.id, data.hero, data.hp, data.maxHp);
        break;

      case 'player_action':
        if (data.id !== this.selfId) {
          if (this.onPlayerAction) this.onPlayerAction(data.id, data.actionType, data.data);
        }
        break;

      case 'player_hit':
        if (this.onPlayerHit) {
          this.onPlayerHit(
            data.targetId,
            data.attackerId,
            data.attackerName,
            data.damage,
            data.isHeadshot,
            data.remainingHp
          );
        }
        break;

      case 'player_eliminated':
        if (this.onPlayerEliminated) {
          this.onPlayerEliminated(
            data.victimId,
            data.victimName,
            data.attackerId,
            data.attackerName,
            data.attackerHero,
            data.isHeadshot
          );
        }
        break;

      case 'player_respawned':
        if (this.onPlayerRespawned) {
          this.onPlayerRespawned(data.id, data.pos, data.hp);
        }
        break;

      case 'player_healed':
        if (this.onPlayerHealed) {
          this.onPlayerHealed(data.id, data.hp, data.maxHp);
        }
        break;

      case 'pong':
        this.ping = Math.round(performance.now() - data.t);
        break;
    }
  }

  send(obj) {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(obj));
    }
  }

  sendMovement(pos, pitch, yaw) {
    if (!this.isConnected) return;
    const now = performance.now();
    if (now - this.lastSendTime < this.sendInterval) return;

    // Check if moved or rotated significantly
    const dx = Math.abs(pos.x - this.lastSentPos[0]);
    const dy = Math.abs(pos.y - this.lastSentPos[1]);
    const dz = Math.abs(pos.z - this.lastSentPos[2]);
    const dp = Math.abs(pitch - this.lastSentRot[0]);
    const dr = Math.abs(yaw - this.lastSentRot[1]);

    if (dx > 0.01 || dy > 0.01 || dz > 0.01 || dp > 0.01 || dr > 0.01) {
      this.lastSendTime = now;
      this.lastSentPos = [pos.x, pos.y, pos.z];
      this.lastSentRot = [pitch, yaw];

      this.send({
        type: 'move',
        pos: [
          Math.round(pos.x * 100) / 100,
          Math.round(pos.y * 100) / 100,
          Math.round(pos.z * 100) / 100
        ],
        rot: [
          Math.round(pitch * 1000) / 1000,
          Math.round(yaw * 1000) / 1000
        ]
      });
    }
  }

  sendHeroSwitch(heroKey) {
    this.send({ type: 'hero_switch', hero: heroKey });
  }

  sendAction(actionType, data = {}) {
    this.send({ type: 'action', actionType, data });
  }

  sendHit(targetId, damage, isHeadshot) {
    this.send({ type: 'hit', targetId, damage, isHeadshot });
  }

  sendRespawn() {
    this.send({ type: 'respawn' });
  }

  sendHeal(amount) {
    this.send({ type: 'heal', amount });
  }
}

// ==================== js/ui/UIManager.js ====================
/**
 * ============================================================================
 * OVERWATCH 2 : HUD & UI MANAGER
 * - Dynamic Hitmarkers (Normal White / Crit Red / Skull Final Blow)
 * - Trailing Health Bar & Segment Pips
 * - Radial SVG Ultimate Meter (0% ~ 100% with Wing Flares)
 * - Real-time Killfeed & 100🔥 Flame Elimination Banner
 * ============================================================================
 */
class UIManager {
  constructor() {
    // HUD Elements
    this.hudOverlay = document.getElementById('hud-overlay');
    this.elimCountEl = document.getElementById('elim-count');
    this.streakCountEl = document.getElementById('streak-count');

    // Crosshair & Hitmarkers
    this.hitmarkerEl = document.getElementById('hitmarker');
    this.skullMarkerEl = document.getElementById('skull-marker');
    this.hitmarkerTimeout = null;
    this.hitDirectionEl = document.getElementById('hit-direction-indicator');
    this.hitDirectionTimeout = null;
    this.damageTimeout = null;

    // Elimination Banner
    this.elimBannerEl = document.getElementById('elimination-banner');
    this.elimVictimEl = document.getElementById('elim-victim-name');
    this.elimBannerTimeout = null;

    // Killfeed (Top-Left)
    this.killfeedContainer = document.getElementById('killfeed-container');

    // Hero Status & Health
    this.heroPortraitEl = document.getElementById('hero-portrait');
    this.heroNameLabel = document.getElementById('hero-name-label');
    this.hpCurrentEl = document.getElementById('hp-current');
    this.hpMaxEl = document.getElementById('hp-max');
    this.healthBarFill = document.getElementById('health-bar-fill');
    this.healthBarTrail = document.getElementById('health-bar-trail');
    this.healthSegmentsEl = document.getElementById('health-segments');

    // Ultimate
    this.ultMeterWrapper = document.getElementById('ult-meter-wrapper');
    this.ultRingProgress = document.getElementById('ult-ring-progress');
    this.ultPercentLabel = document.getElementById('ult-percent-label');
    this.ultReadyTag = document.getElementById('ult-ready-tag');

    // Abilities & Ammo
    this.ability1Overlay = document.getElementById('ability-1-cooldown-overlay');
    this.ability1Timer = document.getElementById('ability-1-timer');
    this.ability2Overlay = document.getElementById('ability-2-cooldown-overlay');
    this.ability2Timer = document.getElementById('ability-2-timer');
    this.blinkChargesEl = document.getElementById('blink-charges');

    this.ammoCurrentEl = document.getElementById('ammo-current');
    this.ammoMaxEl = document.getElementById('ammo-max');
    this.ammoPipsBar = document.getElementById('ammo-pips-bar');
    this.reloadPrompt = document.getElementById('reload-prompt');

    // Screen Overlays
    this.damageVignette = document.getElementById('damage-vignette');
    this.recallWarp = document.getElementById('recall-warp');
    this.dragonbladeAura = document.getElementById('dragonblade-aura');
    this.ultFlash = document.getElementById('ult-fullscreen-flash');

    // Reinhardt Center Barrier Shield HUD
    this.reinhardtShieldHud = document.getElementById('reinhardt-shield-hud');
    this.shieldHpCurrentEl = document.getElementById('shield-hp-current');
    this.shieldBarFill = document.getElementById('shield-bar-fill');

    this.eliminations = 0;
    this.streak = 0;
  }

  showHUD() {
    this.hudOverlay.classList.remove('hidden');
  }

  hideHUD() {
    this.hudOverlay.classList.add('hidden');
  }

  // ==========================================================================
  // DYNAMIC HITMARKERS (skill.md 4: Hitstop & Hitmarkers)
  // ==========================================================================
  showHitmarker(isHeadshot = false, isFinalBlow = false) {
    clearTimeout(this.hitmarkerTimeout);

    // Reset classes
    this.hitmarkerEl.classList.remove('hidden', 'crit');
    void this.hitmarkerEl.offsetWidth; // Force CSS reflow for restart

    if (isHeadshot) {
      this.hitmarkerEl.classList.add('crit');
    }

    if (isFinalBlow) {
      this.skullMarkerEl.classList.remove('hidden');
      void this.skullMarkerEl.offsetWidth;
      setTimeout(() => this.skullMarkerEl.classList.add('hidden'), 450);
    }

    this.hitmarkerTimeout = setTimeout(() => {
      this.hitmarkerEl.classList.add('hidden');
    }, 160);
  }

  // ==========================================================================
  // ELIMINATION FLAME BANNER (ELIMINATED TRAINING BOT 100🔥)
  // ==========================================================================
  showEliminationBanner(victimName) {
    this.eliminations++;
    this.streak++;
    if (this.elimCountEl) this.elimCountEl.textContent = this.eliminations;
    if (this.streakCountEl) this.streakCountEl.textContent = this.streak;

    this.elimVictimEl.textContent = victimName;
    this.elimBannerEl.classList.remove('hidden');
    void this.elimBannerEl.offsetWidth;

    clearTimeout(this.elimBannerTimeout);
    this.elimBannerTimeout = setTimeout(() => {
      this.elimBannerEl.classList.add('hidden');
    }, 1300);
  }

  // ==========================================================================
  // REAL-TIME SLIDING KILLFEED (Top-Left Anchored)
  // ==========================================================================
  getHeroWeaponIcon(heroOrType) {
    if (!heroOrType) return '⚔️';
    const key = String(heroOrType).toLowerCase();
    if (key.includes('tracer') || key.includes('pistol')) return '🔫';
    if (key.includes('genji') || key.includes('blade') || key.includes('shuriken')) return '🗡️';
    if (key.includes('reinhardt') || key.includes('hammer')) return '🔨';
    if (key.includes('firestrike')) return '🔥';
    if (key.includes('earthshatter')) return '⚡';
    if (key.includes('pulse_bomb') || key.includes('bomb')) return '💣';
    if (key.includes('dash') || key.includes('charge')) return '💨';
    return heroOrType.length <= 3 ? heroOrType : '⚔️';
  }

  addKillfeed(killerName, victimName, isHeadshot = false, weaponSource = '⚔️', isLocalVictim = false, isLocalKiller = false) {
    if (!this.killfeedContainer) return;

    // Keep max 5 items visible on screen so it never overflows
    while (this.killfeedContainer.children.length >= 5) {
      this.killfeedContainer.removeChild(this.killfeedContainer.children[0]);
    }

    const item = document.createElement('div');
    item.className = `killfeed-item${isLocalVictim ? ' local-victim' : ''}${isLocalKiller ? ' local-killer' : ''}`;

    const weaponIcon = this.getHeroWeaponIcon(weaponSource);
    const headshotSpan = isHeadshot ? '<span class="killfeed-headshot" title="헤드샷!">🎯</span>' : '';
    item.innerHTML = `
      <span class="killfeed-killer ${isLocalKiller ? 'self' : 'friendly'}">${killerName}</span>
      ${headshotSpan}
      <span class="killfeed-icon">${weaponIcon}</span>
      <span class="killfeed-victim ${isLocalVictim ? 'self' : 'enemy'}">${victimName}</span>
    `;

    this.killfeedContainer.appendChild(item);

    // Remove after 4.2 seconds with smooth fade
    setTimeout(() => {
      item.classList.add('fade-out');
      setTimeout(() => {
        if (item.parentNode) {
          item.parentNode.removeChild(item);
        }
      }, 350);
    }, 4200);
  }

  // ==========================================================================
  // SCREEN DAMAGE FEEDBACK (Directional Threat Arc & Perimeter Red Pulse)
  // ==========================================================================
  triggerHitDirection(angleRad = 0) {
    if (!this.hitDirectionEl) return;
    clearTimeout(this.hitDirectionTimeout);

    // Rotate directional chevron to point at incoming attacker
    const deg = (angleRad * 180 / Math.PI);
    this.hitDirectionEl.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
    this.hitDirectionEl.classList.remove('active');
    void this.hitDirectionEl.offsetWidth; // Reflow for instant punchy restart
    this.hitDirectionEl.classList.add('active');

    this.hitDirectionTimeout = setTimeout(() => {
      if (this.hitDirectionEl) {
        this.hitDirectionEl.classList.remove('active');
      }
    }, 700);
  }

  triggerDamageFlash(hitAngle = null) {
    if (this.damageVignette) {
      this.damageVignette.classList.remove('active');
      void this.damageVignette.offsetWidth;
      this.damageVignette.classList.add('active');
      clearTimeout(this.damageTimeout);
      this.damageTimeout = setTimeout(() => {
        if (this.damageVignette) {
          this.damageVignette.classList.remove('active');
        }
      }, 340);
    }

    if (hitAngle !== null && hitAngle !== undefined) {
      this.triggerHitDirection(hitAngle);
    }
  }

  triggerRecallWarp() {
    this.recallWarp.classList.remove('hidden');
    this.recallWarp.classList.add('active');
    setTimeout(() => {
      this.recallWarp.classList.remove('active');
      this.recallWarp.classList.add('hidden');
    }, 350);
  }

  triggerDragonbladeAura(active) {
    if (active) {
      this.dragonbladeAura.classList.remove('hidden');
      this.dragonbladeAura.classList.add('active');
    } else {
      this.dragonbladeAura.classList.remove('active');
      this.dragonbladeAura.classList.add('hidden');
    }
  }

  triggerUltFlash() {
    this.ultFlash.classList.add('flash');
    setTimeout(() => this.ultFlash.classList.remove('flash'), 300);
  }

  // ==========================================================================
  // UPDATE HUD STATS (Per Frame)
  // ==========================================================================
  update(hero) {
    // 1. Hero Identity & Portrait
    this.heroNameLabel.textContent = hero.name;
    this.heroPortraitEl.className = `hero-portrait portrait-${hero.name.toLowerCase()}`;

    // 2. Numeric Health & Trailing Health Bar (skill.md 3.4)
    this.hpCurrentEl.textContent = Math.ceil(hero.hp);
    this.hpMaxEl.textContent = hero.maxHp;

    const hpPct = Math.max(0, (hero.hp / hero.maxHp) * 100);
    const trailPct = Math.max(0, (hero.trailingHp / hero.maxHp) * 100);

    this.healthBarFill.style.width = `${hpPct}%`;
    this.healthBarTrail.style.width = `${trailPct}%`;

    // Low Health Warning Screen Edge Glow (< 30% HP)
    if (this.damageVignette) {
      if (hero.hp > 0 && hpPct <= 30) {
        this.damageVignette.classList.add('low-hp');
      } else {
        this.damageVignette.classList.remove('low-hp');
      }
    }

    // 3. Radial Ultimate Meter
    const ultProgress = Math.min(100, hero.ultCharge);
    this.ultPercentLabel.textContent = `${Math.floor(ultProgress)}%`;

    // Circumference = 2 * PI * 48 ≈ 301.6
    const offset = 301.6 - (ultProgress / 100) * 301.6;
    this.ultRingProgress.style.strokeDashoffset = offset;

    if (ultProgress >= 100) {
      this.ultMeterWrapper.classList.add('ready');
      this.ultReadyTag.classList.remove('hidden');
    } else {
      this.ultMeterWrapper.classList.remove('ready');
      this.ultReadyTag.classList.add('hidden');
    }

    // 4. Ability 1 (Shift) Cooldown
    if (hero.name === 'TRACER') {
      this.blinkChargesEl.style.display = 'flex';
      const pips = this.blinkChargesEl.children;
      for (let i = 0; i < 3; i++) {
        pips[i].className = i < hero.blinkCharges ? 'blink-pip active' : 'blink-pip';
      }
      this.ability1Overlay.style.transform = 'scaleY(0)';
      this.ability1Timer.textContent = '';
    } else {
      this.blinkChargesEl.style.display = 'none';
      if (hero.ability1Timer > 0) {
        const ratio = hero.ability1Timer / hero.ability1Cooldown;
        this.ability1Overlay.style.transform = `scaleY(${ratio})`;
        this.ability1Timer.textContent = hero.ability1Timer.toFixed(1);
      } else {
        this.ability1Overlay.style.transform = 'scaleY(0)';
        this.ability1Timer.textContent = '';
      }
    }

    // 5. Ability 2 (E) Cooldown
    if (hero.ability2Timer > 0) {
      const ratio = hero.ability2Timer / hero.ability2Cooldown;
      this.ability2Overlay.style.transform = `scaleY(${ratio})`;
      this.ability2Timer.textContent = hero.ability2Timer.toFixed(1);
    } else {
      this.ability2Overlay.style.transform = 'scaleY(0)';
      this.ability2Timer.textContent = '';
    }

    // 6. Weapon Ammo
    if (hero.name === 'REINHARDT') {
      this.ammoCurrentEl.textContent = '∞';
      this.ammoMaxEl.textContent = '';
      this.ammoPipsBar.style.display = 'none';
      this.reloadPrompt.classList.add('hidden');
    } else {
      this.ammoPipsBar.style.display = 'flex';
      this.ammoCurrentEl.textContent = hero.ammo;
      this.ammoMaxEl.textContent = hero.maxAmmo;

      if (hero.isReloading) {
        this.reloadPrompt.textContent = 'RELOADING...';
        this.reloadPrompt.classList.remove('hidden');
      } else if (hero.ammo <= 8) {
        this.reloadPrompt.textContent = '[R] RELOAD';
        this.reloadPrompt.classList.remove('hidden');
      } else {
        this.reloadPrompt.classList.add('hidden');
      }
    }

    // 7. Reinhardt Center Barrier Shield HUD
    this.updateReinhardtShield(hero);
  }

  updateReinhardtShield(hero) {
    if (!this.reinhardtShieldHud) return;

    if (hero.name === 'REINHARDT' && hero.isShieldActive) {
      this.reinhardtShieldHud.classList.remove('hidden');

      const hp = Math.max(0, Math.round(hero.shieldHp));
      const maxHp = hero.maxShieldHp || 500;
      const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));

      if (this.shieldHpCurrentEl) {
        this.shieldHpCurrentEl.textContent = hp;
        this.shieldHpCurrentEl.classList.remove('warning', 'critical');
        if (hp <= 120) {
          this.shieldHpCurrentEl.classList.add('critical');
        } else if (hp <= 250) {
          this.shieldHpCurrentEl.classList.add('warning');
        }
      }

      if (this.shieldBarFill) {
        this.shieldBarFill.style.width = `${pct}%`;
        this.shieldBarFill.classList.remove('warning', 'critical');
        if (hp <= 120) {
          this.shieldBarFill.classList.add('critical');
        } else if (hp <= 250) {
          this.shieldBarFill.classList.add('warning');
        }
      }
    } else {
      this.reinhardtShieldHud.classList.add('hidden');
    }
  }
}

// ==================== js/world/MapBuilder.js ====================
/**
 * ============================================================================
 * OVERWATCH 2 : ROUTE 66 (DEADLOCK GORGE) MAP BUILDER
 * - Authentic Deadlock Gorge Desert Map Implementation
 * - Big Earl's Diner, Gas Station, Payload, Crashed Train & Steel Platform
 * - Dynamic Strata Cliffs & Hoodoo Rock Pillars
 * - Full 3D Multi-Level Collision System (Roofs, Platforms, Stepping Crates)
 * - Distributed Health Packs (Mega 250 HP & Mini 75 HP) with Respawns
 * ============================================================================
 */
class MapBuilder {
  constructor(scene) {
    this.scene = scene;
    this.healthPacks = [];
    this.colliders = []; // Solid 3D collision registry

    this.palette = {
      sky: 0x88c2f0,
      fog: 0xdca67a,
      rockBase: 0xba5b3a,
      rockDark: 0x8e3b24,
      rockHighlight: 0xdb7752,
      sand: 0xdeb887,
      asphalt: 0x3d3b38,
      dinerWall: 0xf2eedb,
      dinerTrim: 0xa8412b,
      dinerAwning: 0x1f7a8c,
      woodCrate: 0x825330,
      trainRed: 0xa82d2d,
      trainSilver: 0xc4ccd3,
      payloadBlue: 0x2b6cb0,
      garageBlue: 0x4a6b8c,
      metalPlatform: 0xa0aec0
    };

    this.buildLighting();
    this.buildRoute66Environment();
    this.spawnHealthPacks();
  }

  buildLighting() {
    // 1. Scene sky & warm desert atmospheric fog
    this.scene.background = new THREE.Color(this.palette.sky);
    this.scene.fog = new THREE.FogExp2(this.palette.fog, 0.0055);

    // 2. Warm Desert Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xfff1dc, 0x965a38, 0.65);
    hemiLight.position.set(0, 60, 0);
    this.scene.add(hemiLight);

    // 3. Bright Sun (Directional Light with sharp shadows)
    const sun = new THREE.DirectionalLight(0xffeed6, 1.45);
    sun.position.set(90, 140, 70);
    sun.castShadow = true;
    sun.shadow.camera.left = -140;
    sun.shadow.camera.right = 140;
    sun.shadow.camera.top = 140;
    sun.shadow.camera.bottom = -140;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 400;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    // 4. Subtle ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }

  createSignTexture(text, bgColor, textColor, width, height, fontSize) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const lines = text.split('\n');
    ctx.fillStyle = textColor;
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lh = fontSize * 1.2;
    let startY = (height - (lines.length * lh)) / 2 + (lh / 2);
    lines.forEach(line => {
      ctx.fillText(line, width / 2, startY);
      startY += lh;
    });

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
  }

  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a3734';
    ctx.fillRect(0, 0, 512, 1024);
    // Yellow double line
    ctx.fillStyle = '#f5ab16';
    ctx.fillRect(244, 0, 8, 1024);
    ctx.fillRect(260, 0, 8, 1024);
    // White edge lines
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(35, 0, 10, 1024);
    ctx.fillRect(467, 0, 10, 1024);

    // Route 66 Shield Emblem
    ctx.save();
    ctx.translate(256, 320);
    ctx.scale(0.8, 0.8);
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.bezierCurveTo(45, -90, 85, -85, 95, -50);
    ctx.bezierCurveTo(95, 30, 65, 80, 0, 105);
    ctx.bezierCurveTo(-65, 80, -95, 30, -95, -50);
    ctx.bezierCurveTo(-85, -85, -45, -90, 0, -90);
    ctx.fill();

    ctx.fillStyle = '#1a202c';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ROUTE', 0, -45);
    ctx.font = '900 85px sans-serif';
    ctx.fillText('66', 0, 20);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  }

  addCollider(mesh, name = 'obstacle', canStandOn = true) {
    mesh.updateMatrixWorld(true);
    const box3 = new THREE.Box3();
    box3.setFromObject(mesh);
    this.colliders.push({
      name,
      minX: box3.min.x,
      maxX: box3.max.x,
      minY: box3.min.y,
      maxY: box3.max.y,
      minZ: box3.min.z,
      maxZ: box3.max.z,
      canStandOn
    });
  }

  createBox(x, y, z, w, h, d, colorHex, rx = 0, ry = 0, rz = 0, name = 'box', collide = true) {
    const mat = (typeof colorHex === 'number')
      ? new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9 })
      : colorHex;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  createCylinder(x, y, z, r, h, colorHex, rx = 0, ry = 0, rz = 0, name = 'cyl', collide = true) {
    const mat = (typeof colorHex === 'number')
      ? new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 })
      : colorHex;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  buildStrataCliff(x, y, z, w, h, d, rotY, colorHex, name = 'strata_cliff') {
    const segX = Math.max(1, Math.floor(w / 6));
    const segZ = Math.max(1, Math.floor(d / 6));
    const geo = new THREE.BoxGeometry(w, h, d, segX, Math.floor(h / 5), segZ);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);
      const strata = Math.sin(py * 1.5) * 2.5;
      const noise = (Math.random() - 0.5) * 3.5;
      if (py > -h / 2 + 2) {
        pos.setX(i, px + (px > 0 ? noise + strata : -noise - strata));
        pos.setZ(i, pz + (pz > 0 ? noise + strata : -noise - strata));
      }
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 1.0, flatShading: true })
    );
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Collision box
    const col = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h, d * 0.85));
    col.position.copy(mesh.position);
    col.rotation.copy(mesh.rotation);
    this.addCollider(col, name, false);
  }

  buildHoodoo(x, y, z, baseR, topR, h, colorHex, name = 'hoodoo') {
    const geo = new THREE.CylinderGeometry(topR, baseR, h, 14, Math.floor(h / 3));
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);
      const strata = Math.sin(py * 1.2) * 1.8;
      if (py > -h / 2 + 2) {
        pos.setX(i, px + strata * Math.sign(px) + (Math.random() - 0.5) * 2);
        pos.setZ(i, pz + strata * Math.sign(pz) + (Math.random() - 0.5) * 2);
      }
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9, flatShading: true })
    );
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.max(baseR, topR) * 0.85, Math.max(baseR, topR) * 0.85, h, 8)
    );
    col.position.copy(mesh.position);
    this.addCollider(col, name, true);
  }

  buildRoute66Environment() {
    const PALETTE = this.palette;

    // 1. Sand Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 360),
      new THREE.MeshStandardMaterial({ color: PALETTE.sand, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Floor Base Box for robust collision support
    const floorBox = new THREE.Mesh(new THREE.BoxGeometry(360, 4, 360));
    floorBox.position.y = -2;
    this.addCollider(floorBox, 'ground_base', true);

    // 2. Asphalt Highway Roads
    const roadMat = this.createRoadTexture();

    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(26, 80), roadMat);
    road1.position.set(30, 0.1, -55);
    road1.rotation.set(-Math.PI / 2, 0, 0.3);
    road1.receiveShadow = true;
    this.scene.add(road1);

    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(26, 80), roadMat);
    road2.position.set(12, 0.1, 0);
    road2.rotation.set(-Math.PI / 2, 0, -0.2);
    road2.receiveShadow = true;
    this.scene.add(road2);

    const road3 = new THREE.Mesh(new THREE.PlaneGeometry(26, 90), roadMat);
    road3.position.set(-5, 0.1, 60);
    road3.rotation.set(-Math.PI / 2, 0, -0.6);
    road3.receiveShadow = true;
    this.scene.add(road3);

    // 3. Building 1: Big Earl's Diner (Right side)
    this.createBox(40, 0, 5, 20, 6, 30, PALETTE.dinerWall, 0, 0, 0, 'diner_main');
    this.createBox(40, 6, 5, 22, 1, 32, PALETTE.dinerTrim, 0, 0, 0, 'diner_roof_1f');
    this.createBox(42, 7, 0, 14, 4, 18, PALETTE.dinerWall, 0, 0, 0, 'diner_2f');
    this.createBox(42, 11, 0, 15, 0.5, 19, PALETTE.dinerTrim, 0, 0, 0, 'diner_roof_2f');

    // Diner Awning & Pillars
    this.createBox(25, 5.5, 5, 22, 0.8, 18, PALETTE.dinerAwning, 0, 0, 0, 'diner_awning');
    this.createCylinder(15, 0, -2, 0.4, 5.5, 0x555555, 0, 0, 0, 'awning_pole1');
    this.createCylinder(15, 0, 12, 0.4, 5.5, 0x555555, 0, 0, 0, 'awning_pole2');

    // Rooftop Neon Sign
    const signMat = this.createSignTexture("Big Earl's\nDINER", "#b83b26", "#ffffff", 512, 256, 60);
    this.createBox(42, 12, 0, 12, 4, 0.6, signMat, 0, -Math.PI / 6, 0, 'diner_neon_sign');

    // GAS Station Sign Crown Tower
    this.createCylinder(48, 0, 30, 0.9, 22, 0xb83226, 0, 0, 0, 'gas_tower_pole');
    this.createCylinder(48, 14, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring1');
    this.createCylinder(48, 16.5, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring2');
    this.createCylinder(48, 19, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring3');
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(4, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 })
    );
    crown.position.set(48, 22, 30);
    crown.rotation.x = Math.PI;
    this.scene.add(crown);

    // 4. Building 2: Left Steel Deck Platform & Mine Entrance
    this.createBox(-35, 7, -15, 20, 1, 25, PALETTE.metalPlatform, 0, 0, 0, 'metal_deck');
    this.createCylinder(-27, 0, -26, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole1');
    this.createCylinder(-27, 0, -4, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole2');
    this.createCylinder(-43, 0, -26, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole3');
    this.createCylinder(-43, 0, -4, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole4');
    this.createBox(-35, 0, -15, 12, 7, 15, 0x4a5568, 0, 0, 0, 'deck_container');
    this.createBox(-20, 0, -20, 5, 3, 5, PALETTE.woodCrate, 0, 0, 0, 'crate_step1');
    this.createBox(-24, 3, -18, 4, 3, 4, PALETTE.woodCrate, 0, 0, 0, 'crate_step2');

    // 5. Building 3: Deadlock Garage (Lower side)
    this.createBox(-15, 0, 60, 25, 8, 20, PALETTE.dinerWall, 0, 0, 0, 'garage_main');
    this.createBox(-15, 8, 60, 27, 1.2, 22, PALETTE.garageBlue, 0, 0, 0, 'garage_roof');
    this.createBox(-18, 9, 62, 10, 4, 12, PALETTE.dinerWall, 0, 0, 0, 'garage_2f');
    this.createBox(-18, 13, 62, 11, 0.6, 13, PALETTE.garageBlue, 0, 0, 0, 'garage_2f_roof');

    // 6. Props: Crashed Train Debris, Hovering Payload & Gorge Billboard
    this.buildHoodoo(2, 0, -25, 8, 5, 10, PALETTE.rockDark, 'train_rock_pedestal');
    this.createBox(5, 7, -25, 8, 5, 18, PALETTE.trainRed, 0.1, 0.4, 0.1, 'train_red');
    this.createBox(-10, 0, -15, 12, 5, 6, PALETTE.trainSilver, -0.1, -0.2, 0, 'train_silver_ramp');
    this.createBox(-12, 3, -20, 4, 4, 4, PALETTE.woodCrate, 0, 0, 0, 'train_crate_step');

    // Hovering Payload Vehicle
    this.createBox(-2, 1.5, 35, 7, 3, 12, PALETTE.payloadBlue, 0, -0.3, 0, 'payload_body');
    // Hover thruster pads
    const padMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const padGeo = new THREE.BoxGeometry(1.5, 0.4, 2);
    const thrusterOffsets = [[-3, -4], [3, -4], [-3, 4], [3, 4]];
    thrusterOffsets.forEach(off => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(-2 + off[0], 1.0, 35 + off[1]);
      pad.rotation.y = -0.3;
      this.scene.add(pad);
    });

    // Welcome Billboard
    const boardMat = this.createSignTexture("Welcome to\nDeadlock Gorge", "#2b6cb0", "#ffffff", 512, 256, 45);
    this.createBox(17, 8, -36, 14, 8, 1, boardMat, 0, -0.3, 0, 'billboard_sign');
    this.createCylinder(12, 0, -35, 0.5, 8, 0x555555, 0, 0, 0, 'billboard_pole1');
    this.createCylinder(22, 0, -38, 0.5, 8, 0x555555, 0, 0, 0, 'billboard_pole2');

    // 7. Giant Canyon Walls (Canyon perimeter)
    this.buildStrataCliff(0, 0, -110, 260, 80, 40, 0, PALETTE.rockBase, 'cliff_north');
    this.buildStrataCliff(0, 0, 110, 260, 80, 40, 0, PALETTE.rockBase, 'cliff_south');
    this.buildStrataCliff(110, 0, 0, 40, 80, 260, 0, PALETTE.rockDark, 'cliff_east');
    this.buildStrataCliff(-110, 0, 0, 40, 80, 260, 0, PALETTE.rockDark, 'cliff_west');

    // Corner Cliffs
    this.buildStrataCliff(80, 0, -80, 60, 75, 60, Math.PI / 4, PALETTE.rockHighlight, 'cliff_ne');
    this.buildStrataCliff(-80, 0, -80, 60, 75, 60, -Math.PI / 4, PALETTE.rockHighlight, 'cliff_nw');
    this.buildStrataCliff(80, 0, 80, 60, 75, 60, -Math.PI / 4, PALETTE.rockBase, 'cliff_se');
    this.buildStrataCliff(-80, 0, 80, 60, 75, 60, Math.PI / 4, PALETTE.rockBase, 'cliff_sw');

    // Towering Hoodoo Pillars
    this.buildHoodoo(-32, 0, -45, 12, 4, 52, PALETTE.rockHighlight, 'hoodoo_main_1');
    this.buildHoodoo(55, 0, 15, 14, 5, 48, PALETTE.rockDark, 'hoodoo_main_2');
    this.buildHoodoo(-50, 0, 30, 11, 4, 42, PALETTE.rockBase, 'hoodoo_main_3');
  }

  // ==========================================================================
  // DISTRIBUTED HEALTH PACKS (MEGA 250 HP & MINI 75 HP) - ROUTE 66 LAYOUT
  // ==========================================================================
  spawnHealthPacks() {
    // Mega Health Packs (250 HP, 10s cooldown) - Strategic Main Hubs
    this.createHealthPack(38, 0, 18, 250, 'mega');     // Inside/side patio of Big Earl's Diner
    this.createHealthPack(-35, 0, -3, 250, 'mega');    // Under left steel platform / container base
    this.createHealthPack(-15, 0, 60, 250, 'mega');    // Inside Deadlock Garage

    // Small Health Packs (75 HP, 6s cooldown) - High Grounds & Flank Routes
    this.createHealthPack(40, 6.5, 5, 75, 'mini');     // Big Earl's Diner 1st floor roof terrace
    this.createHealthPack(-35, 7.5, -15, 75, 'mini');  // Steel platform 2nd floor sniper deck
    this.createHealthPack(5, 7.5, -25, 75, 'mini');    // Atop crashed red train car
    this.createHealthPack(-2, 0, 35, 75, 'mini');      // Flank beside hovering payload
    this.createHealthPack(17, 0, -36, 75, 'mini');     // Underneath Gorge Welcome billboard
  }

  createHealthPack(x, y, z, healAmount, type) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Holographic Cybernetic Base
    const baseGeo = new THREE.CylinderGeometry(0.85, 1.05, 0.25, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.125;
    group.add(base);

    // Glowing Neon Ring
    const ringGeo = new THREE.RingGeometry(0.88, 1.05, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.26;
    group.add(ring);

    // Floating 3D Medical Cross Icon
    const crossGeo1 = new THREE.BoxGeometry(0.75, 0.25, 0.25);
    const crossGeo2 = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const crossMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981
    });

    const crossGroup = new THREE.Group();
    crossGroup.add(new THREE.Mesh(crossGeo1, crossMat));
    crossGroup.add(new THREE.Mesh(crossGeo2, crossMat));
    crossGroup.position.y = 0.95;
    group.add(crossGroup);

    this.scene.add(group);

    // Step-up base collider
    this.colliders.push({
      name: `healthpack_base_${x}_${z}`,
      minX: x - 0.9,
      maxX: x + 0.9,
      minZ: z - 0.9,
      maxZ: z + 0.9,
      minY: y,
      maxY: y + 0.25,
      canStandOn: true
    });

    this.healthPacks.push({
      group,
      crossGroup,
      baseY: y + 0.95,
      healAmount,
      type,
      active: true,
      respawnTimer: 0,
      pos: new THREE.Vector3(x, y + 0.95, z)
    });
  }

  // ==========================================================================
  // 3D COLLISION RESOLUTION (PARKOUR, STEP-UP & PREVENT PASS-THROUGH)
  // ==========================================================================
  resolveCollision(pos, radius = 0.55, height = 3.5) {
    let groundY = 1.7; // default ground level for player eye
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.3;

    // 1. Check all solid obstacle colliders
    for (const col of this.colliders) {
      if (col.canStandOn) {
        if (pos.x >= col.minX - 0.2 && pos.x <= col.maxX + 0.2 &&
            pos.z >= col.minZ - 0.2 && pos.z <= col.maxZ + 0.2) {
          if (feetY >= col.maxY - 0.7) {
            groundY = Math.max(groundY, col.maxY + 1.7);
          }
        }
      }

      // Horizontal obstacle collision
      if (headY < col.minY || feetY > col.maxY - 0.3) continue;

      const clampedX = Math.max(col.minX, Math.min(col.maxX, pos.x));
      const clampedZ = Math.max(col.minZ, Math.min(col.maxZ, pos.z));
      const dx = pos.x - clampedX;
      const dz = pos.z - clampedZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        if (dist > 1e-4) {
          const overlap = radius - dist;
          pos.x += (dx / dist) * overlap;
          pos.z += (dz / dist) * overlap;
        } else {
          const dLeft = Math.abs(pos.x - col.minX);
          const dRight = Math.abs(col.maxX - pos.x);
          const dBack = Math.abs(pos.z - col.minZ);
          const dFront = Math.abs(col.maxZ - pos.z);
          const minEdge = Math.min(dLeft, dRight, dBack, dFront);

          if (minEdge === dLeft) pos.x = col.minX - radius;
          else if (minEdge === dRight) pos.x = col.maxX + radius;
          else if (minEdge === dBack) pos.z = col.minZ - radius;
          else pos.z = col.maxZ + radius;
        }
      }
    }

    // 2. Canyon Outer Perimeter Clamping (Route 66 canyon rock walls)
    pos.x = Math.max(-95.0, Math.min(95.0, pos.x));
    pos.z = Math.max(-95.0, Math.min(95.0, pos.z));

    return { groundY };
  }

  checkWallCollision(pos, radius = 0.6) {
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.2;

    if (Math.abs(pos.x) >= 95.0 || Math.abs(pos.z) >= 95.0) {
      return { hit: true, name: 'canyon_wall' };
    }

    for (const col of this.colliders) {
      if (col.canStandOn && feetY >= col.maxY - 0.2) continue;
      if (headY < col.minY || feetY > col.maxY) continue;

      const clampedX = Math.max(col.minX, Math.min(col.maxX, pos.x));
      const clampedZ = Math.max(col.minZ, Math.min(col.maxZ, pos.z));
      const dx = pos.x - clampedX;
      const dz = pos.z - clampedZ;

      if ((dx * dx + dz * dz) < radius * radius) {
        return { hit: true, name: col.name };
      }
    }

    return { hit: false };
  }

  // ==========================================================================
  // RAYCAST COLLIDERS (For Hitscan weapons like Tracer's Pulse Pistols)
  // Ensures bullets NEVER penetrate walls, buildings or rock pillars!
  // ==========================================================================
  raycastColliders(ray, maxDistance = 60) {
    let closestDist = maxDistance;
    let closestPoint = null;
    let hitCollider = null;

    const box = new THREE.Box3();
    const hitPoint = new THREE.Vector3();

    for (const col of this.colliders) {
      // Skip the bottom floor box when shooting across the surface
      if (col.maxY <= 0.05 && col.minY < -0.5) continue;

      box.min.set(col.minX, col.minY, col.minZ);
      box.max.set(col.maxX, col.maxY, col.maxZ);

      const intersection = ray.intersectBox(box, hitPoint);
      if (intersection) {
        const dist = ray.origin.distanceTo(intersection);
        if (dist > 0.01 && dist < closestDist) {
          closestDist = dist;
          closestPoint = intersection.clone();
          hitCollider = col;
        }
      }
    }

    // Outer canyon boundaries check (x: ±95, z: ±95)
    // If shooting out of bounds, clip at perimeter
    return {
      hit: closestDist < maxDistance,
      distance: closestDist,
      point: closestPoint,
      collider: hitCollider
    };
  }

  checkProjectileHit(prevPos, currentPos, radius = 0.25) {
    if (Math.abs(currentPos.x) >= 95.0 || Math.abs(currentPos.z) >= 95.0) {
      return { hit: true, point: currentPos.clone(), name: 'canyon_wall' };
    }
    if (currentPos.y <= 0.08) {
      return { hit: true, point: new THREE.Vector3(currentPos.x, 0.08, currentPos.z), name: 'ground' };
    }

    for (const col of this.colliders) {
      const minX = col.minX - radius;
      const maxX = col.maxX + radius;
      const minY = col.minY - radius;
      const maxY = col.maxY + radius;
      const minZ = col.minZ - radius;
      const maxZ = col.maxZ + radius;

      if (currentPos.x >= minX && currentPos.x <= maxX &&
          currentPos.y >= minY && currentPos.y <= maxY &&
          currentPos.z >= minZ && currentPos.z <= maxZ) {
        return { hit: true, point: currentPos.clone(), name: col.name };
      }

      if (prevPos) {
        const dx = currentPos.x - prevPos.x;
        const dy = currentPos.y - prevPos.y;
        const dz = currentPos.z - prevPos.z;

        let tMin = 0.0;
        let tMax = 1.0;

        if (Math.abs(dx) > 1e-6) {
          const t1 = (minX - prevPos.x) / dx;
          const t2 = (maxX - prevPos.x) / dx;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.x < minX || prevPos.x > maxX) continue;

        if (Math.abs(dy) > 1e-6) {
          const t1 = (minY - prevPos.y) / dy;
          const t2 = (maxY - prevPos.y) / dy;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.y < minY || prevPos.y > maxY) continue;

        if (Math.abs(dz) > 1e-6) {
          const t1 = (minZ - prevPos.z) / dz;
          const t2 = (maxZ - prevPos.z) / dz;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.z < minZ || prevPos.z > maxZ) continue;

        if (tMax >= tMin && tMin <= 1.0 && tMax >= 0.0) {
          const hitT = Math.max(0, tMin);
          const hitPoint = new THREE.Vector3(
            prevPos.x + dx * hitT,
            prevPos.y + dy * hitT,
            prevPos.z + dz * hitT
          );
          return { hit: true, point: hitPoint, name: col.name };
        }
      }
    }

    return { hit: false };
  }

  update(dt, playerPos, onHealCallback) {
    this.healthPacks.forEach((hp) => {
      if (!hp.active) {
        hp.respawnTimer -= dt;
        if (hp.respawnTimer <= 0) {
          hp.active = true;
          hp.crossGroup.visible = true;
        }
      } else {
        hp.crossGroup.rotation.y += 2.2 * dt;
        hp.crossGroup.position.y = (hp.baseY || 0.95) + Math.sin(Date.now() * 0.005) * 0.12;

        if (playerPos && playerPos.distanceTo(hp.pos) < 2.2) {
          const picked = onHealCallback(hp.healAmount);
          if (picked) {
            hp.active = false;
            hp.crossGroup.visible = false;
            hp.respawnTimer = hp.type === 'mega' ? 10.0 : 6.0;
          }
        }
      }
    });
  }
}

// ==================== js/entities/HeroModels.js ====================
/**
 * ============================================================================
 * HIGH-FIDELITY OVERWATCH HERO 3D MODELS (HeroModels.js)
 * - Reinhardt: Massive Crusader armor, pauldrons with red decal, 3-spike crest,
 *              forearm Lion Shield generator, and Rocket Hammer with glowing exhausts
 * - Tracer: Dual Pulse Pistols, Chronal Accelerator with cyan glow, collar,
 *           amber goggles, spiky anime hair, orange leggings with dark straps
 * - Genji: Cyborg ninja, white/chrome armor, brown synthetic muscle fibers,
 *          glowing V-visor + light, swept-back ear fins, Ryu-Ichimonji katana & wakizashi
 * ============================================================================
 */

// Helper to create and position meshes with shadow
function createMesh(geo, mat, x = 0, y = 0, z = 0, castShadow = true) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================================
// 1. REINHARDT MODEL BUILDER
// ============================================================================
function buildReinhardtModel(parentGroup) {
  const reinhardtRoot = new THREE.Group();

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.8,
    roughness: 0.25
  });
  const darkArmorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.5,
    roughness: 0.7
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.3
  });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.4,
    roughness: 0.5
  });

  const hitMeshes = [];

  // --- Torso ---
  const torsoGroup = new THREE.Group();

  // Chest core
  const chestGeo = new THREE.SphereGeometry(5, 32, 32);
  chestGeo.scale(1, 0.9, 0.75);
  const chest = createMesh(chestGeo, armorMat, 0, 4.5, 0);
  torsoGroup.add(chest);
  hitMeshes.push(chest);

  // Heavy neck collar
  const collarGeo = new THREE.CylinderGeometry(3.5, 4, 3, 32, 1, false, Math.PI, Math.PI);
  const collar = createMesh(collarGeo, armorMat, 0, 6.8, 1);
  collar.rotation.x = -Math.PI / 12;
  torsoGroup.add(collar);

  // Center chest reactor base & glow
  const reactorBase = createMesh(new THREE.CylinderGeometry(2, 2, 0.5, 32), darkArmorMat, 0, 5, 3.8);
  reactorBase.rotation.x = Math.PI / 2;
  torsoGroup.add(reactorBase);

  const reactorGlowGeo = new THREE.SphereGeometry(1.2, 16, 16);
  reactorGlowGeo.scale(1, 1, 0.3);
  const reactorGlow = createMesh(reactorGlowGeo, glowMat, 0, 5, 4.0);
  torsoGroup.add(reactorGlow);

  // Abdomen & lower torso
  const abdomen = createMesh(new THREE.CylinderGeometry(4.2, 3.5, 5, 16), darkArmorMat, 0, 0, 0);
  torsoGroup.add(abdomen);
  hitMeshes.push(abdomen);

  const absPlate = createMesh(new THREE.BoxGeometry(4.5, 3.5, 4), armorMat, 0, 0, 1.5);
  absPlate.rotation.x = Math.PI / 16;
  torsoGroup.add(absPlate);
  hitMeshes.push(absPlate);

  const belt = createMesh(new THREE.BoxGeometry(6.5, 2.5, 5), armorMat, 0, -2.5, 0.5);
  torsoGroup.add(belt);
  hitMeshes.push(belt);

  reinhardtRoot.add(torsoGroup);

  // --- Head & Helmet (CRITICAL HEADSHOT HITBOX) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 9.5, 2);

  const helmetGeo = new THREE.BoxGeometry(2.8, 3.5, 3.2);
  const helmet = createMesh(helmetGeo, armorMat, 0, 0, 0);
  headGroup.add(helmet);
  hitMeshes.push(helmet);

  const jaw = createMesh(new THREE.BoxGeometry(3, 1.5, 2.5), darkArmorMat, 0, -1.2, 0.8);
  headGroup.add(jaw);

  // Visor (Glowing Y/V shape)
  const visorMain = createMesh(new THREE.BoxGeometry(2.2, 0.4, 0.2), glowMat, 0, 0.3, 1.6);
  headGroup.add(visorMain);

  const visorL = createMesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), glowMat, 0.7, 0.1, 1.65);
  visorL.rotation.z = -Math.PI / 4;
  const visorR = createMesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), glowMat, -0.7, 0.1, 1.65);
  visorR.rotation.z = Math.PI / 4;
  headGroup.add(visorL, visorR);

  // 3-Spike Crest
  const centerSpike = createMesh(new THREE.ConeGeometry(0.4, 2.5, 4), armorMat, 0, 2.5, 0.5);
  centerSpike.rotation.x = -Math.PI / 12;
  headGroup.add(centerSpike);

  const leftSpike = createMesh(new THREE.ConeGeometry(0.3, 1.8, 4), armorMat, 1.2, 2.2, 0.2);
  leftSpike.rotation.z = -Math.PI / 8;
  leftSpike.rotation.x = -Math.PI / 12;
  const rightSpike = createMesh(new THREE.ConeGeometry(0.3, 1.8, 4), armorMat, -1.2, 2.2, 0.2);
  rightSpike.rotation.z = Math.PI / 8;
  rightSpike.rotation.x = -Math.PI / 12;
  headGroup.add(leftSpike, rightSpike);

  reinhardtRoot.add(headGroup);

  // --- Pauldrons (Shoulders) ---
  const leftPauldronGroup = new THREE.Group();
  leftPauldronGroup.position.set(6.5, 7, 0);
  leftPauldronGroup.rotation.z = -Math.PI / 8;
  const lPauldron = createMesh(new THREE.SphereGeometry(4.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.6), armorMat, 0, 0, 0);
  const lPauldronPlate = createMesh(new THREE.SphereGeometry(4.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5), armorMat, 0, 0.5, 0);
  const redDecal = createMesh(new THREE.BoxGeometry(1.5, 4, 1), redMat, 1.5, 2.5, 3);
  redDecal.rotation.x = -Math.PI / 4;
  redDecal.rotation.z = -Math.PI / 6;
  leftPauldronGroup.add(lPauldron, lPauldronPlate, redDecal);
  reinhardtRoot.add(leftPauldronGroup);
  hitMeshes.push(lPauldron);

  const rightPauldronGroup = new THREE.Group();
  rightPauldronGroup.position.set(-6.5, 7, 0);
  rightPauldronGroup.rotation.z = Math.PI / 8;
  const rPauldron = createMesh(new THREE.SphereGeometry(4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.6), armorMat, 0, 0, 0);
  rightPauldronGroup.add(rPauldron);
  reinhardtRoot.add(rightPauldronGroup);
  hitMeshes.push(rPauldron);

  // --- Arms & Lion Shield Generator ---
  const upperArmGeo = new THREE.CylinderGeometry(1.8, 1.5, 6);
  const lowerArmGeo = new THREE.BoxGeometry(3, 6, 3);
  const handGeo = new THREE.BoxGeometry(2.5, 3, 2.5);

  // Left Arm (Lion Shield Generator)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(6.5, 4, 0);
  const leftUpper = createMesh(upperArmGeo, darkArmorMat, 0, -2, 0);
  leftUpper.rotation.z = Math.PI / 6;
  leftArmGroup.add(leftUpper);

  const leftLowerGroup = new THREE.Group();
  leftLowerGroup.position.set(1.5, -5, 1.5);
  leftLowerGroup.rotation.x = -Math.PI / 6;
  leftLowerGroup.rotation.y = -Math.PI / 8;
  const leftLower = createMesh(lowerArmGeo, armorMat, 0, -2, 0);
  leftLowerGroup.add(leftLower);

  // Lion Shield Forearm Plate & Crest
  const shieldBase = createMesh(new THREE.CylinderGeometry(3, 2, 6, 6), darkArmorMat, 0, -2, 1.5);
  shieldBase.rotation.x = Math.PI / 2;
  shieldBase.rotation.z = Math.PI / 2;
  const shieldPlate = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 6.2, 6), armorMat, 0, -2, 2);
  shieldPlate.rotation.x = Math.PI / 2;
  shieldPlate.rotation.z = Math.PI / 2;
  const crest = createMesh(new THREE.CylinderGeometry(1.5, 0.5, 6.5, 6), goldMat, 0, -2, 2.5);
  crest.rotation.x = Math.PI / 2;
  crest.rotation.z = Math.PI / 2;
  leftLowerGroup.add(shieldBase, shieldPlate, crest);

  const leftHand = createMesh(handGeo, darkArmorMat, 0, -5.5, 0);
  leftLowerGroup.add(leftHand);
  leftArmGroup.add(leftLowerGroup);
  reinhardtRoot.add(leftArmGroup);
  hitMeshes.push(leftLower);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-6.5, 4, 0);
  const rightUpper = createMesh(upperArmGeo, darkArmorMat, 0, -2, 0);
  rightUpper.rotation.z = -Math.PI / 6;
  rightArmGroup.add(rightUpper);

  const rightLowerGroup = new THREE.Group();
  rightLowerGroup.position.set(-1.5, -5, 1.5);
  rightLowerGroup.rotation.x = -Math.PI / 6;
  rightLowerGroup.rotation.y = Math.PI / 8;
  const rightLower = createMesh(lowerArmGeo, armorMat, 0, -2, 0);
  rightLowerGroup.add(rightLower);

  const rightFlare = createMesh(new THREE.CylinderGeometry(2.5, 2, 4, 4), armorMat, 0, -2, 0.5);
  rightFlare.rotation.y = Math.PI / 4;
  rightLowerGroup.add(rightFlare);

  const rightHand = createMesh(handGeo, darkArmorMat, 0, -5.5, 0);
  rightLowerGroup.add(rightHand);
  rightArmGroup.add(rightLowerGroup);
  reinhardtRoot.add(rightArmGroup);
  hitMeshes.push(rightLower);

  // --- Legs ---
  const thighGeo = new THREE.CylinderGeometry(2.5, 2, 7);
  const calfGeo = new THREE.CylinderGeometry(3.5, 2.5, 8);
  const kneeGeo = new THREE.BoxGeometry(3, 4, 3);
  const toeGeo = new THREE.CylinderGeometry(0, 2.8, 4, 4);

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(3.5, -3.5, 0);
  const lThigh = createMesh(thighGeo, darkArmorMat, 0, -3.5, 0);
  const lCalf = createMesh(calfGeo, armorMat, 0, -10, 0.5);
  const lKnee = createMesh(kneeGeo, armorMat, 0, -6.5, 2.5);
  lKnee.rotation.x = Math.PI / 8;
  leftLegGroup.add(lThigh, lCalf, lKnee);

  const lBootGroup = new THREE.Group();
  lBootGroup.position.set(0, -14, 1);
  const lBootBase = createMesh(new THREE.BoxGeometry(4, 2.5, 5), armorMat, 0, 0, 0);
  const lToe = createMesh(toeGeo, armorMat, 0, -0.2, 3.5);
  lToe.rotation.x = Math.PI / 2;
  lToe.rotation.y = Math.PI / 4;
  lBootGroup.add(lBootBase, lToe);
  leftLegGroup.add(lBootGroup);
  leftLegGroup.rotation.y = -Math.PI / 6;
  leftLegGroup.rotation.z = -Math.PI / 16;
  reinhardtRoot.add(leftLegGroup);
  hitMeshes.push(lThigh, lCalf);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-3.5, -3.5, 0);
  const rThigh = createMesh(thighGeo, darkArmorMat, 0, -3.5, 0);
  const rCalf = createMesh(calfGeo, armorMat, 0, -10, 0.5);
  const rKnee = createMesh(kneeGeo, armorMat, 0, -6.5, 2.5);
  rKnee.rotation.x = Math.PI / 8;
  rightLegGroup.add(rThigh, rCalf, rKnee);

  const rBootGroup = new THREE.Group();
  rBootGroup.position.set(0, -14, 1);
  const rBootBase = createMesh(new THREE.BoxGeometry(4, 2.5, 5), armorMat, 0, 0, 0);
  const rToe = createMesh(toeGeo, armorMat, 0, -0.2, 3.5);
  rToe.rotation.x = Math.PI / 2;
  rToe.rotation.y = Math.PI / 4;
  rBootGroup.add(rBootBase, rToe);
  rightLegGroup.add(rBootGroup);
  rightLegGroup.rotation.y = Math.PI / 6;
  rightLegGroup.rotation.z = Math.PI / 16;
  reinhardtRoot.add(rightLegGroup);
  hitMeshes.push(rThigh, rCalf);

  // --- Rocket Hammer ---
  const hammerGroup = new THREE.Group();
  hammerGroup.position.set(0, -7.5, 8.5);
  hammerGroup.rotation.z = -Math.PI / 2.2;
  hammerGroup.rotation.y = -Math.PI / 12;
  hammerGroup.rotation.x = Math.PI / 8;

  const handle = createMesh(new THREE.CylinderGeometry(0.8, 0.8, 30), darkArmorMat, 0, 0, 0);
  hammerGroup.add(handle);

  const headGroupGeo = new THREE.Group();
  headGroupGeo.position.set(0, 11, 0);
  const coreCyl = createMesh(new THREE.CylinderGeometry(3.5, 3.5, 8, 16), armorMat, 0, 0, 0);
  headGroupGeo.add(coreCyl);

  const strikeFaceGroup = new THREE.Group();
  strikeFaceGroup.position.set(0, 0, 4);
  const strikeBase = createMesh(new THREE.BoxGeometry(5, 7, 4), darkArmorMat, 0, 0, 0);
  const strikePlate = createMesh(new THREE.BoxGeometry(6, 8, 1), armorMat, 0, 0, 2);
  strikeFaceGroup.add(strikeBase, strikePlate);
  headGroupGeo.add(strikeFaceGroup);

  // 3 Rocket exhaust ports with glow
  const exhaustGroup = new THREE.Group();
  exhaustGroup.position.set(0, 0, -3);
  const exhaustPortGeo = new THREE.CylinderGeometry(1.5, 1, 3);
  const innerGlowGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.1);

  const ex1 = createMesh(exhaustPortGeo, darkArmorMat, 0, 2.5, -1);
  ex1.rotation.x = Math.PI / 2;
  const gl1 = createMesh(innerGlowGeo, glowMat, 0, 2.5, -1);
  gl1.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex1, gl1);

  const ex2 = createMesh(exhaustPortGeo, darkArmorMat, 1.8, -1.5, -1);
  ex2.rotation.x = Math.PI / 2;
  const gl2 = createMesh(innerGlowGeo, glowMat, 1.8, -1.5, -1);
  gl2.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex2, gl2);

  const ex3 = createMesh(exhaustPortGeo, darkArmorMat, -1.8, -1.5, -1);
  ex3.rotation.x = Math.PI / 2;
  const gl3 = createMesh(innerGlowGeo, glowMat, -1.8, -1.5, -1);
  gl3.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex3, gl3);

  headGroupGeo.add(exhaustGroup);
  hammerGroup.add(headGroupGeo);

  const pommel = createMesh(new THREE.CylinderGeometry(1.5, 1, 4), armorMat, 0, -14, 0);
  hammerGroup.add(pommel);
  reinhardtRoot.add(hammerGroup);

  // Ground calibration: Feet at y = 0, scaled to ~2.45m height in world
  reinhardtRoot.position.y = 1.35;
  const scale = 0.0766;
  reinhardtRoot.scale.set(scale, scale, scale);

  parentGroup.add(reinhardtRoot);

  // Deployable Barrier Shield (Translucent cyan energy field)
  const shieldGeo = new THREE.PlaneGeometry(3.6, 2.4);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.set(0, 1.4, 1.15);
  shieldMesh.visible = false;
  parentGroup.add(shieldMesh);

  return {
    rootGroup: reinhardtRoot,
    bodyMesh: chest,
    headMesh: helmet,
    shieldMesh,
    hitMeshes
  };
}

// ============================================================================
// 2. TRACER MODEL BUILDER
// ============================================================================
function buildTracerModel(parentGroup) {
  const tracerRoot = new THREE.Group();

  // Materials
  const matOrange = new THREE.MeshStandardMaterial({ color: 0xff7700, roughness: 0.3, metalness: 0.2 });
  const matJacket = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
  const matWhite = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffdcb1, roughness: 0.4 });
  const matHair = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const matGoggles = new THREE.MeshPhysicalMaterial({ color: 0xff5500, transparent: true, opacity: 0.75, roughness: 0.1 });
  const matGlow = new THREE.MeshBasicMaterial({ color: 0x00ffff });

  const hitMeshes = [];

  // Helper for pistols
  function createPistol() {
    const gunGroup = new THREE.Group();
    const body = createMesh(new THREE.BoxGeometry(2.5, 4.5, 11), matWhite);
    const lowerBarrel = createMesh(new THREE.BoxGeometry(2, 2.5, 8), matDark, 0, -2, 1.5);
    const grip = createMesh(new THREE.BoxGeometry(2, 4, 3), matDark, 0, -4, -2.5);
    grip.rotation.x = -0.2;
    const glow = createMesh(new THREE.BoxGeometry(2.8, 1.5, 4), matGlow, 0, 0, 0);
    gunGroup.add(body, lowerBarrel, grip, glow);
    return gunGroup;
  }

  // --- Torso & Chronal Accelerator ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 45;

  const abdomen = createMesh(new THREE.CylinderGeometry(3.5, 4.5, 10, 16), matOrange);
  const chest = createMesh(new THREE.BoxGeometry(11, 10, 7), matJacket, 0, 8, 0);

  const collarGeo = new THREE.CylinderGeometry(5, 6, 4, 16, 1, true, 0, Math.PI);
  const collarMat = matJacket.clone();
  collarMat.side = THREE.DoubleSide;
  const collar = createMesh(collarGeo, collarMat, 0, 14, 0);
  collar.rotation.x = -0.2;

  const armor = createMesh(new THREE.BoxGeometry(12, 6, 8), matWhite, 0, 9, 0);

  // Chronal Accelerator core + ring + blue light
  const accRing = createMesh(new THREE.TorusGeometry(2, 0.5, 16, 32), matWhite, 0, 9, 4.2);
  const accCore = createMesh(new THREE.SphereGeometry(1.5, 16, 16), matGlow, 0, 9, 4.2);
  const glowLight = new THREE.PointLight(0x00ffff, 1.2, 15);
  glowLight.position.set(0, 9, 5);

  torsoGroup.add(abdomen, chest, collar, armor, accRing, accCore, glowLight);
  tracerRoot.add(torsoGroup);
  hitMeshes.push(chest, abdomen, armor);

  // --- Head & Amber Goggles (CRITICAL HITBOX) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 62, 0);

  const head = createMesh(new THREE.SphereGeometry(3.5, 32, 32), matSkin);
  const goggle = createMesh(new THREE.BoxGeometry(6.5, 2, 4), matGoggles, 0, 0.5, 2);
  headGroup.add(head, goggle);
  hitMeshes.push(head);

  // Spiky Anime Hair
  for (let i = 0; i < 15; i++) {
    const hairGeo = new THREE.ConeGeometry(0.7 + (i % 3) * 0.3, 3 + (i % 2) * 1.5, 6);
    const hair = createMesh(hairGeo, matHair);
    hair.position.set(
      ((i % 5) - 2) * 1.0,
      3.0 + (i % 3) * 0.7,
      ((i % 4) - 2) * 1.1 - 0.5
    );
    hair.rotation.set((i % 3) * 0.2 - 0.2, (i % 2) * 0.3 - 0.15, ((i % 5) - 2) * 0.3);
    headGroup.add(hair);
  }
  headGroup.rotation.x = 0.08;
  tracerRoot.add(headGroup);

  // --- Right Arm (Extended aiming forward) ---
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-6.5, 56, 0);
  const rUpperArm = createMesh(new THREE.CylinderGeometry(2, 1.5, 12, 16), matJacket, 0, -5, 0);
  const rElbow = new THREE.Group();
  rElbow.position.set(0, -11, 0);
  const rLowerArm = createMesh(new THREE.CylinderGeometry(1.6, 1.2, 12, 16), matWhite, 0, -5, 0);
  const gunR = createPistol();
  gunR.position.set(0, -11, 3);
  gunR.rotation.x = Math.PI / 2 + 0.2;
  rElbow.add(rLowerArm, gunR);
  rightArmGroup.add(rUpperArm, rElbow);

  rightArmGroup.rotation.x = 1.4;
  rightArmGroup.rotation.z = -0.1;
  rightArmGroup.rotation.y = 0.2;
  rElbow.rotation.x = -0.1;
  tracerRoot.add(rightArmGroup);
  hitMeshes.push(rLowerArm);

  // --- Left Arm (Folded across chest) ---
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(6.5, 56, 0);
  const lUpperArm = createMesh(new THREE.CylinderGeometry(2, 1.5, 12, 16), matJacket, 0, -5, 0);
  const lElbow = new THREE.Group();
  lElbow.position.set(0, -11, 0);
  const lLowerArm = createMesh(new THREE.CylinderGeometry(1.6, 1.2, 12, 16), matWhite, 0, -5, 0);
  const gunL = createPistol();
  gunL.position.set(0, -11, 3);
  gunL.rotation.x = Math.PI / 2 + 0.2;
  lElbow.add(lLowerArm, gunL);
  leftArmGroup.add(lUpperArm, lElbow);

  leftArmGroup.rotation.x = 1.0;
  leftArmGroup.rotation.z = 0.8;
  leftArmGroup.rotation.y = -0.5;
  lElbow.rotation.x = -2.0;
  lElbow.rotation.z = -0.3;
  lElbow.rotation.y = -0.6;
  tracerRoot.add(leftArmGroup);
  hitMeshes.push(lLowerArm);

  // --- Right Leg ---
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-4, 40, 0);
  const rThigh = createMesh(new THREE.CylinderGeometry(3.5, 2.5, 18, 16), matOrange, 0, -9, 0);
  const rStrap = createMesh(new THREE.BoxGeometry(0.5, 18, 1.5), matDark, -3.2, -9, 0);
  const rKnee = new THREE.Group();
  rKnee.position.set(0, -18, 0);
  const rCalf = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 20, 16), matOrange, 0, -10, 0);
  const rBoot = createMesh(new THREE.CylinderGeometry(2, 2.5, 8, 16), matWhite, 0, -21, 0.5);
  const rFoot = createMesh(new THREE.BoxGeometry(4, 2, 8), matWhite, 0, -24, 2);
  rKnee.add(rCalf, rBoot, rFoot);
  rightLegGroup.add(rThigh, rStrap, rKnee);
  rightLegGroup.rotation.z = -0.35;
  rightLegGroup.rotation.x = 0.1;
  rKnee.rotation.x = -0.05;
  tracerRoot.add(rightLegGroup);
  hitMeshes.push(rThigh, rCalf);

  // --- Left Leg ---
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(4, 40, 0);
  const lThigh = createMesh(new THREE.CylinderGeometry(3.5, 2.5, 18, 16), matOrange, 0, -9, 0);
  const lStrap = createMesh(new THREE.BoxGeometry(0.5, 18, 1.5), matDark, 3.2, -9, 0);
  const lKnee = new THREE.Group();
  lKnee.position.set(0, -18, 0);
  const lCalf = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 20, 16), matOrange, 0, -10, 0);
  const lBoot = createMesh(new THREE.CylinderGeometry(2, 2.5, 8, 16), matWhite, 0, -21, 0.5);
  const lFoot = createMesh(new THREE.BoxGeometry(4, 2, 8), matWhite, 0, -24, 2);
  lKnee.add(lCalf, lBoot, lFoot);
  leftLegGroup.add(lThigh, lStrap, lKnee);
  leftLegGroup.rotation.z = 0.35;
  leftLegGroup.rotation.x = -0.3;
  lKnee.rotation.x = 0.5;
  tracerRoot.add(leftLegGroup);
  hitMeshes.push(lThigh, lCalf);

  // Ground calibration: Feet at y = 0, scaled to ~1.72m height
  tracerRoot.position.y = 0.08;
  const scale = 0.0245;
  tracerRoot.scale.set(scale, scale, scale);

  parentGroup.add(tracerRoot);

  return {
    rootGroup: tracerRoot,
    bodyMesh: chest,
    headMesh: head,
    hitMeshes
  };
}

// ============================================================================
// 3. GENJI MODEL BUILDER
// ============================================================================
function buildGenjiModel(parentGroup) {
  const genjiRoot = new THREE.Group();

  // Materials
  const whiteArmorMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.22,
    metalness: 0.32
  });
  const chromeArmorMat = new THREE.MeshStandardMaterial({
    color: 0xc4d0dc,
    roughness: 0.14,
    metalness: 0.88
  });
  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x1f232b,
    roughness: 0.36,
    metalness: 0.75
  });
  const cyberMuscleMat = new THREE.MeshStandardMaterial({
    color: 0x543f34,
    roughness: 0.62,
    metalness: 0.22
  });
  const greenGlowMat = new THREE.MeshStandardMaterial({
    color: 0x55ff22,
    emissive: 0x55ff22,
    emissiveIntensity: 3.2,
    roughness: 0.15,
    metalness: 0.1
  });
  const katanaSteelMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.28,
    metalness: 0.9
  });

  const hitMeshes = [];

  // Anatomical Hierarchy
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, 0.93, 0);
  genjiRoot.add(spineGroup);

  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.30, 0);
  spineGroup.add(chestGroup);

  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.22, 0);
  chestGroup.add(neckGroup);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.12, 0.02);
  neckGroup.add(headGroup);

  // Neck
  const neck = createMesh(new THREE.CylinderGeometry(0.065, 0.08, 0.16, 16), cyberMuscleMat, 0, -0.02, -0.015);
  neck.rotation.x = 0.05;
  const neckPlate = createMesh(new THREE.BoxGeometry(0.045, 0.13, 0.03), whiteArmorMat, 0, -0.01, -0.065);
  neckPlate.rotation.x = 0.12;
  neckGroup.add(neck, neckPlate);

  // Head (CRITICAL HEADSHOT HITBOX)
  const innerHead = createMesh(new THREE.CylinderGeometry(0.075, 0.055, 0.17, 16), darkTitaniumMat, 0, 0.01, 0.01);
  headGroup.add(innerHead);

  const domeGeo = new THREE.SphereGeometry(0.105, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const dome = createMesh(domeGeo, whiteArmorMat, 0, 0.01, 0.01);
  dome.scale.set(0.92, 1.05, 1.18);
  headGroup.add(dome);
  hitMeshes.push(dome);

  // Angular V-Brow
  const browGroup = new THREE.Group();
  browGroup.position.set(0, 0.04, 0.08);
  browGroup.rotation.x = 0.18;
  const browLeft = createMesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), whiteArmorMat, -0.045, 0, 0);
  browLeft.rotation.set(0, -0.35, 0.12);
  const browRight = createMesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), whiteArmorMat, 0.045, 0, 0);
  browRight.rotation.set(0, 0.35, -0.12);
  browGroup.add(browLeft, browRight);
  headGroup.add(browGroup);

  // Glowing Green V-Visor & Light
  const visorLeft = createMesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), greenGlowMat, -0.036, 0.005, 0.105);
  visorLeft.rotation.set(0, -0.28, -0.16);
  const visorRight = createMesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), greenGlowMat, 0.036, 0.005, 0.105);
  visorRight.rotation.set(0, 0.28, 0.16);
  const visorLight = new THREE.PointLight(0x55ff22, 1.8, 1.0);
  visorLight.position.set(0, 0.02, 0.16);
  headGroup.add(visorLeft, visorRight, visorLight);

  // Cheek plates & mouth plate
  const cheekLeft = createMesh(new THREE.BoxGeometry(0.035, 0.11, 0.09), whiteArmorMat, -0.07, -0.04, 0.04);
  cheekLeft.rotation.set(0.2, -0.3, 0.15);
  const cheekRight = createMesh(new THREE.BoxGeometry(0.035, 0.11, 0.09), whiteArmorMat, 0.07, -0.04, 0.04);
  cheekRight.rotation.set(0.2, 0.3, -0.15);
  const mouthPlate = createMesh(new THREE.BoxGeometry(0.065, 0.075, 0.06), darkTitaniumMat, 0, -0.06, 0.07);
  mouthPlate.rotation.x = -0.15;
  headGroup.add(cheekLeft, cheekRight, mouthPlate);

  // Swept-back Twin Ear Fins
  [-1, 1].forEach((side) => {
    const earFin = createMesh(new THREE.BoxGeometry(0.015, 0.18, 0.04), whiteArmorMat, side * 0.10, 0.03, -0.06);
    earFin.rotation.set(-1.0, side * 0.15, side * -0.1);
    headGroup.add(earFin);
  });

  // --- Torso & Cyber Muscle Chassis ---
  const chestCore = createMesh(new THREE.CylinderGeometry(0.185, 0.145, 0.29, 16), cyberMuscleMat);
  chestCore.scale.set(1.15, 1.0, 0.82);
  chestGroup.add(chestCore);
  hitMeshes.push(chestCore);

  const collar = createMesh(new THREE.BoxGeometry(0.32, 0.045, 0.14), whiteArmorMat, 0, 0.13, 0.04);
  chestGroup.add(collar);

  // Chrome Pectoral Armor
  [-1, 1].forEach((side) => {
    const pec = createMesh(new THREE.BoxGeometry(0.145, 0.115, 0.09), chromeArmorMat, side * 0.088, 0.055, 0.082);
    pec.rotation.set(0.14, side * -0.12, side * 0.06);
    chestGroup.add(pec);
    hitMeshes.push(pec);
  });

  // Chest Green Power Core & Rib Plates
  const chestNode = createMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 16), greenGlowMat, 0, 0.07, 0.135);
  chestNode.rotation.x = Math.PI / 2;
  chestGroup.add(chestNode);

  [-1, 1].forEach((side) => {
    const ribPlate = createMesh(new THREE.BoxGeometry(0.035, 0.16, 0.12), whiteArmorMat, side * 0.165, -0.04, 0.02);
    ribPlate.rotation.z = side * -0.15;
    chestGroup.add(ribPlate);
  });

  // Abdomen, Midline & 4 Cyber Nodes
  const absGroup = new THREE.Group();
  absGroup.position.set(0, -0.12, 0);
  const stomachPlate = createMesh(new THREE.BoxGeometry(0.075, 0.22, 0.075), whiteArmorMat, 0, -0.045, 0.078);
  const kanjiStripe = createMesh(new THREE.BoxGeometry(0.022, 0.085, 0.005), darkTitaniumMat, 0, -0.03, 0.118);
  absGroup.add(stomachPlate, kanjiStripe);
  [-1, 1].forEach((col) => {
    [0.015, -0.065].forEach((row) => {
      const dot = createMesh(new THREE.SphereGeometry(0.011, 8, 8), greenGlowMat, col * 0.062, row, 0.108);
      absGroup.add(dot);
    });
  });
  chestGroup.add(absGroup);

  // Pelvis & Green Power Ring
  const pelvis = createMesh(new THREE.CylinderGeometry(0.155, 0.125, 0.19, 16), whiteArmorMat);
  pelvis.scale.set(1.08, 1.0, 0.85);
  spineGroup.add(pelvis);
  hitMeshes.push(pelvis);

  const hipRingOuter = createMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.025, 20), greenGlowMat, -0.115, 0.02, 0.085);
  hipRingOuter.rotation.x = Math.PI / 2;
  const hipRingInner = createMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16), darkTitaniumMat, -0.115, 0.02, 0.088);
  hipRingInner.rotation.x = Math.PI / 2;
  spineGroup.add(hipRingOuter, hipRingInner);

  // Wakizashi short blade on lower back
  const wakizashi = createMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 12), katanaSteelMat, 0, -0.03, -0.115);
  wakizashi.rotation.z = Math.PI / 2 + 0.1;
  const wakiGlow = createMesh(new THREE.CylinderGeometry(0.021, 0.021, 0.06, 12), greenGlowMat, 0.06, -0.03, -0.115);
  wakiGlow.rotation.z = Math.PI / 2 + 0.1;
  spineGroup.add(wakizashi, wakiGlow);

  // --- Ryu-Ichimonji (Katana on Back) ---
  const katanaMount = new THREE.Group();
  katanaMount.position.set(0.06, 0.04, -0.125);
  katanaMount.rotation.set(-0.28, 0.15, -0.68);
  const scabbard = createMesh(new THREE.BoxGeometry(0.034, 0.88, 0.024), katanaSteelMat, 0, 0.08, 0);
  const scabbardBeam = createMesh(new THREE.BoxGeometry(0.009, 0.82, 0.028), greenGlowMat, 0, 0.08, 0);
  const tsuba = createMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), darkTitaniumMat, 0, 0.52, 0);
  const hilt = createMesh(new THREE.CylinderGeometry(0.019, 0.021, 0.22, 12), katanaSteelMat, 0, 0.63, 0);
  const hiltRing = createMesh(new THREE.CylinderGeometry(0.021, 0.021, 0.04, 12), greenGlowMat, 0, 0.63, 0);
  const pommel = createMesh(new THREE.SphereGeometry(0.022, 10, 10), darkTitaniumMat, 0, 0.74, 0);
  katanaMount.add(scabbard, scabbardBeam, tsuba, hilt, hiltRing, pommel);
  chestGroup.add(katanaMount);

  // --- Arms ---
  function buildArm(side) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.235, 0.075, 0.01);

    const pauldron = createMesh(new THREE.SphereGeometry(0.092, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), whiteArmorMat);
    pauldron.rotation.z = side * -0.38;
    pauldron.scale.set(1.0, 1.08, 1.0);
    const shoulderDot = createMesh(new THREE.SphereGeometry(0.013, 8, 8), greenGlowMat, side * 0.055, 0.035, 0.052);
    arm.add(pauldron, shoulderDot);

    const bicep = createMesh(new THREE.CylinderGeometry(0.05, 0.046, 0.19, 14), cyberMuscleMat, 0, -0.125, 0);
    const bicepPlate = createMesh(new THREE.BoxGeometry(0.025, 0.14, 0.07), whiteArmorMat, side * 0.042, -0.125, 0.01);
    const elbow = createMesh(new THREE.SphereGeometry(0.044, 12, 12), darkTitaniumMat, 0, -0.22, 0);
    arm.add(bicep, bicepPlate, elbow);

    const forearm = new THREE.Group();
    forearm.position.set(0, -0.22, 0);
    const bracer = createMesh(new THREE.CylinderGeometry(0.055, 0.044, 0.21, 14), whiteArmorMat, 0, -0.105, 0.01);
    bracer.scale.set(0.95, 1.0, 1.22);
    forearm.add(bracer);

    if (side === -1) {
      const rail = createMesh(new THREE.BoxGeometry(0.02, 0.13, 0.03), greenGlowMat, -0.045, -0.095, 0.012);
      forearm.add(rail);
    }

    const hand = new THREE.Group();
    hand.position.set(0, -0.21, 0);
    const fist = createMesh(new THREE.BoxGeometry(0.055, 0.065, 0.055), darkTitaniumMat, 0, -0.012, 0);
    const knuckleArmor = createMesh(new THREE.BoxGeometry(0.058, 0.016, 0.062), chromeArmorMat, 0, -0.028, 0.018);
    hand.add(fist, knuckleArmor);
    forearm.add(hand);
    arm.add(forearm);

    // Natural athletic heroic arm angle
    arm.rotation.set(0.10, 0, side * -0.18);
    forearm.rotation.set(-0.22, 0, side * 0.12);

    hitMeshes.push(bracer);
    return arm;
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  chestGroup.add(leftArm, rightArm);

  // --- Legs ---
  function buildLeg(side) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.125, 0.89, 0);

    const thigh = createMesh(new THREE.CylinderGeometry(0.078, 0.06, 0.38, 16), cyberMuscleMat, 0, -0.19, 0);
    thigh.scale.set(1.08, 1.0, 1.18);
    const thighPlate = createMesh(new THREE.BoxGeometry(0.035, 0.34, 0.12), whiteArmorMat, side * 0.055, -0.18, 0.025);
    leg.add(thigh, thighPlate);

    const kneeGroup = new THREE.Group();
    kneeGroup.position.set(0, -0.38, 0);
    const kneeCap = createMesh(new THREE.BoxGeometry(0.068, 0.085, 0.065), chromeArmorMat, 0, 0, 0.055);
    kneeCap.rotation.x = -0.16;
    const kneeDot = createMesh(new THREE.SphereGeometry(0.009, 8, 8), greenGlowMat, 0, 0.01, 0.088);
    kneeGroup.add(kneeCap, kneeDot);
    leg.add(kneeGroup);

    const shin = createMesh(new THREE.CylinderGeometry(0.05, 0.038, 0.44, 16), whiteArmorMat, 0, -0.22, 0.01);
    shin.scale.set(0.95, 1.0, 1.25);
    const calf = createMesh(new THREE.ConeGeometry(0.054, 0.28, 12), cyberMuscleMat, 0, -0.18, -0.038);
    calf.rotation.x = Math.PI;
    const foot = createMesh(new THREE.BoxGeometry(0.072, 0.045, 0.21), darkTitaniumMat, 0, -0.44, 0.045);
    const toeCover = createMesh(new THREE.BoxGeometry(0.068, 0.03, 0.09), whiteArmorMat, 0, -0.43, 0.09);
    const splitToe = createMesh(new THREE.BoxGeometry(0.008, 0.025, 0.04), darkTitaniumMat, 0, -0.435, 0.14);
    const heelGlow = createMesh(new THREE.BoxGeometry(0.028, 0.02, 0.018), greenGlowMat, 0, -0.43, -0.055);
    kneeGroup.add(shin, calf, foot, toeCover, splitToe, heelGlow);

    leg.rotation.set(-0.02, side * -0.06, side * 0.05);
    hitMeshes.push(thigh, shin);
    return leg;
  }

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);
  genjiRoot.add(leftLeg, rightLeg);

  // Ground calibration: Feet at y = 0
  genjiRoot.position.y = -0.045;
  parentGroup.add(genjiRoot);

  return {
    rootGroup: genjiRoot,
    bodyMesh: chestCore,
    headMesh: dome,
    hitMeshes
  };
}

// ==================== js/entities/Projectile.js ====================
/**
 * ============================================================================
 * PROJECTILE & HITSCAN TRAIL MANAGER
 * - Genji Shurikens (Fast aerodynamic spinning stars with cyan trail)
 * - Reinhardt Fire Strike (Giant piercing crescent flame wave)
 * - Tracer Pulse Bomb (Sticky physics bomb with 1.5s countdown ring & huge shockwave)
 * - Tracer Hitscan Bullet Beams (Instant laser tracers)
 * ============================================================================
 */
class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.bulletBeams = [];
    this.motionStreaks = [];
  }

  // 1. Hitscan Tracer Beam (Tracer Dual Pulse Pistols)
  addBulletBeam(start, end, color = 0x00f0ff) {
    const points = [start.clone(), end.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });

    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.bulletBeams.push({ line, life: 0.08, maxLife: 0.08 });
  }

  // 1.5 3D Volumetric Motion Streak (Tracer Blink, Genji Swift Strike, Reinhardt Charge)
  addMotionStreak(start, end, color = 0x00f0ff, radius = 0.09, duration = 0.38) {
    const dist = start.distanceTo(end);
    if (dist < 0.2) return;

    const group = new THREE.Group();

    // Intense inner core
    const coreGeo = new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, dist, 8);
    coreGeo.translate(0, dist / 2, 0);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Glowing outer energy sheath
    const sheathGeo = new THREE.CylinderGeometry(radius, radius, dist, 8);
    sheathGeo.translate(0, dist / 2, 0);
    sheathGeo.rotateX(Math.PI / 2);
    const sheathMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });
    const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
    group.add(sheathMesh);

    group.position.copy(start);
    group.lookAt(end);

    this.scene.add(group);
    this.motionStreaks.push({
      group,
      coreMat,
      sheathMat,
      life: duration,
      maxLife: duration
    });
  }

  // 2. Genji Shuriken
  spawnShuriken(origin, direction, hero) {
    const starGroup = new THREE.Group();

    // High-visibility glowing 6-point cybernetic shuriken
    const starGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.03, 3);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const mesh1 = new THREE.Mesh(starGeo, starMat);
    starGroup.add(mesh1);

    const mesh2 = new THREE.Mesh(starGeo, starMat);
    mesh2.rotation.y = Math.PI / 3;
    starGroup.add(mesh2);

    // Glowing energy core for visual clarity
    const coreGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    starGroup.add(core);

    starGroup.position.copy(origin);
    starGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(starGroup);
    this.projectiles.push({
      type: 'shuriken',
      mesh: starGroup,
      velocity: direction.clone().multiplyScalar(48), // 48m/s fast & crisp
      life: 2.5,
      damage: 27,
      hero,
      lastPos: origin.clone()
    });
  }

  // 3. Reinhardt Fire Strike
  spawnFireStrike(origin, direction, hero) {
    const waveGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 16, 1, false, 0, Math.PI);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(waveGeo, waveMat);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'firestrike',
      mesh,
      velocity: direction.clone().multiplyScalar(24),
      life: 3.0,
      damage: 100,
      hitBots: new Set(), // Pierces multiple enemies!
      hero,
      lastPos: origin.clone()
    });
  }

  // 4. Tracer Pulse Bomb
  spawnPulseBomb(origin, direction, hero) {
    const bombGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const bombMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const mesh = new THREE.Mesh(bombGeo, bombMat);
    mesh.position.copy(origin);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'pulsebomb',
      mesh,
      velocity: direction.clone().multiplyScalar(20),
      gravity: -15,
      isStuck: false,
      stuckTarget: null,
      countdown: 1.5,
      damage: 350,
      hero
    });
  }

  // 5. Training Bot / Enemy Plasma Bolt (For testing shield blocking and deflect)
  spawnEnemyBolt(origin, direction, speed = 25, damage = 25) {
    const geo = new THREE.SphereGeometry(0.18, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);

    const haloGeo = new THREE.SphereGeometry(0.30, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff5577,
      transparent: true,
      opacity: 0.55
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'enemy_bolt',
      mesh,
      velocity: direction.clone().multiplyScalar(speed),
      life: 3.5,
      damage,
      isReflected: false,
      lastPos: origin.clone()
    });
  }

  update(dt, bots, onHitCallback, map = null, playerContext = null) {
    // 0. Update Motion Streaks (Fade & Thinning)
    for (let i = this.motionStreaks.length - 1; i >= 0; i--) {
      const s = this.motionStreaks[i];
      s.life -= dt;
      const progress = Math.max(0, s.life / s.maxLife);
      s.coreMat.opacity = progress * 0.95;
      s.sheathMat.opacity = progress * 0.85;
      s.group.scale.set(progress, progress, 1.0); // Thins out radially as it fades!
      if (s.life <= 0) {
        this.scene.remove(s.group);
        s.group.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        this.motionStreaks.splice(i, 1);
      }
    }

    // 1. Update Hitscan Beams
    for (let i = this.bulletBeams.length - 1; i >= 0; i--) {
      const b = this.bulletBeams[i];
      b.life -= dt;
      b.line.material.opacity = Math.max(0, b.life / b.maxLife);
      if (b.life <= 0) {
        this.scene.remove(b.line);
        b.line.geometry.dispose();
        b.line.material.dispose();
        this.bulletBeams.splice(i, 1);
      }
    }

    // 2. Update Physical Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.type === 'shuriken') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 28 * dt; // Rapid aerodynamic spin

        let hit = false;

        // Wall & Obstacle Collision Check
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.15);
          if (wallHit.hit) {
            hit = true;
          }
        }

        if (!hit) {
          // Continuous Swept Collision Detection (CCD) against Bot / Player Vertical Cylinders
          const dx = p.mesh.position.x - prevPos.x;
          const dz = p.mesh.position.z - prevPos.z;
          const horizLenSq = dx * dx + dz * dz;

          for (const bot of bots) {
            if (bot.isDead) continue;
            const botPos = bot.group.position;

            let t = 0;
            if (horizLenSq > 0.00001) {
              const vx = botPos.x - prevPos.x;
              const vz = botPos.z - prevPos.z;
              t = Math.max(0, Math.min(1, (vx * dx + vz * dz) / horizLenSq));
            }

            const closestX = prevPos.x + dx * t;
            const closestZ = prevPos.z + dz * t;
            const closestY = prevPos.y + (p.mesh.position.y - prevPos.y) * t;

            const horizDist = Math.hypot(closestX - botPos.x, closestZ - botPos.z);

            if (horizDist <= 1.25 && closestY >= (botPos.y + 0.1) && closestY <= (botPos.y + 2.7)) {
              const isHead = closestY >= (botPos.y + 1.85);
              const dmg = isHead ? p.damage * 2 : p.damage;
              const finalBlow = bot.takeDamage(dmg, isHead, p.velocity.clone().normalize());
              onHitCallback(bot, dmg, isHead, finalBlow);
              hit = true;
              break;
            }
          }
        }

        if (hit || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'firestrike') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 8 * dt;

        let wallBlocked = false;

        // Wall & Obstacle Collision Check (Reinhardt Fire Strike cannot pass through solid walls)
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.6);
          if (wallHit.hit) {
            wallBlocked = true;
          }
        }

        if (!wallBlocked) {
          const dx = p.mesh.position.x - prevPos.x;
          const dz = p.mesh.position.z - prevPos.z;
          const horizLenSq = dx * dx + dz * dz;

          // Piercing swept hit check against enemy cylinder
          for (const bot of bots) {
            if (bot.isDead || p.hitBots.has(bot.id || bot)) continue;
            const botPos = bot.group.position;

            let t = 0;
            if (horizLenSq > 0.00001) {
              const vx = botPos.x - prevPos.x;
              const vz = botPos.z - prevPos.z;
              t = Math.max(0, Math.min(1, (vx * dx + vz * dz) / horizLenSq));
            }

            const closestX = prevPos.x + dx * t;
            const closestZ = prevPos.z + dz * t;
            const closestY = prevPos.y + (p.mesh.position.y - prevPos.y) * t;
            const horizDist = Math.hypot(closestX - botPos.x, closestZ - botPos.z);

            if (horizDist <= 2.4 && closestY >= botPos.y && closestY <= botPos.y + 3.0) {
              p.hitBots.add(bot.id || bot);
              const finalBlow = bot.takeDamage(p.damage, false, p.velocity.clone().normalize());
              onHitCallback(bot, p.damage, false, finalBlow);
            }
          }
        }

        if (wallBlocked || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'pulsebomb') {
        if (!p.isStuck) {
          const prevPos = p.mesh.position.clone();
          p.velocity.y += p.gravity * dt;
          p.mesh.position.addScaledVector(p.velocity, dt);

          // Wall / Obstacle Collision Check (Sticks to wall on contact)
          if (map && typeof map.checkProjectileHit === 'function') {
            const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.22);
            if (wallHit.hit) {
              p.isStuck = true;
              p.mesh.position.copy(wallHit.point);
              p.velocity.set(0, 0, 0);
            }
          }

          // Floor collision (Sticks to ground)
          if (!p.isStuck && p.mesh.position.y <= 0.15) {
            p.mesh.position.y = 0.15;
            p.velocity.set(0, 0, 0);
            p.isStuck = true;
          }

          // Target Body collision (Sticks to player/bot body)
          if (!p.isStuck) {
            for (const bot of bots) {
              if (bot.isDead) continue;
              const botPos = bot.group.position;
              const horizDist = Math.hypot(p.mesh.position.x - botPos.x, p.mesh.position.z - botPos.z);
              const vertY = p.mesh.position.y;
              if (horizDist < 1.1 && vertY >= botPos.y && vertY <= botPos.y + 2.5) {
                p.isStuck = true;
                p.stuckTarget = bot;
                p.velocity.set(0, 0, 0);
                break;
              }
            }
          }
        } else if (p.stuckTarget) {
          p.mesh.position.copy(p.stuckTarget.group.position).add(new THREE.Vector3(0, 1.2, 0));
        }

        // Pulse Countdown & Flash
        p.countdown -= dt;
        const blinkFreq = p.countdown < 0.5 ? 20 : 8;
        p.mesh.material.color.setHex(Math.sin(Date.now() * 0.02 * blinkFreq) > 0 ? 0xff0044 : 0x00f0ff);

        if (p.countdown <= 0) {
          // EXPLODE!
          for (const bot of bots) {
            if (bot.isDead) continue;
            const targetCenter = bot.group.position.clone().add(new THREE.Vector3(0, 1.0, 0));
            const dist = p.mesh.position.distanceTo(targetCenter);
            if (dist < 5.5) {
              const falloff = 1 - dist / 5.5;
              const dmg = Math.floor(p.damage * falloff);
              const finalBlow = bot.takeDamage(dmg, false, new THREE.Vector3(0, 1, 0));
              onHitCallback(bot, dmg, false, finalBlow);
            }
          }

          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'enemy_bolt') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();

        let hit = false;

        // Map collision
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.18);
          if (wallHit.hit) {
            hit = true;
          }
        }

        if (!hit) {
          if (!p.isReflected) {
            // Check collision against local player
            if (playerContext && playerContext.playerPos && playerContext.currentHero) {
              const pPos = playerContext.playerPos;
              const pHero = playerContext.currentHero;
              const pCam = playerContext.camera;
              const dist = p.mesh.position.distanceTo(pPos);

              if (dist < 1.7) {
                // 1. Check Genji Deflect
                if (pHero.name === 'GENJI' && pHero.isDeflecting) {
                  p.isReflected = true;
                  if (p.mesh.children && p.mesh.children[0]) {
                    p.mesh.children[0].material.color.setHex(0x00ff88);
                  }
                  p.mesh.material.color.setHex(0x10b981);
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  p.velocity.copy(forward).multiplyScalar(42);
                  if (playerContext.audio) playerContext.audio.playGenjiDeflect();
                  if (playerContext.shaker) playerContext.shaker.addTrauma(0.18);
                  continue;
                }

                // 2. Check Reinhardt Shield
                if (pHero.name === 'REINHARDT' && pHero.isShieldActive) {
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  forward.y = 0;
                  forward.normalize();
                  const toBolt = p.mesh.position.clone().sub(pPos).normalize();
                  if (forward.dot(toBolt) > 0.1) {
                    pHero.takeShieldDamage(p.damage);
                    if (playerContext.audio) playerContext.audio.playHit(false);
                    if (playerContext.shaker) playerContext.shaker.addTrauma(0.08);
                    hit = true;
                  }
                }

                if (!hit && !p.isReflected) {
                  // Direct hit on unshielded player
                  pHero.takeDamage(p.damage);
                  if (playerContext.audio) playerContext.audio.playDamage();
                  if (playerContext.shaker) playerContext.shaker.addTrauma(0.2);
                  if (playerContext.ui) playerContext.ui.triggerDamageFlash();
                  hit = true;
                }
              }
            }
          } else {
            // Deflected bolt: travels forward and damages training bots or enemies
            for (const bot of bots) {
              if (bot.isDead) continue;
              const botPos = bot.group.position;
              const dist = p.mesh.position.distanceTo(botPos.clone().add(new THREE.Vector3(0, 1.2, 0)));
              if (dist < 1.4) {
                const finalBlow = bot.takeDamage(50, false, p.velocity.clone().normalize());
                if (typeof onHitCallback === 'function') {
                  onHitCallback(bot, 50, false, finalBlow);
                }
                hit = true;
                break;
              }
            }
          }
        }

        if (hit || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          this.projectiles.splice(i, 1);
        }
      }
    }
  }
}

// ==================== js/entities/Bot.js ====================
/**
 * ============================================================================
 * OMNIC TRAINING BOT (3D Procedural Mesh & Hit Detection)
 * - Critical Headshot Node (Red Glowing Visor Eye with 'DINK' trigger)
 * - Trailing Floating Health Bar (skill.md 3.4 standard)
 * - Squash & Stretch Deformation on Impact (skill.md 3.3)
 * - Dismemberment Physics Explosion upon Elimination
 * ============================================================================
 */
class TrainingBot {
  constructor(scene, x, z, id = 1) {
    this.scene = scene;
    this.id = id;
    this.name = `훈련용 봇 [${id}]`;

    this.maxHp = 200;
    this.hp = 200;
    this.trailingHp = 200;
    this.trailDelay = 0;

    this.isDead = false;
    this.respawnTimer = 0;
    this.spawnPos = new THREE.Vector3(x, 0, z);

    // Hit reaction
    this.flashTimer = 0;
    this.squashScale = new THREE.Vector3(1, 1, 1);
    this.targetSquash = new THREE.Vector3(1, 1, 1);

    // Patrol movement
    this.patrolCenter = new THREE.Vector3(x, 0, z);
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.patrolRadius = 3.5;
    this.moveSpeed = 1.6;
    this.shootCooldown = 2.5 + Math.random() * 2.0;

    // Build 3D Mesh
    this.group = new THREE.Group();
    this.group.position.copy(this.spawnPos);

    this.headMesh = null;
    this.bodyMesh = null;
    this.parts = []; // For death dismemberment

    this.buildBotMesh();
    this.buildFloatingHealthBar();

    this.scene.add(this.group);
  }

  buildBotMesh() {
    // Shared materials
    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.8,
      roughness: 0.25
    });

    this.darkMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.9,
      roughness: 0.2
    });

    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    this.eyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1e38 // Critical Headshot Red Eye
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.1, 12);
    this.bodyMesh = new THREE.Mesh(torsoGeo, this.metalMat);
    this.bodyMesh.position.y = 1.35;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData = { bot: this, isHead: false };
    this.group.add(this.bodyMesh);
    this.parts.push({ mesh: this.bodyMesh, origY: 1.35 });

    // Chest Core
    const coreGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    coreMesh.position.set(0, 0.1, 0.45);
    this.bodyMesh.add(coreMesh);

    // 2. Head (Critical Hit Node)
    const headGeo = new THREE.SphereGeometry(0.38, 12, 12);
    this.headMesh = new THREE.Mesh(headGeo, this.metalMat);
    this.headMesh.position.set(0, 2.2, 0);
    this.headMesh.castShadow = true;
    this.headMesh.userData = { bot: this, isHead: true }; // CRITICAL NODE
    this.group.add(this.headMesh);
    this.parts.push({ mesh: this.headMesh, origY: 2.2 });

    // Red Visor Eye
    const eyeGeo = new THREE.BoxGeometry(0.36, 0.12, 0.2);
    const eyeMesh = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeMesh.position.set(0, 0.05, 0.3);
    eyeMesh.userData = { bot: this, isHead: true };
    this.headMesh.add(eyeMesh);

    // 3. Hover Thruster Base
    const thrusterGeo = new THREE.CylinderGeometry(0.4, 0.15, 0.6, 8);
    const thrusterMesh = new THREE.Mesh(thrusterGeo, this.darkMat);
    thrusterMesh.position.y = 0.55;
    thrusterMesh.userData = { bot: this, isHead: false };
    this.group.add(thrusterMesh);
    this.parts.push({ mesh: thrusterMesh, origY: 0.55 });

    // 4. Arms
    const armGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const armL = new THREE.Mesh(armGeo, this.metalMat);
    armL.position.set(-0.75, 1.25, 0);
    armL.rotation.z = Math.PI / 10;
    armL.userData = { bot: this, isHead: false };
    this.group.add(armL);
    this.parts.push({ mesh: armL, origY: 1.25 });

    const armR = new THREE.Mesh(armGeo, this.metalMat);
    armR.position.set(0.75, 1.25, 0);
    armR.rotation.z = -Math.PI / 10;
    armR.userData = { bot: this, isHead: false };
    this.group.add(armR);
    this.parts.push({ mesh: armR, origY: 1.25 });

    // Full collection of meshes for raycast hit detection
    this.hitMeshes = [this.bodyMesh, this.headMesh, armL, armR, thrusterMesh];
  }

  // Floating 2D Billboard Health Bar with Trailing Bar
  buildFloatingHealthBar() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 24;
    this.hpCanvas = canvas;
    this.hpCtx = canvas.getContext('2d');

    this.hpTexture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: this.hpTexture,
      transparent: true,
      depthTest: false
    });

    this.hpSprite = new THREE.Sprite(spriteMat);
    this.hpSprite.position.y = 2.85;
    this.hpSprite.scale.set(1.4, 0.28, 1);
    this.group.add(this.hpSprite);

    this.updateHealthBarTexture();
  }

  updateHealthBarTexture() {
    const ctx = this.hpCtx;
    ctx.clearRect(0, 0, 128, 24);

    if (this.isDead) {
      this.hpTexture.needsUpdate = true;
      return;
    }

    // Outer frame
    ctx.fillStyle = 'rgba(15, 17, 22, 0.85)';
    ctx.fillRect(0, 0, 128, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 24);

    // Trailing Health (Orange)
    const trailWidth = (this.trailingHp / this.maxHp) * 124;
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(2, 2, Math.max(0, trailWidth), 20);

    // Immediate Health (Red)
    const hpWidth = (this.hp / this.maxHp) * 124;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, 2, Math.max(0, hpWidth), 20);

    // Segment lines every 25 HP
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let i = 1; i < 8; i++) {
      ctx.fillRect((124 / 8) * i + 2, 2, 1.5, 20);
    }

    this.hpTexture.needsUpdate = true;
  }

  takeDamage(amount, isHeadshot = false, hitDir = null) {
    if (this.isDead) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.trailDelay = 0.35; // 0.35s delay before trailing bar drops

    // Hit Flash (White)
    this.flashTimer = 0.08;
    this.metalMat.color.setHex(0xffffff);

    // Squash & Stretch: Compress along Y and expand X/Z
    this.targetSquash.set(1.22, 0.78, 1.22);

    // Knockback
    if (hitDir) {
      this.group.position.addScaledVector(hitDir, 0.3);
    }

    this.updateHealthBarTexture();

    if (this.hp <= 0) {
      this.die();
      return true; // Final Blow
    }
    return false;
  }

  die() {
    this.isDead = true;
    this.respawnTimer = 4.0; // Respawn after 4 seconds
    this.hpSprite.visible = false;

    // Dismemberment velocity
    this.parts.forEach((p) => {
      p.vx = (Math.random() - 0.5) * 6;
      p.vy = Math.random() * 5 + 3;
      p.vz = (Math.random() - 0.5) * 6;
      p.rx = (Math.random() - 0.5) * 10;
      p.ry = (Math.random() - 0.5) * 10;
    });
  }

  respawn() {
    this.isDead = false;
    this.hp = this.maxHp;
    this.trailingHp = this.maxHp;
    this.hpSprite.visible = true;
    this.group.position.copy(this.spawnPos);

    // Reset mesh parts
    this.parts.forEach((p) => {
      p.mesh.position.set(0, p.origY, 0);
      p.mesh.rotation.set(0, 0, 0);
    });

    this.metalMat.color.setHex(0x9ca3af);
    this.targetSquash.set(1, 1, 1);
    this.squashScale.set(1, 1, 1);
    this.updateHealthBarTexture();
  }

  update(dt, playerPos, projectileManager = null) {
    if (this.isDead) {
      // Debris Physics during death
      this.parts.forEach((p) => {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 9.8 * dt; // Gravity
        p.mesh.rotation.x += p.rx * dt;
        p.mesh.rotation.y += p.ry * dt;
      });

      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // 1. Hit Flash Reset
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.metalMat.color.setHex(0x9ca3af);
      }
    }

    // 2. Trailing Health Bar Lerp Decay (skill.md 3.4)
    if (this.trailDelay > 0) {
      this.trailDelay -= dt;
    } else if (this.trailingHp > this.hp) {
      this.trailingHp += (this.hp - this.trailingHp) * 0.14;
      this.updateHealthBarTexture();
    }

    // 3. Squash & Stretch Spring Recovery (skill.md 3.3)
    this.squashScale.lerp(this.targetSquash, 0.25);
    this.targetSquash.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    this.group.scale.copy(this.squashScale);

    // 4. Gentle Patrol & Face Player
    this.patrolAngle += 0.4 * dt;
    const targetX = this.patrolCenter.x + Math.cos(this.patrolAngle) * this.patrolRadius;
    const targetZ = this.patrolCenter.z + Math.sin(this.patrolAngle) * this.patrolRadius;

    this.group.position.x += (targetX - this.group.position.x) * this.moveSpeed * dt;
    this.group.position.z += (targetZ - this.group.position.z) * this.moveSpeed * dt;

    // Hover floating bobbing
    this.group.position.y = 0.15 + Math.sin(Date.now() * 0.003 + this.id) * 0.1;

    // Rotate to face player & periodic plasma bolt shooting
    if (playerPos) {
      const angle = Math.atan2(playerPos.x - this.group.position.x, playerPos.z - this.group.position.z);
      this.group.rotation.y = angle;

      if (projectileManager) {
        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0) {
          const dist = this.group.position.distanceTo(playerPos);
          if (dist > 3.5 && dist < 32.0) {
            const origin = this.group.position.clone().add(new THREE.Vector3(0, 1.35, 0));
            const target = playerPos.clone().add(new THREE.Vector3(0, 0.9, 0));
            const dir = target.sub(origin).normalize();
            projectileManager.spawnEnemyBolt(origin, dir, 25, 25);
          }
          this.shootCooldown = 3.2 + Math.random() * 2.5;
        }
      }
    }
  }
}

// ==================== js/entities/RemotePlayer.js ====================
class RemotePlayer {
  constructor(scene, playerData) {
    this.scene = scene;
    this.id = playerData.id;
    this.name = playerData.name || '플레이어';
    this.heroKey = playerData.hero || 'tracer';

    this.maxHp = playerData.maxHp || (this.heroKey === 'reinhardt' ? 1000 : (this.heroKey === 'genji' ? 400 : 300));
    this.hp = playerData.hp !== undefined ? playerData.hp : this.maxHp;
    this.trailingHp = this.hp;
    this.trailDelay = 0;

    this.isDead = !!playerData.isDead;
    this.isShieldActive = false;

    // Movement interpolation targets (pos.y from client is eye height = 1.7m; offset to ground)
    const initX = (playerData.pos && playerData.pos[0] !== undefined) ? playerData.pos[0] : 0;
    const initY = (playerData.pos && playerData.pos[1] !== undefined) ? playerData.pos[1] - 1.7 : 0;
    const initZ = (playerData.pos && playerData.pos[2] !== undefined) ? playerData.pos[2] : 0;
    this.targetPos = new THREE.Vector3(initX, initY, initZ);
    this.targetYaw = (playerData.rot && playerData.rot[1]) || 0;
    this.targetPitch = (playerData.rot && playerData.rot[0]) || 0;

    // Hit reaction
    this.flashTimer = 0;
    this.flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.squashScale = new THREE.Vector3(1, 1, 1);
    this.targetSquash = new THREE.Vector3(1, 1, 1);

    // Root 3D Group
    this.group = new THREE.Group();
    this.group.position.copy(this.targetPos);
    this.group.rotation.y = this.targetYaw;

    // Model parts
    this.modelGroup = new THREE.Group();
    this.modelGroup.rotation.y = Math.PI; // Face forward in player look direction
    this.group.add(this.modelGroup);

    this.headMesh = null;
    this.bodyMesh = null;
    this.shieldMesh = null;
    this.hitMeshes = [];
    this.origMaterials = new Map();

    // Overhead HUD Canvas Billboard
    this.billboardMesh = null;
    this.hudCanvas = null;
    this.hudContext = null;
    this.hudTexture = null;

    this.buildModel(this.heroKey);
    this.buildOverheadHUD();

    // High-Visibility Red Enemy Tactical Ring on ground (Overwatch enemy target indicator)
    const ringGeo = new THREE.RingGeometry(0.65, 0.78, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.rotation.x = -Math.PI / 2;
    this.targetRing.position.y = 0.03;
    this.group.add(this.targetRing);

    this.scene.add(this.group);
  }

  // ==========================================================================
  // 3D HIGH-FIDELITY OVERWATCH HERO MODELS (HeroModels.js)
  // ==========================================================================
  buildModel(heroKey) {
    // Clear old model parts if switching heroes
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }
    this.hitMeshes = [];
    this.origMaterials.clear();
    this.shieldMesh = null;

    let modelData;
    if (heroKey === 'reinhardt') {
      modelData = buildReinhardtModel(this.modelGroup);
      this.shieldMesh = modelData.shieldMesh;
    } else if (heroKey === 'genji') {
      modelData = buildGenjiModel(this.modelGroup);
    } else {
      modelData = buildTracerModel(this.modelGroup);
    }

    this.bodyMesh = modelData.bodyMesh;
    this.headMesh = modelData.headMesh;
    this.hitMeshes = modelData.hitMeshes ? [...modelData.hitMeshes] : [];

    // Assign critical headshot & body metadata
    if (this.headMesh) {
      this.headMesh.userData = { player: this, isHead: true, playerId: this.id };
    }
    if (this.bodyMesh) {
      this.bodyMesh.userData = { player: this, isHead: false, playerId: this.id };
    }
    if (this.shieldMesh) {
      this.shieldMesh.userData = { player: this, isShield: true, playerId: this.id };
      if (!this.hitMeshes.includes(this.shieldMesh)) {
        this.hitMeshes.push(this.shieldMesh);
      }
    }

    // Register all hit meshes for raycasting & hit flash
    this.hitMeshes.forEach((mesh) => {
      if (!mesh.userData.player) {
        mesh.userData = { player: this, isHead: false, playerId: this.id };
      }
      this.origMaterials.set(mesh, mesh.material);
    });

    if (this.billboardMesh) {
      this.billboardMesh.position.y = (heroKey === 'reinhardt') ? 2.85 : (heroKey === 'genji' ? 2.25 : 2.1);
    }
  }

  // ==========================================================================
  // OVERHEAD 3D BILLBOARD HUD (Trailing Health Bar & Name Tag)
  // ==========================================================================
  buildOverheadHUD() {
    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = 512;
    this.hudCanvas.height = 128;
    this.hudContext = this.hudCanvas.getContext('2d');

    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);
    this.hudTexture.minFilter = THREE.LinearFilter;

    const mat = new THREE.SpriteMaterial({
      map: this.hudTexture,
      transparent: true,
      depthTest: false
    });

    this.billboardMesh = new THREE.Sprite(mat);
    this.billboardMesh.scale.set(2.4, 0.6, 1);
    this.billboardMesh.position.set(0, this.heroKey === 'reinhardt' ? 2.85 : 2.3, 0);
    this.group.add(this.billboardMesh);

    this.updateHUDCanvas();
  }

  updateHUDCanvas() {
    const ctx = this.hudContext;
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 128);

    // 1. Player Name & Hero Tag
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "Rajdhani", "Pretendard", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // Red tag for hostile players, gold for name
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.name} [${this.heroKey.toUpperCase()}]`, 256, 32);

    // 2. Health Bar Background
    const bx = 56;
    const by = 68;
    const bw = 400;
    const bh = 22;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bx, by, bw, bh);

    // 3. Trailing Health Bar (Trailing HP lags behind, skill.md 3.4)
    const trailRatio = Math.max(0, Math.min(1, this.trailingHp / this.maxHp));
    ctx.fillStyle = '#fef08a'; // Trailing yellow/white
    ctx.fillRect(bx, by, bw * trailRatio, bh);

    // 4. Main Health Bar (Red/Crimson for enemies)
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = '#ef4444'; // Red hostile bar
    ctx.fillRect(bx, by, bw * hpRatio, bh);

    // 5. Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);

    this.hudTexture.needsUpdate = true;
  }

  // ==========================================================================
  // COMBAT & REACTION (skill.md 3.3 Squash & Stretch, 3.4 Trailing Bar)
  // ==========================================================================
  takeDamage(amount, isHeadshot) {
    this.hp = Math.max(0, this.hp - amount);
    this.trailDelay = 0.35;

    // Flash white on hit
    this.flashTimer = 0.08;
    this.hitMeshes.forEach((mesh) => {
      if (mesh !== this.shieldMesh) {
        mesh.material = this.flashMaterial;
      }
    });

    // Squash & Stretch deformation
    if (isHeadshot) {
      this.targetSquash.set(1.2, 0.75, 1.2);
    } else {
      this.targetSquash.set(1.12, 0.88, 1.12);
    }

    this.updateHUDCanvas();
    return this.hp <= 0;
  }

  setShieldActive(active) {
    this.isShieldActive = active;
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  setHero(newHeroKey, maxHp) {
    if (this.heroKey === newHeroKey) return;
    this.heroKey = newHeroKey;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.trailingHp = maxHp;
    this.buildModel(newHeroKey);
    this.billboardMesh.position.y = (newHeroKey === 'reinhardt') ? 2.85 : (newHeroKey === 'genji' ? 2.25 : 2.1);
    this.updateHUDCanvas();
  }

  setDead(isDead) {
    this.isDead = isDead;
    this.group.visible = !isDead;
    this.modelGroup.visible = !isDead;
    if (this.billboardMesh) this.billboardMesh.visible = !isDead;
    if (this.shieldMesh) this.shieldMesh.visible = false;
  }

  setTargetPosition(pos) {
    if (!pos || pos.length < 3) return;
    this.targetPos.set(pos[0], pos[1] - 1.7, pos[2]);
  }

  respawn(pos, hp) {
    this.isDead = false;
    this.group.visible = true;
    this.modelGroup.visible = true;
    if (this.billboardMesh) this.billboardMesh.visible = true;
    this.hp = hp || this.maxHp;
    this.trailingHp = this.hp;
    if (pos && pos.length >= 3) {
      this.targetPos.set(pos[0], pos[1] - 1.7, pos[2]);
      this.group.position.copy(this.targetPos);
    }
    this.setShieldActive(false);
    this.updateHUDCanvas();
  }

  // ==========================================================================
  // 60FPS TICK (Smooth Lerp, Squash Restoration, Trailing Bar Lerp)
  // ==========================================================================
  update(dt, camera) {
    if (this.isDead) return;

    // 1. Position Lerp (smooth 25Hz -> 60FPS)
    this.group.position.lerp(this.targetPos, Math.min(1.0, dt * 18.0));

    // 2. Rotation Slerp / Lerp
    let diffYaw = this.targetYaw - this.group.rotation.y;
    // Normalize angle to -PI ~ +PI
    diffYaw = Math.atan2(Math.sin(diffYaw), Math.cos(diffYaw));
    this.group.rotation.y += diffYaw * Math.min(1.0, dt * 16.0);

    // 3. Head Pitch
    if (this.headMesh) {
      this.headMesh.rotation.x = -this.targetPitch;
    }

    // 4. Trailing Health Bar Lerp (skill.md 3.4)
    if (this.trailDelay > 0) {
      this.trailDelay -= dt;
    } else if (this.trailingHp > this.hp) {
      this.trailingHp += (this.hp - this.trailingHp) * 0.14;
      this.updateHUDCanvas();
    }

    // 5. Squash & Stretch spring recovery (skill.md 3.3)
    this.squashScale.lerp(this.targetSquash, 0.3);
    this.targetSquash.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    this.modelGroup.scale.copy(this.squashScale);

    // 6. Hit Flash Material restore
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.hitMeshes.forEach((mesh) => {
          if (this.origMaterials.has(mesh)) {
            mesh.material = this.origMaterials.get(mesh);
          }
        });
      }
    }

    // 7. Billboard always looks at camera
    if (this.billboardMesh && camera) {
      // Sprite already aligns to camera, but maintain upright orientation
    }
  }

  destroy() {
    this.scene.remove(this.group);
    if (this.hudTexture) this.hudTexture.dispose();
  }
}

// ==================== js/heroes/HeroBase.js ====================
/**
 * ============================================================================
 * HERO BASE CLASS
 * - Health, Trailing Bar, Armor, Shield
 * - Magazine Ammo & Reload
 * - Ultimate Charge Meter (0 ~ 100%)
 * - 1st-Person Weapon Viewmodel
 * ============================================================================
 */
class HeroBase {
  constructor(name, maxHp, speed = 6.5) {
    this.name = name;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.trailingHp = maxHp;
    this.trailDelay = 0;

    this.speed = speed;
    this.jumpForce = 8.5;

    this.maxAmmo = 40;
    this.ammo = 40;
    this.isReloading = false;
    this.reloadDuration = 1.1;
    this.reloadTimer = 0;

    this.fireRate = 0.1;
    this.fireTimer = 0;

    // Ultimate (0 ~ 100%)
    this.ultCharge = 0;
    this.isUltActive = false;
    this.ultDuration = 0;

    // Abilities Cooldowns
    this.ability1Cooldown = 6.0;
    this.ability1Timer = 0;
    this.ability2Cooldown = 12.0;
    this.ability2Timer = 0;

    // 1st Person Weapon Model Group
    this.weaponGroup = new THREE.Group();
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this.trailDelay = 0.35;
    return this.hp <= 0;
  }

  heal(amount) {
    if (this.hp >= this.maxHp) return false;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.trailingHp = this.hp;
    return true;
  }

  addUltCharge(amount) {
    if (this.isUltActive) return;
    this.ultCharge = Math.min(100, this.ultCharge + amount);
  }

  startReload(audio) {
    if (this.isReloading || this.ammo >= this.maxAmmo) return;
    this.isReloading = true;
    this.reloadTimer = this.reloadDuration;
    if (audio) audio.playReload();
  }

  updateBase(dt) {
    // 1. Trailing Health Bar Lerp (skill.md 3.4)
    if (this.trailDelay > 0) {
      this.trailDelay -= dt;
    } else if (this.trailingHp > this.hp) {
      this.trailingHp += (this.hp - this.trailingHp) * 0.12;
    }

    // 2. Reload Timer
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
      }
    }

    // 3. Fire Timer
    if (this.fireTimer > 0) {
      this.fireTimer -= dt;
    }

    // 4. Ability Timers
    if (this.ability1Timer > 0) this.ability1Timer -= dt;
    if (this.ability2Timer > 0) this.ability2Timer -= dt;

    // Passive Ultimate Charge Over Time (1% every 3 seconds)
    if (!this.isUltActive && this.ultCharge < 100) {
      this.ultCharge = Math.min(100, this.ultCharge + (dt / 3.0));
    }
  }
}

// ==================== js/heroes/Tracer.js ====================
/**
 * ============================================================================
 * TRACER (DPS - Ultra High Mobility & Time Manipulation)
 * - Dual Pulse Pistols: 40 rounds, 20 rounds/sec rapid hitscan with 1st person gloved hands
 * - 3D Mechanical Reload Animation: Dropping canisters, wrist spin, battery lock
 * - High-speed Swept Blink Dash (0.12s, non-instant) with Glowing Cyan Streak Line
 * - Recall: 3-second time rewind with health restoration & visual screen warp
 * - Pulse Bomb: 350 DMG sticky explosive
 * ============================================================================
 */
class Tracer extends HeroBase {
  constructor() {
    super('TRACER', 300, 7.2); // 300 HP, fast base speed

    // Dual Pulse Pistols
    this.maxAmmo = 40;
    this.ammo = 40;
    this.reloadDuration = 1.15;
    this.fireRate = 0.05; // 20 rounds/sec

    // Blink: 3 charges + High-speed swept movement (non-instant)
    this.blinkCharges = 3;
    this.maxBlinkCharges = 3;
    this.blinkRechargeTime = 3.0;
    this.blinkTimer = 0;

    this.isBlinking = false;
    this.blinkMoveTimer = 0;
    this.blinkDuration = 0.12;
    this.blinkDir = new THREE.Vector3();
    this.blinkSpeed = 0;
    this.blinkTarget = new THREE.Vector3();

    // Recall: Position & Health history buffer (last 3 seconds)
    this.history = [];
    this.recallCooldown = 12.0;

    this.idleTime = 0;
    this.buildWeaponModel();
  }

  buildWeaponModel() {
    // Left & Right Dual Pulse Pistols with authentic Overwatch 2 gloves
    this.pistolL = this.createPulsePistol(-1);
    this.pistolR = this.createPulsePistol(1);

    this.weaponGroup.add(this.pistolL);
    this.weaponGroup.add(this.pistolR);

    // Root offset in camera view: placed comfortably in lower corners matching OW2
    this.weaponGroup.position.set(0, 0, 0);
  }

  createPulsePistol(side) {
    const group = new THREE.Group();

    // Symmetrical positioning in lower corners
    const posX = side * 0.26;
    const posY = -0.19;
    const posZ = -0.42;

    group.position.set(posX, posY, posZ);
    // Angled forward and slightly inward toward center crosshair
    group.rotation.set(0.10, side * -0.14, side * 0.10, 'YXZ');

    // Materials
    const owOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.5,
      roughness: 0.3
    });

    const whiteHoodMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.4,
      roughness: 0.25
    });

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    const glowCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x9a7b56, // Flight pilot brown leather
      roughness: 0.7,
      metalness: 0.1
    });

    const cuffMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.5,
      metalness: 0.2
    });

    // 1. Forearm & Glove (Visible pilot hands holding the guns)
    const armGeo = new THREE.BoxGeometry(0.08, 0.12, 0.26);
    const arm = new THREE.Mesh(armGeo, gloveMat);
    arm.position.set(0, -0.06, 0.10);
    group.add(arm);

    // Blue Flight Glove Cuff
    const cuffGeo = new THREE.BoxGeometry(0.09, 0.13, 0.05);
    const cuff = new THREE.Mesh(cuffGeo, cuffMat);
    cuff.position.set(0, -0.06, 0.20);
    group.add(cuff);

    // Chronal Emitter diode on wrist
    const diodeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8);
    const diode = new THREE.Mesh(diodeGeo, glowCyanMat);
    diode.rotation.x = Math.PI / 2;
    diode.position.set(0, 0.01, 0.18);
    group.add(diode);

    // 2. Pulse Pistol Body (Orange lower frame)
    const bodyGeo = new THREE.BoxGeometry(0.09, 0.11, 0.30);
    const body = new THREE.Mesh(bodyGeo, owOrangeMat);
    body.position.set(0, 0, -0.06);
    group.add(body);

    // 3. White Racing Hood (Top shell with decal stripe)
    const hoodGeo = new THREE.BoxGeometry(0.085, 0.04, 0.26);
    const hood = new THREE.Mesh(hoodGeo, whiteHoodMat);
    hood.position.set(0, 0.065, -0.07);
    group.add(hood);

    // 4. Tactical Grip (Dark polymer)
    const gripGeo = new THREE.BoxGeometry(0.065, 0.13, 0.10);
    const grip = new THREE.Mesh(gripGeo, darkMat);
    grip.position.set(0, -0.09, 0.02);
    grip.rotation.x = -0.25;
    group.add(grip);

    // 5. Twin Barrels in Front
    const barrelGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8);
    const barrelTop = new THREE.Mesh(barrelGeo, darkMat);
    barrelTop.rotation.x = Math.PI / 2;
    barrelTop.position.set(0, 0.03, -0.24);
    group.add(barrelTop);

    const barrelBot = new THREE.Mesh(barrelGeo, darkMat);
    barrelBot.rotation.x = Math.PI / 2;
    barrelBot.position.set(0, -0.02, -0.24);
    group.add(barrelBot);

    // 6. Chronal Energy Core (Vibrant glowing cyan reactor window)
    const coreGeo = new THREE.BoxGeometry(0.095, 0.03, 0.10);
    const core = new THREE.Mesh(coreGeo, glowCyanMat);
    core.position.set(0, 0.01, -0.08);
    group.add(core);

    // Store base transform for recoil & idle lerping
    group.userData = {
      basePos: new THREE.Vector3(posX, posY, posZ),
      baseRot: new THREE.Euler(0.10, side * -0.14, side * 0.10, 'YXZ')
    };

    return group;
  }

  primaryFire(camera, scene, projectileManager, audio, shaker, map) {
    if (this.ammo <= 0) {
      this.startReload(audio);
      return null;
    }
    if (this.isReloading || this.fireTimer > 0) return null;

    this.ammo -= 2;
    this.fireTimer = this.fireRate;
    audio.playTracerFire();

    // Alternate weapon recoil punch-back
    if (this.ammo % 4 === 0) {
      this.pistolL.position.z += 0.035;
      this.pistolL.rotation.x -= 0.05;
    } else {
      this.pistolR.position.z += 0.035;
      this.pistolR.rotation.x -= 0.05;
    }

    shaker.addRecoil(0.003);

    // Raycast hitscan bullet
    const raycaster = new THREE.Raycaster();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

    // Add slight spread
    forward.x += (Math.random() - 0.5) * 0.025;
    forward.y += (Math.random() - 0.5) * 0.025;
    forward.normalize();

    raycaster.set(camera.position, forward);

    // Bullet laser tracer beam clipped to walls
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.5));
    let hitTargetEnd = origin.clone().add(forward.clone().multiplyScalar(40));

    let wallHit = null;
    if (map && typeof map.raycastColliders === 'function') {
      wallHit = map.raycastColliders(raycaster.ray, 45);
      if (wallHit.hit && wallHit.point) {
        hitTargetEnd = wallHit.point.clone();
      }
    }

    projectileManager.addBulletBeam(origin, hitTargetEnd, 0x00f0ff);

    return { raycaster, damage: 9, isHeadshotMultiplier: 2.0, wallHit, hitTargetEnd };
  }

  secondaryFire(camera, scene, projectileManager, audio, shaker, bots, onHitCallback) {
    // Alternate trigger for Blink
    const moveDir = new THREE.Vector3();
    return this.useAbility1(camera.position, moveDir, camera, audio, shaker, bots, onHitCallback, projectileManager);
  }

  useAbility1(playerPos, moveDir, camera, audio, shaker, bots, onHitCallback, projectiles) {
    // HIGH-SPEED SWEPT BLINK DASH (Non-instant, 0.12s smooth rush)
    if (this.blinkCharges <= 0 || this.isBlinking) return false;

    this.blinkCharges--;
    audio.playTracerBlink();
    shaker.addTrauma(0.3);

    // Calculate movement direction from camera yaw
    const blinkDir = new THREE.Vector3();
    if (Math.abs(moveDir.x) > 0.01 || Math.abs(moveDir.z) > 0.01) {
      const camEuler = new THREE.Euler(0, camera.rotation.y, 0, 'YXZ');
      blinkDir.set(moveDir.x, 0, moveDir.z).applyEuler(camEuler).normalize();
    } else {
      blinkDir.set(0, 0, -1).applyQuaternion(camera.quaternion);
      blinkDir.y = 0;
      blinkDir.normalize();
    }

    // Set up continuous dash over 0.12 seconds
    this.isBlinking = true;
    this.blinkDuration = 0.12;
    this.blinkMoveTimer = 0.12;
    this.blinkDir.copy(blinkDir);
    this.blinkSpeed = 7.2 / 0.12; // 60 m/s
    this.blinkTarget.copy(playerPos).addScaledVector(blinkDir, 7.2);

    // Spawn 3D Cyan Chronal Motion Streak Line behind Tracer
    if (projectiles && typeof projectiles.addMotionStreak === 'function') {
      const startStreak = playerPos.clone().add(new THREE.Vector3(0, 0.9, 0));
      const endStreak = this.blinkTarget.clone().add(new THREE.Vector3(0, 0.9, 0));
      projectiles.addMotionStreak(startStreak, endStreak, 0x00f0ff, 0.09, 0.45);
    }

    return true;
  }

  useAbility2(playerPos, camera, audio, shaker, uiManager) {
    // RECALL (E)
    if (this.ability2Timer > 0) return false;
    this.ability2Timer = this.recallCooldown;

    audio.playTracerRecall();
    shaker.addTrauma(0.35);

    // Warp 3 seconds back
    if (this.history.length > 0) {
      const pastState = this.history[0];
      playerPos.copy(pastState.pos);
      if (pastState.hp > this.hp) {
        this.hp = pastState.hp;
        this.trailingHp = pastState.hp;
      }
    }

    // Auto reload on recall
    this.ammo = this.maxAmmo;
    this.isReloading = false;

    // Trigger visual screen warp
    if (uiManager && typeof uiManager.triggerRecallWarp === 'function') {
      uiManager.triggerRecallWarp();
    }
    return true;
  }

  useUltimate(camera, projectileManager, audio, shaker) {
    if (this.ultCharge < 100) return false;
    this.ultCharge = 0;

    audio.playTracerBlink();
    shaker.addTrauma(0.4);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.8));
    projectileManager.spawnPulseBomb(origin, forward, this);

    audio.announce("Bombs away!");
    return true;
  }

  update(dt, playerPos, camera, projectiles, audio, allTargets, onHitCallback, shaker, map) {
    this.updateBase(dt);
    this.idleTime += dt;

    // 1. Blink Charges Recharge
    if (this.blinkCharges < this.maxBlinkCharges) {
      this.blinkTimer += dt;
      if (this.blinkTimer >= this.blinkRechargeTime) {
        this.blinkTimer = 0;
        this.blinkCharges++;
      }
    }

    // 2. High-speed Swept Blink Dash Movement
    if (this.isBlinking) {
      const step = Math.min(dt, this.blinkMoveTimer);
      playerPos.addScaledVector(this.blinkDir, this.blinkSpeed * step);
      if (map && typeof map.resolveCollision === 'function') {
        map.resolveCollision(playerPos, 0.5);
      }
      this.blinkMoveTimer -= dt;
      if (this.blinkMoveTimer <= 0) {
        this.isBlinking = false;
        if (map && typeof map.resolveCollision === 'function') {
          map.resolveCollision(playerPos, 0.5);
        }
      }
    }

    // 3. 3D Mechanical Reload Animation (Canister drop, wrist twirl, snap lock)
    if (this.isReloading) {
      const p = Math.min(1.0, 1.0 - (this.reloadTimer / this.reloadDuration));

      let dipY = 0;
      let rotXOffset = 0;
      let rotZSpin = 0;

      if (p < 0.28) {
        // Drop guns & eject canisters
        const w = p / 0.28;
        dipY = -0.14 * Math.sin(w * Math.PI * 0.5);
        rotXOffset = -0.32 * w;
      } else if (p < 0.70) {
        // Twirl pistols & insert fresh cyan canisters
        const s = (p - 0.28) / 0.42;
        dipY = -0.14 + Math.sin(s * Math.PI) * 0.06;
        rotXOffset = -0.32 + Math.sin(s * Math.PI * 2) * 0.15;
        rotZSpin = Math.sin(s * Math.PI) * 2.8;
      } else {
        // Snap back into firing stance
        const r = (p - 0.70) / 0.30;
        dipY = -0.14 * (1 - r);
        rotXOffset = -0.32 * (1 - r);
      }

      [this.pistolL, this.pistolR].forEach((gun, idx) => {
        if (!gun || !gun.userData.basePos) return;
        const side = idx === 0 ? -1 : 1;
        const base = gun.userData.basePos;
        const baseRot = gun.userData.baseRot;

        gun.position.set(base.x, base.y + dipY, base.z);
        gun.rotation.set(
          baseRot.x + rotXOffset,
          baseRot.y,
          baseRot.z + side * rotZSpin,
          'YXZ'
        );
      });
    } else {
      // Idle Breathing Bobbing & Recoil Recovery
      const breatheY = Math.sin(this.idleTime * 2.8) * 0.004;

      [this.pistolL, this.pistolR].forEach((p) => {
        if (!p || !p.userData.basePos) return;
        const targetPos = p.userData.basePos.clone();
        targetPos.y += breatheY;
        p.position.lerp(targetPos, 16 * dt);
        p.rotation.x += (p.userData.baseRot.x - p.rotation.x) * 16 * dt;
        p.rotation.z += (p.userData.baseRot.z - p.rotation.z) * 16 * dt;
      });
    }

    // 4. Record History for Recall (3 seconds queue)
    const now = Date.now();
    this.history.push({
      pos: playerPos.clone(),
      hp: this.hp,
      time: now
    });

    // Trim history older than 3.0s
    while (this.history.length > 0 && now - this.history[0].time > 3000) {
      this.history.shift();
    }
  }
}

// ==================== js/heroes/Genji.js ====================
/**
 * ============================================================================
 * GENJI (DPS - Agility & Counter)
 * - Shurikens: Left Click 3-Burst / Right Click 3-Fan (27 DMG per star)
 * - Authentic 1st-Person Cybernetic Arm holding vibrant glowing Shuriken (Image 2)
 * - Swift Strike: Shift - 14m Dash, 50 DMG, Resets Cooldown on ANY Kill!
 * - Deflect: E - 2.0s Projectile Reflection & Invulnerability
 * - Dragonblade: Q - "Ryūjin no ken o kurae!", Epic Curved Katana & Cleave Arc (110 DMG)
 * ============================================================================
 */
class Genji extends HeroBase {
  constructor() {
    super('GENJI', 400, 7.0);

    this.maxAmmo = 30;
    this.ammo = 30;
    this.reloadDuration = 1.2;
    this.fireRate = 0.65;

    // Burst queue for primary fire
    this.burstQueue = [];
    this.burstTimer = 0;

    // Swift Strike (Shift) - High-speed swept dash (non-instant)
    this.ability1Cooldown = 8.0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.15;
    this.dashDir = new THREE.Vector3();
    this.dashSpeed = 0;
    this.dashTarget = new THREE.Vector3();
    this.hitBotsThisDash = new Set();

    // Deflect (E)
    this.isDeflecting = false;
    this.deflectDuration = 2.0;
    this.deflectTimer = 0;
    this.ability2Cooldown = 8.0;

    // Dragonblade (Q)
    this.dragonbladeDuration = 6.0;
    this.dragonbladeTimer = 0;
    this.bladeSwingCooldown = 0.75;
    this.bladeSwingTimer = 0;
    this.isBladeSwinging = false;
    this.bladeSwingProgress = 0;
    this.bladeSwingSide = 1;

    this.idleTime = 0;
    this.buildWeaponModel();
  }

  buildWeaponModel() {
    // ========================================================================
    // 1. CYBERNETIC SHURIKEN ARM (Authentic OW2 Stance matching Image 2)
    // ========================================================================
    this.armGroup = new THREE.Group();

    // Positioned in bottom-right reaching towards center-bottom
    this.armIdlePos = new THREE.Vector3(0.18, -0.19, -0.36);
    this.armIdleRot = new THREE.Euler(0.15, -0.22, 0.18, 'YXZ');
    this.armGroup.position.copy(this.armIdlePos);
    this.armGroup.rotation.copy(this.armIdleRot);

    // High-tech Materials
    const darkNinjaMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25
    });

    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2
    });

    const goldPlateMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2
    });

    const glowEmeraldMat = new THREE.MeshBasicMaterial({
      color: 0x10b981
    });

    const glowBrightGreenMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88
    });

    // Forearm Cybernetics
    const forearmGeo = new THREE.BoxGeometry(0.09, 0.11, 0.32);
    const forearm = new THREE.Mesh(forearmGeo, darkNinjaMat);
    forearm.position.set(0, -0.04, 0.10);
    this.armGroup.add(forearm);

    // Gold Armor Trim Plates on top of arm
    const plateGeo = new THREE.BoxGeometry(0.07, 0.03, 0.22);
    const plate = new THREE.Mesh(plateGeo, goldPlateMat);
    plate.position.set(0, 0.025, 0.08);
    this.armGroup.add(plate);

    // Cybernetic Wrist Emitter
    const wristGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.06, 8);
    const wrist = new THREE.Mesh(wristGeo, carbonMat);
    wrist.rotation.x = Math.PI / 2;
    wrist.position.set(0, -0.02, -0.06);
    this.armGroup.add(wrist);

    // Mechanical Hand & Fingers
    const handGeo = new THREE.BoxGeometry(0.08, 0.06, 0.09);
    const hand = new THREE.Mesh(handGeo, darkNinjaMat);
    hand.position.set(0, 0, -0.12);
    this.armGroup.add(hand);

    // 3 Cybernetic Fingers holding the shuriken
    for (let f = -1; f <= 1; f++) {
      const fingerGeo = new THREE.BoxGeometry(0.018, 0.02, 0.07);
      const finger = new THREE.Mesh(fingerGeo, carbonMat);
      finger.position.set(f * 0.026, 0.02, -0.16);
      finger.rotation.x = 0.25;
      this.armGroup.add(finger);
    }

    // THE PROMINENT SHURIKEN HELD IN HAND (Matching Image 2!)
    this.heldShuriken = new THREE.Group();
    this.heldShuriken.position.set(0, 0.03, -0.19);
    this.heldShuriken.rotation.set(-0.35, 0.2, 0);

    // 3-point curved shuriken blades
    const starGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.015, 3);
    const blade1 = new THREE.Mesh(starGeo, glowBrightGreenMat);
    this.heldShuriken.add(blade1);

    const blade2 = new THREE.Mesh(starGeo, glowBrightGreenMat);
    blade2.rotation.y = Math.PI / 3;
    this.heldShuriken.add(blade2);

    // Core emblem
    const starCoreGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8);
    const starCore = new THREE.Mesh(starCoreGeo, goldPlateMat);
    this.heldShuriken.add(starCore);

    this.armGroup.add(this.heldShuriken);
    this.weaponGroup.add(this.armGroup);

    // ========================================================================
    // 2. DRAGONBLADE KATANA (Prominent Curved Emerald Katana during Ult!)
    // ========================================================================
    this.katanaGroup = new THREE.Group();
    this.katanaIdlePos = new THREE.Vector3(0.08, -0.17, -0.38);
    this.katanaIdleRot = new THREE.Euler(0.20, -0.25, 0.35, 'YXZ');
    this.katanaGroup.position.copy(this.katanaIdlePos);
    this.katanaGroup.rotation.copy(this.katanaIdleRot);
    this.katanaGroup.visible = false; // Hidden until Ultimate activates!

    // Curved Katana Blade (Long, glowing emerald dragon edge)
    const katanaBladeGeo = new THREE.BoxGeometry(0.025, 0.06, 0.92);
    const katanaBlade = new THREE.Mesh(katanaBladeGeo, glowBrightGreenMat);
    katanaBlade.position.set(0, 0.08, -0.38);
    katanaBlade.rotation.x = -0.05; // Slight elegant curve forward
    this.katanaGroup.add(katanaBlade);

    // Obsidian Steel Spine on back of blade
    const spineGeo = new THREE.BoxGeometry(0.028, 0.025, 0.90);
    const spine = new THREE.Mesh(spineGeo, darkNinjaMat);
    spine.position.set(0, 0.11, -0.38);
    this.katanaGroup.add(spine);

    // Golden Dragon Maw Tsuba (Crossguard)
    const tsubaGeo = new THREE.BoxGeometry(0.07, 0.09, 0.03);
    const tsuba = new THREE.Mesh(tsubaGeo, goldPlateMat);
    tsuba.position.set(0, 0.05, 0.08);
    this.katanaGroup.add(tsuba);

    // Two-Handed Tsuka (Hilt wrapped in black cord)
    const hiltGeo = new THREE.CylinderGeometry(0.028, 0.03, 0.28, 8);
    const hilt = new THREE.Mesh(hiltGeo, darkNinjaMat);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.set(0, 0.04, 0.22);
    this.katanaGroup.add(hilt);

    // Gold Kashira (Pommel cap)
    const pommelGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.03, 8);
    const pommel = new THREE.Mesh(pommelGeo, goldPlateMat);
    pommel.rotation.x = Math.PI / 2;
    pommel.position.set(0, 0.04, 0.36);
    this.katanaGroup.add(pommel);

    // Two Cybernetic Gauntlets gripping the hilt
    const gripR = this.createNinjaGrip(darkNinjaMat, goldPlateMat);
    gripR.position.set(0.03, 0.04, 0.15);
    this.katanaGroup.add(gripR);

    const gripL = this.createNinjaGrip(darkNinjaMat, goldPlateMat);
    gripL.position.set(-0.03, 0.03, 0.28);
    this.katanaGroup.add(gripL);

    // Emerald Dragon Cleave Slash Arc (Massive green slash trail!)
    const dragonArcGeo = new THREE.RingGeometry(0.85, 1.45, 32, 1, 0, Math.PI * 0.85);
    this.dragonArcMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.dragonArc = new THREE.Mesh(dragonArcGeo, this.dragonArcMat);
    this.dragonArc.position.set(0, -0.05, -0.65);
    this.dragonArc.visible = false;
    this.weaponGroup.add(this.dragonArc);

    this.weaponGroup.add(this.katanaGroup);

    // ========================================================================
    // 3. DEFLECT WAKIZASHI & DEFLECT ARCS (Authentic 1st-person Deflect viewmodel)
    // ========================================================================
    this.deflectGroup = new THREE.Group();
    this.deflectGroup.visible = false;

    // Wakizashi Short Katana
    const wakizashi = new THREE.Group();
    
    // Blade
    const wakiBladeGeo = new THREE.BoxGeometry(0.018, 0.055, 0.58);
    const wakiBlade = new THREE.Mesh(wakiBladeGeo, glowBrightGreenMat);
    wakiBlade.position.set(0, 0.05, -0.26);
    wakizashi.add(wakiBlade);

    // Spine
    const wakiSpineGeo = new THREE.BoxGeometry(0.026, 0.038, 0.58);
    const wakiSpine = new THREE.Mesh(wakiSpineGeo, darkNinjaMat);
    wakiSpine.position.set(0, 0.075, -0.26);
    wakizashi.add(wakiSpine);

    // Guard (Tsuba)
    const wakiTsubaGeo = new THREE.BoxGeometry(0.065, 0.085, 0.025);
    const wakiTsuba = new THREE.Mesh(wakiTsubaGeo, goldPlateMat);
    wakiTsuba.position.set(0, 0.04, 0.03);
    wakizashi.add(wakiTsuba);

    // Tsuka Handle
    const wakiHiltGeo = new THREE.CylinderGeometry(0.024, 0.026, 0.20, 8);
    const wakiHilt = new THREE.Mesh(wakiHiltGeo, darkNinjaMat);
    wakiHilt.rotation.x = Math.PI / 2;
    wakiHilt.position.set(0, 0.04, 0.13);
    wakizashi.add(wakiHilt);

    // Cybernetic Ninja Hand gripping the wakizashi
    const wakiGrip = this.createNinjaGrip(darkNinjaMat, goldPlateMat);
    wakiGrip.position.set(0.02, 0.03, 0.10);
    wakizashi.add(wakiGrip);

    this.deflectGroup.add(wakizashi);
    this.deflectWakizashi = wakizashi;

    // Deflect Cross-Slash Visual Arcs (Two criss-crossing energy slash arcs)
    const deflectArcGeo = new THREE.RingGeometry(0.55, 0.95, 24, 1, 0, Math.PI * 0.7);
    this.deflectArcMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.deflectArc1 = new THREE.Mesh(deflectArcGeo, this.deflectArcMat);
    this.deflectArc1.position.set(0, 0, -0.45);
    this.deflectGroup.add(this.deflectArc1);

    this.deflectArc2 = new THREE.Mesh(deflectArcGeo, this.deflectArcMat);
    this.deflectArc2.position.set(0, 0, -0.45);
    this.deflectArc2.rotation.z = Math.PI * 0.65;
    this.deflectGroup.add(this.deflectArc2);

    this.weaponGroup.add(this.deflectGroup);
  }

  createNinjaGrip(bodyMat, trimMat) {
    const group = new THREE.Group();
    const handGeo = new THREE.BoxGeometry(0.07, 0.06, 0.09);
    const hand = new THREE.Mesh(handGeo, bodyMat);
    group.add(hand);

    const plateGeo = new THREE.BoxGeometry(0.06, 0.02, 0.07);
    const plate = new THREE.Mesh(plateGeo, trimMat);
    plate.position.y = 0.035;
    group.add(plate);
    return group;
  }

  primaryFire(camera, scene, projectileManager, audio, shaker) {
    // 1. Dragonblade Slash during Ult
    if (this.isUltActive) {
      return this.slashDragonblade(camera, scene, projectileManager, audio, shaker);
    }

    // 2. Normal 3-Burst Shurikens
    if (this.ammo < 3) {
      this.startReload(audio);
      return null;
    }
    if (this.isReloading || this.fireTimer > 0 || this.burstQueue.length > 0) return null;

    this.ammo -= 3;
    this.fireTimer = this.fireRate;

    // 0ms instant feedback: fire 1st star immediately!
    audio.playGenjiShuriken();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.6));
    projectileManager.spawnShuriken(origin, forward, this);

    // Arm throw recoil animation
    if (this.armGroup) {
      this.armGroup.position.z += 0.08;
      this.armGroup.rotation.x -= 0.15;
    }

    // Queue 2nd and 3rd stars
    this.burstQueue = [0.09, 0.18];
    this.burstTimer = 0;
    shaker.addRecoil(0.005);
    return null;
  }

  secondaryFire(camera, scene, projectileManager, audio, shaker) {
    if (this.isUltActive) {
      return this.slashDragonblade(camera, scene, projectileManager, audio, shaker);
    }

    // Fan of 3 Shurikens (Simultaneous)
    if (this.ammo < 3) {
      this.startReload(audio);
      return null;
    }
    if (this.isReloading || this.fireTimer > 0) return null;

    this.ammo -= 3;
    this.fireTimer = 0.55;
    audio.playGenjiShuriken();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.6));

    // Center star
    projectileManager.spawnShuriken(origin, forward, this);
    // Left star
    projectileManager.spawnShuriken(origin, forward.clone().addScaledVector(right, -0.12).normalize(), this);
    // Right star
    projectileManager.spawnShuriken(origin, forward.clone().addScaledVector(right, 0.12).normalize(), this);

    // Arm throw recoil
    if (this.armGroup) {
      this.armGroup.position.z += 0.10;
      this.armGroup.rotation.x -= 0.20;
    }

    shaker.addRecoil(0.008);
    return null;
  }

  slashDragonblade(camera, scene, projectileManager, audio, shaker) {
    if (this.bladeSwingTimer > 0) return null;
    this.bladeSwingTimer = this.bladeSwingCooldown;
    this.isBladeSwinging = true;
    this.bladeSwingProgress = 0;
    this.bladeSwingSide *= -1; // Alternate Left <-> Right slash

    if (audio) audio.playDragonblade();
    if (shaker) shaker.addTrauma(0.40);

    // Activate visible emerald dragon slash arc
    if (this.dragonArc) {
      this.dragonArc.visible = true;
      this.dragonArcMat.opacity = 0.95;
      this.dragonArc.rotation.z = this.bladeSwingSide === 1 ? -0.35 : Math.PI - 0.35;
      this.dragonArc.rotation.x = -0.2;
    }

    return {
      isDragonblade: true,
      damage: 110,
      range: 6.0
    };
  }

  useAbility1(playerPos, moveDir, camera, audio, shaker, bots, onHitCallback, projectiles) {
    // SWIFT STRIKE (Shift - 14m Non-instant Swept Dash & 50 DMG)
    if (this.ability1Timer > 0 || this.isDashing) return false;
    this.ability1Timer = this.ability1Cooldown;

    audio.playGenjiDash();
    if (shaker) shaker.addTrauma(0.35);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    this.isDashing = true;
    this.dashDuration = 0.15;
    this.dashTimer = 0.15;
    this.dashDir.copy(forward);
    this.dashSpeed = 14.0 / 0.15; // ~93.3 m/s swept dash
    this.dashTarget.copy(playerPos).addScaledVector(forward, 14.0);
    this.hitBotsThisDash = new Set();

    // Spawn 3D Emerald Green Cybernetic Motion Streak Line behind Genji
    if (projectiles && typeof projectiles.addMotionStreak === 'function') {
      const startStreak = playerPos.clone().add(new THREE.Vector3(0, 0.9, 0));
      const endStreak = this.dashTarget.clone().add(new THREE.Vector3(0, 0.9, 0));
      projectiles.addMotionStreak(startStreak, endStreak, 0x00ff88, 0.12, 0.45);
    }

    return true;
  }

  useAbility2(playerPos, camera, audio, shaker, ui, projectileManager) {
    // DEFLECT (E)
    if (this.ability2Timer > 0 || this.isDeflecting) return false;
    this.isDeflecting = true;
    this.deflectTimer = this.deflectDuration;
    this.ability2Timer = this.ability2Cooldown;

    if (this.deflectGroup) this.deflectGroup.visible = true;
    if (this.armGroup) this.armGroup.visible = false;
    if (this.katanaGroup) this.katanaGroup.visible = false;

    if (audio) audio.playGenjiDeflect();
    if (shaker) shaker.addTrauma(0.25);
    return true;
  }

  useUltimate(camera, projectileManager, audio, shaker, uiManager, bots, onHitCallback) {
    // DRAGONBLADE (Q - "Ryūjin no ken o kurae!")
    if (this.ultCharge < 100 || this.isUltActive) return false;
    this.ultCharge = 0;
    this.isUltActive = true;
    this.dragonbladeTimer = this.dragonbladeDuration;

    // Swift strike cooldown reset immediately on ult activation!
    this.ability1Timer = 0;

    if (audio) {
      audio.announce("Ryūjin no ken o kurae!");
      audio.playDragonblade();
    }
    if (shaker) shaker.addTrauma(0.6);

    // Switch viewmodel: Reveal Dragonblade Katana, hide shuriken arm!
    this.katanaGroup.visible = true;
    this.armGroup.visible = false;
    if (this.deflectGroup) this.deflectGroup.visible = false;
    this.katanaGroup.position.copy(this.katanaIdlePos);
    this.katanaGroup.rotation.copy(this.katanaIdleRot);

    this.savedUiManager = uiManager;
    if (uiManager && typeof uiManager.triggerDragonbladeAura === 'function') {
      uiManager.triggerDragonbladeAura(true);
    }
    return true;
  }

  onEnemyEliminated() {
    // SWIFT STRIKE RESET PASSIVE! (Instantly resets Swift Strike cooldown upon ANY kill)
    this.ability1Timer = 0;
  }

  update(dt, playerPos, camera, projectileManager, audio, bots, onHitCallback, shaker, map) {
    this.updateBase(dt);
    this.idleTime += dt;

    // 0. Swift Strike High-Speed Swept Dash Movement & Collision
    if (this.isDashing) {
      const step = Math.min(dt, this.dashTimer);
      playerPos.addScaledVector(this.dashDir, this.dashSpeed * step);
      if (map && typeof map.resolveCollision === 'function') {
        map.resolveCollision(playerPos, 0.5);
      }
      this.dashTimer -= dt;

      // Check collision with bots along the dash path
      if (Array.isArray(bots)) {
        bots.forEach((bot) => {
          if (bot.isDead || this.hitBotsThisDash.has(bot)) return;
          const botDist = bot.group.position.distanceTo(playerPos);
          if (botDist < 3.2) {
            this.hitBotsThisDash.add(bot);
            const finalBlow = bot.takeDamage(50, false, this.dashDir);
            if (typeof onHitCallback === 'function') {
              onHitCallback(bot, 50, false, finalBlow);
            }
          }
        });
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
        if (map && typeof map.resolveCollision === 'function') {
          map.resolveCollision(playerPos, 0.5);
        }
      }
    }

    // 1. Process 3-Burst Shuriken Queue
    if (this.burstQueue.length > 0) {
      this.burstTimer += dt;
      if (this.burstTimer >= this.burstQueue[0]) {
        this.burstQueue.shift();
        if (audio) audio.playGenjiShuriken();
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.6));
        projectileManager.spawnShuriken(origin, forward, this);

        if (this.burstQueue.length === 0) {
          this.burstTimer = 0;
        }
      }
    }

    // 2. Deflect Timer & Dynamic Criss-Cross Deflect Slashing Motion
    if (this.isDeflecting) {
      this.deflectTimer -= dt;

      if (this.deflectGroup && this.deflectWakizashi) {
        this.deflectGroup.visible = true;
        if (this.armGroup) this.armGroup.visible = false;
        if (this.katanaGroup) this.katanaGroup.visible = false;

        // Fast alternating figure-8 cross-slash motion!
        const elapsed = (this.deflectDuration - this.deflectTimer);
        const t = elapsed * 22; // rapid speed
        const slashX = Math.sin(t) * 0.24;
        const slashY = -0.10 + Math.abs(Math.cos(t * 0.5)) * 0.12;
        const slashZ = -0.34 + Math.sin(t * 2) * 0.05;

        this.deflectWakizashi.position.set(slashX, slashY, slashZ);
        this.deflectWakizashi.rotation.set(
          0.25 + Math.sin(t) * 0.35,
          Math.sin(t) * -0.5,
          Math.sin(t) * 1.1,
          'YXZ'
        );

        if (this.deflectArcMat) {
          this.deflectArcMat.opacity = 0.55 + 0.40 * Math.abs(Math.sin(t * 2));
        }
        if (this.deflectArc1) {
          this.deflectArc1.rotation.z = t * 2.2;
        }
        if (this.deflectArc2) {
          this.deflectArc2.rotation.z = -t * 2.5 + Math.PI * 0.45;
        }
      }

      if (this.deflectTimer <= 0) {
        this.isDeflecting = false;
        if (this.deflectGroup) this.deflectGroup.visible = false;
        if (this.isUltActive) {
          if (this.katanaGroup) this.katanaGroup.visible = true;
        } else {
          if (this.armGroup) this.armGroup.visible = true;
        }
      }
    }

    // 3. Dragonblade Duration & Katana Swing Animation
    if (this.isUltActive) {
      this.dragonbladeTimer -= dt;
      if (this.bladeSwingTimer > 0) this.bladeSwingTimer -= dt;

      if (this.isBladeSwinging) {
        this.bladeSwingProgress += dt / 0.36; // 0.36s razor-sharp blade swing
        const s = Math.min(1.0, this.bladeSwingProgress);
        const easeS = 1 - Math.pow(1 - s, 2.5);

        // Sweeping slash across view
        const side = this.bladeSwingSide;
        const startX = side * 0.45;
        const endX = -side * 0.45;
        const curX = startX + (endX - startX) * easeS;
        const curY = -0.15 + Math.sin(s * Math.PI) * 0.15;
        const curZ = -0.38 - Math.sin(s * Math.PI) * 0.08;

        this.katanaGroup.position.set(curX, curY, curZ);
        this.katanaGroup.rotation.z = side * (0.8 - s * 1.6);
        this.katanaGroup.rotation.x = -0.1 + Math.sin(s * Math.PI) * 0.3;

        if (this.dragonArc) {
          this.dragonArc.rotation.z += (side * -4.5) * dt;
          this.dragonArcMat.opacity = Math.sin(s * Math.PI) * 0.95;
        }

        if (this.bladeSwingProgress >= 1.0) {
          this.isBladeSwinging = false;
          if (this.dragonArc) this.dragonArc.visible = false;
        }
      } else {
        // Idle Katana breathing posture
        const breatheY = Math.sin(this.idleTime * 2.8) * 0.006;
        this.katanaGroup.position.lerp(
          new THREE.Vector3(this.katanaIdlePos.x, this.katanaIdlePos.y + breatheY, this.katanaIdlePos.z),
          10 * dt
        );
        this.katanaGroup.rotation.x += (this.katanaIdleRot.x - this.katanaGroup.rotation.x) * 10 * dt;
        this.katanaGroup.rotation.y += (this.katanaIdleRot.y - this.katanaGroup.rotation.y) * 10 * dt;
        this.katanaGroup.rotation.z += (this.katanaIdleRot.z - this.katanaGroup.rotation.z) * 10 * dt;
        if (this.dragonArc) this.dragonArc.visible = false;
      }

      // Ult ends
      if (this.dragonbladeTimer <= 0) {
        this.isUltActive = false;
        this.katanaGroup.visible = false;
        this.armGroup.visible = true;
        if (this.dragonArc) this.dragonArc.visible = false;
        if (this.savedUiManager && typeof this.savedUiManager.triggerDragonbladeAura === 'function') {
          this.savedUiManager.triggerDragonbladeAura(false);
        }
      }
    } else {
      // 4. Cybernetic Reload Animation or Idle Breathing
      if (this.isReloading && this.armGroup) {
        const p = Math.min(1.0, 1.0 - (this.reloadTimer / this.reloadDuration));

        let dipY = 0;
        let rotXOffset = 0;
        let rotZOffset = 0;

        if (p < 0.28) {
          // Phase 1: Hand drops down, empty shuriken chamber snaps back
          const w = p / 0.28;
          dipY = -0.16 * Math.sin(w * Math.PI * 0.5);
          rotXOffset = -0.38 * w;
          rotZOffset = 0.15 * w;
          if (this.heldShuriken) {
            const s = Math.max(0.01, 1 - w);
            this.heldShuriken.scale.set(s, s, s);
          }
        } else if (p < 0.68) {
          // Phase 2: Fresh shurikens spring out from forearm with cybernetic spin!
          const s = (p - 0.28) / 0.40;
          dipY = -0.16 + Math.sin(s * Math.PI) * 0.07;
          rotXOffset = -0.38 + Math.sin(s * Math.PI * 2) * 0.18;
          rotZOffset = 0.15 - Math.sin(s * Math.PI) * 0.25;
          if (this.heldShuriken) {
            const sc = Math.min(1.0, s * 1.4);
            this.heldShuriken.scale.set(sc, sc, sc);
            this.heldShuriken.rotation.y += 28.0 * dt;
          }
        } else {
          // Phase 3: Sharp ninja wrist snap back to battle ready stance
          const r = (p - 0.68) / 0.32;
          dipY = -0.16 * (1 - r);
          rotXOffset = -0.38 * (1 - r);
          rotZOffset = -0.10 * (1 - r);
          if (this.heldShuriken) {
            this.heldShuriken.scale.set(1, 1, 1);
            this.heldShuriken.rotation.set(-0.35, 0.2, 0);
          }
        }

        this.armGroup.position.set(
          this.armIdlePos.x,
          this.armIdlePos.y + dipY,
          this.armIdlePos.z
        );
        this.armGroup.rotation.set(
          this.armIdleRot.x + rotXOffset,
          this.armIdleRot.y,
          this.armIdleRot.z + rotZOffset,
          'YXZ'
        );
      } else {
        if (this.heldShuriken) {
          this.heldShuriken.scale.set(1, 1, 1);
        }
        // Smooth arm recoil recovery & idle breathing (Normal Stance)
        if (this.armGroup) {
          const breatheY = Math.sin(this.idleTime * 2.6) * 0.005;
          const targetPos = this.armIdlePos.clone();
          targetPos.y += breatheY;
          this.armGroup.position.lerp(targetPos, 14 * dt);
          this.armGroup.rotation.x += (this.armIdleRot.x - this.armGroup.rotation.x) * 14 * dt;
          this.armGroup.rotation.y += (this.armIdleRot.y - this.armGroup.rotation.y) * 14 * dt;
          this.armGroup.rotation.z += (this.armIdleRot.z - this.armGroup.rotation.z) * 14 * dt;
        }
      }
    }
  }
}

// ==================== js/heroes/Reinhardt.js ====================
/**
 * ============================================================================
 * REINHARDT (TANK - Heavy Armor & Cleave)
 * - Rocket Hammer: Left Click with SPECTACULAR 3D Cleave Swing & Fire Arc VFX
 * - Armored Gauntlets: Visible heavy battle gauntlets holding the hammer
 * - 6-Stage Interaction Feel: Anticipation, Cleave Strike, Overshoot & Settle
 * - Barrier Field: Right Click - 2000 HP Holographic Shield
 * - Charge: Shift - 16m/s Rocket Pin Rush, 250 DMG Wall Impact
 * - Fire Strike: E - 100 DMG Piercing Flame Projectile
 * - Earthshatter: Q - "Hammer Down!", Massive Ground Stun Cone
 * ============================================================================
 */
class Reinhardt extends HeroBase {
  constructor() {
    super('REINHARDT', 1000, 5.8);

    // Infinite Hammer (No reload)
    this.maxAmmo = 1;
    this.ammo = 1;

    // Rocket Hammer Swing Mechanics & 6-Stage Animation
    this.swingRate = 0.85;
    this.swingCooldownTimer = 0;
    this.isSwinging = false;
    this.swingDuration = 0.48; // 0.48s satisfying, heavy commercial swing
    this.swingProgress = 0;
    this.currentStanceSide = 1; // 1: Right Ready, -1: Left Ready
    this.swingDirection = 1;    // 1: Right-to-Left, -1: Left-to-Right
    this.idleTime = 0;

    // Barrier Shield (Right Click) - 500 HP as requested
    this.maxShieldHp = 500;
    this.shieldHp = 500;
    this.isShieldActive = false;
    this.shieldRegenDelay = 2.0;
    this.shieldRegenTimer = 0;
    this.shieldRegenRate = 75; // 75 HP/sec regeneration
    this.activeFissures = [];

    // Charge (Shift)
    this.ability1Cooldown = 8.0;
    this.isCharging = false;
    this.chargeDuration = 2.5;
    this.chargeTimer = 0;
    this.pinnedBot = null;

    // Fire Strike (E)
    this.ability2Cooldown = 6.0;

    this.buildWeaponModel();
  }

  buildWeaponModel() {
    // Master Group containing both hands and hammer
    this.hammerGroup = new THREE.Group();

    // Default Stance Offsets (Right-handed posture comfortably placed in the lower-right corner)
    this.stanceRightPos = new THREE.Vector3(0.28, -0.36, -0.40);
    this.stanceRightRot = new THREE.Euler(0.24, -0.32, 0.16, 'YXZ');

    this.stanceLeftPos = new THREE.Vector3(0.28, -0.36, -0.40);
    this.stanceLeftRot = new THREE.Euler(0.24, -0.32, 0.16, 'YXZ');

    this.hammerGroup.position.copy(this.stanceRightPos);
    this.hammerGroup.rotation.copy(this.stanceRightRot);

    // High-visibility materials (bright chrome steel + glowing orange energy vents)
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.2
    });

    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.3
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.25
    });

    const glowOrangeMat = new THREE.MeshBasicMaterial({
      color: 0xff5500
    });

    const glowCyanMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    // 1. Armored Gauntlet Hands (Visible first-person presence!)
    const gauntletR = this.createArmoredGauntlet(steelMat, goldTrimMat, glowOrangeMat);
    gauntletR.position.set(0.04, -0.20, 0.05);
    gauntletR.rotation.z = 0.2;
    this.hammerGroup.add(gauntletR);

    const gauntletL = this.createArmoredGauntlet(steelMat, goldTrimMat, glowOrangeMat);
    gauntletL.position.set(-0.06, -0.38, 0.08);
    gauntletL.rotation.z = -0.15;
    this.hammerGroup.add(gauntletL);

    // 2. Heavy Titanium Hammer Shaft (Proportioned so head doesn't reach the sky)
    const handleGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.85, 10);
    const handle = new THREE.Mesh(handleGeo, darkSteelMat);
    handle.position.set(0, -0.10, 0);
    this.hammerGroup.add(handle);

    // Fluted shaft collar rings
    for (let y = -0.28; y <= 0.18; y += 0.15) {
      const ringGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.025, 10);
      const ring = new THREE.Mesh(ringGeo, goldTrimMat);
      ring.position.set(0, y, 0);
      this.hammerGroup.add(ring);
    }

    // 3. Massive Rocket Hammer Head (Head Pivot positioned low in group)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.16, -0.04);

    // Anvil Striking Block (Sleek & authentic scale)
    const headGeo = new THREE.BoxGeometry(0.32, 0.24, 0.50);
    const headMesh = new THREE.Mesh(headGeo, steelMat);
    headGroup.add(headMesh);

    // Side armor plates with golden German lion bevels
    const sidePlateGeo = new THREE.BoxGeometry(0.35, 0.20, 0.42);
    const sidePlate = new THREE.Mesh(sidePlateGeo, darkSteelMat);
    headGroup.add(sidePlate);

    // Front Striking Thermo-Energy Blades (Blazing Orange Impact Face)
    const bladeGeo = new THREE.BoxGeometry(0.36, 0.24, 0.08);
    const blade = new THREE.Mesh(bladeGeo, glowOrangeMat);
    blade.position.set(0, 0, -0.25);
    headGroup.add(blade);

    // Top & Bottom Striking Teeth
    const toothGeo = new THREE.BoxGeometry(0.26, 0.04, 0.16);
    const toothTop = new THREE.Mesh(toothGeo, goldTrimMat);
    toothTop.position.set(0, 0.13, -0.14);
    headGroup.add(toothTop);

    const toothBot = new THREE.Mesh(toothGeo, goldTrimMat);
    toothBot.position.set(0, -0.13, -0.14);
    headGroup.add(toothBot);

    // 4. Rear Rocket Thruster Assembly
    const thrusterHousingGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.26, 12);
    const thrusterHousing = new THREE.Mesh(thrusterHousingGeo, darkSteelMat);
    thrusterHousing.rotation.x = Math.PI / 2;
    thrusterHousing.position.set(0, 0, 0.18);
    headGroup.add(thrusterHousing);

    // 4 Rocket Nozzles arranged on thruster back
    const nozzleOffsets = [
      [-0.06, 0.06],
      [0.06, 0.06],
      [-0.06, -0.06],
      [0.06, -0.06]
    ];

    nozzleOffsets.forEach(([nx, ny]) => {
      const nozzleGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.10, 8);
      const nozzle = new THREE.Mesh(nozzleGeo, steelMat);
      nozzle.rotation.x = Math.PI / 2;
      nozzle.position.set(nx, ny, 0.31);
      headGroup.add(nozzle);

      const ventGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.02, 8);
      const vent = new THREE.Mesh(ventGeo, glowCyanMat);
      vent.rotation.x = Math.PI / 2;
      vent.position.set(nx, ny, 0.35);
      headGroup.add(vent);
    });

    // 5. Dynamic Rocket Flame Jet (Visibly ignites & roars during swing!)
    const flameGeo = new THREE.ConeGeometry(0.24, 0.95, 10);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.92
    });
    this.rocketFlame = new THREE.Mesh(flameGeo, flameMat);
    this.rocketFlame.rotation.x = -Math.PI / 2;
    this.rocketFlame.position.set(0, 0, 0.98);
    this.rocketFlame.scale.set(0.15, 0.15, 0.15); // Tiny pilot flame
    headGroup.add(this.rocketFlame);

    this.hammerGroup.add(headGroup);
    this.weaponGroup.add(this.hammerGroup);

    // 6. GIANT FIERY CLEAVE SLASH ARC (Sweeps directly across the screen!)
    const arcGeo = new THREE.RingGeometry(0.85, 1.45, 32, 1, 0, Math.PI * 0.9);
    this.cleaveArcMat = new THREE.MeshBasicMaterial({
      color: 0xff5500,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.cleaveArc = new THREE.Mesh(arcGeo, this.cleaveArcMat);
    this.cleaveArc.position.set(0, -0.32, -0.62);
    this.cleaveArc.rotation.x = -0.38;
    this.cleaveArc.visible = false;
    this.weaponGroup.add(this.cleaveArc);

    // 7. Holographic Energy Barrier (Right Click Shield)
    const shieldGeo = new THREE.PlaneGeometry(4.2, 2.6);
    this.shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00c3ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
    this.shieldMesh.position.set(0, 0, -1.1);
    this.shieldMesh.visible = false;
    this.weaponGroup.add(this.shieldMesh);
  }

  createArmoredGauntlet(metalMat, trimMat, glowMat) {
    const gauntlet = new THREE.Group();

    // Forearm plate
    const forearmGeo = new THREE.BoxGeometry(0.14, 0.22, 0.16);
    const forearm = new THREE.Mesh(forearmGeo, metalMat);
    gauntlet.add(forearm);

    // Wrist cuff
    const cuffGeo = new THREE.BoxGeometry(0.16, 0.08, 0.18);
    const cuff = new THREE.Mesh(cuffGeo, trimMat);
    cuff.position.y = 0.10;
    gauntlet.add(cuff);

    // Armored knuckles
    const knuckleGeo = new THREE.BoxGeometry(0.15, 0.08, 0.14);
    const knuckle = new THREE.Mesh(knuckleGeo, metalMat);
    knuckle.position.set(0, 0.18, 0.02);
    gauntlet.add(knuckle);

    // Energy accent line
    const accentGeo = new THREE.BoxGeometry(0.04, 0.18, 0.02);
    const accent = new THREE.Mesh(accentGeo, glowMat);
    accent.position.set(0, 0.02, 0.09);
    gauntlet.add(accent);

    return gauntlet;
  }

  primaryFire(camera, scene, projectileManager, audio, shaker) {
    // Cannot swing while shielding, charging, or cooling down
    if (this.isShieldActive || this.isCharging || this.swingCooldownTimer > 0) return null;

    this.swingCooldownTimer = this.swingRate;
    this.isSwinging = true;
    this.swingProgress = 0;

    // Swing direction depends on current stance side:
    // If currently resting on Right (+1), swing from Right to Left (+1).
    // If currently resting on Left (-1), swing from Left to Right (-1).
    this.swingDirection = this.currentStanceSide;

    // Trigger audible rocket thruster ignition & heavy whoosh
    if (audio) audio.playReinhardtSwing();
    if (shaker) shaker.addTrauma(0.35);

    // Activate visible cleave slash arc
    this.cleaveArc.visible = true;
    this.cleaveArcMat.opacity = 0.95;
    this.cleaveArc.rotation.z = this.swingDirection === 1 ? -0.35 : Math.PI - 0.35;
    this.cleaveArc.rotation.x = -0.38;

    return {
      isHammer: true,
      damage: 85,
      range: 5.5,
      swingSide: this.swingDirection
    };
  }

  setShieldActive(active, audio) {
    if (this.isCharging) return;
    if (active && this.shieldHp <= 0) return; // Cannot raise shattered shield

    this.isShieldActive = active;
    if (this.shieldMesh) this.shieldMesh.visible = active;
    if (this.hammerGroup) this.hammerGroup.visible = !active;
    if (this.cleaveArc) this.cleaveArc.visible = false;
  }

  takeShieldDamage(dmg) {
    if (!this.isShieldActive || this.shieldHp <= 0) return 0;
    const absorbed = Math.min(this.shieldHp, dmg);
    this.shieldHp = Math.max(0, this.shieldHp - dmg);
    this.shieldRegenTimer = this.shieldRegenDelay;

    // Flash shield mesh white briefly on hit
    if (this.shieldMat) {
      this.shieldMat.color.setHex(0xffffff);
      setTimeout(() => {
        if (this.shieldMat) this.shieldMat.color.setHex(0x00c3ff);
      }, 75);
    }

    if (this.shieldHp <= 0) {
      // Shield shattered
      this.isShieldActive = false;
      if (this.shieldMesh) this.shieldMesh.visible = false;
      if (this.hammerGroup) this.hammerGroup.visible = true;
    }
    return absorbed;
  }

  useAbility1(playerPos, moveDir, camera, audio, shaker, bots, onHitCallback, projectiles) {
    // CHARGE (Shift - Controlled 14.5m/s rocket rush with blazing exhaust streak lines)
    if (this.ability1Timer > 0 || this.isCharging) return false;
    this.ability1Timer = this.ability1Cooldown;
    this.isCharging = true;
    this.chargeTimer = this.chargeDuration;
    this.pinnedBot = null;
    this.chargeStreakTimer = 0;
    this.setShieldActive(false, audio);

    if (audio) {
      audio.announce("Hammer time!");
      audio.playReinhardtCharge();
    }
    if (shaker) shaker.addTrauma(0.5);

    // Initial ignition burst rocket streak line behind Reinhardt
    if (projectiles && typeof projectiles.addMotionStreak === 'function') {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
      const streakStart = playerPos.clone().add(new THREE.Vector3(0, 1.0, 0));
      const streakEnd = streakStart.clone().sub(forward.clone().multiplyScalar(4.2));
      projectiles.addMotionStreak(streakEnd, streakStart, 0xff5500, 0.16, 0.5);
    }

    return true;
  }

  useAbility2(playerPos, camera, audio, shaker, ui, projectileManager) {
    // FIRE STRIKE (E)
    if (this.ability2Timer > 0 || this.isCharging) return false;
    this.ability2Timer = this.ability2Cooldown;

    if (audio) audio.playReinhardtSwing();
    if (shaker) shaker.addTrauma(0.4);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(1.2));
    if (projectileManager) {
      projectileManager.spawnFireStrike(origin, forward, this);
    }
    return true;
  }

  useUltimate(camera, projectileManager, audio, shaker, ui, bots, onHitCallback) {
    // EARTHSHATTER (Q - "Hammer Down!")
    if (this.ultCharge < 100 || this.isCharging) return false;
    this.ultCharge = 0;

    if (audio) {
      audio.announce("Hammer Down!");
      audio.playEarthshatter();
    }
    if (shaker) shaker.addTrauma(0.85);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    // Trigger 3D Earthshatter Ground Fissure Effect
    const origin = camera.position.clone();
    if (projectileManager && projectileManager.scene) {
      this.createEarthshatterFissure(origin, forward, projectileManager.scene);
    }

    // Knock down and damage all bots in 14m cone
    if (Array.isArray(bots)) {
      bots.forEach((bot) => {
        if (bot.isDead) return;
        const toBot = bot.group.position.clone().sub(camera.position);
        const dist = toBot.length();
        if (dist < 14.0) {
          toBot.normalize();
          const dot = forward.dot(toBot);
          if (dot > 0.45) {
            const finalBlow = bot.takeDamage(50, false, forward.clone().add(new THREE.Vector3(0, 0.4, 0)));
            if (typeof onHitCallback === 'function') {
              onHitCallback(bot, 50, false, finalBlow);
            }
          }
        }
      });
    }

    return true;
  }

  createEarthshatterFissure(origin, forward, scene) {
    if (!scene) return;

    const fissureGroup = new THREE.Group();
    const startPos = origin.clone();
    startPos.y = 0.05;

    const branches = [-0.42, -0.20, 0, 0.20, 0.42]; // 5 spreading crack paths
    const crackPlanes = [];
    const rockChunks = [];

    // Glowing crack materials (Emissive lava)
    const crackMat = new THREE.MeshBasicMaterial({
      color: 0xff3700,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffe600,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x2b1c14,
      roughness: 0.95,
      metalness: 0.15
    });

    branches.forEach((angle) => {
      const branchDir = forward.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).normalize();
      const numSegments = 5;

      let prevPoint = startPos.clone();
      for (let s = 1; s <= numSegments; s++) {
        const segDist = 2.4 + s * 0.35;
        const curPoint = prevPoint.clone().addScaledVector(branchDir, segDist);
        curPoint.x += (Math.random() - 0.5) * 0.5;
        curPoint.z += (Math.random() - 0.5) * 0.5;
        curPoint.y = 0.05;

        // Fissure ground plane line
        const midPoint = prevPoint.clone().add(curPoint).multiplyScalar(0.5);
        const dist = prevPoint.distanceTo(curPoint);
        const crackGeo = new THREE.PlaneGeometry(0.35 + (s * 0.06), dist);
        crackGeo.rotateX(-Math.PI / 2);

        const crackMesh = new THREE.Mesh(crackGeo, crackMat);
        crackMesh.position.copy(midPoint);
        crackMesh.lookAt(curPoint.x, midPoint.y, curPoint.z);
        fissureGroup.add(crackMesh);
        crackPlanes.push(crackMesh);

        // Bright yellow inner molten core
        const coreGeo = new THREE.PlaneGeometry(0.12 + (s * 0.025), dist * 0.95);
        coreGeo.rotateX(-Math.PI / 2);
        const coreMesh = new THREE.Mesh(coreGeo, innerCoreMat);
        coreMesh.position.copy(midPoint);
        coreMesh.position.y += 0.01;
        coreMesh.lookAt(curPoint.x, midPoint.y + 0.01, curPoint.z);
        fissureGroup.add(coreMesh);
        crackPlanes.push(coreMesh);

        // Jagged protruding rock chunk
        const rockSizeX = 0.32 + Math.random() * 0.40;
        const rockSizeY = 0.35 + Math.random() * 0.55;
        const rockSizeZ = 0.32 + Math.random() * 0.40;
        const rockGeo = new THREE.BoxGeometry(rockSizeX, rockSizeY, rockSizeZ);

        const rockMesh = new THREE.Mesh(rockGeo, rockMat);
        rockMesh.position.copy(curPoint);
        rockMesh.position.y = -0.4;
        rockMesh.rotation.set(
          (Math.random() - 0.5) * 0.6,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.6
        );
        fissureGroup.add(rockMesh);

        const targetY = (rockSizeY * 0.5) * (0.6 + Math.random() * 0.6);
        rockChunks.push({
          mesh: rockMesh,
          targetY,
          curY: -0.4,
          delay: (s - 1) * 0.035, // Staggered rising outward!
          riseSpeed: 8.5,
          decay: false
        });

        prevPoint = curPoint;
      }
    });

    scene.add(fissureGroup);

    this.activeFissures.push({
      group: fissureGroup,
      crackPlanes,
      rockChunks,
      crackMat,
      innerCoreMat,
      rockMat,
      elapsed: 0,
      duration: 3.0,
      scene
    });
  }

  update(dt, playerPos, camera, projectiles, audio, bots, onHitCallback, shaker, map) {
    this.updateBase(dt);
    this.idleTime += dt;

    if (this.swingCooldownTimer > 0) {
      this.swingCooldownTimer -= dt;
    }

    // Shield regeneration when lowered
    if (!this.isShieldActive) {
      if (this.shieldRegenTimer > 0) {
        this.shieldRegenTimer -= dt;
      } else if (this.shieldHp < this.maxShieldHp) {
        this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + this.shieldRegenRate * dt);
      }
    }

    // Update active Earthshatter fissures
    for (let f = this.activeFissures.length - 1; f >= 0; f--) {
      const fis = this.activeFissures[f];
      fis.elapsed += dt;

      // Animate rock chunks rising with staggering shockwave
      fis.rockChunks.forEach((rc) => {
        if (fis.elapsed >= rc.delay) {
          if (!rc.decay) {
            rc.curY += rc.riseSpeed * dt;
            if (rc.curY >= rc.targetY) {
              rc.curY = rc.targetY;
            }
          } else {
            rc.curY -= 1.8 * dt;
          }
          rc.mesh.position.y = rc.curY;
        }
      });

      // After 2.0s, start decay and fading
      if (fis.elapsed >= 2.0) {
        fis.rockChunks.forEach((rc) => { rc.decay = true; });
        const fadeP = 1.0 - (fis.elapsed - 2.0) / (fis.duration - 2.0);
        const opacity = Math.max(0, fadeP);
        fis.crackMat.opacity = opacity * 0.95;
        fis.innerCoreMat.opacity = opacity * 0.95;
      }

      if (fis.elapsed >= fis.duration) {
        fis.scene.remove(fis.group);
        fis.group.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
        });
        fis.crackMat.dispose();
        fis.innerCoreMat.dispose();
        fis.rockMat.dispose();
        this.activeFissures.splice(f, 1);
      }
    }

    // 1. 6-STAGE ROCKET HAMMER ATTACK MOTION (SWEPT & RECOVERS TO RIGHT)
    if (this.isSwinging) {
      this.swingProgress += dt / this.swingDuration;
      const p = Math.min(1.0, this.swingProgress);

      const startX = 0.44;
      const endX = -0.24;

      let curX, curY, curZ, rotX, rotY, rotZ;

      if (p < 0.15) {
        // --- STAGE 1: ANTICIPATION / WINDUP (0% to 15%) ---
        // Hammer pulls back slightly to the right, rocket booster ignites!
        const w = p / 0.15;
        curX = startX + 0.03 * Math.sin(w * Math.PI * 0.5);
        curY = -0.38 - 0.02 * w;
        curZ = -0.42 + 0.03 * w;

        rotX = 0.28 + 0.08 * w;
        rotY = -0.32 - 0.12 * w;
        rotZ = 0.16 + 0.06 * w;

        const flameScale = 0.8 + w * 2.2;
        this.rocketFlame.scale.set(flameScale, flameScale * 2.5, flameScale);
        if (this.cleaveArc) this.cleaveArcMat.opacity = w * 0.4;
      } else if (p < 0.65) {
        // --- STAGE 2: ACTION CLEAVE STRIKE (15% to 65%) ---
        // Powerful sweeping arc cutting across bottom screen!
        const s = (p - 0.15) / 0.50;
        const easeS = 1 - Math.pow(1 - s, 2.5);

        curX = startX + (endX - startX) * easeS;
        curY = -0.40 + Math.sin(s * Math.PI) * 0.05;
        curZ = -0.40 - Math.sin(s * Math.PI) * 0.06;

        rotX = 0.22 + Math.sin(s * Math.PI) * 0.06;
        rotY = 0.50 - s * 1.20;
        rotZ = 0.25 - s * 0.50;

        const flameScale = 3.2 + Math.sin(s * Math.PI) * 1.4;
        this.rocketFlame.scale.set(flameScale, flameScale * 2.8, flameScale);

        if (this.cleaveArc) {
          this.cleaveArc.rotation.z -= 4.2 * dt;
          this.cleaveArcMat.opacity = Math.sin(s * Math.PI) * 0.95;
        }
      } else if (p < 0.80) {
        // --- STAGE 3: OVERSHOOT & FOLLOW-THROUGH (65% to 80%) ---
        const o = (p - 0.65) / 0.15;
        curX = endX - 0.03 * Math.sin(o * Math.PI);
        curY = -0.38 - 0.01 * Math.sin(o * Math.PI);
        curZ = -0.42;

        rotX = 0.25;
        rotY = -0.40 + 0.08 * Math.sin(o * Math.PI);
        rotZ = -0.12;

        const flameScale = Math.max(0.2, (1 - o) * 1.5);
        this.rocketFlame.scale.set(flameScale, flameScale * 1.5, flameScale);

        if (this.cleaveArc) {
          this.cleaveArcMat.opacity = Math.max(0, (1 - o) * 0.4);
        }
      } else {
        // --- STAGE 4: RETURN TO RIGHT-HAND STANCE (80% to 100%) ---
        const r = (p - 0.80) / 0.20;
        const easeR = r * r * (3 - 2 * r);
        const targetStance = this.stanceRightPos;
        const targetRot = this.stanceRightRot;

        curX = endX + (targetStance.x - endX) * easeR;
        curY = -0.38 + (targetStance.y - (-0.38)) * easeR;
        curZ = -0.42 + (targetStance.z - (-0.42)) * easeR;

        rotX = 0.25 + (targetRot.x - 0.25) * easeR;
        rotY = -0.40 + (targetRot.y - (-0.40)) * easeR;
        rotZ = -0.12 + (targetRot.z - (-0.12)) * easeR;

        this.rocketFlame.scale.set(0.15, 0.15, 0.15);
        if (this.cleaveArc) this.cleaveArc.visible = false;
      }

      this.hammerGroup.position.set(curX, curY, curZ);
      this.hammerGroup.rotation.set(rotX, rotY, rotZ, 'YXZ');

      if (this.swingProgress >= 1.0) {
        this.isSwinging = false;
        this.rocketFlame.scale.set(0.15, 0.15, 0.15);
        if (this.cleaveArc) this.cleaveArc.visible = false;
      }
    } else {
      // Idle Breathing Stance (Always on the RIGHT SIDE!)
      const targetPos = this.stanceRightPos;
      const targetRot = this.stanceRightRot;

      const breatheY = Math.sin(this.idleTime * 2.6) * 0.005;
      const breatheRot = Math.sin(this.idleTime * 2.6) * 0.006;

      this.hammerGroup.position.lerp(
        new THREE.Vector3(targetPos.x, targetPos.y + breatheY, targetPos.z),
        12 * dt
      );
      this.hammerGroup.rotation.x += (targetRot.x + breatheRot - this.hammerGroup.rotation.x) * 12 * dt;
      this.hammerGroup.rotation.y += (targetRot.y - this.hammerGroup.rotation.y) * 12 * dt;
      this.hammerGroup.rotation.z += (targetRot.z - this.hammerGroup.rotation.z) * 12 * dt;

      this.rocketFlame.scale.set(0.15, 0.15, 0.15);
      if (this.cleaveArc) this.cleaveArc.visible = false;
    }

    // 2. Charge Physics Rush & Collision Check (Shift)
    if (this.isCharging) {
      this.chargeTimer -= dt;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      // Controlled 14.5 m/s physical rush (no instant teleport feeling)
      playerPos.addScaledVector(forward, 14.5 * dt);

      // Trailing Rocket Exhaust Streak Lines
      this.chargeStreakTimer = (this.chargeStreakTimer || 0) + dt;
      if (this.chargeStreakTimer >= 0.08) {
        this.chargeStreakTimer = 0;
        if (projectiles && typeof projectiles.addMotionStreak === 'function') {
          const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          right.y = 0;
          right.normalize();

          const backCenter = playerPos.clone().sub(forward.clone().multiplyScalar(0.7)).add(new THREE.Vector3(0, 1.1, 0));
          const trailCenter = backCenter.clone().sub(forward.clone().multiplyScalar(3.2));
          projectiles.addMotionStreak(trailCenter, backCenter, 0xff5500, 0.12, 0.35);

          // Left thruster line
          const lStart = backCenter.clone().addScaledVector(right, -0.45);
          const lEnd = trailCenter.clone().addScaledVector(right, -0.45);
          projectiles.addMotionStreak(lEnd, lStart, 0xff7700, 0.08, 0.3);

          // Right thruster line
          const rStart = backCenter.clone().addScaledVector(right, 0.45);
          const rEnd = trailCenter.clone().addScaledVector(right, 0.45);
          projectiles.addMotionStreak(rEnd, rStart, 0xff7700, 0.08, 0.3);
        }
      }

      // Safely check pin bots
      if (Array.isArray(bots)) {
        if (!this.pinnedBot) {
          for (const bot of bots) {
            if (bot.isDead) continue;
            if (bot.group.position.distanceTo(playerPos) < 2.2) {
              this.pinnedBot = bot;
              break;
            }
          }
        } else {
          // Drag pinned bot along in front of Reinhardt
          this.pinnedBot.group.position.copy(playerPos).addScaledVector(forward, 1.4);
        }
      }

      // Check wall and obstacle collision (pillars, balcony, barricades, crates, perimeter)
      let hitWall = Math.abs(playerPos.x) > 37.5 || Math.abs(playerPos.z) > 37.5;
      if (map && typeof map.checkWallCollision === 'function') {
        const colCheck = map.checkWallCollision(playerPos, 0.85);
        if (colCheck.hit) hitWall = true;
      }
      if (map && typeof map.resolveCollision === 'function') {
        map.resolveCollision(playerPos, 0.8);
      }

      if (hitWall || this.chargeTimer <= 0) {
        this.isCharging = false;
        if (hitWall) {
          if (shaker) shaker.addTrauma(0.85);
          if (audio) audio.playExplosion();
        }
        if (this.pinnedBot) {
          // Wall Impact Smash (250 DMG)
          const finalBlow = this.pinnedBot.takeDamage(250, false, forward);
          if (typeof onHitCallback === 'function') {
            onHitCallback(this.pinnedBot, 250, false, finalBlow);
          }
          this.pinnedBot = null;
        }
      }
    }
  }
}

// ==================== js/main.js ====================
/**
 * ============================================================================
 * OVERWATCH 2 : WEB PROTOCOL - MAIN GAME ENGINE (MULTIPLAYER INTEGRATED)
 * - Three.js 3D WebGL 60FPS Render Pipeline
 * - Real-Time WebSocket Multiplayer Architecture (25Hz replication)
 * - 3D Remote Player Avatars (Tracer, Genji, Reinhardt)
 * - Full compliance with skill.md Game Feel Standards:
 *   * 6-Stage Interaction Lifecycle (0ms input to settle)
 *   * 30~60ms Micro Hit Stop & Hit Flash
 *   * Headshot 'DINK' Audio & Dynamic Hitmarkers (White / Red / Skull)
 *   * Segmented & Trailing Health Bars (Player, Bots, Remote Players)
 *   * Real-time Killfeed, 100🔥 Elimination Banner & Speech Announcer
 *   * TAB Scoreboard (Eliminations, Deaths, HP, Ping)
 *   * Camera Euler Order 'YXZ' (Zero horizon roll / tilt)
 * ============================================================================
 */













class OverwatchGame {
  constructor() {
    this.container = document.getElementById('game-container');
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

    // 1. Three.js Core Setup (Bright Daylight Atmosphere)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x8ecae6); // Fresh bright daylight blue sky
    this.scene.fog = new THREE.Fog(0xbde0fe, 45, 120); // Clean light atmospheric haze

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 200);
    this.camera.rotation.order = 'YXZ'; // MANDATORY: Eliminates camera roll / tilt ("드러 눕는 버그")
    this.camera.position.set(0, 1.7, 10);
    this.scene.add(this.camera); // Ensures camera.children (1st person weapons) are rendered!

    // Dedicated 1st-person viewmodel light so weapons are always brilliantly visible
    this.viewmodelLight = new THREE.PointLight(0xffffff, 1.2, 5.0);
    this.viewmodelLight.position.set(0, 0.2, -0.2);
    this.camera.add(this.viewmodelLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: !this.isTouchDevice, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Mobile DPR Clamping for 60FPS performance (skill.md Performance standard)
    const maxDpr = this.isTouchDevice ? 1.35 : 2.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = this.isTouchDevice ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 2. Engine Subsystems
    this.audio = new AudioSynth();
    this.shaker = new CameraShaker(this.camera);
    this.input = new InputManager(this.renderer.domElement, this.camera);
    this.network = new NetworkManager();
    this.map = new MapBuilder(this.scene);
    this.projectiles = new ProjectileManager(this.scene);
    this.ui = new UIManager();

    // 3. Player Physics State
    this.playerPos = new THREE.Vector3(15, 1.7, 30);
    this.velocityY = 0;
    this.isGrounded = true;
    this.canDoubleJump = true;
    this.wasJumpPressed = false;
    this.gravity = -22.0;

    // 4. Hero Roster & Selection
    this.heroes = {
      tracer: new Tracer(),
      genji: new Genji(),
      reinhardt: new Reinhardt()
    };
    this.currentHeroKey = 'tracer';
    this.currentHero = this.heroes.tracer;
    this.attachHeroWeapon(this.currentHero);

    // 5. Training Bots & Remote Players Collection
    this.bots = [];
    this.spawnTrainingBots();
    this.remotePlayers = new Map(); // id -> RemotePlayer

    // 6. Multiplayer Match & Stats
    this.playerNickname = '오버워치요원';
    this.localElims = 0;
    this.localDeaths = 0;
    this.isRespawning = false;
    this.respawnTimer = 0;
    this.allPlayersCache = [];

    // 7. Elimination Announcer Tracker
    this.recentKills = 0;
    this.lastKillTime = 0;

    // 8. Event & Lifecycle Listeners
    this.initNetworking();
    this.initHeroSwitchModal();
    this.initScoreboardModal();
    this.initStartOverlay();
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.onWindowResize(), 150));

    // Prevent accidental mobile page drag/scroll/rubber-banding outside scrollable modals
    document.addEventListener('touchmove', (e) => {
      const scrollable = e.target.closest && e.target.closest('.start-overlay, .hero-switch-modal, .scoreboard-overlay, .scoreboard-window');
      if (!scrollable) {
        e.preventDefault();
      }
    }, { passive: false });

    // 9. Start Game Loop
    this.lastTime = performance.now();
    this.animate();
  }

  spawnTrainingBots() {
    // Spawn 4 Omnic Bots across Route 66 highway and key chokepoints
    const botCoords = [
      [20, 15],   // Near Big Earl's Diner front road
      [28, -5],   // Near hovering Payload
      [5, 25],    // Highway S-curve
      [-15, 35]   // Garage entrance
    ];

    botCoords.forEach(([bx, bz], idx) => {
      const bot = new TrainingBot(this.scene, bx, bz, idx + 1);
      this.bots.push(bot);
    });
  }

  getAllCombatTargets() {
    const targets = [...this.bots];
    for (const rp of this.remotePlayers.values()) {
      if (!rp.isDead) {
        targets.push(rp);
      }
    }
    return targets;
  }

  attachHeroWeapon(hero) {
    for (let i = this.camera.children.length - 1; i >= 0; i--) {
      const child = this.camera.children[i];
      if (child !== this.viewmodelLight) {
        this.camera.remove(child);
      }
    }
    this.camera.add(hero.weaponGroup);
  }

  switchHero(heroKey) {
    if (!this.heroes[heroKey] || this.currentHero === this.heroes[heroKey]) return;
    this.currentHeroKey = heroKey;
    this.currentHero = this.heroes[heroKey];
    this.attachHeroWeapon(this.currentHero);

    this.audio.announce(this.currentHero.name);
    this.ui.triggerUltFlash();

    // Broadcast hero change to multiplayer server
    if (this.network.isConnected) {
      this.network.sendHeroSwitch(heroKey);
    }

    // Update touch buttons icons for current hero
    const shiftIcon = document.getElementById('touch-icon-shift');
    const eIcon = document.getElementById('touch-icon-e');
    const altIcon = document.getElementById('touch-icon-alt');
    const altLbl = document.getElementById('touch-lbl-alt');

    if (heroKey === 'tracer') {
      if (shiftIcon) shiftIcon.textContent = '⚡';
      if (eIcon) eIcon.textContent = '⏪';
      if (altIcon) altIcon.textContent = '👊';
      if (altLbl) altLbl.textContent = 'MELEE';
    } else if (heroKey === 'genji') {
      if (shiftIcon) shiftIcon.textContent = '🗡️';
      if (eIcon) eIcon.textContent = '🛡️';
      if (altIcon) altIcon.textContent = '🌟';
      if (altLbl) altLbl.textContent = 'FAN';
    } else if (heroKey === 'reinhardt') {
      if (shiftIcon) shiftIcon.textContent = '🚀';
      if (eIcon) eIcon.textContent = '🔥';
      if (altIcon) altIcon.textContent = '🛡️';
      if (altLbl) altLbl.textContent = 'SHIELD';
    }

    this.updateScoreboard();
  }

  // ==========================================================================
  // MULTIPLAYER NETWORKING EVENT DISPATCHER
  // ==========================================================================
  initNetworking() {
    this.network.onConnected = (selfId, selfPlayer, initialPlayers) => {
      console.log('[OVERWATCH MP] Connected! Self ID:', selfId);
      const dot = document.getElementById('net-status-dot');
      const text = document.getElementById('net-status-text');
      if (dot) {
        dot.className = 'net-dot online';
      }
      if (text) text.textContent = '온라인';

      this.allPlayersCache = initialPlayers || [];

      // Spawn remote players already in match
      if (initialPlayers) {
        initialPlayers.forEach((p) => {
          if (p.id !== selfId && !this.remotePlayers.has(p.id)) {
            const rp = new RemotePlayer(this.scene, p);
            this.remotePlayers.set(p.id, rp);
          }
        });
      }

      this.updatePlayerCount();
      this.updateScoreboard();
    };

    this.network.onPlayerJoined = (player) => {
      if (!this.remotePlayers.has(player.id)) {
        const rp = new RemotePlayer(this.scene, player);
        this.remotePlayers.set(player.id, rp);
        this.ui.addKillfeed('시스템', `${player.name} 참전`, false, '🎮');
        this.audio.playTracerBlink();
        this.updatePlayerCount();
        this.updateScoreboard();
      }
    };

    this.network.onPlayerLeft = (id, name) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.destroy();
        this.remotePlayers.delete(id);
        this.ui.addKillfeed('시스템', `${name || '플레이어'} 퇴장`, false, '🚪');
        this.updatePlayerCount();
        this.updateScoreboard();
      }
    };

    this.network.onPlayerUpdated = (player) => {
      let rp = this.remotePlayers.get(player.id);
      if (rp) {
        rp.name = player.name;
        if (player.hero && player.hero !== rp.heroKey) {
          rp.setHero(player.hero, player.maxHp);
        }
        if (player.hp !== undefined) {
          rp.hp = player.hp;
          rp.maxHp = player.maxHp;
          rp.trailingHp = player.hp;
        }
        rp.updateHUDCanvas();
      } else if (player.id !== this.network.selfId) {
        rp = new RemotePlayer(this.scene, player);
        this.remotePlayers.set(player.id, rp);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerHealed = (id, hp, maxHp) => {
      if (id === this.network.selfId) {
        this.currentHero.hp = hp;
        this.currentHero.trailingHp = hp;
      } else {
        const rp = this.remotePlayers.get(id);
        if (rp) {
          rp.hp = hp;
          rp.trailingHp = hp;
          rp.updateHUDCanvas();
        }
      }
      this.updateScoreboard();
    };

    this.network.onStateSync = (id, pos, rot) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.setTargetPosition(pos);
        if (rot && rot.length === 2) {
          rp.targetPitch = rot[0];
          rp.targetYaw = rot[1];
        }
      }
    };

    this.network.onHeroSwitched = (id, hero, hp, maxHp) => {
      const rp = this.remotePlayers.get(id);
      if (rp) {
        rp.setHero(hero, maxHp);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerAction = (id, actionType, data) => {
      const rp = this.remotePlayers.get(id);
      if (actionType === 'primary_fire_beam' && data.start && data.end) {
        this.projectiles.addBulletBeam(
          new THREE.Vector3(...data.start),
          new THREE.Vector3(...data.end),
          0x00f0ff
        );
      } else if (actionType === 'blink' && data.from && data.to) {
        this.projectiles.addMotionStreak(
          new THREE.Vector3(...data.from),
          new THREE.Vector3(...data.to),
          0x00f0ff
        );
        this.audio.playTracerBlink();
      } else if (actionType === 'dash' && data.from && data.to) {
        this.projectiles.addMotionStreak(
          new THREE.Vector3(...data.from),
          new THREE.Vector3(...data.to),
          0x00ff88
        );
        this.audio.playGenjiDash();
      } else if (actionType === 'shield_toggle' && rp) {
        rp.setShieldActive(!!data.active);
      }
    };

    this.network.onPlayerHit = (targetId, attackerId, attackerName, damage, isHeadshot, remainingHp) => {
      if (targetId === this.network.selfId) {
        // Genji Deflect check
        if (this.currentHero.name === 'GENJI' && this.currentHero.isDeflecting) {
          this.audio.playGenjiDeflect();
          this.shaker.addTrauma(0.12);
          return;
        }

        // Reinhardt Shield check
        if (this.currentHero.name === 'REINHARDT' && this.currentHero.isShieldActive) {
          const absorbed = this.currentHero.takeShieldDamage(damage);
          this.audio.playHit(false);
          this.shaker.addTrauma(0.08);
          if (absorbed > 0) return;
        }

        // Local player took damage from someone!
        this.currentHero.takeDamage(damage);
        if (remainingHp !== undefined) {
          this.currentHero.hp = Math.max(0, remainingHp);
        }
        this.audio.playDamage();
        this.shaker.addTrauma(isHeadshot ? 0.35 : 0.18);

        // Calculate incoming threat direction relative to player's look yaw
        let hitAngle = null;
        const attacker = this.remotePlayers.get(attackerId);
        if (attacker && attacker.group) {
          const dx = attacker.group.position.x - this.playerPos.x;
          const dz = attacker.group.position.z - this.playerPos.z;
          const worldAngle = Math.atan2(dx, -dz);
          hitAngle = worldAngle - this.input.yaw;
        }

        // Mobile Haptic feedback on damage
        if (this.isTouchDevice && 'vibrate' in navigator) {
          navigator.vibrate(isHeadshot ? [30, 40, 30] : 25);
        }

        // Trigger Directional Threat Arc + Perimeter Red Edge Pulse (Never blocks center view!)
        this.ui.triggerDamageFlash(hitAngle);

        if (this.currentHero.hp <= 0 && !this.isRespawning) {
          this.handleLocalPlayerDeath(attackerName);
        }
      } else {
        const rp = this.remotePlayers.get(targetId);
        if (rp) {
          rp.takeDamage(damage, isHeadshot);
          if (remainingHp !== undefined) {
            rp.hp = Math.max(0, remainingHp);
            rp.trailingHp = rp.hp;
            rp.updateHUDCanvas();
          }
          if (remainingHp !== undefined && remainingHp <= 0) {
            rp.setDead(true);
          }
        }
      }
      this.updateScoreboard();
    };

    this.network.onPlayerEliminated = (victimId, victimName, attackerId, attackerName, attackerHero, isHeadshot) => {
      const isLocalKiller = (attackerId === this.network.selfId);
      const isLocalVictim = (victimId === this.network.selfId);
      const killerDisplay = isLocalKiller ? (this.playerNickname || '나') : (attackerName || '적 요원');
      const victimDisplay = isLocalVictim ? (this.playerNickname || '나') : (victimName || '요원');

      // Top-Left Sliding Killfeed for ALL Eliminations
      this.ui.addKillfeed(killerDisplay, victimDisplay, isHeadshot, attackerHero ? attackerHero.toUpperCase() : '⚡', isLocalVictim, isLocalKiller);

      if (victimId === this.network.selfId) {
        this.currentHero.hp = 0;
        this.currentHero.trailingHp = 0;
        if (!this.isRespawning) {
          this.handleLocalPlayerDeath(attackerName);
        }
      } else if (attackerId === this.network.selfId) {
        this.localElims++;
        const elimCountEl = document.getElementById('elim-count');
        if (elimCountEl) elimCountEl.textContent = this.localElims;
        this.handleCombatHit({ name: victimName }, 100, isHeadshot, true, false);
      }

      const rp = this.remotePlayers.get(victimId);
      if (rp) {
        rp.setDead(true);
      }
      this.updateScoreboard();
    };

    this.network.onPlayerRespawned = (id, pos, hp) => {
      if (id === this.network.selfId) {
        this.isRespawning = false;
        const respawnOverlay = document.getElementById('respawn-overlay');
        if (respawnOverlay) respawnOverlay.classList.add('hidden');

        // Restore weapon viewmodel
        if (this.currentHero && this.currentHero.weaponGroup) {
          this.currentHero.weaponGroup.visible = true;
        }

        this.playerPos.set(...pos);
        this.currentHero.hp = hp || this.currentHero.maxHp;
        this.currentHero.trailingHp = this.currentHero.hp;
        this.audio.playUltReady();
      } else {
        const rp = this.remotePlayers.get(id);
        if (rp) {
          rp.respawn(pos, hp);
        }
      }
      this.updateScoreboard();
    };

    this.network.onDisconnected = () => {
      const dot = document.getElementById('net-status-dot');
      const text = document.getElementById('net-status-text');
      if (dot) dot.className = 'net-dot offline';
      if (text) text.textContent = '오프라인 모드';
    };
  }

  handleLocalPlayerDeath(killerName, skipKillfeed = false) {
    if (this.isRespawning) return;
    this.isRespawning = true;
    this.respawnTimer = 5.0;
    this.localDeaths++;

    this.currentHero.hp = 0;
    this.currentHero.trailingHp = 0;

    const deathCountEl = document.getElementById('death-count');
    if (deathCountEl) deathCountEl.textContent = this.localDeaths;

    this.audio.playDamage();
    this.shaker.addTrauma(0.5);

    // Hide weapon viewmodel so corpse/hands vanish!
    if (this.currentHero && this.currentHero.weaponGroup) {
      this.currentHero.weaponGroup.visible = false;
    }

    // Top-Left Sliding Killfeed for local death (if not already logged by elimination event)
    if (!skipKillfeed) {
      this.ui.addKillfeed(killerName || '전장 위험 요소', this.playerNickname || '나', false, '💀', true, false);
    }

    const respawnOverlay = document.getElementById('respawn-overlay');
    const killerDesc = document.getElementById('respawn-killer-desc');
    const countdownNum = document.getElementById('respawn-countdown-num');

    if (killerDesc) killerDesc.textContent = `${killerName || '적 요원'}에게 처치되었습니다`;
    if (countdownNum) countdownNum.textContent = '5';
    if (respawnOverlay) respawnOverlay.classList.remove('hidden');

    this.updateScoreboard();
  }

  updatePlayerCount() {
    const el = document.getElementById('player-count');
    if (el) el.textContent = this.remotePlayers.size + 1;
  }

  updateScoreboard() {
    const tbody = document.getElementById('scoreboard-body');
    if (!tbody) return;

    let html = '';

    // 1. Self Row
    const selfDeadClass = this.currentHero.hp <= 0 ? 'dead-row' : '';
    html += `
      <tr class="self-row ${selfDeadClass}">
        <td><span class="hero-pill ${this.currentHeroKey}">${this.currentHeroKey}</span></td>
        <td><strong>${this.playerNickname} (나)</strong></td>
        <td>${this.localElims}</td>
        <td>${this.localDeaths}</td>
        <td>${Math.round(this.currentHero.hp)} / ${this.currentHero.maxHp}</td>
        <td>${this.network.ping || 15}ms</td>
      </tr>
    `;

    // 2. Remote Players Rows
    for (const rp of this.remotePlayers.values()) {
      const deadClass = rp.isDead ? 'dead-row' : '';
      html += `
        <tr class="${deadClass}">
          <td><span class="hero-pill ${rp.heroKey}">${rp.heroKey}</span></td>
          <td>${rp.name}</td>
          <td>-</td>
          <td>-</td>
          <td>${Math.round(rp.hp)} / ${rp.maxHp}</td>
          <td>-</td>
        </tr>
      `;
    }

    tbody.innerHTML = html;

    const pingBadge = document.getElementById('scoreboard-ping-badge');
    if (pingBadge) pingBadge.textContent = `PING: ${this.network.ping || 15}ms`;
  }

  initStartOverlay() {
    const startOverlay = document.getElementById('start-overlay');
    const btnStart = document.getElementById('btn-start-game');
    const heroCards = document.querySelectorAll('.hero-select-card');
    const nickInput = document.getElementById('player-nickname-input');
    const serverInput = document.getElementById('server-url-input');

    this.initLobbyHeroShowcase();

    heroCards.forEach((card) => {
      const handleSelect = (e) => {
        if (e && e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        const pick = card.getAttribute('data-hero');
        if (!pick) return;

        heroCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        this.switchHero(pick);
        if (this.audio && this.audio.playSelectClick) {
          this.audio.playSelectClick();
        }
        if (this.updateLobbyShowcaseHero) {
          this.updateLobbyShowcaseHero(pick);
        }
      };

      card.addEventListener('click', handleSelect);
      card.addEventListener('keydown', handleSelect);
    });

    let isStarting = false;
    const startGame = (e) => {
      if (e) e.preventDefault();
      if (isStarting) return;
      isStarting = true;

      if (this.audio) {
        if (this.audio.playBattleStart) this.audio.playBattleStart();
        this.audio.unlock();
      }

      if (this.stopLobbyShowcase) {
        this.stopLobbyShowcase();
      }

      startOverlay.style.display = 'none';
      this.ui.showHUD();

      // Read nickname & custom server url if provided
      if (nickInput && nickInput.value.trim()) {
        this.playerNickname = nickInput.value.trim().slice(0, 16);
      }
      const customUrl = serverInput && serverInput.value.trim() ? serverInput.value.trim() : null;

      // Connect to WebSocket Multiplayer Server
      this.network.connect(customUrl, this.playerNickname, this.currentHeroKey);

      // Mobile landscape orientation request & fullscreen
      if (screen.orientation && typeof screen.orientation.lock === 'function') {
        screen.orientation.lock('landscape').catch(() => {});
      }
      if (this.isTouchDevice && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }

      // On desktop, request pointer lock; catch promise rejection cleanly
      if (!this.isTouchDevice && this.renderer && this.renderer.domElement) {
        try {
          const lockPromise = this.renderer.domElement.requestPointerLock();
          if (lockPromise && typeof lockPromise.catch === 'function') {
            lockPromise.catch(() => {});
          }
        } catch (_) {}
      }
    };

    btnStart.addEventListener('click', startGame);

    const btnCopyInvite = document.getElementById('btn-copy-invite');
    if (btnCopyInvite) {
      btnCopyInvite.addEventListener('click', () => {
        this.copyInviteLink(btnCopyInvite);
      });
    }
  }

  // ==========================================================================
  // REAL-TIME 3D LOBBY HERO SHOWCASE
  // ==========================================================================
  initLobbyHeroShowcase() {
    const canvas = document.getElementById('lobby-hero-canvas');
    if (!canvas) return;

    const width = canvas.clientWidth || 540;
    const height = canvas.clientHeight || 250;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.15, 3.4);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Atmospheric lighting for showroom
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.6);
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 2.2);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const goldRim = new THREE.DirectionalLight(0xf59e0b, 1.6);
    goldRim.position.set(3, 1, -2);
    scene.add(goldRim);

    // Studio pedestal disk
    const floorGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.05, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.025;
    scene.add(floor);

    // Glowing border ring
    const ringGeo = new THREE.RingGeometry(1.18, 1.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    const showcaseGroup = new THREE.Group();
    scene.add(showcaseGroup);

    let isDragging = false;
    let prevMouseX = 0;
    let targetRotY = 0;
    let currentRotY = 0;
    let autoRotate = true;

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      autoRotate = false;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      targetRotY += dx * 0.015;
      prevMouseX = e.clientX;
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        autoRotate = false;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => { isDragging = false; });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevMouseX;
      targetRotY += dx * 0.015;
      prevMouseX = e.touches[0].clientX;
    }, { passive: true });

    const heroTitle = document.getElementById('lobby-hero-title');

    // Dynamic responsive camera fitting for any screen aspect ratio (mobile/tablet/desktop)
    const fitCameraToHero = () => {
      if (!canvas || !camera) return;
      const nw = canvas.clientWidth || 540;
      const nh = canvas.clientHeight || 250;
      if (nw === 0 || nh === 0) return;

      const aspect = nw / nh;
      camera.aspect = aspect;

      showcaseGroup.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(showcaseGroup);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      // Model dimensions with fallback
      const mHeight = Math.max(size.y, 2.0);
      const mWidth = Math.max(size.x, 1.2);

      // Camera Vertical FOV
      const vFov = 34; // Slightly tighter lens for premium hero gallery look
      camera.fov = vFov;
      const vFovRad = THREE.MathUtils.degToRad(vFov * 0.5);

      // Distance required to fit vertically and horizontally with generous 1.35x padding
      const distY = (mHeight * 0.5) / Math.tan(vFovRad);
      const distX = (mWidth * 0.5) / (aspect * Math.tan(vFovRad));
      const targetDist = Math.max(distY, distX) * 1.35;

      const targetCenterY = Math.max(0.65, center.y);
      camera.position.set(0, targetCenterY, targetDist);
      camera.lookAt(0, targetCenterY, 0);
      camera.updateProjectionMatrix();

      renderer.setSize(nw, nh, false);
    };

    const loadHero = (heroKey) => {
      while (showcaseGroup.children.length > 0) {
        showcaseGroup.remove(showcaseGroup.children[0]);
      }
      targetRotY = 0;
      currentRotY = 0;

      if (heroKey === 'reinhardt') {
        const data = buildReinhardtModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        if (heroTitle) heroTitle.textContent = '라인하르트 (REINHARDT)';
        ringMat.color.setHex(0xf59e0b);
      } else if (heroKey === 'genji') {
        const data = buildGenjiModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        if (heroTitle) heroTitle.textContent = '겐지 (GENJI)';
        ringMat.color.setHex(0x55ff22);
      } else {
        const data = buildTracerModel(showcaseGroup);
        data.rootGroup.rotation.y = 0;
        if (heroTitle) heroTitle.textContent = '트레이서 (TRACER)';
        ringMat.color.setHex(0xf97316);
      }

      // Automatically frame full hero model on load
      requestAnimationFrame(fitCameraToHero);
    };

    loadHero(this.currentHeroKey || 'tracer');
    this.updateLobbyShowcaseHero = loadHero;

    let animId = null;
    let isRunning = true;

    const renderShowcase = () => {
      if (!isRunning) return;
      animId = requestAnimationFrame(renderShowcase);

      if (autoRotate && !isDragging) {
        targetRotY += 0.007;
      }
      currentRotY += (targetRotY - currentRotY) * 0.1;
      showcaseGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };
    renderShowcase();

    this.stopLobbyShowcase = () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      renderer.dispose();
    };

    // Resize listeners: window and element ResizeObserver
    window.addEventListener('resize', fitCameraToHero);
    window.addEventListener('orientationchange', () => {
      setTimeout(fitCameraToHero, 100);
      setTimeout(fitCameraToHero, 300);
    });

    if (window.ResizeObserver && canvas) {
      this.resizeObserver = new ResizeObserver(() => fitCameraToHero());
      this.resizeObserver.observe(canvas.parentElement || canvas);
    }
  }

  copyInviteLink(btnElement) {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        const origText = btnElement.textContent;
        btnElement.textContent = '✅ 복사 완료!';
        setTimeout(() => {
          btnElement.textContent = origText;
        }, 2000);
      }).catch(() => {
        prompt('아래 전장 접속 링크를 복사하여 친구에게 전달하세요:', url);
      });
    } else {
      prompt('아래 전장 접속 링크를 복사하여 친구에게 전달하세요:', url);
    }
  }

  initHeroSwitchModal() {
    const modal = document.getElementById('hero-switch-modal');
    const switchCards = document.querySelectorAll('.switch-card');

    const requestLock = () => {
      if (!this.isTouchDevice && this.renderer && this.renderer.domElement) {
        try {
          const p = this.renderer.domElement.requestPointerLock();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch (_) {}
      }
    };

    this.input.onHeroSwitchRequested = (action) => {
      if (action === 'toggle_modal') {
        const isHidden = modal.classList.contains('hidden');
        if (isHidden) {
          modal.classList.remove('hidden');
          if (!this.isTouchDevice) {
            try { document.exitPointerLock(); } catch (_) {}
          }
        } else {
          modal.classList.add('hidden');
          requestLock();
        }
      } else if (action === 'tracer' || action === 'genji' || action === 'reinhardt') {
        this.switchHero(action);
        if (this.audio && this.audio.playSelectClick) {
          this.audio.playSelectClick();
        }
        modal.classList.add('hidden');
        requestLock();
      }
    };

    switchCards.forEach((btn) => {
      btn.addEventListener('click', () => {
        const pick = btn.getAttribute('data-pick');
        if (pick) {
          this.switchHero(pick);
          if (this.audio && this.audio.playSelectClick) {
            this.audio.playSelectClick();
          }
        }
        modal.classList.add('hidden');
        requestLock();
      });
    });
  }

  initScoreboardModal() {
    const scoreboardModal = document.getElementById('scoreboard-overlay');
    const btnClose = document.getElementById('btn-close-scoreboard');
    const btnScoreboardCopy = document.getElementById('btn-scoreboard-copy');

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        if (scoreboardModal) scoreboardModal.classList.add('hidden');
        this.input.keys.tab = false;
      });
    }

    if (btnScoreboardCopy) {
      btnScoreboardCopy.addEventListener('click', () => {
        this.copyInviteLink(btnScoreboardCopy);
      });
    }

    if (scoreboardModal) {
      scoreboardModal.addEventListener('click', (e) => {
        if (e.target === scoreboardModal) {
          scoreboardModal.classList.add('hidden');
          this.input.keys.tab = false;
        }
      });
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ==========================================================================
  // HIT & COMBAT EVENT HANDLER (skill.md 6-Stage Interaction Pipeline)
  // ==========================================================================
  handleCombatHit(target, damageDealt, isHeadshot, isFinalBlow, shouldAddKillfeed = true) {
    // 1. Audio Sync: Headshot DINK vs Body Tick (skill.md 13)
    this.audio.playHit(isHeadshot);

    // 2. Micro Hit Stop: 35ms freeze on hit (skill.md 3.1)
    const hitStopDuration = isFinalBlow ? 0.06 : (isHeadshot ? 0.045 : 0.03);
    this.shaker.triggerHitStop(hitStopDuration);

    // 3. Dynamic Hitmarker: White for body, Red for crit, Skull for final blow
    this.ui.showHitmarker(isHeadshot, isFinalBlow);

    // 4. Camera Trauma Kick (skill.md 3.2)
    this.shaker.addTrauma(isHeadshot ? 0.25 : 0.12);

    // 5. Mobile Haptic feedback (skill.md 14)
    if (this.isTouchDevice && 'vibrate' in navigator) {
      navigator.vibrate(isFinalBlow ? [20, 30, 20] : (isHeadshot ? 18 : 10));
    }

    // 6. Hero Ultimate Charge Gain
    const ultGain = isHeadshot ? 7 : (damageDealt / 20);
    this.currentHero.addUltCharge(ultGain);
    if (this.currentHero.ultCharge >= 100 && !this.currentHero.isUltActive) {
      this.audio.playUltReady();
    }

    // 7. Final Blow & Elimination Sequence (skill.md 5: Continuous Climax)
    if (isFinalBlow) {
      this.audio.playElimination();

      // Flame Elimination Banner & Top-Left Killfeed
      this.ui.showEliminationBanner(target.name);
      if (shouldAddKillfeed) {
        this.ui.addKillfeed(this.playerNickname || this.currentHero.name, target.name, isHeadshot, this.currentHero.name, false, true);
      }

      // Hero Passive Notification (e.g. Genji Swift Strike Reset!)
      if (this.currentHero.onEnemyEliminated) {
        this.currentHero.onEnemyEliminated();
      }

      // Multi-kill Announcer Voice
      const now = performance.now();
      if (now - this.lastKillTime < 4500) {
        this.recentKills++;
      } else {
        this.recentKills = 1;
      }
      this.lastKillTime = now;

      if (this.recentKills === 2) this.audio.announce("Double Kill!");
      else if (this.recentKills === 3) this.audio.announce("Triple Kill!");
      else if (this.recentKills >= 4) this.audio.announce("Team Kill!");
    }
  }

  // ==========================================================================
  // MAIN GAME TICK (60FPS)
  // ==========================================================================
  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1; // Clamp delta time

    // 0. Respawn Timer Handling
    if (this.isRespawning) {
      this.respawnTimer -= dt;
      const countdownEl = document.getElementById('respawn-countdown-num');
      if (countdownEl) {
        countdownEl.textContent = Math.max(1, Math.ceil(this.respawnTimer));
      }
      if (this.respawnTimer <= 0) {
        this.isRespawning = false;
        const respawnOverlay = document.getElementById('respawn-overlay');
        if (respawnOverlay) respawnOverlay.classList.add('hidden');

        // Restore weapon viewmodel
        if (this.currentHero && this.currentHero.weaponGroup) {
          this.currentHero.weaponGroup.visible = true;
        }

        // Send respawn packet to server
        this.network.sendRespawn();

        // Local fallback teleport to Route 66 spawn points
        const spawnPoints = [
          [15.0, 1.7, 30.0],
          [25.0, 1.7, 10.0],
          [-10.0, 1.7, 35.0],
          [0.0, 1.7, 5.0],
          [40.0, 1.7, -20.0]
        ];
        const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        this.playerPos.set(sp[0], sp[1], sp[2]);
        this.currentHero.hp = this.currentHero.maxHp;
        this.currentHero.trailingHp = this.currentHero.maxHp;
        this.audio.playUltReady();
      }
    }

    // Check if local player took fatal environmental or sudden damage
    if (this.currentHero.hp <= 0 && !this.isRespawning) {
      this.handleLocalPlayerDeath('전장 위험 요소');
    }

    // Micro Hit Stop: pauses physical updates, maintains visual loop
    const isHitStopped = this.shaker.isHitStopped();
    this.shaker.update(dt);

    const allTargets = this.getAllCombatTargets();

    if (!isHitStopped && !this.isRespawning) {
      // 1. Player Movement & Physics
      this.updatePlayerMovement(dt);

      // 2. Camera Transforms: Update position & Euler 'YXZ' rotation BEFORE combat inputs for 0-latency aim
      this.camera.position.copy(this.playerPos);
      const shake = this.shaker.getShakeOffset();
      this.camera.position.x += shake.posX;
      this.camera.position.y += shake.posY;

      // ENFORCE YXZ EULER ORDER: Completely eliminates camera roll / tilt / lying down!
      this.camera.rotation.order = 'YXZ';
      this.camera.rotation.set(
        this.input.pitch + shake.rotX,
        this.input.yaw + shake.rotY,
        shake.rotZ * 0.12,
        'YXZ'
      );
      this.camera.updateMatrixWorld(true);

      // 3. Network Movement Send (25Hz Throttled)
      this.network.sendMovement(this.playerPos, this.input.pitch, this.input.yaw);

      // 4. Weapon Firing & Ability Inputs (Using freshly updated camera aim)
      this.handleCombatInputs(allTargets);

      // 5. Hero Update (Guaranteed consistent arguments across all heroes)
      this.currentHero.update(
        dt,
        this.playerPos,
        this.camera,
        this.projectiles,
        this.audio,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          if (kill && (target instanceof RemotePlayer || target.id)) {
            target.setDead(true); // Corpse immediately vanishes!
          }
          this.handleCombatHit(target, dmg, head, kill);
        },
        this.shaker,
        this.map
      );

      // 6. Projectiles Update (against bots and remote players) with Map Wall Collisions & Player Context
      const playerCtx = {
        playerPos: this.playerPos,
        currentHero: this.currentHero,
        camera: this.camera,
        audio: this.audio,
        shaker: this.shaker,
        ui: this.ui
      };

      this.projectiles.update(dt, allTargets, (target, dmg, head, kill) => {
        if (target instanceof RemotePlayer) {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.audio.playHit(head);
          this.ui.showHitmarker(head, false);
        } else {
          this.handleCombatHit(target, dmg, head, kill);
        }
      }, this.map, playerCtx);

      // 7. Bots Update & AI (with combat projectile shooting)
      this.bots.forEach((bot) => bot.update(dt, this.playerPos, this.projectiles));

      // 8. Health Packs Check
      this.map.update(dt, this.playerPos, (healAmount) => {
        const healed = this.currentHero.heal(healAmount);
        if (healed) {
          this.audio.playTracerBlink();
          if (this.network.isConnected) {
            this.network.sendHeal(healAmount);
          }
        }
        return healed;
      });
    }

    // 9. Remote Players 3D Update (Smooth Lerp & Billboards)
    this.remotePlayers.forEach((rp) => rp.update(dt, this.camera));

    // 10. Overwatch 2 TAB Scoreboard Display
    const scoreboardModal = document.getElementById('scoreboard-overlay');
    if (scoreboardModal) {
      if (this.input.keys.tab) {
        scoreboardModal.classList.remove('hidden');
        this.updateScoreboard();
      } else {
        scoreboardModal.classList.add('hidden');
      }
    }

    // 11. Ping display in HUD
    const pingEl = document.getElementById('net-ping-text');
    if (pingEl && this.network.isConnected) {
      pingEl.textContent = `${this.network.ping}ms`;
    }

    // 12. Update Overwatch 2 HUD
    this.ui.update(this.currentHero);

    // 13. Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  updatePlayerMovement(dt) {
    const move = this.input.getMovementVector();

    // Calculate forward/right vectors from yaw
    const forward = new THREE.Vector3(-Math.sin(this.input.yaw), 0, -Math.cos(this.input.yaw));
    const right = new THREE.Vector3(Math.cos(this.input.yaw), 0, -Math.sin(this.input.yaw));

    const moveVelocity = new THREE.Vector3();
    moveVelocity.addScaledVector(forward, -move.z);
    moveVelocity.addScaledVector(right, move.x);

    // Apply Speed (disable standard movement integration during Charge, Blink, or Swift Strike)
    if (this.currentHero.isCharging || this.currentHero.isBlinking || this.currentHero.isDashing) {
      moveVelocity.set(0, 0, 0);
    }

    // REINHARDT: Movement speed halved (50%) while holding Barrier Shield
    let moveSpeed = this.currentHero.speed;
    if (this.currentHero.name === 'REINHARDT' && this.currentHero.isShieldActive) {
      moveSpeed *= 0.5;
    }
    this.playerPos.addScaledVector(moveVelocity, moveSpeed * dt);

    // 1. Resolve 3D Obstacle & Platform Collisions
    const colResult = this.map.resolveCollision(this.playerPos, 0.55);

    // 2. Gravity & Jump
    this.velocityY += this.gravity * dt;
    this.playerPos.y += this.velocityY * dt;

    // 3. Multi-level Ground Collision
    if (this.playerPos.y <= colResult.groundY) {
      this.playerPos.y = colResult.groundY;
      this.velocityY = 0;
      this.isGrounded = true;
      this.canDoubleJump = true; // Landing resets double jump
    } else {
      this.isGrounded = false;
    }

    // Jump Input with Genji Double Jump
    const jumpPressed = !!this.input.keys.jump;
    const jumpJustPressed = jumpPressed && !this.wasJumpPressed;
    this.wasJumpPressed = jumpPressed;

    if (jumpJustPressed) {
      if (this.isGrounded) {
        this.velocityY = this.currentHero.jumpForce;
        this.isGrounded = false;
        if (this.currentHero.name === 'GENJI') {
          this.canDoubleJump = true;
        }
      } else if (this.currentHero.name === 'GENJI' && this.canDoubleJump) {
        // GENJI 2단점프 (Mid-air Double Jump)
        this.velocityY = this.currentHero.jumpForce * 1.05;
        this.canDoubleJump = false;
        if (this.audio) this.audio.playTracerBlink();
        if (this.shaker) this.shaker.addTrauma(0.12);
        if (this.projectiles && typeof this.projectiles.spawnHitSparks === 'function') {
          this.projectiles.spawnHitSparks(this.playerPos.clone().sub(new THREE.Vector3(0, 0.8, 0)), new THREE.Vector3(0, -1, 0), 0x00ff88);
        }
      }
    }

    // 4. Secondary safety collision check after vertical update
    this.map.resolveCollision(this.playerPos, 0.55);
  }

  handleCombatInputs(allTargets) {
    // Allow input if pointer is locked on desktop OR if running on touch device
    const canInput = this.input.isLocked || this.input.isTouchDevice;
    if (!canInput) return;

    // Primary Fire (Left Click / Touch Fire)
    if (this.input.keys.primaryFire) {
      const hitResult = this.currentHero.primaryFire(
        this.camera,
        this.scene,
        this.projectiles,
        this.audio,
        this.shaker,
        this.map
      );

      if (hitResult) {
        if (hitResult.raycaster) {
          // Check collision with walls / obstacles in map FIRST
          let wallHit = hitResult.wallHit;
          if (!wallHit && this.map && typeof this.map.raycastColliders === 'function') {
            wallHit = this.map.raycastColliders(hitResult.raycaster.ray, 50);
          }
          const wallDist = (wallHit && wallHit.hit) ? wallHit.distance : Infinity;

          // Hitscan Raycasting against targets (Tracer)
          const hits = [];
          allTargets.forEach((target) => {
            if (target.isDead) return;
            const targetMeshes = target.hitMeshes || [target.bodyMesh, target.headMesh];
            const intersects = hitResult.raycaster.intersectObjects(targetMeshes, true);
            if (intersects.length > 0) {
              // Target is ONLY hit if closer than the obstructing wall!
              if (intersects[0].distance < wallDist) {
                hits.push({ target, intersect: intersects[0] });
              }
            }
          });

          // Determine laser beam visual end point
          const rayOrigin = this.camera.position.clone();
          const rayDir = hitResult.raycaster.ray.direction.clone();
          let beamEnd = rayOrigin.clone().addScaledVector(rayDir, Math.min(35, wallDist));

          if (hits.length > 0) {
            hits.sort((a, b) => a.intersect.distance - b.intersect.distance);
            if (hits[0].intersect.point) {
              beamEnd = hits[0].intersect.point.clone();
            }
          } else if (wallHit && wallHit.hit && wallHit.point) {
            // Hit solid wall/obstacle! Spawn impact sparks
            beamEnd = wallHit.point.clone();
            if (this.projectiles && typeof this.projectiles.spawnHitSparks === 'function') {
              this.projectiles.spawnHitSparks(wallHit.point, new THREE.Vector3(0, 1, 0), 0x00f0ff);
            }
          }

          // Broadcast primary fire beam to other players
          this.network.sendAction('primary_fire_beam', {
            start: [rayOrigin.x, rayOrigin.y - 0.2, rayOrigin.z],
            end: [beamEnd.x, beamEnd.y, beamEnd.z]
          });
            const target = hits[0].target;
            const hitObject = hits[0].intersect.object;

            if (hitObject.userData && hitObject.userData.isShield) {
              // Hit Reinhardt barrier shield!
              this.audio.playHit(false);
              this.ui.showHitmarker(false, false);
            } else {
              const isHead = hitObject.userData && hitObject.userData.isHead;
              const dmg = isHead ? hitResult.damage * hitResult.isHeadshotMultiplier : hitResult.damage;
              const hitDir = hitResult.raycaster.ray.direction.clone();

              if (target instanceof RemotePlayer) {
                target.takeDamage(dmg, isHead);
                if (target.id) {
                  this.network.sendHit(target.id, dmg, isHead);
                }
                this.audio.playHit(isHead);
                this.ui.showHitmarker(isHead, false);
                this.shaker.addTrauma(isHead ? 0.25 : 0.12);
              } else {
                const finalBlow = target.takeDamage(dmg, isHead, hitDir);
                this.handleCombatHit(target, dmg, isHead, finalBlow);
              }
            }
          }
        } else if (hitResult.isHammer || hitResult.isDragonblade) {
          // Melee Cleave Arc (Reinhardt Rocket Hammer / Genji Dragonblade)
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
          forward.y = 0;
          forward.normalize();

          allTargets.forEach((target) => {
            if (target.isDead) return;
            const dist = target.group.position.distanceTo(this.playerPos);
            if (dist <= hitResult.range) {
              const toTarget = target.group.position.clone().sub(this.playerPos).normalize();
              const dot = forward.dot(toTarget);
              if (dot > 0.25) { // ~75 degree cleave angle
                if (target instanceof RemotePlayer) {
                  target.takeDamage(hitResult.damage, false);
                  if (target.id) {
                    this.network.sendHit(target.id, hitResult.damage, false);
                  }
                  this.audio.playHit(false);
                  this.ui.showHitmarker(false, false);
                  this.shaker.addTrauma(0.12);
                } else {
                  const finalBlow = target.takeDamage(hitResult.damage, false, forward);
                  this.handleCombatHit(target, hitResult.damage, false, finalBlow);
                }
              }
            }
          });
        }
      }
    }

    // Secondary Fire (Right Click)
    if (this.input.keys.secondaryFire) {
      if (this.currentHero.name === 'REINHARDT') {
        if (!this.currentHero.isShieldActive) {
          this.network.sendAction('shield_toggle', { active: true });
        }
        this.currentHero.setShieldActive(true, this.audio);
      } else if (this.currentHero.secondaryFire) {
        this.currentHero.secondaryFire(
          this.camera,
          this.scene,
          this.projectiles,
          this.audio,
          this.shaker
        );
      }
    } else {
      if (this.currentHero.name === 'REINHARDT') {
        if (this.currentHero.isShieldActive) {
          this.network.sendAction('shield_toggle', { active: false });
        }
        this.currentHero.setShieldActive(false, this.audio);
      }
    }

    // Ability 1 (Shift)
    if (this.input.keys.shift) {
      this.input.keys.shift = false; // Trigger once
      const moveDir = this.input.getMovementVector();
      const prevPos = this.playerPos.clone();

      this.currentHero.useAbility1(
        this.playerPos,
        moveDir,
        this.camera,
        this.audio,
        this.shaker,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.handleCombatHit(target, dmg, head, kill);
        },
        this.projectiles
      );

      // Replicate movement abilities across network
      if (this.currentHero.name === 'TRACER') {
        this.network.sendAction('blink', {
          from: [prevPos.x, prevPos.y, prevPos.z],
          to: [this.playerPos.x, this.playerPos.y, this.playerPos.z]
        });
      } else if (this.currentHero.name === 'GENJI') {
        this.network.sendAction('dash', {
          from: [prevPos.x, prevPos.y, prevPos.z],
          to: [this.playerPos.x, this.playerPos.y, this.playerPos.z]
        });
      }
    }

    // Ability 2 (E)
    if (this.input.keys.e) {
      this.input.keys.e = false;
      this.currentHero.useAbility2(
        this.playerPos,
        this.camera,
        this.audio,
        this.shaker,
        this.ui,
        this.projectiles
      );
    }

    // Ultimate (Q)
    if (this.input.keys.q) {
      this.input.keys.q = false;
      this.currentHero.useUltimate(
        this.camera,
        this.projectiles,
        this.audio,
        this.shaker,
        this.ui,
        allTargets,
        (target, dmg, head, kill) => {
          if (target.id) {
            this.network.sendHit(target.id, dmg, head);
          }
          this.handleCombatHit(target, dmg, head, kill);
        }
      );
    }

    // Reload (R)
    if (this.input.keys.r) {
      this.input.keys.r = false;
      this.currentHero.startReload(this.audio);
    }
  }
}

// Reliable Instant & DOMReady Game Boot
function startOverwatchApp() {
  if (!window.__overwatchGame) {
    window.__overwatchGame = new OverwatchGame();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', startOverwatchApp);
} else {
  startOverwatchApp();
}

})();
