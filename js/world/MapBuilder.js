/**
 * ============================================================================
 * OVERWATCH 2 : TRAINING ARENA MAP BUILDER
 * - Bright Daylight Theme (Overwatch Training Range & Ilios aesthetic)
 * - Crisp character silhouette visibility & high contrast
 * - Solid 3D Obstacle Collision System (Pillars, Balcony, Ramp, Barricades)
 * ============================================================================
 */

export class MapBuilder {
  constructor(scene) {
    this.scene = scene;
    this.healthPacks = [];
    this.colliders = []; // Solid collision registry

    this.buildLighting();
    this.buildArenaGeometry();
    this.buildTacticalProps();
    this.spawnHealthPacks();
  }

  buildLighting() {
    // 1. Bright Omni-directional Sky/Ground Daylight (Hemisphere Light)
    // Ensures characters, weapons, and enemies are NEVER lost in dark shadows!
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xcfd8dc, 0.95);
    hemiLight.position.set(0, 50, 0);
    this.scene.add(hemiLight);

    // 2. Main Sun (Directional Light - Warm Golden Daylight)
    const sun = new THREE.DirectionalLight(0xfff8ea, 1.35);
    sun.position.set(28, 45, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -42;
    sun.shadow.camera.right = 42;
    sun.shadow.camera.top = 42;
    sun.shadow.camera.bottom = -42;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    // 3. Cool Skylight Fill Light (eliminates pitch-black back-facing surfaces)
    const fillLight = new THREE.DirectionalLight(0xbde0fe, 0.50);
    fillLight.position.set(-25, 30, -20);
    this.scene.add(fillLight);

    // 4. Subtle Ambient Light for clean contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);

    // 5. Sci-fi Neon Point Accent Lights
    const bluePoint = new THREE.PointLight(0x00c3ff, 1.5, 25);
    bluePoint.position.set(-14, 3.5, -12);
    this.scene.add(bluePoint);

    const orangePoint = new THREE.PointLight(0xf97316, 1.6, 25);
    orangePoint.position.set(14, 3.5, 12);
    this.scene.add(orangePoint);
  }

  buildArenaGeometry() {
    // 1. Main Floor: Bright Clean Architectural Paving (Overwatch White & Pale Slate)
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xeef2f7, // Bright clean white/silver composite
      roughness: 0.45,
      metalness: 0.15
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Clean Tech Grid Floor Decal (High visibility)
    const gridHelper = new THREE.GridHelper(80, 40, 0xf97316, 0xcbd5e1);
    gridHelper.position.y = 0.01;
    this.scene.add(gridHelper);

    // 2. Central Overwatch Circle Emblem (Glowing Vibrant Orange & Cyan)
    const ringGeo = new THREE.RingGeometry(3.5, 3.9, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    this.scene.add(ring);

    const innerRingGeo = new THREE.RingGeometry(1.6, 1.8, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.02;
    this.scene.add(innerRing);

    const centerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 24),
      new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide })
    );
    centerDot.rotation.x = -Math.PI / 2;
    centerDot.position.y = 0.02;
    this.scene.add(centerDot);

    // 3. Perimeter Arena Walls (Bright White Architectural Panels with Navy Skirting)
    const wallWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      metalness: 0.1
    });
    const wallBaseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.3
    });
    const orangeTrimMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });

    const createWall = (width, depth, posX, posZ) => {
      const group = new THREE.Group();
      group.position.set(posX, 0, posZ);

      // Main upper wall (height 7m, from y=1 to 8)
      const upperGeo = new THREE.BoxGeometry(width, 7, depth);
      const upper = new THREE.Mesh(upperGeo, wallWhiteMat);
      upper.position.y = 4.5;
      upper.receiveShadow = true;
      group.add(upper);

      // Foundation base skirting (height 1m, y=0 to 1)
      const baseGeo = new THREE.BoxGeometry(width * 1.01, 1.0, depth * 1.01);
      const base = new THREE.Mesh(baseGeo, wallBaseMat);
      base.position.y = 0.5;
      group.add(base);

      // Orange Hazard / Overwatch Trim Strip (y=4.5)
      const trimGeo = new THREE.BoxGeometry(width * 1.02, 0.25, depth * 1.02);
      const trim = new THREE.Mesh(trimGeo, orangeTrimMat);
      trim.position.y = 4.5;
      group.add(trim);

      this.scene.add(group);
    };

    // North & South
    createWall(80, 2, 0, -40);
    createWall(80, 2, 0, 40);
    // West & East
    createWall(2, 80, -40, 0);
    createWall(2, 80, 40, 0);

    // Register outer boundary colliders
    this.colliders.push(
      { name: 'wall_north', minX: -40, maxX: 40, minZ: -41, maxZ: -39, minY: 0, maxY: 8, canStandOn: false },
      { name: 'wall_south', minX: -40, maxX: 40, minZ: 39, maxZ: 41, minY: 0, maxY: 8, canStandOn: false },
      { name: 'wall_west', minX: -41, maxX: -39, minZ: -40, maxZ: 40, minY: 0, maxY: 8, canStandOn: false },
      { name: 'wall_east', minX: 39, maxX: 41, minZ: -40, maxZ: 40, minY: 0, maxY: 8, canStandOn: false }
    );

    // 4. Elevated Sniper Balcony (High-tech Platform at y=3.0)
    const platGeo = new THREE.BoxGeometry(20, 2, 8);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.25
    });
    const plat = new THREE.Mesh(platGeo, platMat);
    plat.position.set(0, 3, -25);
    plat.castShadow = true;
    plat.receiveShadow = true;
    this.scene.add(plat);

    // Balcony Accent Edge
    const platEdgeGeo = new THREE.BoxGeometry(20.2, 0.25, 0.3);
    const platEdge = new THREE.Mesh(platEdgeGeo, orangeTrimMat);
    platEdge.position.set(0, 4.05, -21.0);
    this.scene.add(platEdge);

    // Balcony Support Columns
    const colMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 });
    [-8, 8].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 1.2), colMat);
      col.position.set(cx, 1.5, -25);
      col.castShadow = true;
      this.scene.add(col);
    });

    // Balcony Collider (x: -10 to 10, y: 0 to 4.0, z: -29 to -21)
    this.colliders.push({
      name: 'balcony',
      minX: -10,
      maxX: 10,
      minZ: -29,
      maxZ: -21,
      minY: 0,
      maxY: 4.0, // Standing surface at y = 4.0
      canStandOn: true
    });

    // 5. Ramp to Balcony (Walkable from ground y=0 to balcony y=4.0)
    // Center at (13, 2.0, -18.5), length 13.5m along Z, width 5.2m
    const rampGroup = new THREE.Group();
    const rampGeo = new THREE.BoxGeometry(5.2, 0.6, 13.5);
    const ramp = new THREE.Mesh(rampGeo, platMat);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    rampGroup.position.set(13, 2.0, -18.5);
    rampGroup.rotation.x = Math.atan2(4.0, 13.0); // Smooth slope from z = -11.8 to z = -25.2
    rampGroup.add(ramp);
    this.scene.add(rampGroup);

    // Register Ramp Collider
    this.colliders.push({
      name: 'ramp',
      minX: 10.4,
      maxX: 15.6,
      minZ: -25.2,
      maxZ: -11.8,
      minY: 0,
      maxY: 4.0,
      isRamp: true,
      zStart: -11.8, // Ground level (y=0)
      zEnd: -25.2,   // Balcony level (y=4.0)
      yStart: 0.0,
      yEnd: 4.0,
      canStandOn: true
    });

    // 6. Solid High-Tech Training Pillars & Cover Blocks
    const pillarBodyMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.35,
      metalness: 0.2
    });
    const pillarAccentMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb, // Vibrant Cyber Blue
      roughness: 0.3,
      metalness: 0.4
    });
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    const pCoords = [
      [-12, -8], [12, -8], [-12, 10], [12, 10], [-22, 0], [22, 0]
    ];

    pCoords.forEach(([px, pz]) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, pz);

      // Main pillar body (2.6m x 4.5m x 2.6m)
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(2.6, 4.5, 2.6), pillarBodyMat);
      pMesh.position.y = 2.25;
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      pGroup.add(pMesh);

      // Cyber Blue Corner Plates
      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.4), pillarAccentMat);
      plate.position.set(0, 2.25, 1.25);
      pGroup.add(plate);

      const plateB = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.2, 0.4), pillarAccentMat);
      plateB.position.set(0, 2.25, -1.25);
      pGroup.add(plateB);

      // Glowing Cyan LED Strip
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 2.75), ledMat);
      led.position.y = 2.25;
      pGroup.add(led);

      this.scene.add(pGroup);

      // Register Solid Obstacle Collider
      this.colliders.push({
        name: `pillar_${px}_${pz}`,
        minX: px - 1.35,
        maxX: px + 1.35,
        minZ: pz - 1.35,
        maxZ: pz + 1.35,
        minY: 0,
        maxY: 4.5,
        canStandOn: false
      });
    });
  }

  buildTacticalProps() {
    // High-Tech Overwatch Tactical Barricades (Low Cover with glowing shield tops)
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.35,
      metalness: 0.3
    });
    const orangeStripeMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.4
    });
    const energyShieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.55
    });

    const createBarricade = (bx, bz, rotY = 0) => {
      const group = new THREE.Group();
      group.position.set(bx, 0, bz);
      group.rotation.y = rotY;

      // Solid Lower Base (Width 3.6m, Height 1.35m, Depth 1.2m)
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.35, 1.2), crateMat);
      base.position.y = 0.675;
      base.castShadow = true;
      base.receiveShadow = true;
      group.add(base);

      // Orange Accent Chevron
      const chev = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.25), orangeStripeMat);
      chev.position.y = 0.675;
      group.add(chev);

      // Holographic Energy Shield Projection on Top (Height 0.5m)
      const shield = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.08), energyShieldMat);
      shield.position.set(0, 1.6, 0);
      group.add(shield);

      this.scene.add(group);

      // Register Solid Collider
      const halfW = 1.85;
      const halfD = 0.65;
      this.colliders.push({
        name: `barricade_${bx}_${bz}`,
        minX: bx - halfW,
        maxX: bx + halfW,
        minZ: bz - halfD,
        maxZ: bz + halfD,
        minY: 0,
        maxY: 1.85,
        canStandOn: true
      });
    };

    // Center arena tactical cover positions
    createBarricade(-6, 0);
    createBarricade(6, 0);

    // High-Tech Supply Pods / Power Generators
    const createSupplyCrate = (cx, cz) => {
      const group = new THREE.Group();
      group.position.set(cx, 0, cz);

      const crate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.2), crateMat);
      crate.position.y = 0.9;
      crate.castShadow = true;
      crate.receiveShadow = true;
      group.add(crate);

      const band = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.4, 2.3), orangeStripeMat);
      band.position.y = 0.9;
      group.add(band);

      this.scene.add(group);

      this.colliders.push({
        name: `crate_${cx}_${cz}`,
        minX: cx - 1.15,
        maxX: cx + 1.15,
        minZ: cz - 1.15,
        maxZ: cz + 1.15,
        minY: 0,
        maxY: 1.8,
        canStandOn: true
      });
    };

    createSupplyCrate(-18, -10);
    createSupplyCrate(18, -10);
  }

  spawnHealthPacks() {
    // Mega Health Pack (250 HP) on center-right
    this.createHealthPack(16, -14, 250, 'mega');
    // Mini Health Pack (75 HP) on center-left
    this.createHealthPack(-16, 14, 75, 'mini');
  }

  createHealthPack(x, z, healAmount, type) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    // Holographic Base (Clean white/chrome)
    const baseGeo = new THREE.CylinderGeometry(0.85, 1.05, 0.25, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.125;
    group.add(base);

    // Glowing base ring
    const ringGeo = new THREE.RingGeometry(0.88, 1.0, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.26;
    group.add(ring);

    // Floating Medical Cross Icon
    const crossGeo1 = new THREE.BoxGeometry(0.65, 0.22, 0.22);
    const crossGeo2 = new THREE.BoxGeometry(0.22, 0.65, 0.22);
    const crossMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981
    });

    const crossGroup = new THREE.Group();
    crossGroup.add(new THREE.Mesh(crossGeo1, crossMat));
    crossGroup.add(new THREE.Mesh(crossGeo2, crossMat));
    crossGroup.position.y = 0.95;
    group.add(crossGroup);

    this.scene.add(group);

    // Register health pack base as low solid obstacle (can walk over / step up)
    this.colliders.push({
      name: `healthpack_base_${x}_${z}`,
      minX: x - 0.9,
      maxX: x + 0.9,
      minZ: z - 0.9,
      maxZ: z + 0.9,
      minY: 0,
      maxY: 0.25,
      canStandOn: true
    });

    this.healthPacks.push({
      group,
      crossGroup,
      healAmount,
      type,
      active: true,
      respawnTimer: 0,
      pos: new THREE.Vector3(x, 0.95, z)
    });
  }

  /**
   * ==========================================================================
   * 3D COLLISION DETECTION & SLIDING RESOLUTION (PASS-THROUGH PREVENTION)
   * ==========================================================================
   * - Prevents players and heroes from passing through walls, pillars, barricades.
   * - Smooth sliding along obstacle surfaces.
   * - Multi-level height resolution (ground floor vs balcony high-ground vs ramp).
   */
  resolveCollision(pos, radius = 0.55) {
    let groundY = 1.7; // Standard standing eye height (floor y=0 + 1.7m)
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.2;

    // 1. Check Platform & Ramp Standing Support
    for (const col of this.colliders) {
      if (pos.x >= col.minX && pos.x <= col.maxX && pos.z >= col.minZ && pos.z <= col.maxZ) {
        if (col.isRamp) {
          // Linear height interpolation on ramp
          const t = Math.max(0, Math.min(1, (pos.z - col.zStart) / (col.zEnd - col.zStart)));
          const rampH = col.yStart + t * (col.yEnd - col.yStart);
          if (feetY >= rampH - 0.65 && feetY <= rampH + 1.0) {
            groundY = Math.max(groundY, rampH + 1.7);
          }
        } else if (col.canStandOn) {
          // If feet are near or above top surface
          if (feetY >= col.maxY - 0.45) {
            groundY = Math.max(groundY, col.maxY + 1.7);
          }
        }
      }
    }

    // 2. Horizontal Obstacle Penetration Resolution (Push Out / Slide)
    for (const col of this.colliders) {
      // If player is safely walking on TOP of this platform, skip horizontal blocking
      if (col.canStandOn && feetY >= col.maxY - 0.15) {
        continue;
      }

      // Vertical bounding check
      if (headY < col.minY || feetY > col.maxY) {
        continue;
      }

      // Find closest point on AABB rectangle to player (pos.x, pos.z)
      const clampedX = Math.max(col.minX, Math.min(col.maxX, pos.x));
      const clampedZ = Math.max(col.minZ, Math.min(col.maxZ, pos.z));

      let dx = pos.x - clampedX;
      let dz = pos.z - clampedZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        if (dist > 0.0001) {
          // Push out along the normal vector by the penetration depth
          const overlap = radius - dist;
          pos.x += (dx / dist) * overlap;
          pos.z += (dz / dist) * overlap;
        } else {
          // Player center penetrated directly inside the box: push to nearest face
          const dLeft = Math.abs(pos.x - col.minX);
          const dRight = Math.abs(col.maxX - pos.x);
          const dBack = Math.abs(pos.z - col.minZ);
          const dFront = Math.abs(col.maxZ - pos.z);
          const minEdge = Math.min(dLeft, dRight, dBack, dFront);

          if (minEdge === dLeft) pos.x = col.minX - radius;
          else if (minEdge === dRight) pos.x = col.maxX + radius;
          else if (minEdge === dBack) pos.z = col.minZ - radius;
          else pos.z = col.maxZ + radius;
        }
      }
    }

    // 3. Absolute Perimeter Arena Clamping
    pos.x = Math.max(-38.2, Math.min(38.2, pos.x));
    pos.z = Math.max(-38.2, Math.min(38.2, pos.z));

    return { groundY };
  }

  /**
   * Fast obstacle collision test (used for Reinhardt charge wall slam & abilities)
   */
  checkWallCollision(pos, radius = 0.6) {
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.2;

    // Check perimeter boundary
    if (Math.abs(pos.x) >= 38.0 || Math.abs(pos.z) >= 38.0) {
      return { hit: true, name: 'perimeter_wall' };
    }

    for (const col of this.colliders) {
      if (col.canStandOn && feetY >= col.maxY - 0.2) continue;
      if (headY < col.minY || feetY > col.maxY) continue;

      const clampedX = Math.max(col.minX, Math.min(col.maxX, pos.x));
      const clampedZ = Math.max(col.minZ, Math.min(col.maxZ, pos.z));
      const dx = pos.x - clampedX;
      const dz = pos.z - clampedZ;

      if ((dx * dx + dz * dz) < radius * radius) {
        return { hit: true, name: col.name };
      }
    }

    return { hit: false };
  }

  update(dt, playerPos, onHealCallback) {
    this.healthPacks.forEach((hp) => {
      if (!hp.active) {
        hp.respawnTimer -= dt;
        if (hp.respawnTimer <= 0) {
          hp.active = true;
          hp.crossGroup.visible = true;
        }
      } else {
        // Spin and bob
        hp.crossGroup.rotation.y += 2.0 * dt;
        hp.crossGroup.position.y = 0.95 + Math.sin(Date.now() * 0.004) * 0.12;

        // Pickup check
        if (playerPos && playerPos.distanceTo(hp.pos) < 1.7) {
          const picked = onHealCallback(hp.healAmount);
          if (picked) {
            hp.active = false;
            hp.crossGroup.visible = false;
            hp.respawnTimer = hp.type === 'mega' ? 10.0 : 6.0;
          }
        }
      }
    });
  }
}
