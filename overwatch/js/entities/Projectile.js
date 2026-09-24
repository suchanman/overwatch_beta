/**
 * ============================================================================
 * PROJECTILE & HITSCAN TRAIL MANAGER
 * - Genji Shurikens (Fast aerodynamic spinning cybernetic stars with green laser trail)
 * - Reinhardt Fire Strike (Giant piercing vertical crescent flame wave with fire tail)
 * - Tracer Pulse Bomb (Chronal sticky physics bomb with expanding countdown ring & shockwave)
 * - Bot / Enemy Plasma Bolts (Vibrant red energy bolt with tracer tail)
 * - Tracer Hitscan Bullet Beams (Instant cyan laser tracers)
 * - Impact Spark Particles & Volumetric Motion Streaks
 * ============================================================================
 */

export class ProjectileManager {
  constructor(scene) {
    this.scene = scene;
    this.projectiles = [];
    this.bulletBeams = [];
    this.motionStreaks = [];
    this.particles = [];
    this.onProjectileSpawned = null; // Replicate projectiles across multiplayer network
  }

  // 1. Hitscan Tracer Beam (Tracer Dual Pulse Pistols)
  addBulletBeam(start, end, color = 0x00f0ff) {
    const points = [start.clone(), end.clone()];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.95,
      linewidth: 2
    });

    const line = new THREE.Line(geo, mat);
    this.scene.add(line);
    this.bulletBeams.push({ line, life: 0.09, maxLife: 0.09 });
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

  // 1.6 Impact Spark Particles (Overwatch High-Energy Impact Feedback)
  spawnHitSparks(pos, normal, color = 0x00f0ff, count = 8) {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      const norm = normal || new THREE.Vector3(0, 1, 0);
      const v = norm.clone().multiplyScalar(3.5 + Math.random() * 4.5);
      v.x += (Math.random() - 0.5) * 4.0;
      v.y += (Math.random() - 0.5) * 4.0;
      v.z += (Math.random() - 0.5) * 4.0;
      velocities.push(v);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: color,
      size: 0.16,
      transparent: true,
      opacity: 1.0
    });
    const points = new THREE.Points(geo, mat);
    this.scene.add(points);
    this.particles.push({
      mesh: points,
      geo,
      mat,
      positions,
      velocities,
      life: 0.28,
      maxLife: 0.28
    });
  }

  // 2. Genji Shuriken (High-Visibility Cybernetic Star with Luminous Green Laser Tail)
  spawnShuriken(origin, direction, hero, isRemote = false) {
    const starGroup = new THREE.Group();

    // High-visibility glowing 6-point cybernetic shuriken
    const starGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.035, 3);
    const starMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const mesh1 = new THREE.Mesh(starGeo, starMat);
    starGroup.add(mesh1);

    const mesh2 = new THREE.Mesh(starGeo, starMat);
    mesh2.rotation.y = Math.PI / 3;
    starGroup.add(mesh2);

    // Glowing energy core for visual clarity
    const coreGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    starGroup.add(core);

    // Glowing Aerodynamic Laser Trail (Vibrant green streak clearly visible from any perspective)
    const trailGeo = new THREE.CylinderGeometry(0.015, 0.08, 1.6, 6);
    trailGeo.translate(0, -0.8, 0);
    trailGeo.rotateX(Math.PI / 2);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.8
    });
    const trail = new THREE.Mesh(trailGeo, trailMat);
    starGroup.add(trail);

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
      isRemote: !!isRemote,
      lastPos: origin.clone()
    });

    if (!isRemote && this.onProjectileSpawned) {
      this.onProjectileSpawned('shuriken', {
        origin: [origin.x, origin.y, origin.z],
        dir: [direction.x, direction.y, direction.z]
      });
    }
  }

  // 3. Reinhardt Fire Strike (Giant Piercing Vertical Flame Crescent with Fiery Tail)
  spawnFireStrike(origin, direction, hero, isRemote = false) {
    const waveGroup = new THREE.Group();

    // 1. Giant blazing vertical crescent wave (2.8m wide x 2.2m tall)
    const arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, 1.5, -Math.PI * 0.45, Math.PI * 0.45, false);
    arcShape.absarc(0, 0, 1.1, Math.PI * 0.45, -Math.PI * 0.45, true);
    const arcGeo = new THREE.ShapeGeometry(arcShape, 24);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0xff3700,
      side: THREE.DoubleSide
    });
    const crescentMesh = new THREE.Mesh(arcGeo, waveMat);
    crescentMesh.rotation.y = Math.PI / 2;
    waveGroup.add(crescentMesh);

    // 2. Blazing fiery inner core (white/gold hot)
    const coreShape = new THREE.Shape();
    coreShape.absarc(0, 0, 1.3, -Math.PI * 0.35, Math.PI * 0.35, false);
    coreShape.absarc(0, 0, 1.05, Math.PI * 0.35, -Math.PI * 0.35, true);
    const coreGeo = new THREE.ShapeGeometry(coreShape, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.y = Math.PI / 2;
    waveGroup.add(coreMesh);

    // 3. Central fiery ignition sphere
    const sphereGeo = new THREE.SphereGeometry(0.35, 12, 12);
    sphereGeo.scale(0.5, 1.8, 1.0);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const centerSphere = new THREE.Mesh(sphereGeo, sphereMat);
    waveGroup.add(centerSphere);

    // 4. Trailing fiery flame tail (Tapered orange flame trail extending 2.2m backward)
    const trailGeo = new THREE.ConeGeometry(1.2, 2.5, 12);
    trailGeo.rotateX(-Math.PI / 2);
    trailGeo.translate(0, 0, -1.25);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const trailMesh = new THREE.Mesh(trailGeo, trailMat);
    waveGroup.add(trailMesh);

    waveGroup.position.copy(origin);
    waveGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(waveGroup);
    this.projectiles.push({
      type: 'firestrike',
      mesh: waveGroup,
      velocity: direction.clone().multiplyScalar(24),
      life: 3.2,
      damage: 100,
      hitBots: new Set(), // Pierces multiple enemies!
      hero,
      isRemote: !!isRemote,
      lastPos: origin.clone()
    });

    if (!isRemote && this.onProjectileSpawned) {
      this.onProjectileSpawned('fire_strike', {
        origin: [origin.x, origin.y, origin.z],
        dir: [direction.x, direction.y, direction.z]
      });
    }
  }

  // 4. Tracer Pulse Bomb (Chronal Sticky Device with Expanding Hologram Countdown Ring)
  spawnPulseBomb(origin, direction, hero, isRemote = false) {
    const bombGroup = new THREE.Group();

    // Chronal core cylinder with glowing cyan reactor band
    const cylGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 16);
    cylGeo.rotateX(Math.PI / 2);
    const bodyMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const cylMesh = new THREE.Mesh(cylGeo, bodyMat);
    bombGroup.add(cylMesh);

    const coreGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    bombGroup.add(coreMesh);

    // Blinking hazard ring & cap
    const capGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.05, 16);
    capGeo.rotateX(Math.PI / 2);
    const capMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    bombGroup.add(capMesh);

    // Ticking countdown hologram ring (expands when stuck)
    const ringGeo = new THREE.RingGeometry(0.3, 0.38, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.visible = false;
    bombGroup.add(ringMesh);

    bombGroup.position.copy(origin);

    this.scene.add(bombGroup);
    this.projectiles.push({
      type: 'pulsebomb',
      mesh: bombGroup,
      coreMesh,
      ringMesh,
      velocity: direction.clone().multiplyScalar(22),
      gravity: -16,
      isStuck: false,
      stuckTarget: null,
      countdown: 1.5,
      damage: 350,
      hero,
      isRemote: !!isRemote
    });

    if (!isRemote && this.onProjectileSpawned) {
      this.onProjectileSpawned('pulse_bomb', {
        origin: [origin.x, origin.y, origin.z],
        dir: [direction.x, direction.y, direction.z]
      });
    }
  }

  // 5. Training Bot / Enemy Plasma Bolt (Vibrant Red Energy Bolt with Tracer Tail)
  spawnEnemyBolt(origin, direction, speed = 25, damage = 25) {
    const boltGroup = new THREE.Group();

    // Central glowing red/crimson plasma core
    const geo = new THREE.SphereGeometry(0.20, 10, 10);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
    const coreMesh = new THREE.Mesh(geo, mat);
    boltGroup.add(coreMesh);

    // Outer plasma aura
    const haloGeo = new THREE.SphereGeometry(0.32, 10, 10);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff4466,
      transparent: true,
      opacity: 0.55
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    boltGroup.add(halo);

    // Elongated tracer tail (clearly visible flying across the air)
    const tailGeo = new THREE.CylinderGeometry(0.02, 0.16, 1.4, 8);
    tailGeo.translate(0, -0.7, 0);
    tailGeo.rotateX(Math.PI / 2);
    const tailMat = new THREE.MeshBasicMaterial({
      color: 0xff1144,
      transparent: true,
      opacity: 0.75
    });
    const tail = new THREE.Mesh(tailGeo, tailMat);
    boltGroup.add(tail);

    boltGroup.position.copy(origin);
    boltGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);

    this.scene.add(boltGroup);
    this.projectiles.push({
      type: 'enemy_bolt',
      mesh: boltGroup,
      velocity: direction.clone().multiplyScalar(speed),
      life: 3.5,
      damage,
      isReflected: false,
      lastPos: origin.clone()
    });
  }

  // ==========================================================================
  // TICK UPDATE LOOP (Motion Streaks, Particles, Swept Collision & Replication)
  // ==========================================================================
  update(dt, bots, onHitCallback, map = null, playerContext = null) {
    // 0. Update Motion Streaks (Fade & Radial Thinning)
    for (let i = this.motionStreaks.length - 1; i >= 0; i--) {
      const s = this.motionStreaks[i];
      s.life -= dt;
      const progress = Math.max(0, s.life / s.maxLife);
      s.coreMat.opacity = progress * 0.95;
      s.sheathMat.opacity = progress * 0.85;
      s.group.scale.set(progress, progress, 1.0);
      if (s.life <= 0) {
        this.scene.remove(s.group);
        s.group.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        this.motionStreaks.splice(i, 1);
      }
    }

    // 0.5 Update Spark Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      const progress = Math.max(0, pt.life / pt.maxLife);
      pt.mat.opacity = progress;
      const posAttr = pt.geo.attributes.position;
      const arr = posAttr.array;
      for (let j = 0; j < pt.velocities.length; j++) {
        pt.velocities[j].y -= 10 * dt; // Gravity
        arr[j * 3] += pt.velocities[j].x * dt;
        arr[j * 3 + 1] += pt.velocities[j].y * dt;
        arr[j * 3 + 2] += pt.velocities[j].z * dt;
      }
      posAttr.needsUpdate = true;
      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        pt.geo.dispose();
        pt.mat.dispose();
        this.particles.splice(i, 1);
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

      // --- SHURIKEN ---
      if (p.type === 'shuriken') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 30 * dt; // Aerodynamic rapid spin

        let hit = false;

        // Map collision
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.18);
          if (wallHit.hit) {
            hit = true;
            this.spawnHitSparks(wallHit.point || prevPos, new THREE.Vector3(0, 1, 0), 0x10b981, 6);
          }
        }

        if (!hit) {
          if (p.isRemote) {
            // Remote shuriken flying toward or past local player
            if (playerContext && playerContext.playerPos && playerContext.currentHero) {
              const pPos = playerContext.playerPos;
              const pHero = playerContext.currentHero;
              const pCam = playerContext.camera;
              const dist = p.mesh.position.distanceTo(pPos);

              if (dist < 1.7) {
                // Genji Deflect against incoming remote shuriken
                if (pHero.name === 'GENJI' && pHero.isDeflecting) {
                  p.isRemote = false; // Deflected shuriken now belongs to local player!
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  p.velocity.copy(forward).multiplyScalar(48);
                  p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forward);
                  if (playerContext.audio) playerContext.audio.playGenjiDeflect();
                  if (playerContext.shaker) playerContext.shaker.addTrauma(0.12);
                  continue;
                }

                // Reinhardt Shield block
                if (pHero.name === 'REINHARDT' && pHero.isShieldActive) {
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  forward.y = 0;
                  forward.normalize();
                  const toProj = p.mesh.position.clone().sub(pPos).normalize();
                  if (forward.dot(toProj) > 0.1) {
                    pHero.takeShieldDamage(p.damage);
                    this.spawnHitSparks(p.mesh.position, toProj.negate(), 0x38bdf8, 8);
                    if (playerContext.audio) playerContext.audio.playHit(false);
                    if (playerContext.shaker) playerContext.shaker.addTrauma(0.06);
                    hit = true;
                  }
                }
              }
            }
          } else {
            // Local player shuriken: Continuous Swept Collision Detection (CCD) against targets
            const dx = p.mesh.position.x - prevPos.x;
            const dz = p.mesh.position.z - prevPos.z;
            const horizLenSq = dx * dx + dz * dz;

            for (const bot of bots) {
              if (bot.isDead) continue;
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

              if (horizDist <= 1.25 && closestY >= (botPos.y + 0.1) && closestY <= (botPos.y + 2.7)) {
                const isHead = closestY >= (botPos.y + 1.85);
                const dmg = isHead ? p.damage * 2 : p.damage;
                const finalBlow = bot.takeDamage(dmg, isHead, p.velocity.clone().normalize());
                onHitCallback(bot, dmg, isHead, finalBlow);
                this.spawnHitSparks(new THREE.Vector3(closestX, closestY, closestZ), new THREE.Vector3(0, 1, 0), 0x10b981, 8);
                hit = true;
                break;
              }
            }
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

      // --- FIRE STRIKE ---
      } else if (p.type === 'firestrike') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();

        // Fiery wobble and subtle spin
        p.mesh.rotation.z += 4.5 * dt;

        let wallBlocked = false;
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.7);
          if (wallHit.hit) {
            wallBlocked = true;
            this.spawnHitSparks(wallHit.point || prevPos, new THREE.Vector3(0, 1, 0), 0xff4500, 14);
          }
        }

        if (!wallBlocked) {
          if (p.isRemote) {
            // Remote Fire Strike flying toward player
            if (playerContext && playerContext.playerPos && playerContext.currentHero) {
              const pPos = playerContext.playerPos;
              const pHero = playerContext.currentHero;
              const pCam = playerContext.camera;
              const dist = p.mesh.position.distanceTo(pPos);

              // Genji can deflect Fire Strike!
              if (dist < 2.2 && pHero.name === 'GENJI' && pHero.isDeflecting) {
                p.isRemote = false; // Deflected flame wave now belongs to local Genji!
                const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                p.velocity.copy(forward).multiplyScalar(24);
                p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forward);
                if (playerContext.audio) playerContext.audio.playGenjiDeflect();
                if (playerContext.shaker) playerContext.shaker.addTrauma(0.3);
                continue;
              }
            }
          } else {
            // Local Fire Strike: Piercing swept hit check
            const dx = p.mesh.position.x - prevPos.x;
            const dz = p.mesh.position.z - prevPos.z;
            const horizLenSq = dx * dx + dz * dz;

            for (const bot of bots) {
              if (bot.isDead || p.hitBots.has(bot.id || bot)) continue;
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
                p.hitBots.add(bot.id || bot);
                const finalBlow = bot.takeDamage(p.damage, false, p.velocity.clone().normalize());
                onHitCallback(bot, p.damage, false, finalBlow);
                this.spawnHitSparks(new THREE.Vector3(closestX, closestY, closestZ), new THREE.Vector3(0, 1, 0), 0xff5500, 12);
              }
            }
          }
        }

        if (wallBlocked || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          this.projectiles.splice(i, 1);
        }

      // --- PULSE BOMB ---
      } else if (p.type === 'pulsebomb') {
        if (!p.isStuck) {
          const prevPos = p.mesh.position.clone();
          p.velocity.y += p.gravity * dt;
          p.mesh.position.addScaledVector(p.velocity, dt);

          // Wall collision (Sticks to wall on contact)
          if (map && typeof map.checkProjectileHit === 'function') {
            const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.22);
            if (wallHit.hit) {
              p.isStuck = true;
              p.mesh.position.copy(wallHit.point);
              p.velocity.set(0, 0, 0);
              if (p.ringMesh) p.ringMesh.visible = true;
            }
          }

          // Floor collision (Sticks to ground)
          if (!p.isStuck && p.mesh.position.y <= 0.15) {
            p.mesh.position.y = 0.15;
            p.velocity.set(0, 0, 0);
            p.isStuck = true;
            if (p.ringMesh) p.ringMesh.visible = true;
          }

          // Target Body collision (Sticks to player/bot body)
          if (!p.isStuck) {
            for (const bot of bots) {
              if (bot.isDead) continue;
              const botPos = bot.group.position;
              const horizDist = Math.hypot(p.mesh.position.x - botPos.x, p.mesh.position.z - botPos.z);
              const vertY = p.mesh.position.y;
              if (horizDist < 1.1 && vertY >= botPos.y && vertY <= botPos.y + 2.5) {
                p.isStuck = true;
                p.stuckTarget = bot;
                p.velocity.set(0, 0, 0);
                if (p.ringMesh) p.ringMesh.visible = true;
                break;
              }
            }
          }
        } else if (p.stuckTarget) {
          p.mesh.position.copy(p.stuckTarget.group.position).add(new THREE.Vector3(0, 1.2, 0));
        }

        // Pulse Countdown & Flash
        p.countdown -= dt;
        const blinkFreq = p.countdown < 0.5 ? 22 : 8;
        const isBlinkRed = Math.sin(Date.now() * 0.02 * blinkFreq) > 0;
        if (p.coreMesh) p.coreMesh.material.color.setHex(isBlinkRed ? 0xef4444 : 0x00f0ff);

        // Expand holographic ring
        if (p.ringMesh && p.ringMesh.visible) {
          const ringScale = 1.0 + (1.5 - p.countdown) * 0.8;
          p.ringMesh.scale.set(ringScale, ringScale, 1.0);
          p.ringMesh.material.opacity = 0.5 + Math.sin(Date.now() * 0.025 * blinkFreq) * 0.4;
        }

        if (p.countdown <= 0) {
          // EXPLODE!
          this.spawnHitSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), 0x00f0ff, 24);

          if (!p.isRemote) {
            for (const bot of bots) {
              if (bot.isDead) continue;
              const targetCenter = bot.group.position.clone().add(new THREE.Vector3(0, 1.0, 0));
              const dist = p.mesh.position.distanceTo(targetCenter);
              if (dist < 5.5) {
                const falloff = 1 - dist / 5.5;
                const dmg = Math.floor(p.damage * falloff);
                const finalBlow = bot.takeDamage(dmg, false, new THREE.Vector3(0, 1, 0));
                onHitCallback(bot, dmg, false, finalBlow);
              }
            }
          }

          this.scene.remove(p.mesh);
          p.mesh.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
          });
          this.projectiles.splice(i, 1);
        }

      // --- BOT / ENEMY PLASMA BOLT ---
      } else if (p.type === 'enemy_bolt') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();

        let hit = false;

        // Map collision
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.18);
          if (wallHit.hit) {
            hit = true;
            this.spawnHitSparks(wallHit.point || prevPos, new THREE.Vector3(0, 1, 0), 0xff2244, 8);
          }
        }

        if (!hit) {
          if (!p.isReflected) {
            // Check collision against local player
            if (playerContext && playerContext.playerPos && playerContext.currentHero) {
              const pPos = playerContext.playerPos;
              const pHero = playerContext.currentHero;
              const pCam = playerContext.camera;
              const dist = p.mesh.position.distanceTo(pPos);

              if (dist < 1.7) {
                // 1. Check Genji Deflect
                if (pHero.name === 'GENJI' && pHero.isDeflecting) {
                  p.isReflected = true;
                  p.mesh.traverse((child) => {
                    if (child.material && child.material.color) {
                      child.material.color.setHex(0x10b981);
                    }
                  });
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  p.velocity.copy(forward).multiplyScalar(44);
                  p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), forward);
                  if (playerContext.audio) playerContext.audio.playGenjiDeflect();
                  if (playerContext.shaker) playerContext.shaker.addTrauma(0.18);
                  continue;
                }

                // 2. Check Reinhardt Shield
                if (pHero.name === 'REINHARDT' && pHero.isShieldActive) {
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  forward.y = 0;
                  forward.normalize();
                  const toBolt = p.mesh.position.clone().sub(pPos).normalize();
                  if (forward.dot(toBolt) > 0.1) {
                    pHero.takeShieldDamage(p.damage);
                    this.spawnHitSparks(p.mesh.position, toBolt.negate(), 0x38bdf8, 8);
                    if (playerContext.audio) playerContext.audio.playHit(false);
                    if (playerContext.shaker) playerContext.shaker.addTrauma(0.08);
                    hit = true;
                  }
                }

                if (!hit && !p.isReflected) {
                  // Direct hit on unshielded local player
                  pHero.takeDamage(p.damage);
                  this.spawnHitSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), 0xef4444, 10);
                  if (playerContext.audio) playerContext.audio.playDamage();
                  if (playerContext.shaker) playerContext.shaker.addTrauma(0.2);
                  if (playerContext.ui) playerContext.ui.triggerDamageFlash();
                  hit = true;
                }
              }
            }
          } else {
            // Deflected bolt: travels forward and damages training bots or enemies
            for (const bot of bots) {
              if (bot.isDead) continue;
              const botPos = bot.group.position;
              const dist = p.mesh.position.distanceTo(botPos.clone().add(new THREE.Vector3(0, 1.2, 0)));
              if (dist < 1.4) {
                const finalBlow = bot.takeDamage(50, false, p.velocity.clone().normalize());
                if (typeof onHitCallback === 'function') {
                  onHitCallback(bot, 50, false, finalBlow);
                }
                this.spawnHitSparks(p.mesh.position, new THREE.Vector3(0, 1, 0), 0x10b981, 10);
                hit = true;
                break;
              }
            }
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
      }
    }
  }
}
