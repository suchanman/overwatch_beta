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
