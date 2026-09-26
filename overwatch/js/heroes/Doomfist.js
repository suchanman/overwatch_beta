/**
 * ============================================================================
 * DOOMFIST (TANK / BRAWLER - Talons Leader) (Doomfist.js)
 * - Hand Cannon (철권포): 4-Shot individual auto-recharge knuckle shotgun (7 pellets)
 * - Rocket Punch (로켓 펀치 / 우클릭): Hold to charge (0~100%), dash & massive knockback
 * - Seismic Slam (지진 강타 / Shift): Forward upward leap, landing shockwave & pull
 * - Rising Uppercut (라이징 어퍼컷 / E): Vertical surge, launches enemies airborne
 * - Meteor Strike (파멸의 일격 / Q): Sky leap, floor dual-ring targeting, crater impact
 * - Passive (최선의 공격은...): Ability damage generates decaying overhealth (+35~75, max +150)
 * ============================================================================
 */

import { HeroBase } from './HeroBase.js';

export class Doomfist extends HeroBase {
  constructor() {
    super('DOOMFIST', 450, 6.6);

    // Passive: The Best Defense... (최선의 공격은...)
    this.maxShields = 150;
    this.shields = 0;
    this.shieldDecayTimer = 0;

    // Hand Cannon (철권포) - 4 Shots with individual sequential auto-recharge
    this.maxAmmo = 4;
    this.ammo = 4;
    this.ammoRegenDelay = 0.65;
    this.ammoRegenTimer = 0;
    this.fireRate = 0.32;
    this.fireTimer = 0;

    // Rocket Punch (로켓 펀치 / 우클릭)
    this.punchCooldown = 4.0;
    this.punchCooldownTimer = 0;
    this.isChargingPunch = false;
    this.punchChargeTime = 0;
    this.punchMaxChargeTime = 1.30;
    this.punchChargeRatio = 0;
    this.isPunchDashing = false;
    this.punchDashTimer = 0;
    this.punchDashDuration = 0.40;
    this.punchVelocity = new THREE.Vector3();
    this.punchedTargets = new Set();

    // Ability 1: Seismic Slam (지진 강타 / Shift)
    this.ability1Cooldown = 6.0;
    this.isSlamming = false;
    this.slamAirTimer = 0;
    this.slamVelocity = new THREE.Vector3();
    this.slamOriginY = 0;
    this.slamElapsed = 0;
    this.slamMinAirTime = 0.22;

    // Ability 2: Rising Uppercut (라이징 어퍼컷 / E)
    this.ability2Cooldown = 6.0;
    this.isUppercutting = false;
    this.uppercutTimer = 0;
    this.uppercutVelocityY = 0;

    // Ultimate: Meteor Strike (파멸의 일격 / Q)
    this.isMeteorActive = false;
    this.meteorPhase = 'IDLE'; // 'TARGETING' | 'STRIKING'
    this.meteorTargetPos = new THREE.Vector3();
    this.meteorTimer = 0;
    this.meteorReticleGroup = null;

    // 1st-Person Viewmodel Handles
    this.defaultLeftArmPos = new THREE.Vector3(-0.28, -0.28, -0.42);
    this.defaultLeftArmRot = new THREE.Euler(0.12, 0.18, -0.15, 'YXZ');
    this.defaultRightFistPos = new THREE.Vector3(0.28, -0.28, -0.45);
    this.defaultRightFistRot = new THREE.Euler(0.18, -0.22, 0.15, 'YXZ');

    this.leftArmGroup = null;
    this.rightFistGroup = null;
    this.knuckleGlows = [];
    this.fistSpikeMeshes = [];
    this.ventGlowMeshes = [];

    this.idleTime = 0;
    this.punchAnimProgress = 0;
    this.uppercutAnimProgress = 0;

    this.buildWeaponModel();
  }

  // ==========================================================================
  // PASSIVE: THE BEST DEFENSE... (임시 보호막 생성 & 감쇄)
  // ==========================================================================
  addOverhealth(amount) {
    this.shields = Math.min(this.maxShields, this.shields + amount);
    this.shieldDecayTimer = 3.0; // Decay begins after 3s
  }

  takeDamage(amount) {
    let remainingDamage = amount;
    if (this.shields > 0) {
      if (this.shields >= remainingDamage) {
        this.shields -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= this.shields;
        this.shields = 0;
      }
    }

    if (remainingDamage > 0) {
      return super.takeDamage(remainingDamage);
    }
    return false;
  }

  // ==========================================================================
  // 1ST-PERSON VIEWMODEL: LEFT HAND CANNON & RIGHT GOLDEN GAUNTLET
  // ==========================================================================
  buildWeaponModel() {
    this.weaponGroup = new THREE.Group();

    // High-tech Overwatch Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.55, metalness: 0.1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.28, metalness: 0.88 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xa0a0a0, roughness: 0.35, metalness: 0.85 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });
    const glowBlueMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const glowRedMat = new THREE.MeshBasicMaterial({ color: 0xff1100 });

    // 1. LEFT HAND: Hand Cannon Knuckle Blaster
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.copy(this.defaultLeftArmPos);
    this.leftArmGroup.rotation.copy(this.defaultLeftArmRot);
    this.weaponGroup.add(this.leftArmGroup);

    // Left forearm
    const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.32, 16), darkMetalMat);
    lForearm.rotation.x = Math.PI / 2;
    this.leftArmGroup.add(lForearm);

    const lPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.24, 16, 1, false, 0, Math.PI), silverMat);
    lPlate.rotation.x = Math.PI / 2;
    lPlate.rotation.y = Math.PI / 2;
    this.leftArmGroup.add(lPlate);

    // Left Fist (Hand Cannon)
    const lFist = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.12), darkMetalMat);
    lFist.position.set(0, 0, -0.18);
    this.leftArmGroup.add(lFist);

    // 4 Knuckle Barrels & Cyan Glowing Muzzle Ports
    this.knuckleGlows = [];
    for (let i = 0; i < 4; i++) {
      const offsetX = -0.033 + (i * 0.022);
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.035, 12), silverMat);
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(offsetX, 0.015, -0.24);
      this.leftArmGroup.add(barrel);

      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 8), glowBlueMat);
      glow.position.set(offsetX, 0.015, -0.26);
      this.leftArmGroup.add(glow);
      this.knuckleGlows.push(glow);
    }

    // 2. RIGHT HAND: Iconic Giant Golden Gauntlet
    this.rightFistGroup = new THREE.Group();
    this.rightFistGroup.position.copy(this.defaultRightFistPos);
    this.rightFistGroup.rotation.copy(this.defaultRightFistRot);
    this.weaponGroup.add(this.rightFistGroup);

    // Massive Golden Gauntlet Arm Sleeve
    const gauntletBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.38, 20), darkMetalMat);
    gauntletBase.rotation.x = Math.PI / 2;
    this.rightFistGroup.add(gauntletBase);

    const goldPlating = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.095, 0.34, 20, 1, false, 0, Math.PI), goldMat);
    goldPlating.rotation.x = Math.PI / 2;
    goldPlating.rotation.y = Math.PI / 2;
    this.rightFistGroup.add(goldPlating);

    // Giant Reinforced Knuckle Guard
    const knuckleGuard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.14), goldMat);
    knuckleGuard.position.set(0, 0.02, -0.22);
    this.rightFistGroup.add(knuckleGuard);

    // Knuckle Spikes
    this.fistSpikeMeshes = [];
    for (let i = 0; i < 3; i++) {
      const spikeX = -0.055 + (i * 0.055);
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.065, 12), silverMat);
      spike.rotation.x = -Math.PI / 2;
      spike.position.set(spikeX, 0.02, -0.31);
      this.rightFistGroup.add(spike);
      this.fistSpikeMeshes.push(spike);

      const ventRing = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.005, 8, 16), glowRedMat);
      ventRing.position.set(spikeX, 0.02, -0.28);
      this.rightFistGroup.add(ventRing);
      this.ventGlowMeshes.push(ventRing);
    }

    // Heavy thumb knuckle
    const thumbKnuckle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.10), goldMat);
    thumbKnuckle.position.set(-0.095, -0.01, -0.19);
    thumbKnuckle.rotation.z = -0.4;
    this.rightFistGroup.add(thumbKnuckle);
  }

  // ==========================================================================
  // PRIMARY ATTACK: HAND CANNON (철권포 7발 산탄)
  // ==========================================================================
  primaryFire(camera, scene, projectiles, audio, shaker, map) {
    if (this.ammo <= 0 || this.fireTimer > 0 || this.isChargingPunch || this.isPunchDashing || this.isMeteorActive) {
      return null;
    }

    this.ammo--;
    this.fireTimer = this.fireRate;
    this.ammoRegenTimer = this.ammoRegenDelay;

    // Recoil animation on left arm
    if (this.leftArmGroup) {
      this.leftArmGroup.position.z += 0.08;
      this.leftArmGroup.position.y += 0.02;
      this.leftArmGroup.rotation.x -= 0.15;
    }

    if (audio) {
      if (typeof audio.playHandCannon === 'function') audio.playHandCannon();
      else if (typeof audio.playShotgun === 'function') audio.playShotgun();
      else audio.playPrimaryFire();
    }

    if (shaker) shaker.addTrauma(0.12);

    // Spawn 7-pellet shotgun blast
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const origin = camera.position.clone().addScaledVector(right, -0.22).addScaledVector(up, -0.18).addScaledVector(forward, 0.4);

    const pelletCount = 7;
    const pelletDmg = 15; // 7 * 15 = 105 max
    const spreadPatterns = [
      [0, 0],
      [0.035, 0.025],
      [-0.035, 0.025],
      [0.045, -0.03],
      [-0.045, -0.03],
      [0.0, 0.045],
      [0.0, -0.045]
    ];

    if (projectiles && typeof projectiles.spawnDoomfistPellet === 'function') {
      spreadPatterns.forEach(([sx, sy]) => {
        const dir = forward.clone().addScaledVector(right, sx).addScaledVector(up, sy).normalize();
        projectiles.spawnDoomfistPellet(origin, dir, pelletDmg, (target, dmg, head, kill) => {
          this.addUltCharge(dmg * 0.15);
        });
      });
    }

    return {
      raycaster: new THREE.Raycaster(camera.position, forward, 0, 22),
      damage: 15,
      isHeadshotMultiplier: 1.5,
      isHandCannon: true
    };
  }

  // ==========================================================================
  // SECONDARY ATTACK: ROCKET PUNCH (로켓 펀치 충전 & 돌진)
  // ==========================================================================
  startRocketPunchCharge(audio) {
    if (this.punchCooldownTimer > 0 || this.isPunchDashing || this.isSlamming || this.isUppercutting || this.isMeteorActive) {
      return false;
    }
    this.isChargingPunch = true;
    this.punchChargeTime = 0;
    this.punchChargeRatio = 0;
    if (audio) {
      if (typeof audio.playRocketPunchCharge === 'function') audio.playRocketPunchCharge();
      else audio.playUltCharge();
    }
    return true;
  }

  releaseRocketPunch(camera, audio, shaker) {
    if (!this.isChargingPunch) return false;
    this.isChargingPunch = false;

    // Minimum charge threshold
    const ratio = Math.max(0.2, this.punchChargeRatio);
    this.isPunchDashing = true;
    this.punchDashTimer = this.punchDashDuration;
    this.punchedTargets.clear();
    this.punchCooldownTimer = this.punchCooldown;

    // Forward direction from camera
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    // Dash speed: 22m/s to 45m/s
    const speed = THREE.MathUtils.lerp(22.0, 45.0, ratio);
    this.punchVelocity.copy(forward).multiplyScalar(speed);

    if (audio) {
      if (typeof audio.playRocketPunchRelease === 'function') audio.playRocketPunchRelease();
      else audio.playReinhardtCharge();
    }
    if (shaker) shaker.addTrauma(0.18 + ratio * 0.15);

    return true;
  }

  // ==========================================================================
  // ==========================================================================
  // ABILITY 1: SEISMIC SLAM (지진 강타 / Shift)
  // ==========================================================================
  useAbility1(playerPos, moveDir, camera, audio, shaker, allTargets, onHit, projectiles) {
    if (this.ability1Timer > 0 || this.isChargingPunch || this.isPunchDashing || this.isMeteorActive) {
      return false;
    }

    this.ability1Timer = this.ability1Cooldown;
    this.isSlamming = true;
    this.slamAirTimer = 3.5; // Generous air timer so slam never prematurely cuts off in mid-air
    this.slamElapsed = 0;
    this.slamMinAirTime = 0.22;

    // 1. 라이징 어퍼컷 중 사용 시: 어퍼컷 즉시 취소 및 지진강타로 부드럽게 연계
    const wasUppercutting = this.isUppercutting;
    if (this.isUppercutting) {
      this.isUppercutting = false;
      this.uppercutTimer = 0;
      this.uppercutVelocityY = 0;
    }

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    // 2. 지면 vs 공중 판정:
    // - 땅에서 지진강타를 쓰는게 아닐 경우 (어퍼컷 직후 또는 점프/공중 낙하 중):
    //   포물선을 그리며 힘차게 점프 도약(상향 8.5m/s, 전방 22.0m/s) 후 지면을 향해 강하
    // - 땅에서 지진강타를 쓰는 경우:
    //   지면에서 포물선을 그리며 점프 도약(상향 11.5m/s, 전방 21.0m/s)
    const isAirborne = wasUppercutting || playerPos.y > 2.05;

    if (isAirborne) {
      this.slamVelocity.copy(forward).multiplyScalar(22.0);
      this.slamVelocity.y = 8.5; // 공중 포물선 도약 상승 속도
    } else {
      this.slamVelocity.copy(forward).multiplyScalar(21.0);
      this.slamVelocity.y = 11.5; // 지면 포물선 도약 상승 속도
    }

    if (audio) {
      if (typeof audio.playSeismicSlamLeap === 'function') audio.playSeismicSlamLeap();
      else audio.playGenjiDash();
    }
    if (shaker) shaker.addTrauma(0.16);

    return true;
  }

  // ==========================================================================
  // ABILITY 2: RISING UPPERCUT (라이징 어퍼컷 / E)
  // ==========================================================================
  useAbility2(playerPos, camera, audio, shaker, ui, projectiles) {
    if (this.ability2Timer > 0 || this.isChargingPunch || this.isPunchDashing || this.isMeteorActive) {
      return false;
    }

    this.ability2Timer = this.ability2Cooldown;
    this.isUppercutting = true;
    this.uppercutTimer = 0.58;
    this.uppercutVelocityY = 24.0; // High vertical launch (~7-9m up)
    this.uppercutAnimProgress = 1.0;

    if (audio) {
      if (typeof audio.playUppercut === 'function') audio.playUppercut();
      else audio.playTracerBlink();
    }
    if (shaker) shaker.addTrauma(0.24);

    return true;
  }

  // ==========================================================================
  // ULTIMATE: METEOR STRIKE (파멸의 일격 / Q)
  // ==========================================================================
  useUltimate(camera, projectiles, audio, shaker, ui, allTargets, onHit) {
    if (this.ultCharge < 100 || this.isMeteorActive) {
      // If already targeting, Q can confirm strike
      if (this.isMeteorActive && this.meteorPhase === 'TARGETING') {
        return this.confirmMeteorStrike(camera, projectiles, audio, shaker, ui, allTargets, onHit);
      }
      return false;
    }

    this.ultCharge = 0;
    this.isMeteorActive = true;
    this.isUltActive = true;
    this.meteorPhase = 'TARGETING';
    this.meteorTimer = 5.0; // 5 seconds max targeting time

    if (this.weaponGroup) this.weaponGroup.visible = false;

    if (audio) {
      if (typeof audio.playMeteorStrikeLaunch === 'function') audio.playMeteorStrikeLaunch();
      else audio.playUltReady();
    }
    if (shaker) shaker.addTrauma(0.3);

    return true;
  }

  confirmMeteorStrike(camera, projectiles, audio, shaker, ui, allTargets, onHit) {
    if (!this.isMeteorActive || this.meteorPhase !== 'TARGETING') return false;

    this.meteorPhase = 'STRIKING';
    this.meteorTimer = 0.65; // Quick supersonic descent

    if (this.meteorReticleGroup) {
      this.meteorReticleGroup.visible = false;
    }

    if (audio) {
      if (typeof audio.playMeteorStrikeImpact === 'function') audio.playMeteorStrikeImpact();
      else audio.playReinhardtShatter();
    }
    if (shaker) shaker.addTrauma(0.65);
    if (ui && typeof ui.triggerUltFlash === 'function') ui.triggerUltFlash();

    return true;
  }

  ensureMeteorReticle(scene) {
    if (this.meteorReticleGroup || !scene) return;

    this.meteorReticleGroup = new THREE.Group();

    // 1. Center / Inner Zone (3.0m radius, 300 damage): Deep dark crimson red
    const innerGeo = new THREE.CircleGeometry(3.0, 48);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626, // Deep Crimson Red
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.rotation.x = -Math.PI / 2;
    innerMesh.position.y = 0.04;
    this.meteorReticleGroup.add(innerMesh);

    // Inner Glowing Ring Border
    const innerRingGeo = new THREE.RingGeometry(2.92, 3.08, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0xff1744,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      depthWrite: false
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.045;
    this.meteorReticleGroup.add(innerRing);

    // 2. Outer Zone (8.5m radius, 50~180 damage): Lighter translucent amber / orange
    const outerGeo = new THREE.RingGeometry(3.08, 8.5, 64);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Lighter Amber Orange
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.rotation.x = -Math.PI / 2;
    outerMesh.position.y = 0.035;
    this.meteorReticleGroup.add(outerMesh);

    // Outer Glowing Border Ring
    const outerRingGeo = new THREE.RingGeometry(8.38, 8.52, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.04;
    this.meteorReticleGroup.add(outerRing);

    // 3. Crosshairs & Targeting Ticks
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const tickGeo = new THREE.PlaneGeometry(0.12, 1.8);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, depthWrite: false });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.rotation.x = -Math.PI / 2;
      tick.rotation.z = angle;
      tick.position.set(Math.cos(angle) * 8.6, 0.045, Math.sin(angle) * 8.6);
      this.meteorReticleGroup.add(tick);

      const inTick = new THREE.Mesh(tickGeo, new THREE.MeshBasicMaterial({ color: 0xff3333, side: THREE.DoubleSide, depthWrite: false }));
      inTick.rotation.x = -Math.PI / 2;
      inTick.rotation.z = angle;
      inTick.position.set(Math.cos(angle) * 3.1, 0.046, Math.sin(angle) * 3.1);
      this.meteorReticleGroup.add(inTick);
    }

    this.meteorReticleGroup.visible = false;
    scene.add(this.meteorReticleGroup);
  }

  // ==========================================================================
  // FRAME UPDATE LOOP
  // ==========================================================================
  update(dt, playerPos, camera, projectiles, audio, allTargets, onHit, shaker, map) {
    super.updateBase(dt);
    this.idleTime += dt;

    // 1. Passive Overhealth Decay
    if (this.shieldDecayTimer > 0) {
      this.shieldDecayTimer -= dt;
    } else if (this.shields > 0) {
      this.shields = Math.max(0, this.shields - (30.0 * dt));
    }

    // 2. Hand Cannon Sequential Auto-Recharge
    if (this.ammo < this.maxAmmo) {
      this.ammoRegenTimer -= dt;
      if (this.ammoRegenTimer <= 0) {
        this.ammo++;
        this.ammoRegenTimer = this.ammoRegenDelay;
        if (audio && typeof audio.playKnuckleRecharge === 'function') audio.playKnuckleRecharge();
      }
    }

    // 3. Rocket Punch Charge Update
    if (this.isChargingPunch) {
      this.punchChargeTime = Math.min(this.punchMaxChargeTime, this.punchChargeTime + dt);
      this.punchChargeRatio = this.punchChargeTime / this.punchMaxChargeTime;

      // Pull right gauntlet back in anticipation
      if (this.rightFistGroup) {
        this.rightFistGroup.position.z = this.defaultRightFistPos.z + this.punchChargeRatio * 0.18;
        this.rightFistGroup.position.x = this.defaultRightFistPos.x + this.punchChargeRatio * 0.05;
        this.rightFistGroup.rotation.y = this.defaultRightFistRot.y - this.punchChargeRatio * 0.25;
      }
    } else if (this.punchCooldownTimer > 0) {
      this.punchCooldownTimer -= dt;
    }

    // 4. Rocket Punch Dash Update & Target Collision Sweep
    if (this.isPunchDashing) {
      this.punchDashTimer -= dt;
      playerPos.addScaledVector(this.punchVelocity, dt);

      // Gauntlet forward punch thrust
      if (this.rightFistGroup) {
        this.rightFistGroup.position.z = this.defaultRightFistPos.z - 0.28;
        this.rightFistGroup.rotation.x = -0.15;
      }

      // Check collision with enemies along dash path
      allTargets.forEach((target) => {
        if (target.isDead || this.punchedTargets.has(target)) return;
        const targetPos = target.group ? target.group.position : target.position;
        if (!targetPos) return;

        const horizDist = Math.hypot(targetPos.x - playerPos.x, targetPos.z - playerPos.z);
        const vertDist = Math.abs(playerPos.y - (targetPos.y + 1.1));

        if (horizDist <= 2.8 && vertDist <= 2.4) {
          this.punchedTargets.add(target);
          const ratio = Math.max(0.2, this.punchChargeRatio);
          const dmg = Math.round(THREE.MathUtils.lerp(90, 240, ratio));

          // 1. Halt punch dash immediately on impact (do not pass through)
          this.isPunchDashing = false;
          this.punchDashTimer = 0;
          this.punchVelocity.set(0, 0, 0);

          // 2. Knockback direction and scaling with charge gauge
          const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
          forward.y = 0;
          forward.normalize();

          const kbForce = THREE.MathUtils.lerp(22.0, 58.0, ratio);
          const kbUp = THREE.MathUtils.lerp(4.0, 12.0, ratio);
          const knockbackDir = forward.clone().multiplyScalar(kbForce).add(new THREE.Vector3(0, kbUp, 0));

          // Apply Knockback
          if (target.applyKnockback) {
            target.applyKnockback(knockbackDir, 1.0);
          } else if (target.velocity) {
            target.velocity.add(knockbackDir);
          }

          const kill = target.takeDamage(dmg, false, forward);
          if (onHit) onHit(target, dmg, false, kill);

          this.addOverhealth(35);
          this.addUltCharge(dmg * 0.2);

          if (projectiles && typeof projectiles.spawnHitSparks === 'function') {
            projectiles.spawnHitSparks(targetPos.clone().add(new THREE.Vector3(0, 1.0, 0)), forward, 0xff9900);
          }

          if (audio) {
            if (typeof audio.playHeavyPunchHit === 'function') audio.playHeavyPunchHit();
            else audio.playHit(false);
          }
          if (shaker) shaker.addTrauma(0.35 + ratio * 0.2);
        }
      });

      if (this.punchDashTimer <= 0) {
        this.isPunchDashing = false;
      }
    }

    // 5. Seismic Slam In-Air Progress (Parabolic leap -> Impact Shockwave)
    if (this.isSlamming) {
      this.slamElapsed += dt;
      this.slamAirTimer -= dt;
      playerPos.addScaledVector(this.slamVelocity, dt);
      this.slamVelocity.y -= 28.0 * dt; // gravity arc

      // 맵 실제 지면 높이 획득 (eye height 기준: 도로 바닥 0.0일 때 groundY = 1.7)
      const col = (map && typeof map.resolveCollision === 'function')
        ? map.resolveCollision(playerPos, 0.55)
        : { groundY: 1.7 };
      const groundY = col.groundY;

      const isDescending = this.slamVelocity.y < 0;
      // 실제 땅(groundY)에 도달했는지 확인 (공중에서 임의로 터지지 않고 실제 바닥에 닿았을 때만 착지)
      const reachedGround = playerPos.y <= groundY + 0.15;
      const timedOut = this.slamAirTimer <= 0;

      // Only land when descending and past minimum airtime upon reaching true map ground (or emergency timeout)
      if (this.slamElapsed >= this.slamMinAirTime && ((reachedGround && isDescending) || (playerPos.y <= groundY) || timedOut)) {
        this.isSlamming = false;
        playerPos.y = groundY;

        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        forward.y = 0;
        forward.normalize();

        // 1. Calculate floor surface level and place shockwave in front of Doomfist at ground level
        const floorSurfaceY = groundY - 1.7;
        const shockwaveOrigin = new THREE.Vector3(playerPos.x, Math.max(0.04, floorSurfaceY + 0.05), playerPos.z).addScaledVector(forward, 0.8);

        // Landing Impact: Visual Ground Shockwave
        if (projectiles && typeof projectiles.spawnSeismicShockwave === 'function') {
          projectiles.spawnSeismicShockwave(shockwaveOrigin, forward, 10.0);
        }

        if (audio) {
          if (typeof audio.playSeismicSlamImpact === 'function') audio.playSeismicSlamImpact();
          else audio.playReinhardtShatter();
        }
        if (shaker) shaker.addTrauma(0.42);

        // 2. Damage enemies hit by shockwave (Enemies must NOT be lifted into air; pure damage only)
        allTargets.forEach((target) => {
          if (target.isDead) return;
          const targetPos = target.group ? target.group.position : target.position;
          if (!targetPos) return;

          const horizDist = Math.hypot(targetPos.x - playerPos.x, targetPos.z - playerPos.z);
          const vertDist = Math.abs(playerPos.y - (targetPos.y + 1.1));
          if (horizDist <= 10.0 && vertDist <= 3.5) {
            const toTarget = new THREE.Vector3(targetPos.x - playerPos.x, 0, targetPos.z - playerPos.z).normalize();
            if (forward.dot(toTarget) > 0.35) { // ~70 degree frontal fan
              const dmg = Math.round(THREE.MathUtils.lerp(50, 95, 1 - horizDist / 10.0));
              // Pure shockwave damage without vertical lift
              const kill = target.takeDamage(dmg, false, forward);
              if (onHit) onHit(target, dmg, false, kill);
              this.addOverhealth(35);
              this.addUltCharge(dmg * 0.2);
            }
          }
        });
      }
    }

    // 6. Rising Uppercut In-Air Progress (High leap & synchronized enemy lift)
    if (this.isUppercutting) {
      this.uppercutTimer -= dt;
      playerPos.y += this.uppercutVelocityY * dt;
      this.uppercutVelocityY -= 24.0 * dt;

      // Frontal airborne lift check
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      allTargets.forEach((target) => {
        if (target.isDead) return;
        const targetPos = target.group ? target.group.position : target.position;
        if (!targetPos) return;

        const horizDist = Math.hypot(targetPos.x - playerPos.x, targetPos.z - playerPos.z);
        const vertDist = Math.abs(playerPos.y - (targetPos.y + 1.1));
        if (horizDist <= 4.2 && vertDist <= 3.0) {
          const toTarget = new THREE.Vector3(targetPos.x - playerPos.x, 0, targetPos.z - playerPos.z).normalize();
          if (forward.dot(toTarget) > 0.2 || horizDist < 2.5) {
            const dmg = 80;
            // Launch the enemy up to the same height!
            const lift = new THREE.Vector3(0, Math.max(22.0, this.uppercutVelocityY + 4.0), 0).addScaledVector(forward, 2.0);
            if (target.applyKnockback) {
              target.applyKnockback(lift, 1.0);
            } else if (target.velocity) {
              target.velocity.y = Math.max(target.velocity.y, lift.y);
            }
            if (target.group && target.group.position.y < playerPos.y) {
              target.group.position.y = THREE.MathUtils.lerp(target.group.position.y, playerPos.y, 0.7);
            }

            const kill = target.takeDamage(dmg, false, forward);
            if (onHit) onHit(target, dmg, false, kill);
            this.addOverhealth(35);
            this.addUltCharge(dmg * 0.2);
          }
        }
      });

      if (this.uppercutTimer <= 0) {
        this.isUppercutting = false;
      }
    }

    // 7. Meteor Strike Targeting & Impact
    if (this.isMeteorActive) {
      if (this.meteorPhase === 'TARGETING') {
        this.meteorTimer -= dt;

        // Ground targeting position follows player pos
        this.meteorTargetPos.set(playerPos.x, 0.05, playerPos.z);

        const scene = (projectiles && projectiles.scene) ? projectiles.scene : null;
        if (scene) this.ensureMeteorReticle(scene);

        if (this.meteorReticleGroup) {
          this.meteorReticleGroup.visible = true;
          this.meteorReticleGroup.position.set(playerPos.x, 0.04, playerPos.z);
          this.meteorReticleGroup.rotation.y += dt * 0.6;
        }

        if (this.meteorTimer <= 0) {
          this.confirmMeteorStrike(camera, projectiles, audio, shaker, null, allTargets, onHit);
        }
      } else if (this.meteorPhase === 'STRIKING') {
        this.meteorTimer -= dt;

        if (this.meteorReticleGroup) {
          this.meteorReticleGroup.visible = false;
        }

        if (this.meteorTimer <= 0) {
          this.isMeteorActive = false;
          this.isUltActive = false;
          this.meteorPhase = 'IDLE';
          if (this.weaponGroup) this.weaponGroup.visible = true;

          // Impact Blast Damage & Ground Crater VFX
          playerPos.copy(this.meteorTargetPos);
          playerPos.y = 1.7;

          if (projectiles && typeof projectiles.spawnMeteorImpactCrater === 'function') {
            projectiles.spawnMeteorImpactCrater(this.meteorTargetPos, 3.0, 8.5);
          }

          allTargets.forEach((target) => {
            if (target.isDead) return;
            const targetPos = target.group ? target.group.position : target.position;
            if (!targetPos) return;

            const horizDist = Math.hypot(targetPos.x - this.meteorTargetPos.x, targetPos.z - this.meteorTargetPos.z);
            if (horizDist <= 8.5) {
              const dmg = horizDist <= 3.0 ? 300 : Math.round(THREE.MathUtils.lerp(180, 50, (horizDist - 3.0) / 5.5));
              const blastDir = targetPos.clone().sub(this.meteorTargetPos).normalize().add(new THREE.Vector3(0, 0.6, 0)).normalize();
              if (target.applyKnockback) target.applyKnockback(blastDir, 28.0);
              const kill = target.takeDamage(dmg, false, blastDir);
              if (onHit) onHit(target, dmg, false, kill);
              this.addOverhealth(75);
            }
          });
        }
      }
    }

    // 8. Dynamic 1st-Person Weapon Viewmodel Settle & Breathing
    this.updateWeaponAnimation(dt);
  }

  updateWeaponAnimation(dt) {
    if (!this.leftArmGroup || !this.rightFistGroup) return;

    // Idle breathing & natural lag
    const breathY = Math.sin(this.idleTime * 2.2) * 0.006;
    const breathX = Math.cos(this.idleTime * 1.5) * 0.004;

    if (!this.isChargingPunch && !this.isPunchDashing) {
      this.rightFistGroup.position.lerp(
        this.defaultRightFistPos.clone().add(new THREE.Vector3(breathX, breathY, 0)),
        dt * 8.0
      );
      this.rightFistGroup.rotation.x = THREE.MathUtils.lerp(this.rightFistGroup.rotation.x, this.defaultRightFistRot.x, dt * 8.0);
      this.rightFistGroup.rotation.y = THREE.MathUtils.lerp(this.rightFistGroup.rotation.y, this.defaultRightFistRot.y, dt * 8.0);
    }

    this.leftArmGroup.position.lerp(
      this.defaultLeftArmPos.clone().add(new THREE.Vector3(-breathX, breathY, 0)),
      dt * 10.0
    );
    this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, this.defaultLeftArmRot.x, dt * 10.0);

    // Knuckle lights status: cyan when loaded, dim when empty
    for (let i = 0; i < 4; i++) {
      if (this.knuckleGlows[i]) {
        this.knuckleGlows[i].visible = i < this.ammo;
      }
    }
  }
}
