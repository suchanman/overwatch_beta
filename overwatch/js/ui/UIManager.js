/**
 * ============================================================================
 * OVERWATCH 2 : HUD & UI MANAGER
 * - Dynamic Hitmarkers (Normal White / Crit Red / Skull Final Blow)
 * - Trailing Health Bar & Segment Pips
 * - Radial SVG Ultimate Meter (0% ~ 100% with Wing Flares)
 * - Real-time Killfeed & 100🔥 Flame Elimination Banner
 * ============================================================================
 */

export class UIManager {
  constructor() {
    // HUD Elements
    this.hudOverlay = document.getElementById('hud-overlay');
    this.elimCountEl = document.getElementById('elim-count');
    this.streakCountEl = document.getElementById('streak-count');

    // Crosshair & Hitmarkers
    this.hitmarkerEl = document.getElementById('hitmarker');
    this.skullMarkerEl = document.getElementById('skull-marker');
    this.hitmarkerTimeout = null;

    // Elimination Banner
    this.elimBannerEl = document.getElementById('elimination-banner');
    this.elimVictimEl = document.getElementById('elim-victim-name');
    this.elimBannerTimeout = null;

    // Killfeed
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
    this.elimCountEl.textContent = this.eliminations;
    this.streakCountEl.textContent = this.streak;

    this.elimVictimEl.textContent = victimName;
    this.elimBannerEl.classList.remove('hidden');
    void this.elimBannerEl.offsetWidth;

    clearTimeout(this.elimBannerTimeout);
    this.elimBannerTimeout = setTimeout(() => {
      this.elimBannerEl.classList.add('hidden');
    }, 1300);
  }

  // ==========================================================================
  // REAL-TIME SLIDING KILLFEED
  // ==========================================================================
  addKillfeed(killerName, victimName, isHeadshot = false, weaponIcon = '⚔️') {
    const item = document.createElement('div');
    item.className = 'killfeed-item';

    const headshotSpan = isHeadshot ? '<span class="killfeed-headshot">🎯</span>' : '';
    item.innerHTML = `
      <span class="killfeed-killer">${killerName}</span>
      ${headshotSpan}
      <span class="killfeed-icon">${weaponIcon}</span>
      <span class="killfeed-victim">${victimName}</span>
    `;

    this.killfeedContainer.appendChild(item);

    // Remove after 3.8 seconds
    setTimeout(() => {
      if (item.parentNode) {
        item.parentNode.removeChild(item);
      }
    }, 3800);
  }

  // ==========================================================================
  // SCREEN DAMAGE & EFFECT OVERLAYS
  // ==========================================================================
  triggerDamageVignette() {
    this.damageVignette.classList.add('active');
    setTimeout(() => this.damageVignette.classList.remove('active'), 250);
  }

  triggerDamageFlash() {
    this.triggerDamageVignette();
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
  }
}
