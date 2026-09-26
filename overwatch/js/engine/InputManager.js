/**
 * ============================================================================
 * INPUT MANAGER (Desktop & Mobile 60FPS Optimization)
 * - Desktop: Mouse Pointer Lock Controls (FPS standard camera rotation)
 * - Mobile: 360-degree Virtual Joystick + Touch Aim Drag Zone + Haptic Feedback
 * - Keyboard bindings: WASD, Space, L.Shift, E, Q, R, Left/Right Click
 * - Quick Hero Switch: [1], [2], [3], [H]
 * ============================================================================
 */

export class InputManager {
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
      if (key === '4' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('mccree');
      if (key === '5' && this.onHeroSwitchRequested) this.onHeroSwitchRequested('doomfist');
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
