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
  // MOBILE TOUCH CONTROLS (Virtual Joystick + Aim Drag + Buttons)
  // ==========================================================================
  initMobileControls() {
    const mobileContainer = document.getElementById('mobile-controls');
    if (mobileContainer) {
      mobileContainer.classList.remove('hidden');
    }

    // 1. Virtual Joystick (Left Thumb Movement)
    const joyZone = document.getElementById('joystick-zone');
    const joyBase = document.getElementById('joystick-base');
    const joyKnob = document.getElementById('joystick-knob');

    let joyTouchId = null;
    let baseCenterX = 0;
    let baseCenterY = 0;
    const maxRadius = 45; // Max knob drag distance in px

    if (joyZone && joyBase && joyKnob) {
      joyZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        joyTouchId = touch.identifier;

        const rect = joyBase.getBoundingClientRect();
        baseCenterX = rect.left + rect.width / 2;
        baseCenterY = rect.top + rect.height / 2;

        this.updateJoystick(touch.clientX, touch.clientY, baseCenterX, baseCenterY, maxRadius, joyKnob);
      }, { passive: false });

      joyZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === joyTouchId) {
            this.updateJoystick(touch.clientX, touch.clientY, baseCenterX, baseCenterY, maxRadius, joyKnob);
            break;
          }
        }
      }, { passive: false });

      const endJoystick = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === joyTouchId) {
            joyTouchId = null;
            this.touchMove = { x: 0, z: 0 };
            joyKnob.style.transform = 'translate(0px, 0px)';
            break;
          }
        }
      };

      joyZone.addEventListener('touchend', endJoystick);
      joyZone.addEventListener('touchcancel', endJoystick);
    }

    // 2. Touch Aim Drag Zone (Right Screen Drag for Camera Rotation)
    const lookZone = document.getElementById('touch-look-zone');
    let lookTouchId = null;
    let lastLookX = 0;
    let lastLookY = 0;

    if (lookZone) {
      lookZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        lookTouchId = touch.identifier;
        lastLookX = touch.clientX;
        lastLookY = touch.clientY;
      }, { passive: false });

      lookZone.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === lookTouchId) {
            const dx = touch.clientX - lastLookX;
            const dy = touch.clientY - lastLookY;
            lastLookX = touch.clientX;
            lastLookY = touch.clientY;

            this.yaw -= dx * this.touchLookSensitivity;
            this.pitch -= dy * this.touchLookSensitivity;

            // Clamp vertical pitch to -83deg ~ +83deg
            const maxPitch = 1.45;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
            break;
          }
        }
      }, { passive: false });

      const endLook = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === lookTouchId) {
            lookTouchId = null;
            break;
          }
        }
      };

      lookZone.addEventListener('touchend', endLook);
      lookZone.addEventListener('touchcancel', endLook);
    }

    // 3. Mobile Touch Action Buttons
    // Integrated Primary Fire + Aim Drag: Pressing Fire triggers shooting AND dragging thumb rotates camera!
    const btnFire = document.getElementById('btn-touch-fire');
    let fireTouchId = null;
    let lastFireX = 0;
    let lastFireY = 0;

    if (btnFire) {
      btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        fireTouchId = touch.identifier;
        lastFireX = touch.clientX;
        lastFireY = touch.clientY;
        this.keys.primaryFire = true;
        btnFire.classList.add('active');
        if ('vibrate' in navigator) navigator.vibrate(10);
      }, { passive: false });

      btnFire.addEventListener('touchmove', (e) => {
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === fireTouchId) {
            const dx = touch.clientX - lastFireX;
            const dy = touch.clientY - lastFireY;
            lastFireX = touch.clientX;
            lastFireY = touch.clientY;

            this.yaw -= dx * this.touchLookSensitivity;
            this.pitch -= dy * this.touchLookSensitivity;

            // Clamp vertical pitch to -83deg ~ +83deg
            const maxPitch = 1.45;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
            break;
          }
        }
      }, { passive: false });

      const endFire = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === fireTouchId) {
            fireTouchId = null;
            this.keys.primaryFire = false;
            btnFire.classList.remove('active');
            break;
          }
        }
      };

      btnFire.addEventListener('touchend', endFire);
      btnFire.addEventListener('touchcancel', endFire);
    }

    // Secondary Fire / Alt (Shield / Fan of Shurikens)
    this.bindTouchButton('btn-touch-alt', (active) => {
      this.keys.secondaryFire = active;
      if (active && 'vibrate' in navigator) navigator.vibrate(10);
    });

    this.bindTouchButton('btn-touch-jump', (active) => {
      this.keys.jump = active;
      if (active && 'vibrate' in navigator) navigator.vibrate(12);
    });

    this.bindTouchButton('btn-touch-shift', (active) => {
      if (active) {
        this.keys.shift = true;
        if ('vibrate' in navigator) navigator.vibrate(20);
      }
    });

    this.bindTouchButton('btn-touch-e', (active) => {
      if (active) {
        this.keys.e = true;
        if ('vibrate' in navigator) navigator.vibrate(20);
      }
    });

    this.bindTouchButton('btn-touch-q', (active) => {
      if (active) {
        this.keys.q = true;
        if ('vibrate' in navigator) navigator.vibrate([25, 40, 25]);
      }
    });

    this.bindTouchButton('btn-touch-reload', (active) => {
      if (active) {
        this.keys.r = true;
        if ('vibrate' in navigator) navigator.vibrate(15);
      }
    });

    const btnSwitch = document.getElementById('btn-touch-switch');
    if (btnSwitch) {
      btnSwitch.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (this.onHeroSwitchRequested) {
          this.onHeroSwitchRequested('toggle_modal');
          if ('vibrate' in navigator) navigator.vibrate(15);
        }
      }, { passive: false });
    }

    const btnScoreboard = document.getElementById('btn-touch-scoreboard');
    if (btnScoreboard) {
      btnScoreboard.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys.tab = !this.keys.tab;
        if ('vibrate' in navigator) navigator.vibrate(15);
      }, { passive: false });
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

    knob.style.transform = `translate(${dx}px, ${dy}px)`;
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
