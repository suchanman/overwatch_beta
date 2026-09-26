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

    // McCree Deadeye (황야의 무법자) Cinematic Overlay & Target Tracking
    this.deadeyeVignette = document.getElementById('deadeye-vignette');
    this.deadeyeTimerBar = document.getElementById('deadeye-timer-bar');
    this.deadeyeTargetsContainer = document.getElementById('deadeye-targets-container');
    this.deadeyeMarkers = new Map(); // target -> { el, wasLethal, shrinkCircle, ... }

    this.eliminations = 0;
    this.streak = 0;
  }

  showHUD() {
    this.hudOverlay.classList.remove('hidden');
  }

  hideHUD() {
    this.hudOverlay.classList.add('hidden');
    if (this.deadeyeVignette) this.deadeyeVignette.classList.add('hidden');
    this.clearDeadeyeMarkers();
  }

  clearDeadeyeMarkers() {
    for (const data of this.deadeyeMarkers.values()) {
      if (data.el && data.el.parentNode) {
        data.el.parentNode.removeChild(data.el);
      }
    }
    this.deadeyeMarkers.clear();
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
    if (key.includes('mccree') || key.includes('cassidy')) return '🤠';
    if (key.includes('flashbang')) return '💥';
    if (key.includes('roll')) return '🔄';
    if (key.includes('deadeye') || key.includes('highnoon')) return '☀️';
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
  update(hero, camera) {
    // 1. Hero Identity & Portrait
    this.heroNameLabel.textContent = hero.name;
    this.heroPortraitEl.className = `hero-portrait portrait-${hero.name.toLowerCase()}`;

    if (this._lastHeroName !== hero.name) {
      this._lastHeroName = hero.name;
      const a1Icon = document.querySelector('#ability-1-icon .icon-text');
      const a2Icon = document.querySelector('#ability-2-icon .icon-text');
      if (a1Icon && a2Icon) {
        if (hero.name === 'TRACER') { a1Icon.textContent = '⚡'; a2Icon.textContent = '⏪'; }
        else if (hero.name === 'GENJI') { a1Icon.textContent = '🗡️'; a2Icon.textContent = '🛡️'; }
        else if (hero.name === 'REINHARDT') { a1Icon.textContent = '🚀'; a2Icon.textContent = '🔥'; }
        else if (hero.name === 'MCCREE') { a1Icon.textContent = '🔄'; a2Icon.textContent = '💥'; }
        else if (hero.name === 'DOOMFIST') { a1Icon.textContent = '💥'; a2Icon.textContent = '🌪️'; }
      }
    }

    // 2. Numeric Health & Trailing Health Bar (skill.md 3.4)
    const baseHp = Math.ceil(hero.hp);
    const shields = Math.ceil(hero.shields || 0);
    this.hpCurrentEl.textContent = baseHp + shields;
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
    } else if (hero.name === 'DOOMFIST') {
      this.ammoPipsBar.style.display = 'flex';
      this.ammoCurrentEl.textContent = hero.ammo;
      this.ammoMaxEl.textContent = '4';
      this.reloadPrompt.classList.add('hidden');
    } else {
      this.ammoPipsBar.style.display = 'flex';
      this.ammoCurrentEl.textContent = hero.ammo;
      this.ammoMaxEl.textContent = hero.maxAmmo;

      if (hero.isReloading) {
        this.reloadPrompt.textContent = 'RELOADING...';
        this.reloadPrompt.classList.remove('hidden');
      } else if (hero.ammo <= (hero.name === 'MCCREE' ? 2 : 8)) {
        this.reloadPrompt.textContent = '[R] RELOAD';
        this.reloadPrompt.classList.remove('hidden');
      } else {
        this.reloadPrompt.classList.add('hidden');
      }
    }

    // 7. Reinhardt Center Barrier Shield HUD
    this.updateReinhardtShield(hero);

    // 8. McCree Deadeye Ultimate HUD & Target Reticles
    this.updateDeadeyeOverlay(hero, camera);

    // 9. Doomfist Rocket Punch Charge & Meteor Strike Targeting
    this.updateDoomfistHUD(hero);
  }

  updateDoomfistHUD(hero) {
    let chargeHud = document.getElementById('doomfist-charge-hud');
    let meteorPrompt = document.getElementById('doomfist-meteor-prompt');

    if (!chargeHud) {
      chargeHud = document.createElement('div');
      chargeHud.id = 'doomfist-charge-hud';
      chargeHud.className = 'doomfist-charge-hud hidden';
      chargeHud.innerHTML = `
        <div class="df-charge-header">
          <span class="df-charge-title">ROCKET PUNCH CHARGE</span>
          <span id="df-charge-pct-text" class="df-charge-pct">0%</span>
        </div>
        <div class="df-charge-track">
          <div id="df-charge-fill-bar" class="df-charge-fill"></div>
          <div class="df-tier t1"></div>
          <div class="df-tier t2"></div>
          <div class="df-tier t3"></div>
        </div>
        <div class="df-charge-hint">RELEASE TO UNLEASH PUNCH</div>
      `;
      document.body.appendChild(chargeHud);
    }

    if (!meteorPrompt) {
      meteorPrompt = document.createElement('div');
      meteorPrompt.id = 'doomfist-meteor-prompt';
      meteorPrompt.className = 'doomfist-meteor-prompt hidden';
      meteorPrompt.innerHTML = `
        <div class="meteor-prompt-title">METEOR STRIKE (파멸의 일격)</div>
        <div class="meteor-zone-legend">
          <div class="zone-badge zone-core">
            <span class="zone-dot core-dot"></span>
            <span class="zone-text">중심부 (3m): <strong class="dmg-val core-val">300 치명타 피해</strong></span>
          </div>
          <div class="zone-badge zone-outer">
            <span class="zone-dot outer-dot"></span>
            <span class="zone-text">외곽부 (8.5m): <strong class="dmg-val outer-val">50~180 피해</strong></span>
          </div>
        </div>
        <div class="meteor-prompt-sub">[좌클릭] 또는 [Q] 낙하 확정 (CONFIRM IMPACT)</div>
      `;
      document.body.appendChild(meteorPrompt);
    }

    if (hero && hero.name === 'DOOMFIST') {
      if (hero.isChargingPunch) {
        chargeHud.classList.remove('hidden');
        const pct = Math.floor((hero.punchChargeRatio || 0) * 100);
        const fillBar = document.getElementById('df-charge-fill-bar');
        const pctText = document.getElementById('df-charge-pct-text');
        if (fillBar) fillBar.style.width = `${pct}%`;
        if (pctText) pctText.textContent = `${pct}%`;
      } else {
        chargeHud.classList.add('hidden');
      }

      if (hero.isMeteorActive && hero.meteorPhase === 'TARGETING') {
        meteorPrompt.classList.remove('hidden');
      } else {
        meteorPrompt.classList.add('hidden');
      }
    } else {
      if (chargeHud) chargeHud.classList.add('hidden');
      if (meteorPrompt) meteorPrompt.classList.add('hidden');
    }
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

  // ==========================================================================
  // MCCREE DEADEYE (황야의 무법자) TARGET RETICLES & LETHAL SKULL
  // ==========================================================================
  updateDeadeyeOverlay(hero, camera) {
    const isDeadeye = hero && hero.name === 'MCCREE' && hero.isDeadeyeActive;

    if (!isDeadeye) {
      if (this.deadeyeVignette && !this.deadeyeVignette.classList.contains('hidden')) {
        this.deadeyeVignette.classList.add('hidden');
      }
      if (this.deadeyeMarkers.size > 0) {
        this.clearDeadeyeMarkers();
      }
      return;
    }

    // Show Sunset High Noon Vignette
    if (this.deadeyeVignette && this.deadeyeVignette.classList.contains('hidden')) {
      this.deadeyeVignette.classList.remove('hidden');
    }

    // Update Deadeye remaining channel bar
    if (this.deadeyeTimerBar && hero.deadeyeDuration > 0) {
      const pct = Math.max(0, Math.min(100, (hero.deadeyeTimer / hero.deadeyeDuration) * 100));
      this.deadeyeTimerBar.style.width = `${pct}%`;
    }

    if (!this.deadeyeTargetsContainer || !camera || !hero.deadeyeTargets) return;

    const activeTargets = new Set();
    const camPos = camera.position;
    const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);

    for (const [target, state] of hero.deadeyeTargets.entries()) {
      if (!target || target.isDead) continue;

      // Determine 3D world position of enemy's head / face
      const headWorldPos = new THREE.Vector3();
      if (target.headMesh && typeof target.headMesh.getWorldPosition === 'function') {
        target.headMesh.getWorldPosition(headWorldPos);
      } else if (target.group && target.group.position) {
        headWorldPos.copy(target.group.position).add(new THREE.Vector3(0, 1.8, 0));
      } else {
        continue;
      }

      // Check if target is behind camera plane
      const toTarget = headWorldPos.clone().sub(camPos).normalize();
      if (camForward.dot(toTarget) <= 0.1) continue;

      // Project 3D world coordinate to 2D NDC [-1, 1]
      const proj = headWorldPos.clone().project(camera);
      if (proj.z > 1.0) continue;

      // Convert to screen pixel coordinates
      const sx = (proj.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-(proj.y * 0.5) + 0.5) * window.innerHeight;

      // Discard targets that are outside screen viewport
      if (sx < -60 || sx > window.innerWidth + 60 || sy < -60 || sy > window.innerHeight + 60) {
        continue;
      }

      // Calculate damage charge ratio against enemy current HP
      const targetHp = Math.max(1, (target.hp !== undefined) ? target.hp : 200);
      const currentDmg = Math.floor(state.damage || 0);
      const progress = Math.min(1.0, currentDmg / targetHp);
      const isLethal = state.isLethal || progress >= 1.0;

      // Shrink outer circle radius smoothly from 46px down to 12px
      const maxR = 46;
      const minR = 12;
      const currentR = Math.max(minR, Math.round(maxR - (maxR - minR) * progress));

      // Get or create cached DOM marker element
      let markerData = this.deadeyeMarkers.get(target);
      if (!markerData) {
        markerData = this.createDeadeyeMarkerElement(target);
        this.deadeyeTargetsContainer.appendChild(markerData.el);
        this.deadeyeMarkers.set(target, markerData);
      }

      activeTargets.add(target);

      // Position over target's face
      markerData.el.style.left = `${sx.toFixed(1)}px`;
      markerData.el.style.top = `${sy.toFixed(1)}px`;

      // Update state: Charging vs Lethal Skull
      if (isLethal) {
        if (!markerData.wasLethal) {
          markerData.wasLethal = true;
          markerData.el.classList.remove('is-charging');
          markerData.el.classList.add('is-lethal');
        }
      } else {
        if (markerData.wasLethal) {
          markerData.wasLethal = false;
          markerData.el.classList.remove('is-lethal');
          markerData.el.classList.add('is-charging');
        }

        // Update shrinking circle radius and ticks
        if (markerData.shrinkCircle) {
          markerData.shrinkCircle.setAttribute('r', currentR);
        }
        if (markerData.notchT) {
          markerData.notchT.setAttribute('y1', 60 - currentR - 7);
          markerData.notchT.setAttribute('y2', 60 - currentR);
        }
        if (markerData.notchB) {
          markerData.notchB.setAttribute('y1', 60 + currentR);
          markerData.notchB.setAttribute('y2', 60 + currentR + 7);
        }
        if (markerData.notchL) {
          markerData.notchL.setAttribute('x1', 60 - currentR - 7);
          markerData.notchL.setAttribute('x2', 60 - currentR);
        }
        if (markerData.notchR) {
          markerData.notchR.setAttribute('x1', 60 + currentR);
          markerData.notchR.setAttribute('x2', 60 + currentR + 7);
        }
        if (markerData.progressLabel) {
          markerData.progressLabel.textContent = `${Math.floor(progress * 100)}% (${currentDmg}/${Math.ceil(targetHp)})`;
        }
      }
    }

    // Clean up any targets that lost line of sight, moved out of FOV, or died
    for (const [t, data] of this.deadeyeMarkers.entries()) {
      if (!activeTargets.has(t)) {
        if (data.el && data.el.parentNode) {
          data.el.parentNode.removeChild(data.el);
        }
        this.deadeyeMarkers.delete(t);
      }
    }
  }

  createDeadeyeMarkerElement(target) {
    const el = document.createElement('div');
    el.className = 'deadeye-marker is-charging';

    el.innerHTML = `
      <!-- Center dot on target head -->
      <div class="deadeye-center-point"></div>

      <!-- Target Name Label -->
      <div class="deadeye-target-tag">${target.name || '적 요원'}</div>

      <!-- 1. Charging Circle (Shrinks as damage builds) -->
      <div class="deadeye-charge-box">
        <svg class="deadeye-ring-svg" viewBox="0 0 120 120">
          <circle class="deadeye-outer-ring" cx="60" cy="60" r="48"></circle>
          <circle class="deadeye-shrink-circle" cx="60" cy="60" r="46"></circle>
          <line class="deadeye-notch notch-t" x1="60" y1="7" x2="60" y2="14"></line>
          <line class="deadeye-notch notch-b" x1="60" y1="106" x2="60" y2="113"></line>
          <line class="deadeye-notch notch-l" x1="7" y1="60" x2="14" y2="60"></line>
          <line class="deadeye-notch notch-r" x1="106" y1="60" x2="113" y2="60"></line>
        </svg>
        <div class="deadeye-progress-info">0%</div>
      </div>

      <!-- 2. Lethal Skull Box (Appears with snap when damage >= HP) -->
      <div class="deadeye-skull-box">
        <div class="deadeye-skull-aura"></div>
        <div class="deadeye-lock-brackets">
          <span class="deadeye-bracket-corner c-tl"></span>
          <span class="deadeye-bracket-corner c-tr"></span>
          <span class="deadeye-bracket-corner c-bl"></span>
          <span class="deadeye-bracket-corner c-br"></span>
        </div>
        <svg class="deadeye-skull-svg" viewBox="0 0 40 40">
          <!-- Stylized OW2 Lethal Skull -->
          <path class="skull-path-head" d="M10 16 C10 8, 15 4, 20 4 C25 4, 30 8, 30 16 C30 21, 28 25, 25 27 L25 32 L15 32 L15 27 C12 25, 10 21, 10 16 Z"></path>
          <ellipse class="skull-path-socket" cx="16" cy="16" rx="2.8" ry="3.8"></ellipse>
          <ellipse class="skull-path-socket" cx="24" cy="16" rx="2.8" ry="3.8"></ellipse>
          <polygon class="skull-path-nose" points="20,21 18.5,25 21.5,25"></polygon>
          <line class="skull-path-tooth" x1="18" y1="28" x2="18" y2="32"></line>
          <line class="skull-path-tooth" x1="20" y1="28" x2="20" y2="32"></line>
          <line class="skull-path-tooth" x1="22" y1="28" x2="22" y2="32"></line>
        </svg>
        <div class="deadeye-lethal-badge">💀 한방 처치</div>
      </div>
    `;

    return {
      el,
      wasLethal: false,
      shrinkCircle: el.querySelector('.deadeye-shrink-circle'),
      notchT: el.querySelector('.notch-t'),
      notchB: el.querySelector('.notch-b'),
      notchL: el.querySelector('.notch-l'),
      notchR: el.querySelector('.notch-r'),
      progressLabel: el.querySelector('.deadeye-progress-info'),
      skullBox: el.querySelector('.deadeye-skull-box')
    };
  }
}
