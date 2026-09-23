/**
 * ============================================================================
 * HERO BASE CLASS
 * - Health, Trailing Bar, Armor, Shield
 * - Magazine Ammo & Reload
 * - Ultimate Charge Meter (0 ~ 100%)
 * - 1st-Person Weapon Viewmodel
 * ============================================================================
 */

export class HeroBase {
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
