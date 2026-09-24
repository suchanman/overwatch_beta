/**
 * ============================================================================
 * OVERWATCH 2 : ROUTE 66 (DEADLOCK GORGE) MAP BUILDER
 * - Authentic Deadlock Gorge Desert Map Implementation
 * - Big Earl's Diner, Gas Station, Payload, Crashed Train & Steel Platform
 * - Dynamic Strata Cliffs & Hoodoo Rock Pillars
 * - Full 3D Multi-Level Collision System (Roofs, Platforms, Stepping Crates)
 * - Distributed Health Packs (Mega 250 HP & Mini 75 HP) with Respawns
 * ============================================================================
 */

export class MapBuilder {
  constructor(scene) {
    this.scene = scene;
    this.healthPacks = [];
    this.colliders = []; // Solid 3D collision registry

    this.palette = {
      sky: 0x88c2f0,
      fog: 0xdca67a,
      rockBase: 0xba5b3a,
      rockDark: 0x8e3b24,
      rockHighlight: 0xdb7752,
      sand: 0xdeb887,
      asphalt: 0x3d3b38,
      dinerWall: 0xf2eedb,
      dinerTrim: 0xa8412b,
      dinerAwning: 0x1f7a8c,
      woodCrate: 0x825330,
      trainRed: 0xa82d2d,
      trainSilver: 0xc4ccd3,
      payloadBlue: 0x2b6cb0,
      garageBlue: 0x4a6b8c,
      metalPlatform: 0xa0aec0
    };

    this.buildLighting();
    this.buildRoute66Environment();
    this.spawnHealthPacks();
  }

  buildLighting() {
    // 1. Scene sky & warm desert atmospheric fog
    this.scene.background = new THREE.Color(this.palette.sky);
    this.scene.fog = new THREE.FogExp2(this.palette.fog, 0.0055);

    // 2. Warm Desert Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xfff1dc, 0x965a38, 0.65);
    hemiLight.position.set(0, 60, 0);
    this.scene.add(hemiLight);

    // 3. Bright Sun (Directional Light with sharp shadows)
    const sun = new THREE.DirectionalLight(0xffeed6, 1.45);
    sun.position.set(90, 140, 70);
    sun.castShadow = true;
    sun.shadow.camera.left = -140;
    sun.shadow.camera.right = 140;
    sun.shadow.camera.top = 140;
    sun.shadow.camera.bottom = -140;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far = 400;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.bias = -0.0005;
    this.scene.add(sun);

    // 4. Subtle ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
  }

  createSignTexture(text, bgColor, textColor, width, height, fontSize) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const lines = text.split('\n');
    ctx.fillStyle = textColor;
    ctx.font = `900 ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lh = fontSize * 1.2;
    let startY = (height - (lines.length * lh)) / 2 + (lh / 2);
    lines.forEach(line => {
      ctx.fillText(line, width / 2, startY);
      startY += lh;
    });

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
  }

  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3a3734';
    ctx.fillRect(0, 0, 512, 1024);
    // Yellow double line
    ctx.fillStyle = '#f5ab16';
    ctx.fillRect(244, 0, 8, 1024);
    ctx.fillRect(260, 0, 8, 1024);
    // White edge lines
    ctx.fillStyle = '#dcdcdc';
    ctx.fillRect(35, 0, 10, 1024);
    ctx.fillRect(467, 0, 10, 1024);

    // Route 66 Shield Emblem
    ctx.save();
    ctx.translate(256, 320);
    ctx.scale(0.8, 0.8);
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.moveTo(0, -90);
    ctx.bezierCurveTo(45, -90, 85, -85, 95, -50);
    ctx.bezierCurveTo(95, 30, 65, 80, 0, 105);
    ctx.bezierCurveTo(-65, 80, -95, 30, -95, -50);
    ctx.bezierCurveTo(-85, -85, -45, -90, 0, -90);
    ctx.fill();

    ctx.fillStyle = '#1a202c';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ROUTE', 0, -45);
    ctx.font = '900 85px sans-serif';
    ctx.fillText('66', 0, 20);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
  }

  addCollider(mesh, name = 'obstacle', canStandOn = true) {
    mesh.updateMatrixWorld(true);
    const box3 = new THREE.Box3();
    box3.setFromObject(mesh);
    this.colliders.push({
      name,
      minX: box3.min.x,
      maxX: box3.max.x,
      minY: box3.min.y,
      maxY: box3.max.y,
      minZ: box3.min.z,
      maxZ: box3.max.z,
      canStandOn
    });
  }

  createBox(x, y, z, w, h, d, colorHex, rx = 0, ry = 0, rz = 0, name = 'box', collide = true) {
    const mat = (typeof colorHex === 'number')
      ? new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9 })
      : colorHex;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  createCylinder(x, y, z, r, h, colorHex, rx = 0, ry = 0, rz = 0, name = 'cyl', collide = true) {
    const mat = (typeof colorHex === 'number')
      ? new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.8 })
      : colorHex;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.set(rx, ry, rz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  buildStrataCliff(x, y, z, w, h, d, rotY, colorHex, name = 'strata_cliff') {
    const segX = Math.max(1, Math.floor(w / 6));
    const segZ = Math.max(1, Math.floor(d / 6));
    const geo = new THREE.BoxGeometry(w, h, d, segX, Math.floor(h / 5), segZ);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);
      const strata = Math.sin(py * 1.5) * 2.5;
      const noise = (Math.random() - 0.5) * 3.5;
      if (py > -h / 2 + 2) {
        pos.setX(i, px + (px > 0 ? noise + strata : -noise - strata));
        pos.setZ(i, pz + (pz > 0 ? noise + strata : -noise - strata));
      }
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 1.0, flatShading: true })
    );
    mesh.position.set(x, y + h / 2, z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Collision box
    const col = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, h, d * 0.85));
    col.position.copy(mesh.position);
    col.rotation.copy(mesh.rotation);
    this.addCollider(col, name, false);
  }

  buildHoodoo(x, y, z, baseR, topR, h, colorHex, name = 'hoodoo') {
    const geo = new THREE.CylinderGeometry(topR, baseR, h, 14, Math.floor(h / 3));
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let px = pos.getX(i);
      let py = pos.getY(i);
      let pz = pos.getZ(i);
      const strata = Math.sin(py * 1.2) * 1.8;
      if (py > -h / 2 + 2) {
        pos.setX(i, px + strata * Math.sign(px) + (Math.random() - 0.5) * 2);
        pos.setZ(i, pz + strata * Math.sign(pz) + (Math.random() - 0.5) * 2);
      }
    }
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.9, flatShading: true })
    );
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(Math.max(baseR, topR) * 0.85, Math.max(baseR, topR) * 0.85, h, 8)
    );
    col.position.copy(mesh.position);
    this.addCollider(col, name, true);
  }

  buildRoute66Environment() {
    const PALETTE = this.palette;

    // 1. Sand Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(360, 360),
      new THREE.MeshStandardMaterial({ color: PALETTE.sand, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Floor Base Box for robust collision support
    const floorBox = new THREE.Mesh(new THREE.BoxGeometry(360, 4, 360));
    floorBox.position.y = -2;
    this.addCollider(floorBox, 'ground_base', true);

    // 2. Asphalt Highway Roads
    const roadMat = this.createRoadTexture();

    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(26, 80), roadMat);
    road1.position.set(30, 0.1, -55);
    road1.rotation.set(-Math.PI / 2, 0, 0.3);
    road1.receiveShadow = true;
    this.scene.add(road1);

    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(26, 80), roadMat);
    road2.position.set(12, 0.1, 0);
    road2.rotation.set(-Math.PI / 2, 0, -0.2);
    road2.receiveShadow = true;
    this.scene.add(road2);

    const road3 = new THREE.Mesh(new THREE.PlaneGeometry(26, 90), roadMat);
    road3.position.set(-5, 0.1, 60);
    road3.rotation.set(-Math.PI / 2, 0, -0.6);
    road3.receiveShadow = true;
    this.scene.add(road3);

    // 3. Building 1: Big Earl's Diner (Right side)
    this.createBox(40, 0, 5, 20, 6, 30, PALETTE.dinerWall, 0, 0, 0, 'diner_main');
    this.createBox(40, 6, 5, 22, 1, 32, PALETTE.dinerTrim, 0, 0, 0, 'diner_roof_1f');
    this.createBox(42, 7, 0, 14, 4, 18, PALETTE.dinerWall, 0, 0, 0, 'diner_2f');
    this.createBox(42, 11, 0, 15, 0.5, 19, PALETTE.dinerTrim, 0, 0, 0, 'diner_roof_2f');

    // Diner Awning & Pillars
    this.createBox(25, 5.5, 5, 22, 0.8, 18, PALETTE.dinerAwning, 0, 0, 0, 'diner_awning');
    this.createCylinder(15, 0, -2, 0.4, 5.5, 0x555555, 0, 0, 0, 'awning_pole1');
    this.createCylinder(15, 0, 12, 0.4, 5.5, 0x555555, 0, 0, 0, 'awning_pole2');

    // Rooftop Neon Sign
    const signMat = this.createSignTexture("Big Earl's\nDINER", "#b83b26", "#ffffff", 512, 256, 60);
    this.createBox(42, 12, 0, 12, 4, 0.6, signMat, 0, -Math.PI / 6, 0, 'diner_neon_sign');

    // GAS Station Sign Crown Tower
    this.createCylinder(48, 0, 30, 0.9, 22, 0xb83226, 0, 0, 0, 'gas_tower_pole');
    this.createCylinder(48, 14, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring1');
    this.createCylinder(48, 16.5, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring2');
    this.createCylinder(48, 19, 30, 3, 1, 0xffffff, 0, 0, 0, 'gas_ring3');
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(4, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.7 })
    );
    crown.position.set(48, 22, 30);
    crown.rotation.x = Math.PI;
    this.scene.add(crown);

    // 4. Building 2: Left Steel Deck Platform & Mine Entrance
    this.createBox(-35, 7, -15, 20, 1, 25, PALETTE.metalPlatform, 0, 0, 0, 'metal_deck');
    this.createCylinder(-27, 0, -26, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole1');
    this.createCylinder(-27, 0, -4, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole2');
    this.createCylinder(-43, 0, -26, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole3');
    this.createCylinder(-43, 0, -4, 0.5, 7, 0x555555, 0, 0, 0, 'platform_pole4');
    this.createBox(-35, 0, -15, 12, 7, 15, 0x4a5568, 0, 0, 0, 'deck_container');
    this.createBox(-20, 0, -20, 5, 3, 5, PALETTE.woodCrate, 0, 0, 0, 'crate_step1');
    this.createBox(-24, 3, -18, 4, 3, 4, PALETTE.woodCrate, 0, 0, 0, 'crate_step2');

    // 5. Building 3: Deadlock Garage (Lower side)
    this.createBox(-15, 0, 60, 25, 8, 20, PALETTE.dinerWall, 0, 0, 0, 'garage_main');
    this.createBox(-15, 8, 60, 27, 1.2, 22, PALETTE.garageBlue, 0, 0, 0, 'garage_roof');
    this.createBox(-18, 9, 62, 10, 4, 12, PALETTE.dinerWall, 0, 0, 0, 'garage_2f');
    this.createBox(-18, 13, 62, 11, 0.6, 13, PALETTE.garageBlue, 0, 0, 0, 'garage_2f_roof');

    // 6. Props: Crashed Train Debris, Hovering Payload & Gorge Billboard
    this.buildHoodoo(2, 0, -25, 8, 5, 10, PALETTE.rockDark, 'train_rock_pedestal');
    this.createBox(5, 7, -25, 8, 5, 18, PALETTE.trainRed, 0.1, 0.4, 0.1, 'train_red');
    this.createBox(-10, 0, -15, 12, 5, 6, PALETTE.trainSilver, -0.1, -0.2, 0, 'train_silver_ramp');
    this.createBox(-12, 3, -20, 4, 4, 4, PALETTE.woodCrate, 0, 0, 0, 'train_crate_step');

    // Hovering Payload Vehicle
    this.createBox(-2, 1.5, 35, 7, 3, 12, PALETTE.payloadBlue, 0, -0.3, 0, 'payload_body');
    // Hover thruster pads
    const padMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const padGeo = new THREE.BoxGeometry(1.5, 0.4, 2);
    const thrusterOffsets = [[-3, -4], [3, -4], [-3, 4], [3, 4]];
    thrusterOffsets.forEach(off => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(-2 + off[0], 1.0, 35 + off[1]);
      pad.rotation.y = -0.3;
      this.scene.add(pad);
    });

    // Welcome Billboard
    const boardMat = this.createSignTexture("Welcome to\nDeadlock Gorge", "#2b6cb0", "#ffffff", 512, 256, 45);
    this.createBox(17, 8, -36, 14, 8, 1, boardMat, 0, -0.3, 0, 'billboard_sign');
    this.createCylinder(12, 0, -35, 0.5, 8, 0x555555, 0, 0, 0, 'billboard_pole1');
    this.createCylinder(22, 0, -38, 0.5, 8, 0x555555, 0, 0, 0, 'billboard_pole2');

    // 7. Giant Canyon Walls (Canyon perimeter)
    this.buildStrataCliff(0, 0, -110, 260, 80, 40, 0, PALETTE.rockBase, 'cliff_north');
    this.buildStrataCliff(0, 0, 110, 260, 80, 40, 0, PALETTE.rockBase, 'cliff_south');
    this.buildStrataCliff(110, 0, 0, 40, 80, 260, 0, PALETTE.rockDark, 'cliff_east');
    this.buildStrataCliff(-110, 0, 0, 40, 80, 260, 0, PALETTE.rockDark, 'cliff_west');

    // Corner Cliffs
    this.buildStrataCliff(80, 0, -80, 60, 75, 60, Math.PI / 4, PALETTE.rockHighlight, 'cliff_ne');
    this.buildStrataCliff(-80, 0, -80, 60, 75, 60, -Math.PI / 4, PALETTE.rockHighlight, 'cliff_nw');
    this.buildStrataCliff(80, 0, 80, 60, 75, 60, -Math.PI / 4, PALETTE.rockBase, 'cliff_se');
    this.buildStrataCliff(-80, 0, 80, 60, 75, 60, Math.PI / 4, PALETTE.rockBase, 'cliff_sw');

    // Towering Hoodoo Pillars
    this.buildHoodoo(-32, 0, -45, 12, 4, 52, PALETTE.rockHighlight, 'hoodoo_main_1');
    this.buildHoodoo(55, 0, 15, 14, 5, 48, PALETTE.rockDark, 'hoodoo_main_2');
    this.buildHoodoo(-50, 0, 30, 11, 4, 42, PALETTE.rockBase, 'hoodoo_main_3');
  }

  // ==========================================================================
  // DISTRIBUTED HEALTH PACKS (MEGA 250 HP & MINI 75 HP) - ROUTE 66 LAYOUT
  // ==========================================================================
  spawnHealthPacks() {
    // Mega Health Packs (250 HP, 10s cooldown) - Strategic Main Hubs
    this.createHealthPack(38, 0, 18, 250, 'mega');     // Inside/side patio of Big Earl's Diner
    this.createHealthPack(-35, 0, -3, 250, 'mega');    // Under left steel platform / container base
    this.createHealthPack(-15, 0, 60, 250, 'mega');    // Inside Deadlock Garage

    // Small Health Packs (75 HP, 6s cooldown) - High Grounds & Flank Routes
    this.createHealthPack(40, 6.5, 5, 75, 'mini');     // Big Earl's Diner 1st floor roof terrace
    this.createHealthPack(-35, 7.5, -15, 75, 'mini');  // Steel platform 2nd floor sniper deck
    this.createHealthPack(5, 7.5, -25, 75, 'mini');    // Atop crashed red train car
    this.createHealthPack(-2, 0, 35, 75, 'mini');      // Flank beside hovering payload
    this.createHealthPack(17, 0, -36, 75, 'mini');     // Underneath Gorge Welcome billboard
  }

  createHealthPack(x, y, z, healAmount, type) {
    const group = new THREE.Group();
    group.position.set(x, y, z);

    // Holographic Cybernetic Base
    const baseGeo = new THREE.CylinderGeometry(0.85, 1.05, 0.25, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.125;
    group.add(base);

    // Glowing Neon Ring
    const ringGeo = new THREE.RingGeometry(0.88, 1.05, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.26;
    group.add(ring);

    // Floating 3D Medical Cross Icon
    const crossGeo1 = new THREE.BoxGeometry(0.75, 0.25, 0.25);
    const crossGeo2 = new THREE.BoxGeometry(0.25, 0.75, 0.25);
    const crossMat = new THREE.MeshBasicMaterial({
      color: type === 'mega' ? 0x00f0ff : 0x10b981
    });

    const crossGroup = new THREE.Group();
    crossGroup.add(new THREE.Mesh(crossGeo1, crossMat));
    crossGroup.add(new THREE.Mesh(crossGeo2, crossMat));
    crossGroup.position.y = 0.95;
    group.add(crossGroup);

    this.scene.add(group);

    // Step-up base collider
    this.colliders.push({
      name: `healthpack_base_${x}_${z}`,
      minX: x - 0.9,
      maxX: x + 0.9,
      minZ: z - 0.9,
      maxZ: z + 0.9,
      minY: y,
      maxY: y + 0.25,
      canStandOn: true
    });

    this.healthPacks.push({
      group,
      crossGroup,
      baseY: y + 0.95,
      healAmount,
      type,
      active: true,
      respawnTimer: 0,
      pos: new THREE.Vector3(x, y + 0.95, z)
    });
  }

  // ==========================================================================
  // 3D COLLISION RESOLUTION (PARKOUR, STEP-UP & PREVENT PASS-THROUGH)
  // ==========================================================================
  resolveCollision(pos, radius = 0.55, height = 3.5) {
    let groundY = 1.7; // default ground level for player eye
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.3;

    // 1. Check all solid obstacle colliders
    for (const col of this.colliders) {
      if (col.canStandOn) {
        if (pos.x >= col.minX - 0.2 && pos.x <= col.maxX + 0.2 &&
            pos.z >= col.minZ - 0.2 && pos.z <= col.maxZ + 0.2) {
          if (feetY >= col.maxY - 0.7) {
            groundY = Math.max(groundY, col.maxY + 1.7);
          }
        }
      }

      // Horizontal obstacle collision
      if (headY < col.minY || feetY > col.maxY - 0.3) continue;

      const clampedX = Math.max(col.minX, Math.min(col.maxX, pos.x));
      const clampedZ = Math.max(col.minZ, Math.min(col.maxZ, pos.z));
      const dx = pos.x - clampedX;
      const dz = pos.z - clampedZ;
      const distSq = dx * dx + dz * dz;

      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq);
        if (dist > 1e-4) {
          const overlap = radius - dist;
          pos.x += (dx / dist) * overlap;
          pos.z += (dz / dist) * overlap;
        } else {
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

    // 2. Canyon Outer Perimeter Clamping (Route 66 canyon rock walls)
    pos.x = Math.max(-95.0, Math.min(95.0, pos.x));
    pos.z = Math.max(-95.0, Math.min(95.0, pos.z));

    return { groundY };
  }

  checkWallCollision(pos, radius = 0.6) {
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.2;

    if (Math.abs(pos.x) >= 95.0 || Math.abs(pos.z) >= 95.0) {
      return { hit: true, name: 'canyon_wall' };
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

  // ==========================================================================
  // RAYCAST COLLIDERS (For Hitscan weapons like Tracer's Pulse Pistols)
  // Ensures bullets NEVER penetrate walls, buildings or rock pillars!
  // ==========================================================================
  raycastColliders(ray, maxDistance = 60) {
    let closestDist = maxDistance;
    let closestPoint = null;
    let hitCollider = null;

    const box = new THREE.Box3();
    const hitPoint = new THREE.Vector3();

    for (const col of this.colliders) {
      // Skip the bottom floor box when shooting across the surface
      if (col.maxY <= 0.05 && col.minY < -0.5) continue;

      box.min.set(col.minX, col.minY, col.minZ);
      box.max.set(col.maxX, col.maxY, col.maxZ);

      const intersection = ray.intersectBox(box, hitPoint);
      if (intersection) {
        const dist = ray.origin.distanceTo(intersection);
        if (dist > 0.01 && dist < closestDist) {
          closestDist = dist;
          closestPoint = intersection.clone();
          hitCollider = col;
        }
      }
    }

    // Outer canyon boundaries check (x: ±95, z: ±95)
    // If shooting out of bounds, clip at perimeter
    return {
      hit: closestDist < maxDistance,
      distance: closestDist,
      point: closestPoint,
      collider: hitCollider
    };
  }

  checkProjectileHit(prevPos, currentPos, radius = 0.25) {
    if (Math.abs(currentPos.x) >= 95.0 || Math.abs(currentPos.z) >= 95.0) {
      return { hit: true, point: currentPos.clone(), name: 'canyon_wall' };
    }
    if (currentPos.y <= 0.08) {
      return { hit: true, point: new THREE.Vector3(currentPos.x, 0.08, currentPos.z), name: 'ground' };
    }

    for (const col of this.colliders) {
      const minX = col.minX - radius;
      const maxX = col.maxX + radius;
      const minY = col.minY - radius;
      const maxY = col.maxY + radius;
      const minZ = col.minZ - radius;
      const maxZ = col.maxZ + radius;

      if (currentPos.x >= minX && currentPos.x <= maxX &&
          currentPos.y >= minY && currentPos.y <= maxY &&
          currentPos.z >= minZ && currentPos.z <= maxZ) {
        return { hit: true, point: currentPos.clone(), name: col.name };
      }

      if (prevPos) {
        const dx = currentPos.x - prevPos.x;
        const dy = currentPos.y - prevPos.y;
        const dz = currentPos.z - prevPos.z;

        let tMin = 0.0;
        let tMax = 1.0;

        if (Math.abs(dx) > 1e-6) {
          const t1 = (minX - prevPos.x) / dx;
          const t2 = (maxX - prevPos.x) / dx;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.x < minX || prevPos.x > maxX) continue;

        if (Math.abs(dy) > 1e-6) {
          const t1 = (minY - prevPos.y) / dy;
          const t2 = (maxY - prevPos.y) / dy;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.y < minY || prevPos.y > maxY) continue;

        if (Math.abs(dz) > 1e-6) {
          const t1 = (minZ - prevPos.z) / dz;
          const t2 = (maxZ - prevPos.z) / dz;
          tMin = Math.max(tMin, Math.min(t1, t2));
          tMax = Math.min(tMax, Math.max(t1, t2));
        } else if (prevPos.z < minZ || prevPos.z > maxZ) continue;

        if (tMax >= tMin && tMin <= 1.0 && tMax >= 0.0) {
          const hitT = Math.max(0, tMin);
          const hitPoint = new THREE.Vector3(
            prevPos.x + dx * hitT,
            prevPos.y + dy * hitT,
            prevPos.z + dz * hitT
          );
          return { hit: true, point: hitPoint, name: col.name };
        }
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
        hp.crossGroup.rotation.y += 2.2 * dt;
        hp.crossGroup.position.y = (hp.baseY || 0.95) + Math.sin(Date.now() * 0.005) * 0.12;

        if (playerPos && playerPos.distanceTo(hp.pos) < 2.2) {
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
