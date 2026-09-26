/**
 * ============================================================================
 * OMNIC TRAINING BOT (3D Procedural Mesh & Hit Detection)
 * - Critical Headshot Node (Red Glowing Visor Eye with 'DINK' trigger)
 * - Trailing Floating Health Bar (skill.md 3.4 standard)
 * - Squash & Stretch Deformation on Impact (skill.md 3.3)
 * - Dismemberment Physics Explosion upon Elimination
 * ============================================================================
 */

export class TrainingBot {
  constructor(scene, x, z, id = 1) {
    this.scene = scene;
    this.id = id;
    this.name = `훈련용 봇 [${id}]`;

    this.maxHp = 200;
    this.hp = 200;
    this.trailingHp = 200;
    this.trailDelay = 0;

    this.isDead = false;
    this.respawnTimer = 0;
    this.spawnPos = new THREE.Vector3(x, 0, z);

    // Hit reaction & Knockback physics
    this.flashTimer = 0;
    this.squashScale = new THREE.Vector3(1, 1, 1);
    this.targetSquash = new THREE.Vector3(1, 1, 1);
    this.knockbackVelocity = new THREE.Vector3();
    this.isAirborne = false;

    // Patrol movement
    this.patrolCenter = new THREE.Vector3(x, 0, z);
    this.patrolAngle = Math.random() * Math.PI * 2;
    this.patrolRadius = 3.5;
    this.moveSpeed = 1.6;
    this.shootCooldown = 2.5 + Math.random() * 2.0;

    // Build 3D Mesh
    this.group = new THREE.Group();
    this.group.position.copy(this.spawnPos);

    this.headMesh = null;
    this.bodyMesh = null;
    this.parts = []; // For death dismemberment

    this.buildBotMesh();
    this.buildFloatingHealthBar();

    this.scene.add(this.group);
  }

  buildBotMesh() {
    // Shared materials
    this.metalMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      metalness: 0.8,
      roughness: 0.25
    });

    this.darkMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.9,
      roughness: 0.2
    });

    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff
    });

    this.eyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1e38 // Critical Headshot Red Eye
    });

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.1, 12);
    this.bodyMesh = new THREE.Mesh(torsoGeo, this.metalMat);
    this.bodyMesh.position.y = 1.35;
    this.bodyMesh.castShadow = true;
    this.bodyMesh.userData = { bot: this, isHead: false };
    this.group.add(this.bodyMesh);
    this.parts.push({ mesh: this.bodyMesh, origY: 1.35 });

    // Chest Core
    const coreGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const coreMesh = new THREE.Mesh(coreGeo, this.coreMat);
    coreMesh.position.set(0, 0.1, 0.45);
    this.bodyMesh.add(coreMesh);

    // 2. Head (Critical Hit Node)
    const headGeo = new THREE.SphereGeometry(0.38, 12, 12);
    this.headMesh = new THREE.Mesh(headGeo, this.metalMat);
    this.headMesh.position.set(0, 2.2, 0);
    this.headMesh.castShadow = true;
    this.headMesh.userData = { bot: this, isHead: true }; // CRITICAL NODE
    this.group.add(this.headMesh);
    this.parts.push({ mesh: this.headMesh, origY: 2.2 });

    // Red Visor Eye
    const eyeGeo = new THREE.BoxGeometry(0.36, 0.12, 0.2);
    const eyeMesh = new THREE.Mesh(eyeGeo, this.eyeMat);
    eyeMesh.position.set(0, 0.05, 0.3);
    eyeMesh.userData = { bot: this, isHead: true };
    this.headMesh.add(eyeMesh);

    // 3. Hover Thruster Base
    const thrusterGeo = new THREE.CylinderGeometry(0.4, 0.15, 0.6, 8);
    const thrusterMesh = new THREE.Mesh(thrusterGeo, this.darkMat);
    thrusterMesh.position.y = 0.55;
    thrusterMesh.userData = { bot: this, isHead: false };
    this.group.add(thrusterMesh);
    this.parts.push({ mesh: thrusterMesh, origY: 0.55 });

    // 4. Arms
    const armGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const armL = new THREE.Mesh(armGeo, this.metalMat);
    armL.position.set(-0.75, 1.25, 0);
    armL.rotation.z = Math.PI / 10;
    armL.userData = { bot: this, isHead: false };
    this.group.add(armL);
    this.parts.push({ mesh: armL, origY: 1.25 });

    const armR = new THREE.Mesh(armGeo, this.metalMat);
    armR.position.set(0.75, 1.25, 0);
    armR.rotation.z = -Math.PI / 10;
    armR.userData = { bot: this, isHead: false };
    this.group.add(armR);
    this.parts.push({ mesh: armR, origY: 1.25 });

    // Full collection of meshes for raycast hit detection
    this.hitMeshes = [this.bodyMesh, this.headMesh, armL, armR, thrusterMesh];
  }

  // Floating 2D Billboard Health Bar with Trailing Bar
  buildFloatingHealthBar() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 24;
    this.hpCanvas = canvas;
    this.hpCtx = canvas.getContext('2d');

    this.hpTexture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: this.hpTexture,
      transparent: true,
      depthTest: false
    });

    this.hpSprite = new THREE.Sprite(spriteMat);
    this.hpSprite.position.y = 2.85;
    this.hpSprite.scale.set(1.4, 0.28, 1);
    this.group.add(this.hpSprite);

    this.updateHealthBarTexture();
  }

  updateHealthBarTexture() {
    const ctx = this.hpCtx;
    ctx.clearRect(0, 0, 128, 24);

    if (this.isDead) {
      this.hpTexture.needsUpdate = true;
      return;
    }

    // Outer frame
    ctx.fillStyle = 'rgba(15, 17, 22, 0.85)';
    ctx.fillRect(0, 0, 128, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 24);

    // Trailing Health (Orange)
    const trailWidth = (this.trailingHp / this.maxHp) * 124;
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(2, 2, Math.max(0, trailWidth), 20);

    // Immediate Health (Red)
    const hpWidth = (this.hp / this.maxHp) * 124;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(2, 2, Math.max(0, hpWidth), 20);

    // Segment lines every 25 HP
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    for (let i = 1; i < 8; i++) {
      ctx.fillRect((124 / 8) * i + 2, 2, 1.5, 20);
    }

    this.hpTexture.needsUpdate = true;
  }

  takeDamage(amount, isHeadshot = false, hitDir = null) {
    if (this.isDead) return false;

    this.hp = Math.max(0, this.hp - amount);
    this.trailDelay = 0.35; // 0.35s delay before trailing bar drops

    // Hit Flash (White)
    this.flashTimer = 0.08;
    this.metalMat.color.setHex(0xffffff);

    // Squash & Stretch: Compress along Y and expand X/Z
    this.targetSquash.set(1.22, 0.78, 1.22);

    // Knockback
    if (hitDir && (!this.knockbackVelocity || this.knockbackVelocity.lengthSq() < 0.01)) {
      this.group.position.addScaledVector(hitDir, 0.3);
    }

    this.updateHealthBarTexture();

    if (this.hp <= 0) {
      this.die();
      return true; // Final Blow
    }
    return false;
  }

  applyKnockback(vector, force = 1.0) {
    if (this.isDead) return;
    if (!this.knockbackVelocity) this.knockbackVelocity = new THREE.Vector3();
    this.knockbackVelocity.addScaledVector(vector, force);
    this.isAirborne = true;
  }

  die() {
    this.isDead = true;
    this.respawnTimer = 4.0; // Respawn after 4 seconds
    this.hpSprite.visible = false;

    // Dismemberment velocity
    this.parts.forEach((p) => {
      p.vx = (Math.random() - 0.5) * 6;
      p.vy = Math.random() * 5 + 3;
      p.vz = (Math.random() - 0.5) * 6;
      p.rx = (Math.random() - 0.5) * 10;
      p.ry = (Math.random() - 0.5) * 10;
    });
  }

  respawn() {
    this.isDead = false;
    this.hp = this.maxHp;
    this.trailingHp = this.maxHp;
    this.hpSprite.visible = true;
    this.group.position.copy(this.spawnPos);

    this.knockbackVelocity = new THREE.Vector3();
    this.isAirborne = false;

    // Reset mesh parts
    this.parts.forEach((p) => {
      p.mesh.position.set(0, p.origY, 0);
      p.mesh.rotation.set(0, 0, 0);
    });

    this.metalMat.color.setHex(0x9ca3af);
    this.targetSquash.set(1, 1, 1);
    this.squashScale.set(1, 1, 1);
    this.updateHealthBarTexture();
  }

  takeStun(duration = 1.2) {
    this.stunTimer = Math.max(this.stunTimer || 0, duration);
    this.metalMat.color.setHex(0xfde047);
    this.flashTimer = duration;
  }

  update(dt, playerPos, projectileManager = null) {
    if (this.isDead) {
      // Debris Physics during death
      this.parts.forEach((p) => {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 9.8 * dt; // Gravity
        p.mesh.rotation.x += p.rx * dt;
        p.mesh.rotation.y += p.ry * dt;
      });

      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn();
      }
      return;
    }

    // Stun status check (e.g. from McCree Flashbang)
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      // Yellow flashing sparks indicator
      if (Math.random() < 0.25) {
        this.metalMat.color.setHex(Math.random() < 0.5 ? 0xfde047 : 0xffffff);
      }
      return;
    }

    // 1. Hit Flash Reset
    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
      if (this.flashTimer <= 0) {
        this.metalMat.color.setHex(0x9ca3af);
      }
    }

    // 2. Trailing Health Bar Lerp Decay (skill.md 3.4)
    if (this.trailDelay > 0) {
      this.trailDelay -= dt;
    } else if (this.trailingHp > this.hp) {
      this.trailingHp += (this.hp - this.trailingHp) * 0.14;
      this.updateHealthBarTexture();
    }

    // 3. Squash & Stretch Spring Recovery (skill.md 3.3)
    this.squashScale.lerp(this.targetSquash, 0.25);
    this.targetSquash.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    this.group.scale.copy(this.squashScale);

    // 4. Knockback & Physical Velocity Integration (Rocket Punch, Uppercut, Seismic Slam)
    if (this.knockbackVelocity && this.knockbackVelocity.lengthSq() > 0.01) {
      this.group.position.addScaledVector(this.knockbackVelocity, dt);
      // Horizontal drag
      this.knockbackVelocity.x *= Math.pow(0.12, dt);
      this.knockbackVelocity.z *= Math.pow(0.12, dt);
      // Gravity
      this.knockbackVelocity.y -= 26.0 * dt;

      // Floor collision check
      const floorY = (this.spawnPos ? this.spawnPos.y : 0);
      if (this.group.position.y <= floorY) {
        this.group.position.y = floorY;
        this.knockbackVelocity.y = 0;
        this.isAirborne = false;
      }
    } else {
      // Normal gentle patrol & hover bobbing only when settled
      this.group.position.y = (this.spawnPos ? this.spawnPos.y : 0) + 0.15 + Math.sin(Date.now() * 0.003 + this.id) * 0.1;

      this.patrolAngle += 0.4 * dt;
      const targetX = this.patrolCenter.x + Math.cos(this.patrolAngle) * this.patrolRadius;
      const targetZ = this.patrolCenter.z + Math.sin(this.patrolAngle) * this.patrolRadius;

      this.group.position.x += (targetX - this.group.position.x) * this.moveSpeed * dt;
      this.group.position.z += (targetZ - this.group.position.z) * this.moveSpeed * dt;
    }

    // Rotate to face player & periodic plasma bolt shooting
    if (playerPos) {
      const angle = Math.atan2(playerPos.x - this.group.position.x, playerPos.z - this.group.position.z);
      this.group.rotation.y = angle;

      if (projectileManager) {
        this.shootCooldown -= dt;
        if (this.shootCooldown <= 0) {
          const dist = this.group.position.distanceTo(playerPos);
          if (dist > 3.5 && dist < 32.0) {
            const origin = this.group.position.clone().add(new THREE.Vector3(0, 1.35, 0));
            const target = playerPos.clone().add(new THREE.Vector3(0, 0.9, 0));
            const dir = target.sub(origin).normalize();
            projectileManager.spawnEnemyBolt(origin, dir, 25, 25);
          }
          this.shootCooldown = 3.2 + Math.random() * 2.5;
        }
      }
    }
  }
}
