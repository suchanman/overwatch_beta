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

import { HeroBase } from './HeroBase.js';

export class Genji extends HeroBase {
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

    if (audio) audio.playGenjiDeflect();
    if (shaker) shaker.addTrauma(0.2);
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
    this.katanaGroup.position.copy(this.katanaIdlePos);
    this.katanaGroup.rotation.copy(this.katanaIdleRot);

    this.savedUiManager = uiManager;
    if (uiManager && typeof uiManager.triggerDragonbladeAura === 'function') {
      uiManager.triggerDragonbladeAura(true);
    }
    return true;
  }

  onEnemyEliminated() {
    // SWIFT STRIKE RESET PASSIVE!
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

    // 2. Deflect Timer
    if (this.isDeflecting) {
      this.deflectTimer -= dt;
      if (this.deflectTimer <= 0) {
        this.isDeflecting = false;
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
