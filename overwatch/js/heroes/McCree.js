/**
 * ============================================================================
 * MCCREE (CASSIDY) - DAMAGE HERO (Bounty Hunter / Gunslinger)
 * - Peacekeeper Revolver: 6-Round heavy precision revolver (70 DMG / 140 Headshot)
 * - Fan the Hammer: Rapidly empties all remaining rounds in the cylinder
 * - Combat Roll (Shift): Quick directional dodge roll + INSTANT RELOAD (6.0s CD)
 * - Flashbang (E): Throws tactical stun grenade that explodes on impact / fuse (8.0s CD)
 * - Deadeye (Q): "석양이 진다... (It's High Noon)", locks onto enemies in line of sight
 * ============================================================================
 */

import { HeroBase } from './HeroBase.js';

export class McCree extends HeroBase {
  constructor() {
    super('MCCREE', 450, 6.0);

    // Peacekeeper 6-Round Cylinder
    this.maxAmmo = 6;
    this.ammo = 6;
    this.reloadDuration = 1.4;

    // Primary Fire Timing
    this.fireRate = 0.50; // 120 RPM precision fire
    this.fireTimer = 0;

    // Fan the Hammer (Secondary Fire Burst)
    this.isFanning = false;
    this.fanQueue = 0;
    this.fanInterval = 0.11; // 6 shots in ~0.66s
    this.fanTimer = 0;

    // Ability 1: Combat Roll (Shift)
    this.ability1Cooldown = 6.0;
    this.isRolling = false;
    this.rollDuration = 0.35;
    this.rollTimer = 0;
    this.rollDirection = new THREE.Vector3(0, 0, -1);
    this.rollSpeed = 18.5; // ~6.5m dodge distance

    // Ability 2: Flashbang (E)
    this.ability2Cooldown = 8.0;

    // Ultimate: Deadeye (Q)
    this.isDeadeyeActive = false;
    this.deadeyeDuration = 6.0;
    this.deadeyeTimer = 0;
    this.deadeyeTargets = new Map(); // target -> { lockTime: 0, damage: 0, isLocked: false, isLethal: false }
    this.deadeyeFiringQueue = [];
    this.deadeyeFireInterval = 0.14;
    this.deadeyeFireTimer = 0;

    // 1st-Person Weapon Viewmodel
    this.defaultWeaponPos = new THREE.Vector3(0.24, -0.26, -0.42);
    this.defaultWeaponRot = new THREE.Euler(0.04, -0.06, 0.02, 'YXZ');
    this.recoilOffset = new THREE.Vector3(0, 0, 0);
    this.recoilRot = new THREE.Euler(0, 0, 0, 'YXZ');

    this.buildWeaponModel();
  }

  // ==========================================================================
  // 1ST-PERSON PEACEKEEPER VIEWMODEL
  // ==========================================================================
  buildWeaponModel() {
    this.weaponGroup = new THREE.Group();
    this.weaponGroup.position.copy(this.defaultWeaponPos);
    this.weaponGroup.rotation.copy(this.defaultWeaponRot);

    // Materials
    const gunSteelMat = new THREE.MeshStandardMaterial({
      color: 0x3f444a,
      metalness: 0.88,
      roughness: 0.22
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1e2124,
      metalness: 0.92,
      roughness: 0.35
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8dc,
      metalness: 0.90,
      roughness: 0.18
    });
    const woodGripMat = new THREE.MeshStandardMaterial({
      color: 0x59341b,
      metalness: 0.10,
      roughness: 0.50
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25
    });
    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0x3d281a,
      metalness: 0.20,
      roughness: 0.70
    });
    const mechMat = new THREE.MeshStandardMaterial({
      color: 0x949ba3,
      metalness: 0.82,
      roughness: 0.25
    });
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });

    // 1. Right Hand / Arm (Leather Shooting Glove)
    const armGeo = new THREE.CylinderGeometry(0.048, 0.055, 0.32, 12);
    armGeo.rotateX(Math.PI / 3);
    const armMesh = new THREE.Mesh(armGeo, gloveMat);
    armMesh.position.set(0.04, -0.16, 0.12);
    this.weaponGroup.add(armMesh);

    // Hand gripping the revolver
    const handGeo = new THREE.BoxGeometry(0.07, 0.08, 0.09);
    const handMesh = new THREE.Mesh(handGeo, gloveMat);
    handMesh.position.set(0.01, -0.06, 0.01);
    this.weaponGroup.add(handMesh);

    // 2. Peacekeeper Revolver Main Assembly
    this.gunMeshGroup = new THREE.Group();
    this.weaponGroup.add(this.gunMeshGroup);

    // Wooden Grip with brass star inlay
    const gripGeo = new THREE.BoxGeometry(0.038, 0.12, 0.065);
    const gripMesh = new THREE.Mesh(gripGeo, woodGripMat);
    gripMesh.position.set(0, -0.07, -0.03);
    gripMesh.rotation.x = -0.38;
    this.gunMeshGroup.add(gripMesh);

    const gripStarGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.040, 5);
    gripStarGeo.rotateZ(Math.PI / 2);
    const gripStar = new THREE.Mesh(gripStarGeo, goldMat);
    gripStar.position.set(0, -0.07, -0.03);
    this.gunMeshGroup.add(gripStar);

    // Receiver / Frame
    const frameGeo = new THREE.BoxGeometry(0.046, 0.075, 0.14);
    const frameMesh = new THREE.Mesh(frameGeo, gunSteelMat);
    frameMesh.position.set(0, 0.01, 0.02);
    this.gunMeshGroup.add(frameMesh);

    // 6-Chamber Revolver Cylinder
    this.cylinderGroup = new THREE.Group();
    this.cylinderGroup.position.set(0, 0.012, 0.01);
    this.gunMeshGroup.add(this.cylinderGroup);

    const cylBodyGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.078, 16);
    cylBodyGeo.rotateX(Math.PI / 2);
    const cylBody = new THREE.Mesh(cylBodyGeo, silverMat);
    this.cylinderGroup.add(cylBody);

    // 6 fluted chamber indentations
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const cx = Math.cos(angle) * 0.022;
      const cy = Math.sin(angle) * 0.022;
      const chamberGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.080, 8);
      chamberGeo.rotateX(Math.PI / 2);
      const chamber = new THREE.Mesh(chamberGeo, darkSteelMat);
      chamber.position.set(cx, cy, 0);
      this.cylinderGroup.add(chamber);
    }

    // Long Octagonal Heavy Barrel (Iconic Peacekeeper look)
    const barrelGeo = new THREE.CylinderGeometry(0.026, 0.028, 0.28, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMesh = new THREE.Mesh(barrelGeo, gunSteelMat);
    barrelMesh.position.set(0, 0.026, 0.20);
    this.gunMeshGroup.add(barrelMesh);

    // Barrel Under-rib & Ejector Rod Housing
    const underRibGeo = new THREE.BoxGeometry(0.022, 0.022, 0.22);
    const underRibMesh = new THREE.Mesh(underRibGeo, darkSteelMat);
    underRibMesh.position.set(0, -0.005, 0.17);
    this.gunMeshGroup.add(underRibMesh);

    // Front Blade Sight (Silver)
    const sightGeo = new THREE.BoxGeometry(0.010, 0.025, 0.025);
    const sightMesh = new THREE.Mesh(sightGeo, silverMat);
    sightMesh.position.set(0, 0.055, 0.32);
    this.gunMeshGroup.add(sightMesh);

    // Rear Sight Notch
    const rearSightGeo = new THREE.BoxGeometry(0.022, 0.015, 0.015);
    const rearSight = new THREE.Mesh(rearSightGeo, darkSteelMat);
    rearSight.position.set(0, 0.050, -0.05);
    this.gunMeshGroup.add(rearSight);

    // Revolver Hammer (Striker)
    this.hammerMesh = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.040, 0.025), silverMat);
    this.hammerMesh.position.set(0, 0.048, -0.055);
    this.hammerMesh.rotation.x = -0.35;
    this.gunMeshGroup.add(this.hammerMesh);

    // Trigger Guard & Trigger
    const guardGeo = new THREE.TorusGeometry(0.024, 0.005, 6, 12, Math.PI);
    guardGeo.rotateY(Math.PI / 2);
    const guardMesh = new THREE.Mesh(guardGeo, darkSteelMat);
    guardMesh.position.set(0, -0.035, 0.02);
    this.gunMeshGroup.add(guardMesh);

    // 3. Left Mechanical Prosthetic Hand (Fanning Hand)
    this.fanningHandGroup = new THREE.Group();
    this.fanningHandGroup.position.set(-0.16, 0.18, 0.02);
    this.fanningHandGroup.visible = false;
    this.weaponGroup.add(this.fanningHandGroup);

    const fArmGeo = new THREE.CylinderGeometry(0.040, 0.045, 0.26, 10);
    fArmGeo.rotateZ(Math.PI / 4);
    const fArmMesh = new THREE.Mesh(fArmGeo, mechMat);
    const fGlow = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.015), cyanGlowMat);
    fGlow.rotation.z = Math.PI / 4;
    const fHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.035, 0.09), mechMat);
    fHandMesh.position.set(0.12, -0.10, 0.0);
    this.fanningHandGroup.add(fArmMesh, fGlow, fHandMesh);
  }

  // ==========================================================================
  // PRIMARY FIRE: PEACEKEEPER SINGLE SHOT
  // ==========================================================================
  primaryFire(camera, scene, projectileManager, audio, shaker, map) {
    if (this.isRolling) return null;

    // Check if Deadeye is active - Left click fires all locked targets!
    if (this.isDeadeyeActive) {
      this.fireDeadeye(camera, scene, projectileManager, audio, shaker, map);
      return null;
    }

    if (this.ammo <= 0) {
      this.startReload(audio);
      return null;
    }
    if (this.isReloading || this.fireTimer > 0 || this.isFanning) return null;

    this.ammo--;
    this.fireTimer = this.fireRate;

    // Audio & Screen Shake
    if (audio) audio.playMcCreeShot();
    if (shaker) shaker.addRecoil(0.022);

    // Viewmodel Recoil Animation
    this.recoilOffset.set(0, 0.04, 0.06);
    this.recoilRot.set(0.24, (Math.random() - 0.5) * 0.04, 0.02);

    // Rotate Cylinder 1/6 turn (60 degrees)
    if (this.cylinderGroup) {
      this.cylinderGroup.rotation.z += Math.PI / 3;
    }

    // Hitscan Raycaster
    const raycaster = new THREE.Raycaster();
    const rayOrigin = camera.position.clone();
    const rayDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    raycaster.set(rayOrigin, rayDir);

    // Check wall collision FIRST (Prevents penetrating walls)
    let wallHit = null;
    if (map && typeof map.raycastColliders === 'function') {
      wallHit = map.raycastColliders(raycaster.ray, 55);
    }

    // Local laser beam visualization clipped to wall
    const beamOrigin = camera.position.clone().add(rayDir.clone().multiplyScalar(0.4));
    let beamEnd = beamOrigin.clone().addScaledVector(rayDir, 50);
    if (wallHit && wallHit.hit && wallHit.point) {
      beamEnd = wallHit.point.clone();
    }
    if (projectileManager) {
      projectileManager.addBulletBeam(beamOrigin, beamEnd, 0xffaa44);
    }

    return {
      raycaster,
      damage: 70,
      isHeadshotMultiplier: 2.0,
      range: 55,
      falloffStart: 20,
      falloffEnd: 35,
      wallHit,
      beamEnd
    };
  }

  // ==========================================================================
  // SECONDARY FIRE: FAN THE HAMMER (난사 - 모든 탄약을 사용하는 연사)
  // ==========================================================================
  secondaryFire(camera, scene, projectileManager, audio, shaker, map) {
    if (this.isRolling || this.isReloading) return null;

    // Right-click cancels Deadeye without firing (authentic OW2 mechanic)
    if (this.isDeadeyeActive) {
      this.cancelDeadeye(audio);
      return null;
    }

    if (this.ammo <= 0) {
      this.startReload(audio);
      return null;
    }

    if (this.isFanning) return null;

    // Start Fan the Hammer sequence
    this.isFanning = true;
    this.fanQueue = this.ammo;
    this.fanTimer = 0;

    // Trigger first shot immediately!
    return this.executeFanShot(camera, scene, projectileManager, audio, shaker, map);
  }

  executeFanShot(camera, scene, projectileManager, audio, shaker, map) {
    if (this.ammo <= 0 || this.fanQueue <= 0) {
      this.isFanning = false;
      this.fanQueue = 0;
      if (this.fanningHandGroup) this.fanningHandGroup.visible = false;
      this.startReload(audio);
      return null;
    }

    this.ammo--;
    this.fanQueue--;
    this.fanTimer = this.fanInterval;

    // Audio & Intense Shake
    if (audio) audio.playMcCreeFanShot();
    if (shaker) shaker.addRecoil(0.038);

    // Viewmodel Recoil
    this.recoilOffset.set((Math.random() - 0.5) * 0.02, 0.05, 0.07);
    this.recoilRot.set(0.30 + Math.random() * 0.08, (Math.random() - 0.5) * 0.10, (Math.random() - 0.5) * 0.06);

    // Rotate Cylinder
    if (this.cylinderGroup) {
      this.cylinderGroup.rotation.z += Math.PI / 3;
    }

    // Fanning hand animation toggle
    if (this.fanningHandGroup) {
      this.fanningHandGroup.visible = true;
      this.fanningHandGroup.position.y = 0.08 + Math.random() * 0.04;
    }

    // Fan the Hammer Spread Cone (OW2 Spread)
    const spreadAngle = 0.055;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    const spreadX = (Math.random() - 0.5) * spreadAngle;
    const spreadY = (Math.random() - 0.5) * spreadAngle;
    const rayDir = forward.clone().addScaledVector(right, spreadX).addScaledVector(up, spreadY).normalize();

    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position.clone(), rayDir);

    // Wall collision check (Cannot penetrate walls!)
    let wallHit = null;
    if (map && typeof map.raycastColliders === 'function') {
      wallHit = map.raycastColliders(raycaster.ray, 45);
    }

    // Local laser beam visualization clipped to wall
    const beamOrigin = camera.position.clone().add(rayDir.clone().multiplyScalar(0.4));
    let beamEnd = beamOrigin.clone().addScaledVector(rayDir, 40);
    if (wallHit && wallHit.hit && wallHit.point) {
      beamEnd = wallHit.point.clone();
    }
    if (projectileManager) {
      projectileManager.addBulletBeam(beamOrigin, beamEnd, 0xffaa44);
    }

    if (typeof this.onFanShotFired === 'function') {
      this.onFanShotFired(beamOrigin, beamEnd);
    }

    // End of fan sequence: auto reload
    if (this.ammo <= 0 || this.fanQueue <= 0) {
      this.isFanning = false;
      this.fanQueue = 0;
      if (this.fanningHandGroup) this.fanningHandGroup.visible = false;
      setTimeout(() => {
        if (!this.isReloading && this.ammo === 0) {
          this.startReload(audio);
        }
      }, 250);
    }

    return {
      raycaster,
      damage: 50, // 50 DMG per bullet
      isHeadshotMultiplier: 1.0, // Fan the Hammer CANNOT Headshot in OW2!
      range: 40,
      wallHit,
      beamEnd,
      isFan: true
    };
  }

  // ==========================================================================
  // ABILITY 1: COMBAT ROLL (구르기 + 즉시 재장전)
  // ==========================================================================
  useAbility1(playerPos, moveDir, camera, audio, shaker, allTargets, onHitCallback, projectileManager) {
    if (this.ability1Timer > 0 || this.isRolling) return false;

    this.ability1Timer = this.ability1Cooldown;
    this.isRolling = true;
    this.rollTimer = this.rollDuration;

    // 1. Instant Peacekeeper Reload (Full 6 Rounds!)
    this.ammo = this.maxAmmo;
    this.isReloading = false;
    this.reloadTimer = 0;
    this.isFanning = false;
    this.fanQueue = 0;
    if (this.fanningHandGroup) this.fanningHandGroup.visible = false;

    // 2. Determine Roll Direction (Input Direction relative to camera yaw or forward)
    if (moveDir && (Math.abs(moveDir.x) > 0.1 || Math.abs(moveDir.z) > 0.1)) {
      this.rollDirection.set(moveDir.x, 0, moveDir.z).normalize();
    } else {
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      this.rollDirection.copy(forward.normalize());
    }

    // Audio & Camera Tumble Feel
    if (audio) audio.playMcCreeRoll();
    if (shaker) shaker.addTrauma(0.18);

    return true;
  }

  // ==========================================================================
  // ABILITY 2: FLASHBANG (섬광탄 투척)
  // ==========================================================================
  useAbility2(playerPos, camera, audio, shaker, ui, projectileManager) {
    if (this.ability2Timer > 0 || this.isRolling) return false;

    this.ability2Timer = this.ability2Cooldown;

    if (audio) audio.playFlashbangThrow();
    if (shaker) shaker.addTrauma(0.12);

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().add(forward.clone().multiplyScalar(0.7));

    if (projectileManager) {
      projectileManager.spawnFlashbang(origin, forward, this);
    }

    return true;
  }

  // ==========================================================================
  // ULTIMATE: DEADEYE (황야의 무법자 - "석양이 진다...")
  // ==========================================================================
  useUltimate(camera, projectileManager, audio, shaker, ui, allTargets, onHitCallback) {
    if (this.ultCharge < 100 || this.isRolling) return false;

    this.ultCharge = 0;
    this.isUltActive = true;
    this.isDeadeyeActive = true;
    this.deadeyeTimer = this.deadeyeDuration;
    this.deadeyeTargets.clear();

    // Instant Reload upon activating Deadeye
    this.ammo = this.maxAmmo;
    this.isReloading = false;

    if (audio) {
      audio.playHighNoon();
    }
    if (shaker) shaker.addTrauma(0.25);
    if (ui) ui.triggerUltFlash();

    return true;
  }

  // Fire Deadeye when player left-clicks during Deadeye
  fireDeadeye(camera, scene, projectileManager, audio, shaker, map) {
    if (!this.isDeadeyeActive) return;

    this.isDeadeyeActive = false;
    this.isUltActive = false;

    // Collect all locked targets that have line of sight
    this.deadeyeFiringQueue = [];
    for (const [target, state] of this.deadeyeTargets.entries()) {
      if (!target.isDead && state.damage > 0) {
        this.deadeyeFiringQueue.push({ target, damage: Math.floor(state.damage) });
      }
    }

    // Sort targets from right-to-left for authentic cinematic execution
    this.deadeyeFiringQueue.sort((a, b) => {
      const posA = a.target.group.position;
      const posB = b.target.group.position;
      return posB.x - posA.x;
    });

    this.deadeyeTargets.clear();
  }

  // Cancel Deadeye cleanly
  cancelDeadeye(audio) {
    if (!this.isDeadeyeActive) return;
    this.isDeadeyeActive = false;
    this.isUltActive = false;
    this.deadeyeTargets.clear();
    this.deadeyeFiringQueue = [];
    if (audio && typeof audio.playSelectClick === 'function') {
      audio.playSelectClick();
    }
  }

  // ==========================================================================
  // RELOAD MECHANICS
  // ==========================================================================
  startReload(audio) {
    if (this.isReloading || this.ammo === this.maxAmmo || this.isRolling) return;
    this.isReloading = true;
    this.reloadTimer = this.reloadDuration;
    if (audio) audio.playReload();
  }

  // ==========================================================================
  // 60FPS TICK UPDATE LOOP
  // ==========================================================================
  update(dt, playerPos, camera, projectileManager, audio, allTargets, onHitCallback, shaker, map) {
    this.updateBase(dt);

    if (this.fireTimer > 0) this.fireTimer -= dt;

    // 1. Process Fan the Hammer Burst
    if (this.isFanning && this.fanQueue > 0) {
      this.fanTimer -= dt;
      if (this.fanTimer <= 0) {
        const hitResult = this.executeFanShot(camera, this.weaponGroup.parent, projectileManager, audio, shaker, map);
        if (hitResult && typeof onHitCallback === 'function' && allTargets) {
          // Raycast swept hit check for each fan bullet
          const wallDist = (hitResult.wallHit && hitResult.wallHit.hit) ? hitResult.wallHit.distance : Infinity;
          const hits = [];

          allTargets.forEach((target) => {
            if (target.isDead) return;
            const targetMeshes = target.hitMeshes || [target.bodyMesh, target.headMesh];
            const intersects = hitResult.raycaster.intersectObjects(targetMeshes, true);
            if (intersects.length > 0 && intersects[0].distance < wallDist) {
              hits.push({ target, intersect: intersects[0] });
            }
          });

          if (hits.length > 0) {
            hits.sort((a, b) => a.intersect.distance - b.intersect.distance);
            const target = hits[0].target;
            const finalBlow = target.takeDamage(hitResult.damage, false, hitResult.raycaster.ray.direction);
            onHitCallback(target, hitResult.damage, false, finalBlow);
          }
        }
      }
    }

    // 2. Process Combat Roll Movement
    if (this.isRolling) {
      this.rollTimer -= dt;
      const moveStep = this.rollDirection.clone().multiplyScalar(this.rollSpeed * dt);
      playerPos.add(moveStep);

      // Resolve obstacle/wall collision during roll (DO NOT ROLL THROUGH WALLS)
      if (map && typeof map.resolveCollision === 'function') {
        map.resolveCollision(playerPos, 0.45);
      }

      // Camera Roll Dip Animation
      const rollProgress = 1 - (this.rollTimer / this.rollDuration);
      camera.rotation.z = Math.sin(rollProgress * Math.PI) * 0.12;

      if (this.rollTimer <= 0) {
        this.isRolling = false;
        camera.rotation.z = 0;
      }
    }

    // 3. Process Deadeye Targeting & Lock-on Accumulation
    if (this.isDeadeyeActive) {
      this.deadeyeTimer -= dt;
      const camPos = camera.position.clone();
      const camForward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();

      if (allTargets) {
        allTargets.forEach((target) => {
          if (target.isDead) {
            this.deadeyeTargets.delete(target);
            return;
          }

          const targetCenter = target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
          const toTarget = targetCenter.clone().sub(camPos);
          const dist = toTarget.length();
          const dir = toTarget.clone().normalize();

          // Check Field of View (FOV ~ 85 degrees)
          const dot = camForward.dot(dir);
          const inFOV = dot > 0.55;

          // Check Line of Sight against walls (DO NOT LOCK ON THROUGH WALLS)
          let wallBlocked = false;
          if (map && typeof map.raycastColliders === 'function') {
            const ray = new THREE.Ray(camPos, dir);
            const wallHit = map.raycastColliders(ray, dist);
            if (wallHit && wallHit.hit && wallHit.distance < dist - 0.2) {
              wallBlocked = true;
            }
          }

          if (inFOV && !wallBlocked) {
            let state = this.deadeyeTargets.get(target);
            if (!state) {
              state = {
                lockTime: 0,
                damage: 0,
                isLocked: true,
                isLethal: false,
                wasLethal: false,
                target: target
              };
              this.deadeyeTargets.set(target, state);
              if (audio && typeof audio.playDeadeyeLock === 'function') {
                audio.playDeadeyeLock();
              }
            }
            state.lockTime += dt;
            // Overwatch 2 Deadeye damage ramp: 130 DMG/s for the first 1.0s, then 260 DMG/s
            const rampRate = state.lockTime > 1.0 ? 260 : 130;
            state.damage = Math.min(1000, state.damage + rampRate * dt);

            const targetHp = (target.hp !== undefined) ? target.hp : 200;
            const isLethalNow = state.damage >= targetHp;

            if (isLethalNow && !state.wasLethal) {
              state.wasLethal = true;
              if (audio && typeof audio.playDeadeyeLethalLock === 'function') {
                audio.playDeadeyeLethalLock();
              }
            }
            state.isLethal = isLethalNow;
          } else {
            // Lost line of sight behind wall or out of view: reset lock
            this.deadeyeTargets.delete(target);
          }
        });
      }

      // Auto-fire when Deadeye duration ends
      if (this.deadeyeTimer <= 0) {
        this.fireDeadeye(camera, this.weaponGroup.parent, projectileManager, audio, shaker, map);
      }
    }

    // 4. Process Deadeye Sequential Firing Queue
    if (this.deadeyeFiringQueue.length > 0) {
      this.deadeyeFireTimer -= dt;
      if (this.deadeyeFireTimer <= 0) {
        this.deadeyeFireTimer = this.deadeyeFireInterval;
        const shot = this.deadeyeFiringQueue.shift();

        if (shot && !shot.target.isDead) {
          const targetCenter = shot.target.group.position.clone().add(new THREE.Vector3(0, 1.2, 0));
          const camPos = camera.position.clone();
          const toTarget = targetCenter.clone().sub(camPos);
          const dist = toTarget.length();
          const dir = toTarget.clone().normalize();

          // Final wall check at time of firing
          let wallBlocked = false;
          if (map && typeof map.raycastColliders === 'function') {
            const ray = new THREE.Ray(camPos, dir);
            const wallHit = map.raycastColliders(ray, dist);
            if (wallHit && wallHit.hit && wallHit.distance < dist - 0.2) {
              wallBlocked = true;
            }
          }

          if (!wallBlocked) {
            // Lethal golden beam
            if (projectileManager) {
              projectileManager.addBulletBeam(camPos, targetCenter, 0xfacc15);
            }
            if (audio) audio.playDeadeyeShot();
            if (shaker) shaker.addRecoil(0.045);
            if (typeof this.onDeadeyeShotFired === 'function') {
              this.onDeadeyeShotFired(camPos, targetCenter);
            }

            const finalBlow = shot.target.takeDamage(shot.damage, true, dir);
            if (typeof onHitCallback === 'function') {
              onHitCallback(shot.target, shot.damage, true, finalBlow);
            }
          }
        }
      }
    }

    // 5. Reload Processing
    if (this.isReloading) {
      this.reloadTimer -= dt;
      // Cylinder spin animation
      if (this.cylinderGroup) {
        this.cylinderGroup.rotation.z += 16 * dt;
      }
      if (this.reloadTimer <= 0) {
        this.ammo = this.maxAmmo;
        this.isReloading = false;
      }
    }

    // 6. Viewmodel Recoil & Breathing Recovery
    this.recoilOffset.lerp(new THREE.Vector3(0, 0, 0), 0.18);
    this.recoilRot.x = THREE.MathUtils.lerp(this.recoilRot.x, 0, 0.16);
    this.recoilRot.y = THREE.MathUtils.lerp(this.recoilRot.y, 0, 0.16);
    this.recoilRot.z = THREE.MathUtils.lerp(this.recoilRot.z, 0, 0.16);

    // Hammer spring recovery
    if (this.hammerMesh) {
      this.hammerMesh.rotation.x = THREE.MathUtils.lerp(this.hammerMesh.rotation.x, -0.35, 0.2);
    }

    this.weaponGroup.position.copy(this.defaultWeaponPos).add(this.recoilOffset);
    this.weaponGroup.rotation.set(
      this.defaultWeaponRot.x + this.recoilRot.x,
      this.defaultWeaponRot.y + this.recoilRot.y,
      this.defaultWeaponRot.z + this.recoilRot.z
    );
  }
}
