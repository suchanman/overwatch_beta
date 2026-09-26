import { buildReinhardtModel, buildTracerModel, buildGenjiModel, buildMcCreeModel, buildDoomfistModel, animateHeroWalk } from './HeroModels.js';

export class RemotePlayer {
  constructor(scene, playerData) {
    this.scene = scene;
    this.id = playerData.id;
    this.name = playerData.name || '플레이어';
    this.heroKey = playerData.hero || 'tracer';

    this.maxHp = playerData.maxHp || (this.heroKey === 'reinhardt' ? 1000 : (this.heroKey === 'doomfist' ? 450 : (this.heroKey === 'mccree' ? 450 : (this.heroKey === 'genji' ? 400 : 300))));
    this.hp = playerData.hp !== undefined ? playerData.hp : this.maxHp;
    this.trailingHp = this.hp;
    this.trailDelay = 0;

    this.isDead = !!playerData.isDead;
    this.isShieldActive = false;

    // Movement interpolation targets (pos.y from client is eye height = 1.7m; offset to ground)
    const initX = (playerData.pos && playerData.pos[0] !== undefined) ? playerData.pos[0] : 0;
    const initY = (playerData.pos && playerData.pos[1] !== undefined) ? playerData.pos[1] - 1.7 : 0;
    const initZ = (playerData.pos && playerData.pos[2] !== undefined) ? playerData.pos[2] : 0;
    this.targetPos = new THREE.Vector3(initX, initY, initZ);
    this.targetYaw = (playerData.rot && playerData.rot[1]) || 0;
    this.targetPitch = (playerData.rot && playerData.rot[0]) || 0;

    // Hit reaction & Knockback physics
    this.flashTimer = 0;
    this.flashMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.squashScale = new THREE.Vector3(1, 1, 1);
    this.targetSquash = new THREE.Vector3(1, 1, 1);
    this.knockbackVelocity = new THREE.Vector3();
    this.isAirborne = false;

    // Root 3D Group
    this.group = new THREE.Group();
    this.group.position.copy(this.targetPos);
    this.group.rotation.y = this.targetYaw;

    // Walk animation state & displacement tracking
    this.animNodes = null;
    this.walkTime = 0;
    this.lastPos = this.group.position.clone();
    this.hammerSwingTimer = 0;
    this.rollTimer = 0;
    this.punchTimer = 0;

    // Model parts
    this.modelGroup = new THREE.Group();
    this.modelGroup.rotation.y = Math.PI; // Face forward in player look direction
    this.group.add(this.modelGroup);

    this.headMesh = null;
    this.bodyMesh = null;
    this.shieldMesh = null;
    this.hitMeshes = [];
    this.origMaterials = new Map();

    // Overhead HUD Canvas Billboard
    this.billboardMesh = null;
    this.hudCanvas = null;
    this.hudContext = null;
    this.hudTexture = null;

    this.buildModel(this.heroKey);
    this.buildOverheadHUD();

    // High-Visibility Red Enemy Tactical Ring on ground (Overwatch enemy target indicator)
    const ringGeo = new THREE.RingGeometry(0.65, 0.78, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
    this.targetRing = new THREE.Mesh(ringGeo, ringMat);
    this.targetRing.rotation.x = -Math.PI / 2;
    this.targetRing.position.y = 0.03;
    this.group.add(this.targetRing);

    this.scene.add(this.group);
  }

  // ==========================================================================
  // 3D HIGH-FIDELITY OVERWATCH HERO MODELS (HeroModels.js)
  // ==========================================================================
  buildModel(heroKey) {
    // Clear old model parts if switching heroes
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }
    this.hitMeshes = [];
    this.origMaterials.clear();
    this.shieldMesh = null;
    this.animNodes = null;

    let modelData;
    if (heroKey === 'reinhardt') {
      modelData = buildReinhardtModel(this.modelGroup);
      this.shieldMesh = modelData.shieldMesh;
    } else if (heroKey === 'mccree') {
      modelData = buildMcCreeModel(this.modelGroup);
    } else if (heroKey === 'doomfist') {
      modelData = buildDoomfistModel(this.modelGroup);
    } else if (heroKey === 'genji') {
      modelData = buildGenjiModel(this.modelGroup);
    } else {
      modelData = buildTracerModel(this.modelGroup);
    }

    this.bodyMesh = modelData.bodyMesh;
    this.headMesh = modelData.headMesh;
    this.animNodes = modelData.animNodes || null;
    this.hitMeshes = modelData.hitMeshes ? [...modelData.hitMeshes] : [];

    // Assign critical headshot & body metadata
    if (this.headMesh) {
      this.headMesh.userData = { player: this, isHead: true, playerId: this.id };
    }
    if (this.bodyMesh) {
      this.bodyMesh.userData = { player: this, isHead: false, playerId: this.id };
    }
    if (this.shieldMesh) {
      this.shieldMesh.userData = { player: this, isShield: true, playerId: this.id };
      if (!this.hitMeshes.includes(this.shieldMesh)) {
        this.hitMeshes.push(this.shieldMesh);
      }
    }

    // Register all hit meshes for raycasting & hit flash
    this.hitMeshes.forEach((mesh) => {
      if (!mesh.userData.player) {
        mesh.userData = { player: this, isHead: false, playerId: this.id };
      }
      this.origMaterials.set(mesh, mesh.material);
    });

    if (this.billboardMesh) {
      this.billboardMesh.position.y = (heroKey === 'reinhardt') ? 2.85 : ((heroKey === 'doomfist') ? 2.50 : ((heroKey === 'genji' || heroKey === 'mccree') ? 2.30 : 2.1));
    }
  }

  // ==========================================================================
  // OVERHEAD 3D BILLBOARD HUD (Trailing Health Bar & Name Tag)
  // ==========================================================================
  buildOverheadHUD() {
    this.hudCanvas = document.createElement('canvas');
    this.hudCanvas.width = 512;
    this.hudCanvas.height = 128;
    this.hudContext = this.hudCanvas.getContext('2d');

    this.hudTexture = new THREE.CanvasTexture(this.hudCanvas);
    this.hudTexture.minFilter = THREE.LinearFilter;

    const mat = new THREE.SpriteMaterial({
      map: this.hudTexture,
      transparent: true,
      depthTest: false
    });

    this.billboardMesh = new THREE.Sprite(mat);
    this.billboardMesh.scale.set(2.4, 0.6, 1);
    this.billboardMesh.position.set(0, this.heroKey === 'reinhardt' ? 2.85 : (this.heroKey === 'doomfist' ? 2.50 : 2.3), 0);
    this.group.add(this.billboardMesh);

    this.updateHUDCanvas();
  }

  updateHUDCanvas() {
    const ctx = this.hudContext;
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 128);

    // 1. Player Name & Hero Tag
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 36px "Rajdhani", "Pretendard", sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 8;

    // Red tag for hostile players, gold for name
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.name} [${this.heroKey.toUpperCase()}]`, 256, 32);

    // 2. Health Bar Background
    const bx = 56;
    const by = 68;
    const bw = 400;
    const bh = 22;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(bx, by, bw, bh);

    // 3. Trailing Health Bar (Trailing HP lags behind, skill.md 3.4)
    const trailRatio = Math.max(0, Math.min(1, this.trailingHp / this.maxHp));
    ctx.fillStyle = '#fef08a'; // Trailing yellow/white
    ctx.fillRect(bx, by, bw * trailRatio, bh);

    // 4. Main Health Bar (Red/Crimson for enemies)
    const hpRatio = Math.max(0, Math.min(1, this.hp / this.maxHp));
    ctx.fillStyle = '#ef4444'; // Red hostile bar
    ctx.fillRect(bx, by, bw * hpRatio, bh);

    // 5. Border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);

    this.hudTexture.needsUpdate = true;
  }

  // ==========================================================================
  // COMBAT & REACTION (skill.md 3.3 Squash & Stretch, 3.4 Trailing Bar)
  // ==========================================================================
  takeDamage(amount, isHeadshot) {
    this.hp = Math.max(0, this.hp - amount);
    this.trailDelay = 0.35;

    // Flash white on hit
    this.flashTimer = 0.08;
    this.hitMeshes.forEach((mesh) => {
      if (mesh !== this.shieldMesh) {
        mesh.material = this.flashMaterial;
      }
    });

    // Squash & Stretch deformation
    if (isHeadshot) {
      this.targetSquash.set(1.2, 0.75, 1.2);
    } else {
      this.targetSquash.set(1.12, 0.88, 1.12);
    }

    this.updateHUDCanvas();
    return this.hp <= 0;
  }

  takeStun(duration = 1.2) {
    this.flashTimer = Math.max(this.flashTimer || 0, duration);
  }

  setShieldActive(active) {
    this.isShieldActive = active;
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  setHero(newHeroKey, maxHp) {
    if (this.heroKey === newHeroKey) return;
    this.heroKey = newHeroKey;
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.trailingHp = maxHp;
    this.buildModel(newHeroKey);
    this.billboardMesh.position.y = (newHeroKey === 'reinhardt') ? 2.85 : ((newHeroKey === 'doomfist') ? 2.50 : ((newHeroKey === 'genji' || newHeroKey === 'mccree') ? 2.30 : 2.1));
    this.updateHUDCanvas();
  }

  setDead(isDead) {
    this.isDead = isDead;
    this.group.visible = !isDead;
    this.modelGroup.visible = !isDead;
    if (this.billboardMesh) this.billboardMesh.visible = !isDead;
    if (this.shieldMesh) this.shieldMesh.visible = false;
  }

  setTargetPosition(pos) {
    if (!pos || pos.length < 3) return;
    this.targetPos.set(pos[0], pos[1] - 1.7, pos[2]);
  }

  respawn(pos, hp) {
    this.isDead = false;
    this.group.visible = true;
    this.modelGroup.visible = true;
    if (this.billboardMesh) this.billboardMesh.visible = true;
    this.hp = hp || this.maxHp;
    this.trailingHp = this.hp;
    if (pos && pos.length >= 3) {
      this.targetPos.set(pos[0], pos[1] - 1.7, pos[2]);
      this.group.position.copy(this.targetPos);
    }
    this.setShieldActive(false);
    this.updateHUDCanvas();
  }

  triggerHammerSwing() {
    this.hammerSwingTimer = 0.45;
  }

  triggerRoll() {
    this.rollTimer = 0.35;
  }

  triggerPunch() {
    this.punchTimer = 0.40;
  }

  applyKnockback(vector, force = 1.0) {
    if (this.isDead) return;
    if (!this.knockbackVelocity) this.knockbackVelocity = new THREE.Vector3();
    this.knockbackVelocity.addScaledVector(vector, force);
  }

  // ==========================================================================
  // 60FPS TICK (Smooth Lerp, Squash Restoration, Trailing Bar Lerp, Walking Motion)
  // ==========================================================================
  update(dt, camera) {
    if (this.isDead) return;

    // 0. Walking animation & idle breathing (HeroModels.js)
    const dx = this.group.position.x - this.lastPos.x;
    const dz = this.group.position.z - this.lastPos.z;
    const distSq = dx * dx + dz * dz;
    const targetDistSq = this.group.position.distanceToSquared(this.targetPos);
    const speed = Math.sqrt(distSq) / Math.max(dt, 0.001);
    const isMoving = speed > 0.08 || targetDistSq > 0.02;

    if (isMoving) {
      this.walkTime += dt;
    } else {
      this.walkTime += dt * 0.6; // Advance subtle idle breathing
    }

    if (this.animNodes) {
      animateHeroWalk(this.animNodes, this.heroKey, this.walkTime, isMoving, dt);

      // Procedural hammer swing arc for remote Reinhardt
      if (this.heroKey === 'reinhardt' && this.hammerSwingTimer > 0) {
        this.hammerSwingTimer -= dt;
        const progress = 1 - (this.hammerSwingTimer / 0.45);
        if (this.animNodes.weapon) {
          this.animNodes.weapon.rotation.z = Math.sin(progress * Math.PI) * 1.5;
          this.animNodes.weapon.rotation.x = Math.cos(progress * Math.PI) * 0.8;
        }
      }

      // Procedural combat roll tumble for remote McCree
      if (this.heroKey === 'mccree' && this.rollTimer > 0) {
        this.rollTimer -= dt;
        const progress = 1 - (this.rollTimer / 0.35);
        if (this.animNodes.root) {
          this.animNodes.root.rotation.x = progress * Math.PI * 2;
        }
      } else if (this.animNodes && this.animNodes.root && this.heroKey === 'mccree') {
        this.animNodes.root.rotation.x = 0;
      }

      // Procedural rocket punch thrust for remote Doomfist
      if (this.heroKey === 'doomfist' && this.punchTimer > 0) {
        this.punchTimer -= dt;
        const progress = 1 - (this.punchTimer / 0.40);
        const punchReach = Math.sin(progress * Math.PI);
        if (this.animNodes && this.animNodes.rightArm) {
          this.animNodes.rightArm.rotation.x = -Math.PI / 2 + punchReach * 0.4;
          this.animNodes.rightArm.position.z = punchReach * 0.5;
        }
      } else if (this.animNodes && this.animNodes.rightArm && this.heroKey === 'doomfist') {
        this.animNodes.rightArm.position.z = 0;
      }
    }
    this.lastPos.copy(this.group.position);

    // 1. Position Lerp & Knockback integration
    if (this.knockbackVelocity && this.knockbackVelocity.lengthSq() > 0.01) {
      this.group.position.addScaledVector(this.knockbackVelocity, dt);
      this.knockbackVelocity.multiplyScalar(Math.pow(0.12, dt));
    } else {
      this.group.position.lerp(this.targetPos, Math.min(1.0, dt * 18.0));
    }

    // 2. Rotation Slerp / Lerp
    let diffYaw = this.targetYaw - this.group.rotation.y;
    // Normalize angle to -PI ~ +PI
    diffYaw = Math.atan2(Math.sin(diffYaw), Math.cos(diffYaw));
    this.group.rotation.y += diffYaw * Math.min(1.0, dt * 16.0);

    // 3. Head Pitch
    if (this.headMesh) {
      this.headMesh.rotation.x = -this.targetPitch;
    }

    // 4. Trailing Health Bar Lerp (skill.md 3.4)
    if (this.trailDelay > 0) {
      this.trailDelay -= dt;
    } else if (this.trailingHp > this.hp) {
      this.trailingHp += (this.hp - this.trailingHp) * 0.14;
      this.updateHUDCanvas();
    }

    // 5. Squash & Stretch spring recovery (skill.md 3.3)
    this.squashScale.lerp(this.targetSquash, 0.3);
    this.targetSquash.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    this.modelGroup.scale.copy(this.squashScale);

    // 6. Hit Flash Material restore
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.hitMeshes.forEach((mesh) => {
          if (this.origMaterials.has(mesh)) {
            mesh.material = this.origMaterials.get(mesh);
          }
        });
      }
    }

    // 7. Billboard always looks at camera
    if (this.billboardMesh && camera) {
      // Sprite already aligns to camera, but maintain upright orientation
    }
  }

  destroy() {
    this.scene.remove(this.group);
    if (this.hudTexture) this.hudTexture.dispose();
  }
}
