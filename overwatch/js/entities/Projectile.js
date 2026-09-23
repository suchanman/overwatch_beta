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

  // 5. Training Bot / Enemy Plasma Bolt (For testing shield blocking and deflect)
  spawnEnemyBolt(origin, direction, speed = 25, damage = 25) {
    const geo = new THREE.SphereGeometry(0.18, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff2244 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(origin);

    const haloGeo = new THREE.SphereGeometry(0.30, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff5577,
      transparent: true,
      opacity: 0.55
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    mesh.add(halo);

    this.scene.add(mesh);
    this.projectiles.push({
      type: 'enemy_bolt',
      mesh,
      velocity: direction.clone().multiplyScalar(speed),
      life: 3.5,
      damage,
      isReflected: false,
      lastPos: origin.clone()
    });
  }

  update(dt, bots, onHitCallback, map = null, playerContext = null) {
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

        let hit = false;

        // Wall & Obstacle Collision Check
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.15);
          if (wallHit.hit) {
            hit = true;
          }
        }

        if (!hit) {
          // Continuous Swept Collision Detection (CCD) against Bot / Player Vertical Cylinders
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
              hit = true;
              break;
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
      } else if (p.type === 'firestrike') {
        p.life -= dt;
        const prevPos = p.lastPos ? p.lastPos.clone() : p.mesh.position.clone();
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.lastPos = p.mesh.position.clone();
        p.mesh.rotation.z += 8 * dt;

        let wallBlocked = false;

        // Wall & Obstacle Collision Check (Reinhardt Fire Strike cannot pass through solid walls)
        if (map && typeof map.checkProjectileHit === 'function') {
          const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.6);
          if (wallHit.hit) {
            wallBlocked = true;
          }
        }

        if (!wallBlocked) {
          const dx = p.mesh.position.x - prevPos.x;
          const dz = p.mesh.position.z - prevPos.z;
          const horizLenSq = dx * dx + dz * dz;

          // Piercing swept hit check against enemy cylinder
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
            }
          }
        }

        if (wallBlocked || p.life <= 0) {
          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
      } else if (p.type === 'pulsebomb') {
        if (!p.isStuck) {
          const prevPos = p.mesh.position.clone();
          p.velocity.y += p.gravity * dt;
          p.mesh.position.addScaledVector(p.velocity, dt);

          // Wall / Obstacle Collision Check (Sticks to wall on contact)
          if (map && typeof map.checkProjectileHit === 'function') {
            const wallHit = map.checkProjectileHit(prevPos, p.mesh.position, 0.22);
            if (wallHit.hit) {
              p.isStuck = true;
              p.mesh.position.copy(wallHit.point);
              p.velocity.set(0, 0, 0);
            }
          }

          // Floor collision (Sticks to ground)
          if (!p.isStuck && p.mesh.position.y <= 0.15) {
            p.mesh.position.y = 0.15;
            p.velocity.set(0, 0, 0);
            p.isStuck = true;
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
                break;
              }
            }
          }
        } else if (p.stuckTarget) {
          p.mesh.position.copy(p.stuckTarget.group.position).add(new THREE.Vector3(0, 1.2, 0));
        }

        // Pulse Countdown & Flash
        p.countdown -= dt;
        const blinkFreq = p.countdown < 0.5 ? 20 : 8;
        p.mesh.material.color.setHex(Math.sin(Date.now() * 0.02 * blinkFreq) > 0 ? 0xff0044 : 0x00f0ff);

        if (p.countdown <= 0) {
          // EXPLODE!
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

          this.scene.remove(p.mesh);
          p.mesh.geometry.dispose();
          p.mesh.material.dispose();
          this.projectiles.splice(i, 1);
        }
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
                  if (p.mesh.children && p.mesh.children[0]) {
                    p.mesh.children[0].material.color.setHex(0x00ff88);
                  }
                  p.mesh.material.color.setHex(0x10b981);
                  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(pCam.quaternion);
                  p.velocity.copy(forward).multiplyScalar(42);
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
                    if (playerContext.audio) playerContext.audio.playHit(false);
                    if (playerContext.shaker) playerContext.shaker.addTrauma(0.08);
                    hit = true;
                  }
                }

                if (!hit && !p.isReflected) {
                  // Direct hit on unshielded player
                  pHero.takeDamage(p.damage);
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
