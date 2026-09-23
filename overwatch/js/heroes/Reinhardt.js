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

import { HeroBase } from './HeroBase.js';

export class Reinhardt extends HeroBase {
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

    // Barrier Shield (Right Click)
    this.maxShieldHp = 2000;
    this.shieldHp = 2000;
    this.isShieldActive = false;

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
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00c3ff,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
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
    this.isShieldActive = active;
    this.shieldMesh.visible = active;
    this.hammerGroup.visible = !active;
    if (this.cleaveArc) this.cleaveArc.visible = false;
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

  update(dt, playerPos, camera, projectiles, audio, bots, onHitCallback, shaker, map) {
    this.updateBase(dt);
    this.idleTime += dt;

    if (this.swingCooldownTimer > 0) {
      this.swingCooldownTimer -= dt;
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
