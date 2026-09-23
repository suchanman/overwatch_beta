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

import { HeroBase } from './HeroBase.js';

export class Tracer extends HeroBase {
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

  primaryFire(camera, scene, projectileManager, audio, shaker) {
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

    // Bullet laser tracer beam
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.5));
    const hitTargetEnd = origin.clone().add(forward.clone().multiplyScalar(40));
    projectileManager.addBulletBeam(origin, hitTargetEnd, 0x00f0ff);

    return { raycaster, damage: 6, isHeadshotMultiplier: 2.0 };
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
