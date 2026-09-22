/**
 * ============================================================================
 * PROJECTILE & HITSCAN TRAIL MANAGER
 * - Genji Shurikens (Fast aerodynamic spinning stars with cyan trail)
 * - Reinhardt Fire Strike (Giant piercing crescent flame wave)
 * - Tracer Pulse Bomb (Sticky physics bomb with 1.5s countdown ring & huge shockwave)
 * - Tracer Hitscan Bullet Beams (Instant laser tracers)
 * ============================================================================
 */

export class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.bulletBeams = [];
    this.motionStreaks = [];
  }

  // 1. Hitscan Tracer Beam (Tracer Dual Pulse Pistols)
  addBulletBeam(start, end, color = 0x00f0ff) {
    const points = [start.clone(), end.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });

    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.bulletBeams.push({ line, life: 0.08, maxLife: 0.08 });
  }

  // 1.5 3D Volumetric Motion Streak (Tracer Blink, Genji Swift Strike, Reinhardt Charge)
  addMotionStreak(start, end, color = 0x00f0ff, radius = 0.09, duration = 0.38) {
    const dist = start.distanceTo(end);
    if (dist < 0.2) return;

    const group = new THREE.Group();

    // Intense inner core
    const coreGeo = new THREE.CylinderGeometry(radius * 0.35, radius * 0.35, dist, 8);
    coreGeo.translate(0, dist / 2, 0);
    coreGeo.rotateX(Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // Glowing outer energy sheath
    const sheathGeo = new THREE.CylinderGeometry(radius, radius, dist, 8);
    sheathGeo.translate(0, dist / 2, 0);
    sheathGeo.rotateX(Math.PI / 2);
    const sheathMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85
    });
    const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
    group.add(sheathMesh);

    group.position.copy(start);
    group.lookAt(end);

    this.scene.add(group);
    this.motionStreaks.push({
      group,
      coreMat,
      sheathMat,
      life: duration,
      maxLife: duration
    });
  }

  // 2. Genji Shuriken
  spawnShuriken(origin, direction, hero) {
    const starGroup = new THREE.Group();

    // High-visibility glowing 6-point cybernetic shuriken
    const starGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.03, 3);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const mesh1 = new THREE.Mesh(starGeo, starMat);
    starGroup.add(mesh1);

    const mesh2 = new THREE.Mesh(starGeo, starMat);
    mesh2.rotation.y = Math.PI / 3;
    starGroup.add(mesh2);

    // Glowing energy core for visual clarity
    const coreGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    starGroup.add(core);

    starGroup.position.copy(origin);
    starGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(starGroup);
    this.projectiles.push({
      type: 'shuriken',
      mesh: starGroup,
      velocity: direction.clone().multiplyScalar(48), // 48m/s fast & crisp
      life: 2.5,
      damage: 27,
      hero,
      lastPos: origin.clone()
    });
  }

  // 3. Reinhardt Fire Strike
  spawnFireStrike(origin, direction, hero) {
    const waveGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 16, 1, false, 0, Math.PI);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(waveGeo, waveMat);
    mesh.position.copy(origin);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'firestrike',
      mesh,
      velocity: direction.clone().multiplyScalar(24),
      life: 3.0,
      damage: 100,
      hitBots: new Set(), // Pierces multiple enemies!
      hero,
      lastPos: origin.clone()
    });
  }

  // 4. Tracer Pulse Bomb
  spawnPulseBomb(origin, direction, hero) {
    const bombGeo = new THREE.SphereGeometry(0.22, 12, 12);
    const bombMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const mesh = new THREE.Mesh(bombGeo, bombMat);
    mesh.position.copy(origin);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'pulsebomb',
      mesh,
      velocity: direction.clone().multiplyScalar(20),
      gravity: -15,
      isStuck: false,
      stuckTarget: null,
      countdown: 1.5,
      damage: 350,
      hero
    });
  }

  update(dt, bots, onHitCallback) {
    // 0. Update Motion Streaks (Fade & Thinning)
    for (let i = this.motionStreaks.length - 1; i >= 0; i--) {
      const s = this.motionStreaks[i];
      s.life -= dt;
      const progress = Math.max(0, s.life / s.maxLife);
      s.coreMat.opacity = progress * 0.95;
      s.sheathMat.opacity = progress * 0.85;
      s.group.scale.set(progress, progress, 1.0); // Thins out radially as it fades!
      if (s.life <= 0) {
        this.scene.remove(s.group);
        s.group.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        this.motionStreaks.splice(i, 1);
      }
    }

    // 1. Update Hitscan Beams
    for (let i = this.bulletBeams.length - 1; i >= 0; i--) {
      const b = this.bulletBeams[i];
      b.life -= dt;
      b.line.material.opacity = Math.max(0, b.life / b.maxLife);
      if (b.life <= 0) {
        this.scene.remove(b.line);
        b.line.geometry.dispose();
        b.line.material.dispose();
        this.bulletBeams.splice(i, 1);
      }
    }

    // 2. Update Physical Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.type === 'shuriken') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 28 * dt; // Rapid aerodynamic spin

        // Continuous Swept Collision Detection (CCD) against Bot Vertical Cylinders
        let hit = false;
        const dx = p.mesh.position.x - prevPos.x;
        const dz = p.mesh.position.z - prevPos.z;
        const horizLenSq = dx * dx + dz * dz;

        for (const bot of bots) {
          if (bot.isDead) continue;
          const botPos = bot.group.position;

          // 1. Compute parameter t in [0, 1] for closest horizontal approach to bot center
          let t = 0;
          if (horizLenSq > 0.00001) {
            const vx = botPos.x - prevPos.x;
            const vz = botPos.z - prevPos.z;
            t = Math.max(0, Math.min(1, (vx * dx + vz * dz) / horizLenSq));
          }

          // 2. Closest point on swept trajectory to bot's vertical axis
          const closestX = prevPos.x + dx * t;
          const closestZ = prevPos.z + dz * t;
          const closestY = prevPos.y + (p.mesh.position.y - prevPos.y) * t;

          // 3. True horizontal distance to bot vertical axis
          const horizDist = Math.hypot(closestX - botPos.x, closestZ - botPos.z);

          // Generous, fair hitbox (1.25m radius accounts for bot body, arms, and shuriken width)
          // Height range: feet (botPos.y + 0.1) to head top (botPos.y + 2.7)
          if (horizDist <= 1.25 && closestY >= (botPos.y + 0.1) && closestY <= (botPos.y + 2.7)) {
            // Critical Headshot Node check (head center at botPos.y + 2.2)
            const isHead = closestY >= (botPos.y + 1.85);
            const dmg = isHead ? p.damage * 2 : p.damage;
            const finalBlow = bot.takeDamage(dmg, isHead, p.velocity.clone().normalize());
            onHitCallback(bot, dmg, isHead, finalBlow);
            hit = true;
            break;
          }
        }

        if (hit || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'firestrike') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 8 * dt;

        const dx = p.mesh.position.x - prevPos.x;
        const dz = p.mesh.position.z - prevPos.z;
        const horizLenSq = dx * dx + dz * dz;

        // Piercing swept hit check against bot cylinder
        for (const bot of bots) {
          if (bot.isDead || p.hitBots.has(bot.id)) continue;
          const botPos = bot.group.position;

          let t = 0;
          if (horizLenSq > 0.00001) {
            const vx = botPos.x - prevPos.x;
            const vz = botPos.z - prevPos.z;
            t = Math.max(0, Math.min(1, (vx * dx + vz * dz) / horizLenSq));
          }

          const closestX = prevPos.x + dx * t;
          const closestZ = prevPos.z + dz * t;
          const closestY = prevPos.y + (p.mesh.position.y - prevPos.y) * t;
          const horizDist = Math.hypot(closestX - botPos.x, closestZ - botPos.z);

          if (horizDist <= 2.4 && closestY >= botPos.y && closestY <= botPos.y + 3.0) {
            p.hitBots.add(bot.id);
            const finalBlow = bot.takeDamage(p.damage, false, p.velocity.clone().normalize());
            onHitCallback(bot, p.damage, false, finalBlow);
          }
        }

        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'pulsebomb') {
        if (!p.isStuck) {
          p.velocity.y += p.gravity * dt;
          p.mesh.position.addScaledVector(p.velocity, dt);

          // Floor collision
          if (p.mesh.position.y <= 0.15) {
            p.mesh.position.y = 0.15;
            p.isStuck = true;
          }

          // Bot body collision
          for (const bot of bots) {
            if (bot.isDead) continue;
            const botPos = bot.group.position;
            const horizDist = Math.hypot(p.mesh.position.x - botPos.x, p.mesh.position.z - botPos.z);
            const vertY = p.mesh.position.y;
            if (horizDist < 1.0 && vertY >= botPos.y && vertY <= botPos.y + 2.5) {
              p.isStuck = true;
              p.stuckTarget = bot;
              break;
            }
          }
        } else if (p.stuckTarget) {
          p.mesh.position.copy(p.stuckTarget.group.position).add(new THREE.Vector3(0, 1.4, 0));
        }

        // Pulse Countdown & Flash
        p.countdown -= dt;
        const blinkFreq = p.countdown < 0.5 ? 20 : 8;
        p.mesh.material.color.setHex(Math.sin(Date.now() * 0.02 * blinkFreq) > 0 ? 0xff0044 : 0x00f0ff);

        if (p.countdown <= 0) {
          // EXPLODE!
          for (const bot of bots) {
            if (bot.isDead) continue;
            const dist = p.mesh.position.distanceTo(bot.group.position);
            if (dist < 5.0) {
              const falloff = 1 - dist / 5.0;
              const dmg = Math.floor(p.damage * falloff);
              const finalBlow = bot.takeDamage(dmg, false, new THREE.Vector3(0, 1, 0));
              onHitCallback(bot, dmg, false, finalBlow);
            }
          }

          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
      }
    }
  }
}
