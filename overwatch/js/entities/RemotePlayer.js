/**
 * ============================================================================
 * REMOTE PLAYER 3D ENTITY (RemotePlayer.js)
 * - 3D Procedural Avatar for Tracer, Genji, and Reinhardt
 * - Authentic Headshot Hitbox (Critical DINK Hit Node) & Body Hitbox
 * - Overhead 3D Canvas Billboard: Nickname + Role + Trailing Health Bar
 * - Reinhardt Deployable Energy Barrier Shield Mesh
 * - Butter-smooth 60FPS Position & Rotation Lerp Interpolation
 * ============================================================================
 */

export class RemotePlayer {
  constructor(scene, playerData) {
    this.scene = scene;
    this.id = playerData.id;
    this.name = playerData.name || '플레이어';
    this.heroKey = playerData.hero || 'tracer';

    this.maxHp = playerData.maxHp || (this.heroKey === 'reinhardt' ? 1000 : (this.heroKey === 'genji' ? 400 : 300));
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

    // Hit reaction
    this.flashTimer = 0;
    this.squashScale = new THREE.Vector3(1, 1, 1);
    this.targetSquash = new THREE.Vector3(1, 1, 1);

    // Root 3D Group
    this.group = new THREE.Group();
    this.group.position.copy(this.targetPos);
    this.group.rotation.y = this.targetYaw;

    // Model parts
    this.modelGroup = new THREE.Group();
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
  // 3D PROCEDURAL HERO MODELS
  // ==========================================================================
  buildModel(heroKey) {
    // Clear old model parts if switching heroes
    while (this.modelGroup.children.length > 0) {
      this.modelGroup.remove(this.modelGroup.children[0]);
    }
    this.hitMeshes = [];
    this.origMaterials.clear();

    if (heroKey === 'reinhardt') {
      this.buildReinhardtModel();
    } else if (heroKey === 'genji') {
      this.buildGenjiModel();
    } else {
      this.buildTracerModel();
    }

    // Register all hit meshes for raycasting
    this.hitMeshes.forEach((mesh) => {
      this.origMaterials.set(mesh, mesh.material);
    });
  }

  // 1. TRACER (Slim, orange chronal harness, glowing chest core, pulse pistols)
  buildTracerModel() {
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xeb780a, roughness: 0.35, metalness: 0.4 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.5, metalness: 0.5 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const visorMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.28, 0.22, 0.85, 10);
    this.bodyMesh = new THREE.Mesh(torsoGeo, suitMat);
    this.bodyMesh.position.y = 1.05;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData = { player: this, isHead: false, playerId: this.id };
    this.modelGroup.add(this.bodyMesh);
    this.hitMeshes.push(this.bodyMesh);

    // Chronal Accelerator (Chest Core)
    const coreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 8);
    coreGeo.rotateX(Math.PI / 2);
    const coreMesh = new THREE.Mesh(coreGeo, glowMat);
    coreMesh.position.set(0, 0.15, 0.22);
    this.bodyMesh.add(coreMesh);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.75, 8);
    const legL = new THREE.Mesh(legGeo, darkMat);
    legL.position.set(-0.16, 0.38, 0);
    const legR = new THREE.Mesh(legGeo, darkMat);
    legR.position.set(0.16, 0.38, 0);
    this.modelGroup.add(legL, legR);

    // Head (CRITICAL HIT NODE)
    const headGeo = new THREE.SphereGeometry(0.22, 12, 12);
    this.headMesh = new THREE.Mesh(headGeo, darkMat);
    this.headMesh.position.set(0, 1.62, 0);
    this.headMesh.castShadow = true;
    this.headMesh.userData = { player: this, isHead: true, playerId: this.id };
    this.modelGroup.add(this.headMesh);
    this.hitMeshes.push(this.headMesh);

    // Amber Visor
    const visorGeo = new THREE.BoxGeometry(0.24, 0.08, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.02, 0.18);
    this.headMesh.add(visorMesh);

    // Dual Pulse Pistols
    const gunGeo = new THREE.BoxGeometry(0.08, 0.12, 0.32);
    const gunL = new THREE.Mesh(gunGeo, darkMat);
    gunL.position.set(-0.35, 1.05, 0.25);
    const gunR = new THREE.Mesh(gunGeo, darkMat);
    gunR.position.set(0.35, 1.05, 0.25);
    this.modelGroup.add(gunL, gunR);
  }

  // 2. GENJI (Cyborg ninja, sleek silver armor, neon green glow, katana on back)
  buildGenjiModel() {
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 });
    const greenGlow = new THREE.MeshBasicMaterial({ color: 0x00ff88 });

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.25, 0.9, 10);
    this.bodyMesh = new THREE.Mesh(torsoGeo, armorMat);
    this.bodyMesh.position.y = 1.1;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData = { player: this, isHead: false, playerId: this.id };
    this.modelGroup.add(this.bodyMesh);
    this.hitMeshes.push(this.bodyMesh);

    // Green chest vents
    const ventGeo = new THREE.BoxGeometry(0.18, 0.04, 0.05);
    const ventMesh = new THREE.Mesh(ventGeo, greenGlow);
    ventMesh.position.set(0, 0.18, 0.26);
    this.bodyMesh.add(ventMesh);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.11, 0.08, 0.8, 8);
    const legL = new THREE.Mesh(legGeo, darkMat);
    legL.position.set(-0.18, 0.4, 0);
    const legR = new THREE.Mesh(legGeo, darkMat);
    legR.position.set(0.18, 0.4, 0);
    this.modelGroup.add(legL, legR);

    // Head (CRITICAL HIT NODE)
    const headGeo = new THREE.SphereGeometry(0.23, 12, 12);
    this.headMesh = new THREE.Mesh(headGeo, armorMat);
    this.headMesh.position.set(0, 1.7, 0);
    this.headMesh.castShadow = true;
    this.headMesh.userData = { player: this, isHead: true, playerId: this.id };
    this.modelGroup.add(this.headMesh);
    this.hitMeshes.push(this.headMesh);

    // Cyber Visor (Neon Green Slit)
    const visorGeo = new THREE.BoxGeometry(0.24, 0.05, 0.12);
    const visorMesh = new THREE.Mesh(visorGeo, greenGlow);
    visorMesh.position.set(0, 0.02, 0.19);
    this.headMesh.add(visorMesh);

    // Katana Scabbard on Back
    const swordGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6);
    const swordMesh = new THREE.Mesh(swordGeo, greenGlow);
    swordMesh.rotation.z = Math.PI / 4;
    swordMesh.position.set(-0.1, 1.25, -0.25);
    this.modelGroup.add(swordMesh);
  }

  // 3. REINHARDT (Massive crusader knight, rocket hammer, barrier shield)
  buildReinhardtModel() {
    const steelMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3, metalness: 0.85 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35, metalness: 0.7 });
    const lionCore = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // Massive Torso
    const torsoGeo = new THREE.BoxGeometry(1.0, 1.2, 0.75);
    this.bodyMesh = new THREE.Mesh(torsoGeo, steelMat);
    this.bodyMesh.position.y = 1.35;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData = { player: this, isHead: false, playerId: this.id };
    this.modelGroup.add(this.bodyMesh);
    this.hitMeshes.push(this.bodyMesh);

    // Huge Pauldrons (Shoulders)
    const shoulderGeo = new THREE.SphereGeometry(0.38, 8, 8);
    const pL = new THREE.Mesh(shoulderGeo, brassMat);
    pL.position.set(-0.72, 0.45, 0);
    const pR = new THREE.Mesh(shoulderGeo, brassMat);
    pR.position.set(0.72, 0.45, 0);
    this.bodyMesh.add(pL, pR);

    // Chest Lion Crest
    const crestGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 6);
    crestGeo.rotateX(Math.PI / 2);
    const crest = new THREE.Mesh(crestGeo, lionCore);
    crest.position.set(0, 0.2, 0.4);
    this.bodyMesh.add(crest);

    // Armor Legs
    const legGeo = new THREE.CylinderGeometry(0.22, 0.18, 0.85, 8);
    const legL = new THREE.Mesh(legGeo, steelMat);
    legL.position.set(-0.35, 0.42, 0);
    const legR = new THREE.Mesh(legGeo, steelMat);
    legR.position.set(0.35, 0.42, 0);
    this.modelGroup.add(legL, legR);

    // Crusader Helmet Head (CRITICAL HIT NODE)
    const headGeo = new THREE.BoxGeometry(0.42, 0.45, 0.42);
    this.headMesh = new THREE.Mesh(headGeo, brassMat);
    this.headMesh.position.set(0, 2.15, 0);
    this.headMesh.castShadow = true;
    this.headMesh.userData = { player: this, isHead: true, playerId: this.id };
    this.modelGroup.add(this.headMesh);
    this.hitMeshes.push(this.headMesh);

    // Visor eye slit
    const eyeGeo = new THREE.BoxGeometry(0.28, 0.06, 0.1);
    const eyeMesh = new THREE.Mesh(eyeGeo, lionCore);
    eyeMesh.position.set(0, 0.05, 0.22);
    this.headMesh.add(eyeMesh);

    // Rocket Hammer (held on back or side)
    const hammerGroup = new THREE.Group();
    hammerGroup.position.set(0.65, 1.2, 0.3);
    hammerGroup.rotation.x = Math.PI / 6;

    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
    const shaftMesh = new THREE.Mesh(shaftGeo, steelMat);
    shaftMesh.position.y = 0.5;

    const headHammerGeo = new THREE.BoxGeometry(0.35, 0.55, 0.65);
    const headHammerMesh = new THREE.Mesh(headHammerGeo, brassMat);
    headHammerMesh.position.set(0, 1.3, 0);

    hammerGroup.add(shaftMesh, headHammerMesh);
    this.modelGroup.add(hammerGroup);

    // Deployable Barrier Shield (Translucent cyan hexagonal energy field)
    const shieldGeo = new THREE.PlaneGeometry(3.6, 2.4);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 1.4, 1.2);
    this.shieldMesh.visible = false;
    this.shieldMesh.userData = { player: this, isShield: true, playerId: this.id };
    this.modelGroup.add(this.shieldMesh);
    this.hitMeshes.push(this.shieldMesh);
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
    this.billboardMesh.position.set(0, this.heroKey === 'reinhardt' ? 2.85 : 2.3, 0);
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

    // Squash & Stretch deformation
    if (isHeadshot) {
      this.targetSquash.set(1.2, 0.75, 1.2);
    } else {
      this.targetSquash.set(1.12, 0.88, 1.12);
    }

    this.updateHUDCanvas();
    return this.hp <= 0;
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
    this.billboardMesh.position.y = (newHeroKey === 'reinhardt') ? 2.85 : 2.3;
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

  // ==========================================================================
  // 60FPS TICK (Smooth Lerp, Squash Restoration, Trailing Bar Lerp)
  // ==========================================================================
  update(dt, camera) {
    if (this.isDead) return;

    // 1. Position Lerp (smooth 25Hz -> 60FPS)
    this.group.position.lerp(this.targetPos, Math.min(1.0, dt * 18.0));

    // 2. Rotation Slerp / Lerp
    let diffYaw = this.targetYaw - this.group.rotation.y;
    // Normalize angle to -PI ~ +PI
    diffYaw = Math.atan2(Math.sin(diffYaw), Math.cos(diffYaw));
    this.group.rotation.y += diffYaw * Math.min(1.0, dt * 16.0);

    // 3. Head Pitch
    if (this.headMesh) {
      this.headMesh.rotation.x = this.targetPitch;
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
