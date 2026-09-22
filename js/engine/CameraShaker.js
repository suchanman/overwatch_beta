/**
 * ============================================================================
 * CAMERA SHAKER & HIT STOP MANAGER (skill.md 3.1 & 3.2 Standard)
 * - Trauma-based Exponential Damping Screen Shake
 * - Authentic Weapon Recoil Pitch & Yaw Kick
 * - Micro Hit Stop (Freezes game entities for 30~60ms without freezing renderer)
 * ============================================================================
 */

export class CameraShaker {
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
