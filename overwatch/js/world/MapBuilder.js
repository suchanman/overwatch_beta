/**
 * ============================================================================
 * OVERWATCH 2 : ROUTE 66 (DEADLOCK GORGE) MAP BUILDER
 * - Authentic Route 66 Desert Aesthetics (Big Earl's Diner, Gas Station, Payload)
 * - Canyon Rock Walls, Derailment Train Cars, Railroad Tracks & Cactus
 * - Full 3D Multi-Level Collision System (Roofs, Platforms, Stepping Crates)
 * - Distributed Health Packs (Mega 250 HP & Mini 75 HP) with Respawns
 * ============================================================================
 */

import * as THREE from 'three';

export class MapBuilder {
  constructor(scene) {
    this.scene = scene;
    this.healthPacks = [];
    this.colliders = []; // Solid 3D collision registry

    this.colors = {
      sky: 0x8cbbe2,
      ground: 0xc49a71, // Rich desert sand
      road: 0x4f4f4f,
      rock: 0xc86a41,
      rockDark: 0x9b4226,
      dinerWall: 0xe0d6b8,
      dinerRoof: 0x826d56,
      garageBlue: 0x48647a,
      trainRed: 0xb53535,
      trainSilver: 0xb0b0b0,
      dinerAwning: 0x3d858f,
      signYellow: 0xf5c851,
      signRed: 0xc84b31,
      billboard: 0x5a9a8f,
      wood: 0x6e5237
    };

    this.buildLighting();
    this.buildRoute66Environment();
    this.spawnHealthPacks();
  }

  buildLighting() {
    // 1. Scene sky & warm desert atmospheric fog
    this.scene.background = new THREE.Color(this.colors.sky);
    this.scene.fog = new THREE.FogExp2(this.colors.sky, 0.005);

    // 2. Warm Desert Hemisphere Light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xaa7744, 0.85);
    hemiLight.position.set(0, 60, 0);
    this.scene.add(hemiLight);

    // 3. Bright Sun (Directional Light with sharp shadows)
    const dirLight = new THREE.DirectionalLight(0xfffae6, 1.25);
    dirLight.position.set(-50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 300;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // 4. Subtle ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);
  }

  // Helper for generating canvas sign texture
  createSignTexture(text, bgColor, textColor, width, height, fontSize, fontStyle = "bold") {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const lines = text.split('\n');
    ctx.fillStyle = textColor;
    ctx.font = `${fontStyle} ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    let startY = (height - totalHeight) / 2 + (lineHeight / 2);

    lines.forEach(line => {
      ctx.fillText(line, width / 2, startY);
      startY += lineHeight;
    });

    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.8 });
  }

  // Asphalt road texture with tire tracks and Route 66 shield marking
  createRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#4f4f4f';
    ctx.fillRect(0, 0, 512, 1024);

    // Tire marks
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(145, 0, 42, 1024);
    ctx.fillRect(325, 0, 42, 1024);

    // Center yellow dashes
    ctx.fillStyle = '#e8c92a';
    for (let i = 0; i < 1024; i += 100) {
      ctx.fillRect(246, i, 20, 60);
    }

    // Route 66 Shield Emblem
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(256, 800, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111111';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("66", 256, 800);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4);
    return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 });
  }

  addCollider(mesh, name = 'obstacle', canStandOn = true) {
    mesh.geometry.computeBoundingBox();
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

  createBox(x, y, z, w, h, d, colorHex, rotX = 0, rotY = 0, rotZ = 0, name = 'box', collide = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.95, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + (h / 2), z);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  createCylinder(x, y, z, radius, height, colorHex, rotX = 0, rotY = 0, rotZ = 0, name = 'cyl', collide = true) {
    const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.85, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + (height / 2), z);
    mesh.rotation.set(rotX, rotY, rotZ);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    if (collide) this.addCollider(mesh, name, true);
    return mesh;
  }

  createSignBoard(x, y, z, w, h, d, text, bgColor, textColor, rotY = 0, name = 'sign') {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = this.createSignTexture(text, bgColor, textColor, 512, 256, 45);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + (h / 2), z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.addCollider(mesh, name, true);
    return mesh;
  }

  buildRockWall(x, y, z, w, h, d, rotY, colorHex, name = 'rock_wall') {
    const geo = new THREE.BoxGeometry(w, h, d);
    const positions = geo.attributes.position;
    if (positions) {
      for (let i = 0; i < positions.count; i++) {
        positions.setX(i, positions.getX(i) + (Math.random() - 0.5) * 4);
        positions.setY(i, positions.getY(i) + (Math.random() - 0.5) * 4);
        positions.setZ(i, positions.getZ(i) + (Math.random() - 0.5) * 4);
      }
      geo.computeVertexNormals();
    }
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 1.0, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + (h / 2), z);
    mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.addCollider(mesh, name, false);
  }

  createPayload(x, y, z) {
    this.createBox(x, y + 1.5, z, 7, 1.5, 12, 0x555555, 0, Math.PI / 12, 0, 'payload_base');
    this.createBox(x, y + 3, z, 5, 2.5, 9, 0x3a6a8c, 0, Math.PI / 12, 0, 'payload_body');
    this.createBox(x, y + 5.5, z, 3, 2, 7, 0xeeeeee, 0, Math.PI / 12, 0, 'payload_top');

    // Glowing Hover Thruster Pads
    const padMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const padGeo = new THREE.BoxGeometry(1.5, 0.4, 2);
    const offsets = [[-3, -4], [3, -4], [-3, 4], [3, 4]];
    offsets.forEach(off => {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(x + off[0], y + 1.0, z + off[1]);
      pad.rotation.y = Math.PI / 12;
      this.scene.add(pad);
    });
  }

  createCactus(x, y, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x4a6a38, roughness: 0.8 });
    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.5, 3.2, 8);
    const trunk = new THREE.Mesh(trunkGeo, mat);
    trunk.position.set(x, y + 1.6, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    this.scene.add(trunk);
    this.addCollider(trunk, 'cactus', true);

    const arm1Geo = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8);
    const arm1 = new THREE.Mesh(arm1Geo, mat);
    arm1.position.set(x + 0.6, y + 1.8, z);
    arm1.rotation.z = Math.PI / 4;
    arm1.castShadow = true;
    this.scene.add(arm1);

    const arm2Geo = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8);
    const arm2 = new THREE.Mesh(arm2Geo, mat);
    arm2.position.set(x - 0.5, y + 1.2, z);
    arm2.rotation.z = -Math.PI / 3;
    arm2.castShadow = true;
    this.scene.add(arm2);
  }

  buildRoute66Environment() {
    // 1. Desert Floor
    const floorGeo = new THREE.PlaneGeometry(600, 600);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: this.colors.ground, roughness: 1.0 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Railroad tracks & wooden ties
    for (let i = 0; i < 5; i++) {
      this.createBox(-10 + (i * 6), 0, -35, 1, 0.2, 20, 0x333333, 0, 0, 0, 'rail_track', false);
      this.createBox(-10 + (i * 6), 0, -25, 1, 0.2, 20, 0x333333, 0, 0, 0, 'rail_track', false);
    }
    for (let i = 0; i < 15; i++) {
      this.createBox(-15 + (i * 2), 0, -30, 4, 0.1, 1, this.colors.wood, 0, 0, 0, 'rail_tie', false);
    }

    // 2. S-Curved Route 66 Highway
    const roadMat = this.createRoadTexture();

    const road1 = new THREE.Mesh(new THREE.PlaneGeometry(24, 80), roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.rotation.z = Math.PI / 5;
    road1.position.set(45, 0.05, -30);
    road1.receiveShadow = true;
    this.scene.add(road1);

    const road2 = new THREE.Mesh(new THREE.PlaneGeometry(24, 80), roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = -Math.PI / 10;
    road2.position.set(15, 0.06, 25);
    road2.receiveShadow = true;
    this.scene.add(road2);

    const road3 = new THREE.Mesh(new THREE.PlaneGeometry(24, 90), roadMat);
    road3.rotation.x = -Math.PI / 2;
    road3.rotation.z = Math.PI / 3;
    road3.position.set(-35, 0.07, 50);
    road3.receiveShadow = true;
    this.scene.add(road3);

    // 3. Big Earl's Diner Building
    this.createBox(30, 0, 15, 25, 7, 25, this.colors.dinerWall, 0, 0, 0, 'diner_1f');
    this.createBox(30, 7, 15, 27, 1, 27, this.colors.dinerRoof, 0, 0, 0, 'diner_roof1');
    this.createBox(32, 8, 12, 12, 5, 15, this.colors.dinerWall, 0, 0, 0, 'diner_2f');
    this.createBox(32, 13, 12, 14, 1, 17, this.colors.dinerRoof, 0, 0, 0, 'diner_roof2');
    this.createSignBoard(32, 14, 12, 14, 4, 0.5, "Big Earl's\n24 Hour", "#ffffff", "#c84b31", -Math.PI / 6, 'diner_sign');

    // Diner Gas Awning & Pumps
    this.createBox(12, 6, 15, 20, 1, 10, this.colors.dinerAwning, 0, 0, Math.PI / 32, 'gas_awning');
    this.createCylinder(6, 0, 12, 0.5, 6, 0x666666, 0, 0, 0, 'awning_pole1');
    this.createCylinder(6, 0, 18, 0.5, 6, 0x666666, 0, 0, 0, 'awning_pole2');
    this.createBox(6, 0, 15, 2, 3, 2, this.colors.signRed, 0, 0, 0, 'gas_pump1');
    this.createBox(6, 3, 15, 1.5, 1.5, 1.5, 0xffffff, 0, 0, 0, 'gas_pump1_top');
    this.createBox(6, 0, 12, 2, 3, 2, this.colors.signRed, 0, 0, 0, 'gas_pump2');
    this.createBox(6, 3, 12, 1.5, 1.5, 1.5, 0xffffff, 0, 0, 0, 'gas_pump2_top');

    // Huge GAS Station Sign Tower
    this.createCylinder(45, 0, 35, 0.8, 16, this.colors.signRed, 0, 0, 0, 'gas_tower_pole');
    this.createSignBoard(45, 10, 35, 1, 5, 4, "G\nA\nS", "#ffffff", "#4a949e", -Math.PI / 4, 'gas_tower_sign');
    this.createBox(45, 15, 35, 4, 3, 4, this.colors.signYellow, 0, 0, 0, 'gas_tower_top');

    // Parkour Crates for Diner Roof Access
    this.createBox(18, 0, 24, 6, 2.5, 4, this.colors.wood, 0, 0, 0, 'diner_parkour1');
    this.createBox(18, 2.5, 24, 4, 2.5, 4, this.colors.wood, 0, 0, 0, 'diner_parkour2');
    this.createBox(22, 0, 28, 4, 2, 4, 0x555555, 0, 0, 0, 'diner_parkour3');

    // 4. Blue Garage Building
    this.createBox(-20, 0, 50, 30, 8, 25, 0x88949c, 0, 0, 0, 'garage_main');
    this.createBox(-20, 8, 50, 32, 1, 27, this.colors.garageBlue, 0, 0, 0, 'garage_roof');
    this.createBox(-45, 0, 45, 20, 6, 15, 0x88949c, 0, 0, 0, 'garage_wing');
    this.createBox(-45, 6, 45, 22, 1, 17, this.colors.garageBlue, 0, 0, 0, 'garage_wing_roof');

    // Garage Parkour Crates
    this.createBox(-10, 0, 35, 4, 3, 4, this.colors.wood, 0, 0, 0, 'garage_box1');
    this.createBox(-10, 3, 35, 3, 3, 3, this.colors.wood, 0, 0, 0, 'garage_box2');
    this.createBox(-30, 0, 38, 5, 4, 5, 0x555555, 0, 0, 0, 'garage_crate');

    // 5. Deadlock Gang Base (Attack Spawn Outpost)
    this.createBox(-45, 0, -5, 20, 5, 25, this.colors.dinerWall, 0, 0, 0, 'deadlock_base');
    this.createBox(-50, 5, -10, 15, 5, 15, 0x9a968a, 0, 0, 0, 'deadlock_tower');
    this.createBox(-32, 0, 5, 4, 2, 4, this.colors.wood, 0, 0, 0, 'deadlock_crate1');
    this.createBox(-38, 0, 0, 4, 4, 4, 0x555555, 0, 0, 0, 'deadlock_crate2');

    // 6. Deadlock Gorge Billboard
    this.createSignBoard(35, 5, -15, 1, 8, 16, "Welcome to\nDeadlock Gorge!", this.colors.billboard, "#ffffff", -Math.PI / 5, 'welcome_billboard');
    this.createCylinder(35, 0, -11, 0.4, 5, 0x333333, 0, 0, 0, 'billboard_pole1');
    this.createCylinder(35, 0, -19, 0.4, 5, 0x333333, 0, 0, 0, 'billboard_pole2');

    // 7. Hovering Payload Vehicle
    this.createPayload(25, 0, 5);

    // 8. Central Cliff & Crashed Train Wreck
    this.createBox(0, 0, -15, 25, 6, 25, this.colors.rockDark, 0, 0, 0, 'cliff_base');
    this.createBox(5, 6, -20, 15, 4, 15, this.colors.rock, 0, 0, 0, 'cliff_top');

    // Red & Silver Train Cars
    this.createBox(12, 4, -10, 8, 5, 15, this.colors.trainRed, 0, Math.PI / 16, 0, 'train_car_red');
    this.createBox(12, 0, -2, 5, 2, 5, this.colors.trainSilver, 0, 0, 0, 'train_step1');
    this.createBox(12, 2, -4, 5, 2, 5, this.colors.trainSilver, 0, 0, 0, 'train_step2');

    // Upper Train Debris
    this.createBox(-8, 7, -18, 10, 5, 15, this.colors.trainSilver, 0, -Math.PI / 16, 0, 'train_car_silver');
    this.createBox(-2, 6, -12, 4, 2, 4, this.colors.wood, 0, 0, 0, 'train_wood');

    // 9. Canyon Boundaries (Four Massive 80m High Rock Canyon Walls)
    this.buildRockWall(0, 0, -100, 300, 80, 40, 0, this.colors.rock, 'canyon_wall_north');
    this.buildRockWall(0, 0, 100, 300, 80, 40, 0, this.colors.rock, 'canyon_wall_south');
    this.buildRockWall(-100, 0, 0, 40, 80, 300, 0, this.colors.rockDark, 'canyon_wall_west');
    this.buildRockWall(100, 0, 0, 40, 80, 300, 0, this.colors.rockDark, 'canyon_wall_east');

    // Corner Canyon Buttes
    this.buildRockWall(60, 0, -60, 50, 60, 50, Math.PI / 4, this.colors.rockDark, 'canyon_corner_ne');
    this.buildRockWall(75, 0, 25, 40, 50, 40, -Math.PI / 6, this.colors.rock, 'canyon_corner_se');
    this.buildRockWall(-60, 0, -60, 60, 60, 60, -Math.PI / 4, this.colors.rockDark, 'canyon_corner_nw');
    this.buildRockWall(-70, 0, 60, 50, 60, 50, Math.PI / 4, this.colors.rock, 'canyon_corner_sw');

    // Attack Team Tunnel Rock
    this.createBox(65, 15, -30, 40, 20, 30, this.colors.rockDark, 0, 0, 0, 'tunnel_rock');

    // Hoodoo Pillars
    this.createCylinder(-25, 0, -50, 8, 40, this.colors.rockDark, 0, 0, 0, 'hoodoo1_base');
    this.createCylinder(-25, 40, -50, 10, 10, this.colors.rock, 0, 0, 0, 'hoodoo1_cap');
    this.createCylinder(-40, 0, -35, 6, 35, this.colors.rock, 0, 0, 0, 'hoodoo2');

    // 10. Props & Foliage
    this.createCactus(25, 0, -5);
    this.createCactus(-5, 0, 20);
    this.createCactus(-35, 0, 25);
    this.createCactus(10, 0, -45);
    this.createCactus(-15, 0, 5);

    // Tire Piles
    this.createCylinder(8, 0, 15, 1, 1, 0x111111, Math.PI / 2, 0, 0, 'tire1');
    this.createCylinder(8, 1, 15, 1, 1, 0x111111, Math.PI / 2, 0, 0, 'tire2');
    this.createCylinder(10, 0, 16, 1, 1, 0x111111, Math.PI / 2, 0, 0, 'tire3');
  }

  // ==========================================================================
  // DISTRIBUTED HEALTH PACKS (MEGA 250 HP & MINI 75 HP)
  // ==========================================================================
  spawnHealthPacks() {
    // Mega Health Packs (250 HP, 10s cooldown)
    this.createHealthPack(28, 0, 12, 250, 'mega');     // Inside/next to Big Earl's Diner
    this.createHealthPack(-5, 0, -15, 250, 'mega');    // Under central train cliff pass
    this.createHealthPack(-25, 0, 48, 250, 'mega');    // Inside Blue Garage

    // Small Health Packs (75 HP, 6s cooldown)
    this.createHealthPack(8, 0, 18, 75, 'mini');       // Near Gas Station Awning
    this.createHealthPack(35, 0, -13, 75, 'mini');     // Behind Deadlock Billboard
    this.createHealthPack(-32, 0, 2, 75, 'mini');      // Deadlock Base Supply Crates
    this.createHealthPack(32, 7, 15, 75, 'mini');      // Diner 2nd Floor Roof Terrace
    this.createHealthPack(15, 0, 30, 75, 'mini');      // Highway S-Curve Midpoint
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
          if (feetY >= col.maxY - 0.6) {
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

    // 2. Canyon Outer Perimeter Clamping (Route 66 boundaries)
    pos.x = Math.max(-88.0, Math.min(88.0, pos.x));
    pos.z = Math.max(-88.0, Math.min(88.0, pos.z));

    return { groundY };
  }

  checkWallCollision(pos, radius = 0.6) {
    const feetY = pos.y - 1.7;
    const headY = pos.y + 0.2;

    if (Math.abs(pos.x) >= 88.0 || Math.abs(pos.z) >= 88.0) {
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

  checkProjectileHit(prevPos, currentPos, radius = 0.25) {
    if (Math.abs(currentPos.x) >= 88.0 || Math.abs(currentPos.z) >= 88.0) {
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
