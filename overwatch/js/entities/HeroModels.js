/**
 * ============================================================================
 * HIGH-FIDELITY OVERWATCH HERO 3D MODELS (HeroModels.js)
 * - Reinhardt: Massive Crusader armor, pauldrons with red decal, 3-spike crest,
 *              forearm Lion Shield generator, and Rocket Hammer with glowing exhausts
 * - Tracer: Dual Pulse Pistols, Chronal Accelerator with cyan glow, collar,
 *           amber goggles, spiky anime hair, orange leggings with dark straps
 * - Genji: Cyborg ninja, white/chrome armor, brown synthetic muscle fibers,
 *          glowing V-visor + light, swept-back ear fins, Ryu-Ichimonji katana & wakizashi
 * ============================================================================
 */

// Helper to create and position meshes with shadow
function createMesh(geo, mat, x = 0, y = 0, z = 0, castShadow = true) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================================
// 1. REINHARDT MODEL BUILDER
// ============================================================================
export function buildReinhardtModel(parentGroup) {
  const reinhardtRoot = new THREE.Group();

  // Materials
  const armorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.8,
    roughness: 0.25
  });
  const darkArmorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.5,
    roughness: 0.7
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.9,
    roughness: 0.3
  });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.4,
    roughness: 0.5
  });

  const hitMeshes = [];

  // --- Torso ---
  const torsoGroup = new THREE.Group();

  // Chest core
  const chestGeo = new THREE.SphereGeometry(5, 32, 32);
  chestGeo.scale(1, 0.9, 0.75);
  const chest = createMesh(chestGeo, armorMat, 0, 4.5, 0);
  torsoGroup.add(chest);
  hitMeshes.push(chest);

  // Heavy neck collar
  const collarGeo = new THREE.CylinderGeometry(3.5, 4, 3, 32, 1, false, Math.PI, Math.PI);
  const collar = createMesh(collarGeo, armorMat, 0, 6.8, 1);
  collar.rotation.x = -Math.PI / 12;
  torsoGroup.add(collar);

  // Center chest reactor base & glow
  const reactorBase = createMesh(new THREE.CylinderGeometry(2, 2, 0.5, 32), darkArmorMat, 0, 5, 3.8);
  reactorBase.rotation.x = Math.PI / 2;
  torsoGroup.add(reactorBase);

  const reactorGlowGeo = new THREE.SphereGeometry(1.2, 16, 16);
  reactorGlowGeo.scale(1, 1, 0.3);
  const reactorGlow = createMesh(reactorGlowGeo, glowMat, 0, 5, 4.0);
  torsoGroup.add(reactorGlow);

  // Abdomen & lower torso
  const abdomen = createMesh(new THREE.CylinderGeometry(4.2, 3.5, 5, 16), darkArmorMat, 0, 0, 0);
  torsoGroup.add(abdomen);
  hitMeshes.push(abdomen);

  const absPlate = createMesh(new THREE.BoxGeometry(4.5, 3.5, 4), armorMat, 0, 0, 1.5);
  absPlate.rotation.x = Math.PI / 16;
  torsoGroup.add(absPlate);
  hitMeshes.push(absPlate);

  const belt = createMesh(new THREE.BoxGeometry(6.5, 2.5, 5), armorMat, 0, -2.5, 0.5);
  torsoGroup.add(belt);
  hitMeshes.push(belt);

  reinhardtRoot.add(torsoGroup);

  // --- Head & Helmet (CRITICAL HEADSHOT HITBOX) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 9.5, 2);

  const helmetGeo = new THREE.BoxGeometry(2.8, 3.5, 3.2);
  const helmet = createMesh(helmetGeo, armorMat, 0, 0, 0);
  headGroup.add(helmet);
  hitMeshes.push(helmet);

  const jaw = createMesh(new THREE.BoxGeometry(3, 1.5, 2.5), darkArmorMat, 0, -1.2, 0.8);
  headGroup.add(jaw);

  // Visor (Glowing Y/V shape)
  const visorMain = createMesh(new THREE.BoxGeometry(2.2, 0.4, 0.2), glowMat, 0, 0.3, 1.6);
  headGroup.add(visorMain);

  const visorL = createMesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), glowMat, 0.7, 0.1, 1.65);
  visorL.rotation.z = -Math.PI / 4;
  const visorR = createMesh(new THREE.BoxGeometry(0.8, 0.3, 0.2), glowMat, -0.7, 0.1, 1.65);
  visorR.rotation.z = Math.PI / 4;
  headGroup.add(visorL, visorR);

  // 3-Spike Crest
  const centerSpike = createMesh(new THREE.ConeGeometry(0.4, 2.5, 4), armorMat, 0, 2.5, 0.5);
  centerSpike.rotation.x = -Math.PI / 12;
  headGroup.add(centerSpike);

  const leftSpike = createMesh(new THREE.ConeGeometry(0.3, 1.8, 4), armorMat, 1.2, 2.2, 0.2);
  leftSpike.rotation.z = -Math.PI / 8;
  leftSpike.rotation.x = -Math.PI / 12;
  const rightSpike = createMesh(new THREE.ConeGeometry(0.3, 1.8, 4), armorMat, -1.2, 2.2, 0.2);
  rightSpike.rotation.z = Math.PI / 8;
  rightSpike.rotation.x = -Math.PI / 12;
  headGroup.add(leftSpike, rightSpike);

  reinhardtRoot.add(headGroup);

  // --- Pauldrons (Shoulders) ---
  const leftPauldronGroup = new THREE.Group();
  leftPauldronGroup.position.set(6.5, 7, 0);
  leftPauldronGroup.rotation.z = -Math.PI / 8;
  const lPauldron = createMesh(new THREE.SphereGeometry(4.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.6), armorMat, 0, 0, 0);
  const lPauldronPlate = createMesh(new THREE.SphereGeometry(4.7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5), armorMat, 0, 0.5, 0);
  const redDecal = createMesh(new THREE.BoxGeometry(1.5, 4, 1), redMat, 1.5, 2.5, 3);
  redDecal.rotation.x = -Math.PI / 4;
  redDecal.rotation.z = -Math.PI / 6;
  leftPauldronGroup.add(lPauldron, lPauldronPlate, redDecal);
  reinhardtRoot.add(leftPauldronGroup);
  hitMeshes.push(lPauldron);

  const rightPauldronGroup = new THREE.Group();
  rightPauldronGroup.position.set(-6.5, 7, 0);
  rightPauldronGroup.rotation.z = Math.PI / 8;
  const rPauldron = createMesh(new THREE.SphereGeometry(4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 1.6), armorMat, 0, 0, 0);
  rightPauldronGroup.add(rPauldron);
  reinhardtRoot.add(rightPauldronGroup);
  hitMeshes.push(rPauldron);

  // --- Arms & Lion Shield Generator ---
  const upperArmGeo = new THREE.CylinderGeometry(1.8, 1.5, 6);
  const lowerArmGeo = new THREE.BoxGeometry(3, 6, 3);
  const handGeo = new THREE.BoxGeometry(2.5, 3, 2.5);

  // Left Arm (Lion Shield Generator)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(6.5, 4, 0);
  const leftUpper = createMesh(upperArmGeo, darkArmorMat, 0, -2, 0);
  leftUpper.rotation.z = Math.PI / 6;
  leftArmGroup.add(leftUpper);

  const leftLowerGroup = new THREE.Group();
  leftLowerGroup.position.set(1.5, -5, 1.5);
  leftLowerGroup.rotation.x = -Math.PI / 6;
  leftLowerGroup.rotation.y = -Math.PI / 8;
  const leftLower = createMesh(lowerArmGeo, armorMat, 0, -2, 0);
  leftLowerGroup.add(leftLower);

  // Lion Shield Forearm Plate & Crest
  const shieldBase = createMesh(new THREE.CylinderGeometry(3, 2, 6, 6), darkArmorMat, 0, -2, 1.5);
  shieldBase.rotation.x = Math.PI / 2;
  shieldBase.rotation.z = Math.PI / 2;
  const shieldPlate = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 6.2, 6), armorMat, 0, -2, 2);
  shieldPlate.rotation.x = Math.PI / 2;
  shieldPlate.rotation.z = Math.PI / 2;
  const crest = createMesh(new THREE.CylinderGeometry(1.5, 0.5, 6.5, 6), goldMat, 0, -2, 2.5);
  crest.rotation.x = Math.PI / 2;
  crest.rotation.z = Math.PI / 2;
  leftLowerGroup.add(shieldBase, shieldPlate, crest);

  const leftHand = createMesh(handGeo, darkArmorMat, 0, -5.5, 0);
  leftLowerGroup.add(leftHand);
  leftArmGroup.add(leftLowerGroup);
  reinhardtRoot.add(leftArmGroup);
  hitMeshes.push(leftLower);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-6.5, 4, 0);
  const rightUpper = createMesh(upperArmGeo, darkArmorMat, 0, -2, 0);
  rightUpper.rotation.z = -Math.PI / 6;
  rightArmGroup.add(rightUpper);

  const rightLowerGroup = new THREE.Group();
  rightLowerGroup.position.set(-1.5, -5, 1.5);
  rightLowerGroup.rotation.x = -Math.PI / 6;
  rightLowerGroup.rotation.y = Math.PI / 8;
  const rightLower = createMesh(lowerArmGeo, armorMat, 0, -2, 0);
  rightLowerGroup.add(rightLower);

  const rightFlare = createMesh(new THREE.CylinderGeometry(2.5, 2, 4, 4), armorMat, 0, -2, 0.5);
  rightFlare.rotation.y = Math.PI / 4;
  rightLowerGroup.add(rightFlare);

  const rightHand = createMesh(handGeo, darkArmorMat, 0, -5.5, 0);
  rightLowerGroup.add(rightHand);
  rightArmGroup.add(rightLowerGroup);
  reinhardtRoot.add(rightArmGroup);
  hitMeshes.push(rightLower);

  // --- Legs ---
  const thighGeo = new THREE.CylinderGeometry(2.5, 2, 7);
  const calfGeo = new THREE.CylinderGeometry(3.5, 2.5, 8);
  const kneeGeo = new THREE.BoxGeometry(3, 4, 3);
  const toeGeo = new THREE.CylinderGeometry(0, 2.8, 4, 4);

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(3.5, -3.5, 0);
  const lThigh = createMesh(thighGeo, darkArmorMat, 0, -3.5, 0);
  const lCalf = createMesh(calfGeo, armorMat, 0, -10, 0.5);
  const lKnee = createMesh(kneeGeo, armorMat, 0, -6.5, 2.5);
  lKnee.rotation.x = Math.PI / 8;
  leftLegGroup.add(lThigh, lCalf, lKnee);

  const lBootGroup = new THREE.Group();
  lBootGroup.position.set(0, -14, 1);
  const lBootBase = createMesh(new THREE.BoxGeometry(4, 2.5, 5), armorMat, 0, 0, 0);
  const lToe = createMesh(toeGeo, armorMat, 0, -0.2, 3.5);
  lToe.rotation.x = Math.PI / 2;
  lToe.rotation.y = Math.PI / 4;
  lBootGroup.add(lBootBase, lToe);
  leftLegGroup.add(lBootGroup);
  leftLegGroup.rotation.y = -Math.PI / 6;
  leftLegGroup.rotation.z = -Math.PI / 16;
  reinhardtRoot.add(leftLegGroup);
  hitMeshes.push(lThigh, lCalf);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-3.5, -3.5, 0);
  const rThigh = createMesh(thighGeo, darkArmorMat, 0, -3.5, 0);
  const rCalf = createMesh(calfGeo, armorMat, 0, -10, 0.5);
  const rKnee = createMesh(kneeGeo, armorMat, 0, -6.5, 2.5);
  rKnee.rotation.x = Math.PI / 8;
  rightLegGroup.add(rThigh, rCalf, rKnee);

  const rBootGroup = new THREE.Group();
  rBootGroup.position.set(0, -14, 1);
  const rBootBase = createMesh(new THREE.BoxGeometry(4, 2.5, 5), armorMat, 0, 0, 0);
  const rToe = createMesh(toeGeo, armorMat, 0, -0.2, 3.5);
  rToe.rotation.x = Math.PI / 2;
  rToe.rotation.y = Math.PI / 4;
  rBootGroup.add(rBootBase, rToe);
  rightLegGroup.add(rBootGroup);
  rightLegGroup.rotation.y = Math.PI / 6;
  rightLegGroup.rotation.z = Math.PI / 16;
  reinhardtRoot.add(rightLegGroup);
  hitMeshes.push(rThigh, rCalf);

  // --- Rocket Hammer ---
  const hammerGroup = new THREE.Group();
  hammerGroup.position.set(0, -7.5, 8.5);
  hammerGroup.rotation.z = -Math.PI / 2.2;
  hammerGroup.rotation.y = -Math.PI / 12;
  hammerGroup.rotation.x = Math.PI / 8;

  const handle = createMesh(new THREE.CylinderGeometry(0.8, 0.8, 30), darkArmorMat, 0, 0, 0);
  hammerGroup.add(handle);

  const headGroupGeo = new THREE.Group();
  headGroupGeo.position.set(0, 11, 0);
  const coreCyl = createMesh(new THREE.CylinderGeometry(3.5, 3.5, 8, 16), armorMat, 0, 0, 0);
  headGroupGeo.add(coreCyl);

  const strikeFaceGroup = new THREE.Group();
  strikeFaceGroup.position.set(0, 0, 4);
  const strikeBase = createMesh(new THREE.BoxGeometry(5, 7, 4), darkArmorMat, 0, 0, 0);
  const strikePlate = createMesh(new THREE.BoxGeometry(6, 8, 1), armorMat, 0, 0, 2);
  strikeFaceGroup.add(strikeBase, strikePlate);
  headGroupGeo.add(strikeFaceGroup);

  // 3 Rocket exhaust ports with glow
  const exhaustGroup = new THREE.Group();
  exhaustGroup.position.set(0, 0, -3);
  const exhaustPortGeo = new THREE.CylinderGeometry(1.5, 1, 3);
  const innerGlowGeo = new THREE.CylinderGeometry(0.8, 0.8, 3.1);

  const ex1 = createMesh(exhaustPortGeo, darkArmorMat, 0, 2.5, -1);
  ex1.rotation.x = Math.PI / 2;
  const gl1 = createMesh(innerGlowGeo, glowMat, 0, 2.5, -1);
  gl1.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex1, gl1);

  const ex2 = createMesh(exhaustPortGeo, darkArmorMat, 1.8, -1.5, -1);
  ex2.rotation.x = Math.PI / 2;
  const gl2 = createMesh(innerGlowGeo, glowMat, 1.8, -1.5, -1);
  gl2.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex2, gl2);

  const ex3 = createMesh(exhaustPortGeo, darkArmorMat, -1.8, -1.5, -1);
  ex3.rotation.x = Math.PI / 2;
  const gl3 = createMesh(innerGlowGeo, glowMat, -1.8, -1.5, -1);
  gl3.rotation.x = Math.PI / 2;
  exhaustGroup.add(ex3, gl3);

  headGroupGeo.add(exhaustGroup);
  hammerGroup.add(headGroupGeo);

  const pommel = createMesh(new THREE.CylinderGeometry(1.5, 1, 4), armorMat, 0, -14, 0);
  hammerGroup.add(pommel);
  reinhardtRoot.add(hammerGroup);

  // Ground calibration: Feet at y = 0, scaled to ~2.45m height in world
  reinhardtRoot.position.y = 1.35;
  const scale = 0.0766;
  reinhardtRoot.scale.set(scale, scale, scale);

  parentGroup.add(reinhardtRoot);

  // Deployable Barrier Shield (Translucent cyan energy field)
  const shieldGeo = new THREE.PlaneGeometry(3.6, 2.4);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.set(0, 1.4, 1.15);
  shieldMesh.visible = false;
  parentGroup.add(shieldMesh);

  return {
    rootGroup: reinhardtRoot,
    bodyMesh: chest,
    headMesh: helmet,
    shieldMesh,
    hitMeshes,
    animNodes: {
      root: reinhardtRoot,
      torso: torsoGroup,
      head: headGroup,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg: leftLegGroup,
      rightLeg: rightLegGroup,
      weapon: hammerGroup
    }
  };
}

// ============================================================================
// 2. TRACER MODEL BUILDER
// ============================================================================
export function buildTracerModel(parentGroup) {
  const tracerRoot = new THREE.Group();

  // Materials
  const matOrange = new THREE.MeshStandardMaterial({ color: 0xff7700, roughness: 0.3, metalness: 0.2 });
  const matJacket = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 });
  const matWhite = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.5 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.7 });
  const matSkin = new THREE.MeshStandardMaterial({ color: 0xffdcb1, roughness: 0.4 });
  const matHair = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const matGoggles = new THREE.MeshPhysicalMaterial({ color: 0xff5500, transparent: true, opacity: 0.75, roughness: 0.1 });
  const matGlow = new THREE.MeshBasicMaterial({ color: 0x00ffff });

  const hitMeshes = [];

  // Helper for pistols
  function createPistol() {
    const gunGroup = new THREE.Group();
    const body = createMesh(new THREE.BoxGeometry(2.5, 4.5, 11), matWhite);
    const lowerBarrel = createMesh(new THREE.BoxGeometry(2, 2.5, 8), matDark, 0, -2, 1.5);
    const grip = createMesh(new THREE.BoxGeometry(2, 4, 3), matDark, 0, -4, -2.5);
    grip.rotation.x = -0.2;
    const glow = createMesh(new THREE.BoxGeometry(2.8, 1.5, 4), matGlow, 0, 0, 0);
    gunGroup.add(body, lowerBarrel, grip, glow);
    return gunGroup;
  }

  // --- Torso & Chronal Accelerator ---
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 45;

  const abdomen = createMesh(new THREE.CylinderGeometry(3.5, 4.5, 10, 16), matOrange);
  const chest = createMesh(new THREE.BoxGeometry(11, 10, 7), matJacket, 0, 8, 0);

  const collarGeo = new THREE.CylinderGeometry(5, 6, 4, 16, 1, true, 0, Math.PI);
  const collarMat = matJacket.clone();
  collarMat.side = THREE.DoubleSide;
  const collar = createMesh(collarGeo, collarMat, 0, 14, 0);
  collar.rotation.x = -0.2;

  const armor = createMesh(new THREE.BoxGeometry(12, 6, 8), matWhite, 0, 9, 0);

  // Chronal Accelerator core + ring + blue light
  const accRing = createMesh(new THREE.TorusGeometry(2, 0.5, 16, 32), matWhite, 0, 9, 4.2);
  const accCore = createMesh(new THREE.SphereGeometry(1.5, 16, 16), matGlow, 0, 9, 4.2);
  const glowLight = new THREE.PointLight(0x00ffff, 1.2, 15);
  glowLight.position.set(0, 9, 5);

  torsoGroup.add(abdomen, chest, collar, armor, accRing, accCore, glowLight);
  tracerRoot.add(torsoGroup);
  hitMeshes.push(chest, abdomen, armor);

  // --- Head & Amber Goggles (CRITICAL HITBOX) ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 62, 0);

  const head = createMesh(new THREE.SphereGeometry(3.5, 32, 32), matSkin);
  const goggle = createMesh(new THREE.BoxGeometry(6.5, 2, 4), matGoggles, 0, 0.5, 2);
  headGroup.add(head, goggle);
  hitMeshes.push(head);

  // Spiky Anime Hair
  for (let i = 0; i < 15; i++) {
    const hairGeo = new THREE.ConeGeometry(0.7 + (i % 3) * 0.3, 3 + (i % 2) * 1.5, 6);
    const hair = createMesh(hairGeo, matHair);
    hair.position.set(
      ((i % 5) - 2) * 1.0,
      3.0 + (i % 3) * 0.7,
      ((i % 4) - 2) * 1.1 - 0.5
    );
    hair.rotation.set((i % 3) * 0.2 - 0.2, (i % 2) * 0.3 - 0.15, ((i % 5) - 2) * 0.3);
    headGroup.add(hair);
  }
  headGroup.rotation.x = 0.08;
  tracerRoot.add(headGroup);

  // --- Right Arm (Extended aiming forward) ---
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(-6.5, 56, 0);
  const rUpperArm = createMesh(new THREE.CylinderGeometry(2, 1.5, 12, 16), matJacket, 0, -5, 0);
  const rElbow = new THREE.Group();
  rElbow.position.set(0, -11, 0);
  const rLowerArm = createMesh(new THREE.CylinderGeometry(1.6, 1.2, 12, 16), matWhite, 0, -5, 0);
  const gunR = createPistol();
  gunR.position.set(0, -11, 3);
  gunR.rotation.x = Math.PI / 2 + 0.2;
  rElbow.add(rLowerArm, gunR);
  rightArmGroup.add(rUpperArm, rElbow);

  rightArmGroup.rotation.x = 1.4;
  rightArmGroup.rotation.z = -0.1;
  rightArmGroup.rotation.y = 0.2;
  rElbow.rotation.x = -0.1;
  tracerRoot.add(rightArmGroup);
  hitMeshes.push(rLowerArm);

  // --- Left Arm (Folded across chest) ---
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(6.5, 56, 0);
  const lUpperArm = createMesh(new THREE.CylinderGeometry(2, 1.5, 12, 16), matJacket, 0, -5, 0);
  const lElbow = new THREE.Group();
  lElbow.position.set(0, -11, 0);
  const lLowerArm = createMesh(new THREE.CylinderGeometry(1.6, 1.2, 12, 16), matWhite, 0, -5, 0);
  const gunL = createPistol();
  gunL.position.set(0, -11, 3);
  gunL.rotation.x = Math.PI / 2 + 0.2;
  lElbow.add(lLowerArm, gunL);
  leftArmGroup.add(lUpperArm, lElbow);

  leftArmGroup.rotation.x = 1.0;
  leftArmGroup.rotation.z = 0.8;
  leftArmGroup.rotation.y = -0.5;
  lElbow.rotation.x = -2.0;
  lElbow.rotation.z = -0.3;
  lElbow.rotation.y = -0.6;
  tracerRoot.add(leftArmGroup);
  hitMeshes.push(lLowerArm);

  // --- Right Leg ---
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(-4, 40, 0);
  const rThigh = createMesh(new THREE.CylinderGeometry(3.5, 2.5, 18, 16), matOrange, 0, -9, 0);
  const rStrap = createMesh(new THREE.BoxGeometry(0.5, 18, 1.5), matDark, -3.2, -9, 0);
  const rKnee = new THREE.Group();
  rKnee.position.set(0, -18, 0);
  const rCalf = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 20, 16), matOrange, 0, -10, 0);
  const rBoot = createMesh(new THREE.CylinderGeometry(2, 2.5, 8, 16), matWhite, 0, -21, 0.5);
  const rFoot = createMesh(new THREE.BoxGeometry(4, 2, 8), matWhite, 0, -24, 2);
  rKnee.add(rCalf, rBoot, rFoot);
  rightLegGroup.add(rThigh, rStrap, rKnee);
  rightLegGroup.rotation.z = -0.35;
  rightLegGroup.rotation.x = 0.1;
  rKnee.rotation.x = -0.05;
  tracerRoot.add(rightLegGroup);
  hitMeshes.push(rThigh, rCalf);

  // --- Left Leg ---
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(4, 40, 0);
  const lThigh = createMesh(new THREE.CylinderGeometry(3.5, 2.5, 18, 16), matOrange, 0, -9, 0);
  const lStrap = createMesh(new THREE.BoxGeometry(0.5, 18, 1.5), matDark, 3.2, -9, 0);
  const lKnee = new THREE.Group();
  lKnee.position.set(0, -18, 0);
  const lCalf = createMesh(new THREE.CylinderGeometry(2.5, 1.5, 20, 16), matOrange, 0, -10, 0);
  const lBoot = createMesh(new THREE.CylinderGeometry(2, 2.5, 8, 16), matWhite, 0, -21, 0.5);
  const lFoot = createMesh(new THREE.BoxGeometry(4, 2, 8), matWhite, 0, -24, 2);
  lKnee.add(lCalf, lBoot, lFoot);
  leftLegGroup.add(lThigh, lStrap, lKnee);
  leftLegGroup.rotation.z = 0.35;
  leftLegGroup.rotation.x = -0.3;
  lKnee.rotation.x = 0.5;
  tracerRoot.add(leftLegGroup);
  hitMeshes.push(lThigh, lCalf);

  // Ground calibration: Feet at y = 0, scaled to ~1.72m height
  tracerRoot.position.y = 0.08;
  const scale = 0.0245;
  tracerRoot.scale.set(scale, scale, scale);

  parentGroup.add(tracerRoot);

  return {
    rootGroup: tracerRoot,
    bodyMesh: chest,
    headMesh: head,
    hitMeshes,
    animNodes: {
      root: tracerRoot,
      torso: torsoGroup,
      head: head,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg: leftLegGroup,
      rightLeg: rightLegGroup
    }
  };
}

// ============================================================================
// 3. GENJI MODEL BUILDER
// ============================================================================
export function buildGenjiModel(parentGroup) {
  const genjiRoot = new THREE.Group();

  // Materials
  const whiteArmorMat = new THREE.MeshStandardMaterial({
    color: 0xf0f4f8,
    roughness: 0.22,
    metalness: 0.32
  });
  const chromeArmorMat = new THREE.MeshStandardMaterial({
    color: 0xc4d0dc,
    roughness: 0.14,
    metalness: 0.88
  });
  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x1f232b,
    roughness: 0.36,
    metalness: 0.75
  });
  const cyberMuscleMat = new THREE.MeshStandardMaterial({
    color: 0x543f34,
    roughness: 0.62,
    metalness: 0.22
  });
  const greenGlowMat = new THREE.MeshStandardMaterial({
    color: 0x55ff22,
    emissive: 0x55ff22,
    emissiveIntensity: 3.2,
    roughness: 0.15,
    metalness: 0.1
  });
  const katanaSteelMat = new THREE.MeshStandardMaterial({
    color: 0x181a20,
    roughness: 0.28,
    metalness: 0.9
  });

  const hitMeshes = [];

  // Anatomical Hierarchy
  const spineGroup = new THREE.Group();
  spineGroup.position.set(0, 0.93, 0);
  genjiRoot.add(spineGroup);

  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 0.30, 0);
  spineGroup.add(chestGroup);

  const neckGroup = new THREE.Group();
  neckGroup.position.set(0, 0.22, 0);
  chestGroup.add(neckGroup);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.12, 0.02);
  neckGroup.add(headGroup);

  // Neck
  const neck = createMesh(new THREE.CylinderGeometry(0.065, 0.08, 0.16, 16), cyberMuscleMat, 0, -0.02, -0.015);
  neck.rotation.x = 0.05;
  const neckPlate = createMesh(new THREE.BoxGeometry(0.045, 0.13, 0.03), whiteArmorMat, 0, -0.01, -0.065);
  neckPlate.rotation.x = 0.12;
  neckGroup.add(neck, neckPlate);

  // Head (CRITICAL HEADSHOT HITBOX)
  const innerHead = createMesh(new THREE.CylinderGeometry(0.075, 0.055, 0.17, 16), darkTitaniumMat, 0, 0.01, 0.01);
  headGroup.add(innerHead);

  const domeGeo = new THREE.SphereGeometry(0.105, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const dome = createMesh(domeGeo, whiteArmorMat, 0, 0.01, 0.01);
  dome.scale.set(0.92, 1.05, 1.18);
  headGroup.add(dome);
  hitMeshes.push(dome);

  // Angular V-Brow
  const browGroup = new THREE.Group();
  browGroup.position.set(0, 0.04, 0.08);
  browGroup.rotation.x = 0.18;
  const browLeft = createMesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), whiteArmorMat, -0.045, 0, 0);
  browLeft.rotation.set(0, -0.35, 0.12);
  const browRight = createMesh(new THREE.BoxGeometry(0.1, 0.035, 0.05), whiteArmorMat, 0.045, 0, 0);
  browRight.rotation.set(0, 0.35, -0.12);
  browGroup.add(browLeft, browRight);
  headGroup.add(browGroup);

  // Glowing Green V-Visor & Light
  const visorLeft = createMesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), greenGlowMat, -0.036, 0.005, 0.105);
  visorLeft.rotation.set(0, -0.28, -0.16);
  const visorRight = createMesh(new THREE.BoxGeometry(0.08, 0.015, 0.02), greenGlowMat, 0.036, 0.005, 0.105);
  visorRight.rotation.set(0, 0.28, 0.16);
  const visorLight = new THREE.PointLight(0x55ff22, 1.8, 1.0);
  visorLight.position.set(0, 0.02, 0.16);
  headGroup.add(visorLeft, visorRight, visorLight);

  // Cheek plates & mouth plate
  const cheekLeft = createMesh(new THREE.BoxGeometry(0.035, 0.11, 0.09), whiteArmorMat, -0.07, -0.04, 0.04);
  cheekLeft.rotation.set(0.2, -0.3, 0.15);
  const cheekRight = createMesh(new THREE.BoxGeometry(0.035, 0.11, 0.09), whiteArmorMat, 0.07, -0.04, 0.04);
  cheekRight.rotation.set(0.2, 0.3, -0.15);
  const mouthPlate = createMesh(new THREE.BoxGeometry(0.065, 0.075, 0.06), darkTitaniumMat, 0, -0.06, 0.07);
  mouthPlate.rotation.x = -0.15;
  headGroup.add(cheekLeft, cheekRight, mouthPlate);

  // Swept-back Twin Ear Fins
  [-1, 1].forEach((side) => {
    const earFin = createMesh(new THREE.BoxGeometry(0.015, 0.18, 0.04), whiteArmorMat, side * 0.10, 0.03, -0.06);
    earFin.rotation.set(-1.0, side * 0.15, side * -0.1);
    headGroup.add(earFin);
  });

  // --- Torso & Cyber Muscle Chassis ---
  const chestCore = createMesh(new THREE.CylinderGeometry(0.185, 0.145, 0.29, 16), cyberMuscleMat);
  chestCore.scale.set(1.15, 1.0, 0.82);
  chestGroup.add(chestCore);
  hitMeshes.push(chestCore);

  const collar = createMesh(new THREE.BoxGeometry(0.32, 0.045, 0.14), whiteArmorMat, 0, 0.13, 0.04);
  chestGroup.add(collar);

  // Chrome Pectoral Armor
  [-1, 1].forEach((side) => {
    const pec = createMesh(new THREE.BoxGeometry(0.145, 0.115, 0.09), chromeArmorMat, side * 0.088, 0.055, 0.082);
    pec.rotation.set(0.14, side * -0.12, side * 0.06);
    chestGroup.add(pec);
    hitMeshes.push(pec);
  });

  // Chest Green Power Core & Rib Plates
  const chestNode = createMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.035, 16), greenGlowMat, 0, 0.07, 0.135);
  chestNode.rotation.x = Math.PI / 2;
  chestGroup.add(chestNode);

  [-1, 1].forEach((side) => {
    const ribPlate = createMesh(new THREE.BoxGeometry(0.035, 0.16, 0.12), whiteArmorMat, side * 0.165, -0.04, 0.02);
    ribPlate.rotation.z = side * -0.15;
    chestGroup.add(ribPlate);
  });

  // Abdomen, Midline & 4 Cyber Nodes
  const absGroup = new THREE.Group();
  absGroup.position.set(0, -0.12, 0);
  const stomachPlate = createMesh(new THREE.BoxGeometry(0.075, 0.22, 0.075), whiteArmorMat, 0, -0.045, 0.078);
  const kanjiStripe = createMesh(new THREE.BoxGeometry(0.022, 0.085, 0.005), darkTitaniumMat, 0, -0.03, 0.118);
  absGroup.add(stomachPlate, kanjiStripe);
  [-1, 1].forEach((col) => {
    [0.015, -0.065].forEach((row) => {
      const dot = createMesh(new THREE.SphereGeometry(0.011, 8, 8), greenGlowMat, col * 0.062, row, 0.108);
      absGroup.add(dot);
    });
  });
  chestGroup.add(absGroup);

  // Pelvis & Green Power Ring
  const pelvis = createMesh(new THREE.CylinderGeometry(0.155, 0.125, 0.19, 16), whiteArmorMat);
  pelvis.scale.set(1.08, 1.0, 0.85);
  spineGroup.add(pelvis);
  hitMeshes.push(pelvis);

  const hipRingOuter = createMesh(new THREE.CylinderGeometry(0.038, 0.038, 0.025, 20), greenGlowMat, -0.115, 0.02, 0.085);
  hipRingOuter.rotation.x = Math.PI / 2;
  const hipRingInner = createMesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16), darkTitaniumMat, -0.115, 0.02, 0.088);
  hipRingInner.rotation.x = Math.PI / 2;
  spineGroup.add(hipRingOuter, hipRingInner);

  // Wakizashi short blade on lower back
  const wakizashi = createMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.44, 12), katanaSteelMat, 0, -0.03, -0.115);
  wakizashi.rotation.z = Math.PI / 2 + 0.1;
  const wakiGlow = createMesh(new THREE.CylinderGeometry(0.021, 0.021, 0.06, 12), greenGlowMat, 0.06, -0.03, -0.115);
  wakiGlow.rotation.z = Math.PI / 2 + 0.1;
  spineGroup.add(wakizashi, wakiGlow);

  // --- Ryu-Ichimonji (Katana on Back) ---
  const katanaMount = new THREE.Group();
  katanaMount.position.set(0.06, 0.04, -0.125);
  katanaMount.rotation.set(-0.28, 0.15, -0.68);
  const scabbard = createMesh(new THREE.BoxGeometry(0.034, 0.88, 0.024), katanaSteelMat, 0, 0.08, 0);
  const scabbardBeam = createMesh(new THREE.BoxGeometry(0.009, 0.82, 0.028), greenGlowMat, 0, 0.08, 0);
  const tsuba = createMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.012, 8), darkTitaniumMat, 0, 0.52, 0);
  const hilt = createMesh(new THREE.CylinderGeometry(0.019, 0.021, 0.22, 12), katanaSteelMat, 0, 0.63, 0);
  const hiltRing = createMesh(new THREE.CylinderGeometry(0.021, 0.021, 0.04, 12), greenGlowMat, 0, 0.63, 0);
  const pommel = createMesh(new THREE.SphereGeometry(0.022, 10, 10), darkTitaniumMat, 0, 0.74, 0);
  katanaMount.add(scabbard, scabbardBeam, tsuba, hilt, hiltRing, pommel);
  chestGroup.add(katanaMount);

  // --- Arms ---
  function buildArm(side) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.235, 0.075, 0.01);

    const pauldron = createMesh(new THREE.SphereGeometry(0.092, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), whiteArmorMat);
    pauldron.rotation.z = side * -0.38;
    pauldron.scale.set(1.0, 1.08, 1.0);
    const shoulderDot = createMesh(new THREE.SphereGeometry(0.013, 8, 8), greenGlowMat, side * 0.055, 0.035, 0.052);
    arm.add(pauldron, shoulderDot);

    const bicep = createMesh(new THREE.CylinderGeometry(0.05, 0.046, 0.19, 14), cyberMuscleMat, 0, -0.125, 0);
    const bicepPlate = createMesh(new THREE.BoxGeometry(0.025, 0.14, 0.07), whiteArmorMat, side * 0.042, -0.125, 0.01);
    const elbow = createMesh(new THREE.SphereGeometry(0.044, 12, 12), darkTitaniumMat, 0, -0.22, 0);
    arm.add(bicep, bicepPlate, elbow);

    const forearm = new THREE.Group();
    forearm.position.set(0, -0.22, 0);
    const bracer = createMesh(new THREE.CylinderGeometry(0.055, 0.044, 0.21, 14), whiteArmorMat, 0, -0.105, 0.01);
    bracer.scale.set(0.95, 1.0, 1.22);
    forearm.add(bracer);

    if (side === -1) {
      const rail = createMesh(new THREE.BoxGeometry(0.02, 0.13, 0.03), greenGlowMat, -0.045, -0.095, 0.012);
      forearm.add(rail);
    }

    const hand = new THREE.Group();
    hand.position.set(0, -0.21, 0);
    const fist = createMesh(new THREE.BoxGeometry(0.055, 0.065, 0.055), darkTitaniumMat, 0, -0.012, 0);
    const knuckleArmor = createMesh(new THREE.BoxGeometry(0.058, 0.016, 0.062), chromeArmorMat, 0, -0.028, 0.018);
    hand.add(fist, knuckleArmor);
    forearm.add(hand);
    arm.add(forearm);

    // Natural athletic heroic arm angle
    arm.rotation.set(0.10, 0, side * -0.18);
    forearm.rotation.set(-0.22, 0, side * 0.12);

    hitMeshes.push(bracer);
    return arm;
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);
  chestGroup.add(leftArm, rightArm);

  // --- Legs ---
  function buildLeg(side) {
    const leg = new THREE.Group();
    leg.position.set(side * 0.125, 0.89, 0);

    const thigh = createMesh(new THREE.CylinderGeometry(0.078, 0.06, 0.38, 16), cyberMuscleMat, 0, -0.19, 0);
    thigh.scale.set(1.08, 1.0, 1.18);
    const thighPlate = createMesh(new THREE.BoxGeometry(0.035, 0.34, 0.12), whiteArmorMat, side * 0.055, -0.18, 0.025);
    leg.add(thigh, thighPlate);

    const kneeGroup = new THREE.Group();
    kneeGroup.position.set(0, -0.38, 0);
    const kneeCap = createMesh(new THREE.BoxGeometry(0.068, 0.085, 0.065), chromeArmorMat, 0, 0, 0.055);
    kneeCap.rotation.x = -0.16;
    const kneeDot = createMesh(new THREE.SphereGeometry(0.009, 8, 8), greenGlowMat, 0, 0.01, 0.088);
    kneeGroup.add(kneeCap, kneeDot);
    leg.add(kneeGroup);

    const shin = createMesh(new THREE.CylinderGeometry(0.05, 0.038, 0.44, 16), whiteArmorMat, 0, -0.22, 0.01);
    shin.scale.set(0.95, 1.0, 1.25);
    const calf = createMesh(new THREE.ConeGeometry(0.054, 0.28, 12), cyberMuscleMat, 0, -0.18, -0.038);
    calf.rotation.x = Math.PI;
    const foot = createMesh(new THREE.BoxGeometry(0.072, 0.045, 0.21), darkTitaniumMat, 0, -0.44, 0.045);
    const toeCover = createMesh(new THREE.BoxGeometry(0.068, 0.03, 0.09), whiteArmorMat, 0, -0.43, 0.09);
    const splitToe = createMesh(new THREE.BoxGeometry(0.008, 0.025, 0.04), darkTitaniumMat, 0, -0.435, 0.14);
    const heelGlow = createMesh(new THREE.BoxGeometry(0.028, 0.02, 0.018), greenGlowMat, 0, -0.43, -0.055);
    kneeGroup.add(shin, calf, foot, toeCover, splitToe, heelGlow);

    leg.rotation.set(-0.02, side * -0.06, side * 0.05);
    hitMeshes.push(thigh, shin);
    return leg;
  }

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);
  genjiRoot.add(leftLeg, rightLeg);

  // Ground calibration: Feet at y = 0
  genjiRoot.position.y = -0.045;
  parentGroup.add(genjiRoot);

  return {
    rootGroup: genjiRoot,
    bodyMesh: chestCore,
    headMesh: dome,
    hitMeshes,
    animNodes: {
      root: genjiRoot,
      torso: chestGroup,
      head: dome,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg
    }
  };
}

// ============================================================================
// 4. MCCREE (CASSIDY) MODEL BUILDER
// - Iconic cowboy hat with curved brim, hatband with brass bullet loops
// - Red draped serape (poncho) with gold trim patterns and cloth folds
// - Mechanical prosthetic left arm with cyan glow, holster, flashbangs on belt
// - BAMF gold belt buckle, rugged chaps, boots with spinning silver spurs
// - Signature Peacekeeper Revolver with 6-chamber cylinder and long barrel
// - Rugged bearded face, cigar with glowing cherry
// ============================================================================
export function buildMcCreeModel(parentGroup) {
  const mccreeRoot = new THREE.Group();

  // Materials
  const hatMat = new THREE.MeshStandardMaterial({ color: 0x3b2518, roughness: 0.8, metalness: 0.1 });
  const hatbandMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.7, metalness: 0.2 });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe3a878, roughness: 0.55, metalness: 0.05 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x22150f, roughness: 0.9, metalness: 0.05 });
  const serapeMat = new THREE.MeshStandardMaterial({ color: 0x962b2b, roughness: 0.75, metalness: 0.05 });
  const serapeTrimMat = new THREE.MeshStandardMaterial({ color: 0xd4a017, roughness: 0.4, metalness: 0.6 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0x5a5e63, roughness: 0.7, metalness: 0.15 });
  const armorMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45, metalness: 0.5 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x26150b, roughness: 0.65, metalness: 0.2 });
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf2c313, roughness: 0.25, metalness: 0.85 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2529, roughness: 0.8, metalness: 0.1 });
  const chapsMat = new THREE.MeshStandardMaterial({ color: 0x4a2f1d, roughness: 0.6, metalness: 0.2 });
  const bootsMat = new THREE.MeshStandardMaterial({ color: 0x26160d, roughness: 0.5, metalness: 0.3 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xb8c0c7, roughness: 0.25, metalness: 0.85 });
  const mechMat = new THREE.MeshStandardMaterial({ color: 0x949ba3, roughness: 0.3, metalness: 0.8 });
  const mechDarkMat = new THREE.MeshStandardMaterial({ color: 0x40454a, roughness: 0.4, metalness: 0.7 });
  const glowCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
  const gunSteelMat = new THREE.MeshStandardMaterial({ color: 0x4c5257, roughness: 0.3, metalness: 0.85 });
  const gunWoodMat = new THREE.MeshStandardMaterial({ color: 0x59341b, roughness: 0.45, metalness: 0.1 });
  const cigarMat = new THREE.MeshStandardMaterial({ color: 0x3a2010, roughness: 0.9, metalness: 0.0 });
  const cherryMat = new THREE.MeshBasicMaterial({ color: 0xff4d00 });
  const flashbangMat = new THREE.MeshStandardMaterial({ color: 0x425734, roughness: 0.5, metalness: 0.3 });

  const hitMeshes = [];

  // 1. Torso Group
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, 1.05, 0);
  mccreeRoot.add(torsoGroup);

  // Shirt / Abdomen base
  const shirt = createMesh(new THREE.BoxGeometry(0.38, 0.45, 0.24), shirtMat, 0, 0, 0);
  torsoGroup.add(shirt);
  hitMeshes.push(shirt);

  // Chest Armor Plate (over tactical shirt)
  const chestPlate = createMesh(new THREE.BoxGeometry(0.36, 0.26, 0.06), armorMat, 0, 0.09, 0.11);
  torsoGroup.add(chestPlate);
  hitMeshes.push(chestPlate);

  // Western Belt
  const belt = createMesh(new THREE.BoxGeometry(0.40, 0.08, 0.26), beltMat, 0, -0.20, 0);
  torsoGroup.add(belt);

  // Big Gold BAMF Buckle
  const buckle = createMesh(new THREE.BoxGeometry(0.14, 0.07, 0.04), buckleMat, 0, -0.20, 0.14);
  torsoGroup.add(buckle);

  // Flashbang canisters on left hip
  for (let i = 0; i < 2; i++) {
    const fb = createMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.10, 12), flashbangMat, -0.21, -0.19, -0.04 + i * 0.08);
    const fbCap = createMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.025, 12), silverMat, -0.21, -0.13, -0.04 + i * 0.08);
    torsoGroup.add(fb, fbCap);
  }

  // Gun Holster on right hip
  const holster = createMesh(new THREE.BoxGeometry(0.09, 0.22, 0.11), chapsMat, 0.22, -0.26, 0.02);
  holster.rotation.z = -0.08;
  torsoGroup.add(holster);

  // 2. Red Serape (Poncho draped over left shoulder with golden trim)
  const serapeGroup = new THREE.Group();
  torsoGroup.add(serapeGroup);

  // Left shoulder drape
  const serapeShoulder = createMesh(new THREE.BoxGeometry(0.24, 0.14, 0.32), serapeMat, -0.16, 0.20, 0);
  serapeShoulder.rotation.z = 0.12;
  serapeGroup.add(serapeShoulder);

  // Front cascading cloth drape
  const serapeFront = createMesh(new THREE.BoxGeometry(0.28, 0.36, 0.05), serapeMat, -0.09, 0.02, 0.15);
  serapeFront.rotation.z = 0.08;
  serapeGroup.add(serapeFront);

  // Golden trim pattern on serape front
  const serapeTrim1 = createMesh(new THREE.BoxGeometry(0.28, 0.035, 0.055), serapeTrimMat, -0.09, -0.14, 0.151);
  serapeTrim1.rotation.z = 0.08;
  serapeGroup.add(serapeTrim1);

  // Back cascading cloth drape
  const serapeBack = createMesh(new THREE.BoxGeometry(0.30, 0.42, 0.05), serapeMat, -0.10, -0.01, -0.15);
  serapeBack.rotation.z = 0.05;
  serapeGroup.add(serapeBack);

  const serapeTrimBack = createMesh(new THREE.BoxGeometry(0.30, 0.035, 0.055), serapeTrimMat, -0.10, -0.20, -0.151);
  serapeTrimBack.rotation.z = 0.05;
  serapeGroup.add(serapeTrimBack);

  // 3. Head & Hat
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.36, 0.02);
  torsoGroup.add(headGroup);

  // Neck
  const neck = createMesh(new THREE.CylinderGeometry(0.065, 0.075, 0.12, 12), skinMat, 0, -0.05, 0);
  headGroup.add(neck);

  // Face / Head
  const headMesh = createMesh(new THREE.BoxGeometry(0.18, 0.20, 0.18), skinMat, 0, 0.06, 0);
  headGroup.add(headMesh);
  hitMeshes.push(headMesh);

  // Dark beard & stubble
  const beard = createMesh(new THREE.BoxGeometry(0.19, 0.10, 0.14), hairMat, 0, 0.01, 0.04);
  headGroup.add(beard);

  // Hair under hat
  const backHair = createMesh(new THREE.BoxGeometry(0.20, 0.14, 0.12), hairMat, 0, 0.08, -0.07);
  headGroup.add(backHair);

  // Cigar in mouth with glowing ember cherry
  const cigar = createMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 8), cigarMat, 0.07, 0.0, 0.14);
  cigar.rotation.x = Math.PI / 2 + 0.1;
  cigar.rotation.y = 0.3;
  const cherry = createMesh(new THREE.SphereGeometry(0.016, 8, 8), cherryMat, 0.095, -0.005, 0.18);
  headGroup.add(cigar, cherry);

  // Cowboy Hat
  const hatGroup = new THREE.Group();
  hatGroup.position.set(0, 0.16, 0);
  headGroup.add(hatGroup);

  // Curved Hat Brim (Iconic curved-up edges)
  const brimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.024, 24);
  brimGeo.scale(1.0, 1.0, 1.15);
  const brim = createMesh(brimGeo, hatMat, 0, 0, 0);
  hatGroup.add(brim);

  // Curved brim flaps
  const brimFlapL = createMesh(new THREE.BoxGeometry(0.08, 0.06, 0.32), hatMat, -0.32, 0.03, 0);
  brimFlapL.rotation.z = 0.35;
  const brimFlapR = createMesh(new THREE.BoxGeometry(0.08, 0.06, 0.32), hatMat, 0.32, 0.03, 0);
  brimFlapR.rotation.z = -0.35;
  hatGroup.add(brimFlapL, brimFlapR);

  // Hat Crown (Tapered top with center crease)
  const crownGeo = new THREE.CylinderGeometry(0.18, 0.21, 0.15, 16);
  crownGeo.scale(0.95, 1.0, 1.1);
  const crown = createMesh(crownGeo, hatMat, 0, 0.08, 0);
  hatGroup.add(crown);

  // Dark Hatband with golden bullet loops
  const band = createMesh(new THREE.CylinderGeometry(0.212, 0.215, 0.04, 16), hatbandMat, 0, 0.03, 0);
  hatGroup.add(band);

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const bx = Math.cos(a) * 0.216;
    const bz = Math.sin(a) * 0.222;
    const bullet = createMesh(new THREE.CylinderGeometry(0.009, 0.009, 0.03, 6), buckleMat, bx, 0.03, bz);
    hatGroup.add(bullet);
  }

  // 4. Left Arm (Cyborg Mechanical Arm with Cyan Glow)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.25, 0.18, 0);
  torsoGroup.add(leftArmGroup);

  const lShoulder = createMesh(new THREE.SphereGeometry(0.075, 12, 12), mechDarkMat, 0, 0, 0);
  const lUpperArm = createMesh(new THREE.CylinderGeometry(0.055, 0.05, 0.22, 12), mechMat, 0, -0.11, 0);
  const lElbow = createMesh(new THREE.SphereGeometry(0.055, 10, 10), mechDarkMat, 0, -0.22, 0);
  const lForearm = createMesh(new THREE.CylinderGeometry(0.058, 0.048, 0.20, 12), mechMat, 0, -0.32, 0.04);
  lForearm.rotation.x = 0.35;
  const lGlow = createMesh(new THREE.BoxGeometry(0.03, 0.14, 0.015), glowCyanMat, 0, -0.32, 0.095);
  lGlow.rotation.x = 0.35;
  const lHand = createMesh(new THREE.BoxGeometry(0.07, 0.09, 0.05), mechDarkMat, 0, -0.42, 0.09);
  leftArmGroup.add(lShoulder, lUpperArm, lElbow, lForearm, lGlow, lHand);
  hitMeshes.push(lUpperArm, lForearm);

  // 5. Right Arm (Shooting Arm holding Peacekeeper Revolver)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.25, 0.18, 0);
  torsoGroup.add(rightArmGroup);

  const rShoulder = createMesh(new THREE.SphereGeometry(0.08, 12, 12), shirtMat, 0, 0, 0);
  const rUpperArm = createMesh(new THREE.CylinderGeometry(0.065, 0.055, 0.22, 12), shirtMat, 0, -0.11, 0);
  const rElbow = createMesh(new THREE.SphereGeometry(0.055, 10, 10), shirtMat, 0, -0.22, 0);
  const rForearm = createMesh(new THREE.CylinderGeometry(0.058, 0.052, 0.20, 12), shirtMat, 0, -0.31, 0.05);
  rForearm.rotation.x = 0.30;
  const rGlove = createMesh(new THREE.BoxGeometry(0.075, 0.10, 0.06), chapsMat, 0, -0.41, 0.10);
  rGlove.rotation.x = 0.30;
  rightArmGroup.add(rShoulder, rUpperArm, rElbow, rForearm, rGlove);
  hitMeshes.push(rUpperArm, rForearm);

  // Peacekeeper Revolver in Right Hand
  const gunGroup = new THREE.Group();
  gunGroup.position.set(0, -0.44, 0.14);
  gunGroup.rotation.x = 0.30;
  rightArmGroup.add(gunGroup);

  const gunGrip = createMesh(new THREE.BoxGeometry(0.04, 0.11, 0.06), gunWoodMat, 0, -0.04, -0.04);
  gunGrip.rotation.x = -0.35;
  const gunBody = createMesh(new THREE.BoxGeometry(0.05, 0.07, 0.12), gunSteelMat, 0, 0.02, 0.02);
  const gunCyl = createMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 12), silverMat, 0, 0.02, 0.01);
  gunCyl.rotation.x = Math.PI / 2;
  const gunBarrel = createMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.26, 8), gunSteelMat, 0, 0.04, 0.18);
  gunBarrel.rotation.x = Math.PI / 2;
  const gunSight = createMesh(new THREE.BoxGeometry(0.015, 0.025, 0.025), silverMat, 0, 0.07, 0.30);
  const gunHammer = createMesh(new THREE.BoxGeometry(0.018, 0.035, 0.02), silverMat, 0, 0.06, -0.04);
  gunGroup.add(gunGrip, gunBody, gunCyl, gunBarrel, gunSight, gunHammer);

  // 6. Legs & Boots with Spurs
  function buildMcCreeLeg(isRight) {
    const legGroup = new THREE.Group();
    const side = isRight ? 1 : -1;
    legGroup.position.set(side * 0.13, 0.60, 0);

    const thigh = createMesh(new THREE.CylinderGeometry(0.08, 0.068, 0.32, 12), pantsMat, 0, -0.16, 0);
    const chapThigh = createMesh(new THREE.BoxGeometry(0.06, 0.30, 0.17), chapsMat, side * 0.04, -0.16, 0.01);
    legGroup.add(thigh, chapThigh);

    const knee = createMesh(new THREE.SphereGeometry(0.065, 10, 10), pantsMat, 0, -0.32, 0);
    legGroup.add(knee);

    const calf = createMesh(new THREE.CylinderGeometry(0.066, 0.060, 0.30, 12), chapsMat, 0, -0.47, 0);
    legGroup.add(calf);

    const boot = createMesh(new THREE.BoxGeometry(0.12, 0.12, 0.24), bootsMat, 0, -0.62, 0.04);
    legGroup.add(boot);

    const spurBand = createMesh(new THREE.BoxGeometry(0.13, 0.03, 0.08), silverMat, 0, -0.63, -0.08);
    const spurWheel = createMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8), silverMat, 0, -0.63, -0.14);
    spurWheel.rotation.x = Math.PI / 2;
    legGroup.add(spurBand, spurWheel);

    hitMeshes.push(thigh, calf);
    return legGroup;
  }

  const leftLeg = buildMcCreeLeg(false);
  const rightLeg = buildMcCreeLeg(true);
  mccreeRoot.add(leftLeg, rightLeg);

  // Ground calibration: Feet at y = 0
  mccreeRoot.position.y = 0.0;
  parentGroup.add(mccreeRoot);

  return {
    rootGroup: mccreeRoot,
    bodyMesh: shirt,
    headMesh,
    hitMeshes,
    animNodes: {
      root: mccreeRoot,
      torso: torsoGroup,
      head: headGroup,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg,
      rightLeg,
      weapon: gunGroup
    }
  };
}

// ============================================================================
// DYNAMIC PROCEDURAL WALKING & IDLE ANIMATION ENGINE
// - Reinhardt: Heavy armored footfalls, mass-shifting hammer sway & torso tilt
// - Genji: Agile cybernetic ninja stride, aerodynamic forward lean & arm swing
// - Tracer: Ultra-fast springy cadence, twin pulse pistol pump & energetic bounce
// - McCree: Gunslinger swagger strut, bowlegged cadence & combat roll rotation
// ============================================================================
export function animateHeroWalk(animNodes, heroKey, walkTime, isMoving, dt) {
  if (!animNodes) return;

  const lerpFactor = Math.min(1.0, dt * 14.0);

  if (heroKey === 'reinhardt') {
    const freq = 6.0; // Heavy, deliberate stride
    if (isMoving) {
      const sinVal = Math.sin(walkTime * freq);
      const cosVal = Math.cos(walkTime * freq);

      // Heavy crusader legs stride
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = sinVal * 0.48;
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = -sinVal * 0.48;

      // Heavy left arm swing & hammer lag
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = -sinVal * 0.32;
      if (animNodes.weapon) animNodes.weapon.rotation.x = (Math.PI / 8) + sinVal * 0.18;

      // Side-to-side weight transfer & step thud
      if (animNodes.root) {
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, sinVal * 0.045, lerpFactor);
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, 1.35 - Math.abs(cosVal) * 0.05, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, -sinVal * 0.06, lerpFactor);
      }
    } else {
      // Idle recovery & subtle breathing
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = THREE.MathUtils.lerp(animNodes.leftLeg.rotation.x, 0, lerpFactor);
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = THREE.MathUtils.lerp(animNodes.rightLeg.rotation.x, 0, lerpFactor);
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = THREE.MathUtils.lerp(animNodes.leftArm.rotation.x, 0, lerpFactor);
      if (animNodes.weapon) animNodes.weapon.rotation.x = THREE.MathUtils.lerp(animNodes.weapon.rotation.x, Math.PI / 8, lerpFactor);
      if (animNodes.root) {
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, 0, lerpFactor);
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, 1.35 + Math.sin(walkTime * 2.0) * 0.015, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, 0, lerpFactor);
      }
    }
  } else if (heroKey === 'genji') {
    const freq = 9.2; // Quick, controlled ninja stride
    if (isMoving) {
      const sinVal = Math.sin(walkTime * freq);
      const cosVal = Math.cos(walkTime * freq);

      // Ninja aerodynamic stride
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = -0.02 + sinVal * 0.60;
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = -0.02 - sinVal * 0.60;

      // Cybernetic arms counter-swing
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = 0.10 - sinVal * 0.44;
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = 0.10 + sinVal * 0.44;

      // Agile forward lean & footstep bounce
      if (animNodes.torso) {
        animNodes.torso.rotation.x = THREE.MathUtils.lerp(animNodes.torso.rotation.x, 0.14 + Math.abs(cosVal) * 0.04, lerpFactor);
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, -sinVal * 0.08, lerpFactor);
      }
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, -0.045 + Math.abs(sinVal) * 0.04, lerpFactor);
      }
    } else {
      // Ninja poised idle
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = THREE.MathUtils.lerp(animNodes.leftLeg.rotation.x, -0.02, lerpFactor);
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = THREE.MathUtils.lerp(animNodes.rightLeg.rotation.x, -0.02, lerpFactor);
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = THREE.MathUtils.lerp(animNodes.leftArm.rotation.x, 0.10, lerpFactor);
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = THREE.MathUtils.lerp(animNodes.rightArm.rotation.x, 0.10, lerpFactor);
      if (animNodes.torso) {
        animNodes.torso.rotation.x = THREE.MathUtils.lerp(animNodes.torso.rotation.x, Math.sin(walkTime * 2.5) * 0.02, lerpFactor);
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, 0, lerpFactor);
      }
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, -0.045, lerpFactor);
      }
    }
  } else if (heroKey === 'mccree') {
    const freq = 7.0; // Gunslinger confident swagger
    if (isMoving) {
      const sinVal = Math.sin(walkTime * freq);
      const cosVal = Math.cos(walkTime * freq);

      // Bowlegged western stride
      if (animNodes.leftLeg) {
        animNodes.leftLeg.rotation.x = sinVal * 0.54;
        animNodes.leftLeg.rotation.z = -0.04;
      }
      if (animNodes.rightLeg) {
        animNodes.rightLeg.rotation.x = -sinVal * 0.54;
        animNodes.rightLeg.rotation.z = 0.04;
      }

      // Shooting arm with Peacekeeper counter-balance
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = 0.16 + sinVal * 0.28;
      // Mechanical arm resting steady near belt
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = -0.15 - sinVal * 0.18;

      // Confident shoulder sway & step bounce
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, -sinVal * 0.09, lerpFactor);
        animNodes.torso.rotation.z = THREE.MathUtils.lerp(animNodes.torso.rotation.z, sinVal * 0.03, lerpFactor);
      }
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, Math.abs(cosVal) * 0.04, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, sinVal * 0.025, lerpFactor);
      }
    } else {
      // Poised western idle
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = THREE.MathUtils.lerp(animNodes.leftLeg.rotation.x, 0, lerpFactor);
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = THREE.MathUtils.lerp(animNodes.rightLeg.rotation.x, 0, lerpFactor);
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = THREE.MathUtils.lerp(animNodes.rightArm.rotation.x, 0.15, lerpFactor);
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = THREE.MathUtils.lerp(animNodes.leftArm.rotation.x, -0.12, lerpFactor);
      if (animNodes.torso) {
        animNodes.torso.rotation.x = THREE.MathUtils.lerp(animNodes.torso.rotation.x, Math.sin(walkTime * 2.2) * 0.015, lerpFactor);
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, 0, lerpFactor);
        animNodes.torso.rotation.z = THREE.MathUtils.lerp(animNodes.torso.rotation.z, 0, lerpFactor);
      }
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, 0, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, 0, lerpFactor);
      }
    }
  } else if (heroKey === 'doomfist') {
    // Doomfist: Heavy confident brawler stride & giant golden gauntlet sway
    const freq = 6.8;
    if (isMoving) {
      const sinVal = Math.sin(walkTime * freq);
      const cosVal = Math.cos(walkTime * freq);

      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = sinVal * 0.55;
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = -sinVal * 0.55;

      if (animNodes.leftArm) animNodes.leftArm.rotation.x = -sinVal * 0.35;
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = -Math.PI / 8 + sinVal * 0.25;

      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, Math.abs(cosVal) * 0.05, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, sinVal * 0.035, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, -sinVal * 0.08, lerpFactor);
      }
    } else {
      // Intimidating talon leader stance
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = THREE.MathUtils.lerp(animNodes.leftLeg.rotation.x, 0, lerpFactor);
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = THREE.MathUtils.lerp(animNodes.rightLeg.rotation.x, 0, lerpFactor);
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = THREE.MathUtils.lerp(animNodes.leftArm.rotation.x, -Math.PI / 8, lerpFactor);
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = THREE.MathUtils.lerp(animNodes.rightArm.rotation.x, -Math.PI / 8, lerpFactor);
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, Math.sin(walkTime * 2.2) * 0.015, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, 0, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, 0, lerpFactor);
      }
    }
  } else {
    // Tracer
    const freq = 11.5; // High cadence rapid sprint
    if (isMoving) {
      const sinVal = Math.sin(walkTime * freq);
      const cosVal = Math.cos(walkTime * freq);

      // Energetic high mobility stride
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = sinVal * 0.70;
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = -sinVal * 0.70;

      // Dual pistol arm pump
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = -sinVal * 0.50;
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = sinVal * 0.50;

      // Cheerful bounce & hip sway
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, 0.08 + Math.abs(cosVal) * 0.06, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, sinVal * 0.045, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, -sinVal * 0.10, lerpFactor);
      }
    } else {
      // Lively Tracer idle breathing
      if (animNodes.leftLeg) animNodes.leftLeg.rotation.x = THREE.MathUtils.lerp(animNodes.leftLeg.rotation.x, 0, lerpFactor);
      if (animNodes.rightLeg) animNodes.rightLeg.rotation.x = THREE.MathUtils.lerp(animNodes.rightLeg.rotation.x, 0, lerpFactor);
      if (animNodes.leftArm) animNodes.leftArm.rotation.x = THREE.MathUtils.lerp(animNodes.leftArm.rotation.x, 0, lerpFactor);
      if (animNodes.rightArm) animNodes.rightArm.rotation.x = THREE.MathUtils.lerp(animNodes.rightArm.rotation.x, 0, lerpFactor);
      if (animNodes.root) {
        animNodes.root.position.y = THREE.MathUtils.lerp(animNodes.root.position.y, 0.08 + Math.sin(walkTime * 3.2) * 0.015, lerpFactor);
        animNodes.root.rotation.z = THREE.MathUtils.lerp(animNodes.root.rotation.z, 0, lerpFactor);
      }
      if (animNodes.torso) {
        animNodes.torso.rotation.y = THREE.MathUtils.lerp(animNodes.torso.rotation.y, 0, lerpFactor);
      }
    }
  }
}

// ============================================================================
// 5. DOOMFIST 3D MODEL BUILDER (User-Provided Three.js Mesh Specification)
// ============================================================================
export function buildDoomfistModel(parentGroup) {
  const doomfistRoot = new THREE.Group();
  const hitMeshes = [];

  const colors = {
    skinDark: 0x3d2b1f,
    gauntletGold: 0xd4af37,
    gauntletSilver: 0xa0a0a0,
    gauntletDark: 0x222222,
    glowRed: 0xff0000,
    glowBlue: 0x00aaff,
    pantsWhite: 0xe0e0e0,
    sashRed: 0x8b0000,
    armorBlack: 0x1a1a1a,
    tattoo: 0xffffff
  };

  const matSkin = new THREE.MeshStandardMaterial({ color: colors.skinDark, roughness: 0.5, metalness: 0.1 });
  const matGold = new THREE.MeshStandardMaterial({ color: colors.gauntletGold, roughness: 0.3, metalness: 0.9 });
  const matSilver = new THREE.MeshStandardMaterial({ color: colors.gauntletSilver, roughness: 0.4, metalness: 0.8 });
  const matDarkMetal = new THREE.MeshStandardMaterial({ color: colors.gauntletDark, roughness: 0.6, metalness: 0.5 });
  const matArmorBlack = new THREE.MeshStandardMaterial({ color: colors.armorBlack, roughness: 0.7, metalness: 0.3 });
  const matGlowRed = new THREE.MeshBasicMaterial({ color: colors.glowRed });
  const matGlowBlue = new THREE.MeshBasicMaterial({ color: colors.glowBlue });
  const matPants = new THREE.MeshStandardMaterial({ color: colors.pantsWhite, roughness: 0.9, metalness: 0.0 });
  const matSash = new THREE.MeshStandardMaterial({ color: colors.sashRed, roughness: 0.8, metalness: 0.0 });
  const matTattoo = new THREE.MeshStandardMaterial({ color: colors.tattoo, roughness: 0.5, metalness: 0.0 });

  // 1. Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 1.2;
  doomfistRoot.add(torsoGroup);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 32), matSkin);
  chest.scale.set(1.3, 0.9, 0.8);
  chest.position.y = 0.25;
  chest.castShadow = true;
  torsoGroup.add(chest);
  hitMeshes.push(chest);

  const chestArmor = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI, 0, Math.PI / 2), matArmorBlack);
  chestArmor.scale.set(1.31, 0.91, 0.81);
  chestArmor.position.set(0, 0.25, 0);
  chestArmor.rotation.y = Math.PI / 4;
  chestArmor.castShadow = true;
  torsoGroup.add(chestArmor);

  const chestGoldPlate = new THREE.Mesh(new THREE.SphereGeometry(0.37, 32, 32, 0, Math.PI / 3, 0, Math.PI / 3), matGold);
  chestGoldPlate.scale.set(1.3, 0.9, 0.8);
  chestGoldPlate.position.set(-0.1, 0.25, 0.1);
  chestGoldPlate.rotation.z = -Math.PI / 8;
  chestGoldPlate.castShadow = true;
  torsoGroup.add(chestGoldPlate);

  const chestGlow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.05), matGlowRed);
  chestGlow.position.set(-0.15, 0.35, 0.35);
  chestGlow.rotation.z = Math.PI / 8;
  chestGlow.rotation.y = -Math.PI / 8;
  torsoGroup.add(chestGlow);

  const abs = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), matSkin);
  abs.scale.set(1.1, 1.0, 0.7);
  abs.position.y = -0.15;
  abs.castShadow = true;
  torsoGroup.add(abs);
  hitMeshes.push(abs);

  const sashGeo = new THREE.TorusGeometry(0.28, 0.08, 16, 64);
  const sash = new THREE.Mesh(sashGeo, matSash);
  sash.position.y = -0.4;
  sash.rotation.x = Math.PI / 2;
  sash.rotation.y = 0.1;
  sash.castShadow = true;
  torsoGroup.add(sash);

  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), matSash);
  knot.position.set(0.1, -0.4, 0.3);
  knot.scale.set(1, 1.5, 0.5);
  torsoGroup.add(knot);

  const paintGeo = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI / 4, 0, Math.PI / 3);
  const paint = new THREE.Mesh(paintGeo, matTattoo);
  paint.scale.set(1.3, 0.9, 0.8);
  paint.position.set(0, 0.25, 0);
  paint.rotation.y = -Math.PI / 2;
  torsoGroup.add(paint);

  // 2. Head
  const headGroup = new THREE.Group();
  headGroup.position.y = 0.65;
  torsoGroup.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), matSkin);
  head.scale.set(0.9, 1.2, 1.0);
  head.castShadow = true;
  head.userData.isHead = true;
  headGroup.add(head);
  hitMeshes.push(head);

  const headsetBand = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 16, 32, Math.PI), matArmorBlack);
  headsetBand.rotation.x = Math.PI / 2;
  headsetBand.rotation.y = Math.PI / 2;
  headGroup.add(headsetBand);

  const earPiece = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 32), matArmorBlack);
  earPiece.rotation.z = Math.PI / 2;
  earPiece.position.set(0.14, 0, 0);
  headGroup.add(earPiece);

  const earGlow = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 16, 32), matGlowRed);
  earGlow.rotation.y = Math.PI / 2;
  earGlow.position.set(0.16, 0, 0);
  headGroup.add(earGlow);

  const skullPlate = new THREE.Mesh(new THREE.SphereGeometry(0.142, 32, 32, 0, Math.PI / 3, 0, Math.PI / 3), matDarkMetal);
  skullPlate.scale.set(0.9, 1.2, 1.0);
  skullPlate.rotation.y = -Math.PI / 6;
  headGroup.add(skullPlate);

  const eyeGlow = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.02), matGlowRed);
  eyeGlow.position.set(0.05, 0.02, 0.13);
  headGroup.add(eyeGlow);

  const facePaint = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.08), matTattoo);
  facePaint.position.set(-0.05, -0.05, 0.135);
  facePaint.rotation.y = -0.2;
  facePaint.rotation.z = -0.1;
  headGroup.add(facePaint);

  // 3. Hips & Pelvis
  const hips = new THREE.Group();
  hips.position.y = 0.8;
  doomfistRoot.add(hips);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), matPants);
  pelvis.scale.set(1.1, 0.8, 0.9);
  pelvis.castShadow = true;
  hips.add(pelvis);
  hitMeshes.push(pelvis);

  function createLeg(xSide) {
    const legGroup = new THREE.Group();
    legGroup.position.set(xSide * 0.16, -0.1, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.45, 32), matPants);
    thigh.position.y = -0.225;
    thigh.castShadow = true;
    legGroup.add(thigh);

    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 32), matArmorBlack);
    knee.position.set(0, -0.45, 0.08);
    knee.scale.set(1, 1.2, 1);
    knee.castShadow = true;
    legGroup.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.4, 32), matArmorBlack);
    calf.position.y = -0.65;
    calf.castShadow = true;
    legGroup.add(calf);

    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 16, 32), matGlowRed);
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = -0.75;
    legGroup.add(stripe);

    const foot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 32, 32), matDarkMetal);
    foot.scale.set(1, 0.5, 1.6);
    foot.position.set(0, -0.9, 0.05);
    foot.castShadow = true;
    legGroup.add(foot);

    hitMeshes.push(thigh, calf);
    return legGroup;
  }

  const leftLeg = createLeg(-1);
  const rightLeg = createLeg(1);
  hips.add(leftLeg, rightLeg);

  // 4. Left Arm (Hand Cannon)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.45, 0.4, 0);
  torsoGroup.add(leftArmGroup);

  const lShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 32), matSkin);
  leftArmGroup.add(lShoulder);

  const armTattoo = new THREE.Mesh(new THREE.SphereGeometry(0.155, 32, 32, 0, Math.PI / 2, Math.PI / 4, Math.PI / 4), matTattoo);
  armTattoo.rotation.y = -Math.PI / 2;
  leftArmGroup.add(armTattoo);

  const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.35, 32), matSkin);
  lBicep.position.y = -0.2;
  leftArmGroup.add(lBicep);

  const lElbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 32), matSkin);
  lElbow.position.y = -0.38;
  leftArmGroup.add(lElbow);

  const lForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.4, 32), matArmorBlack);
  lForearm.position.y = -0.6;
  leftArmGroup.add(lForearm);

  const lForearmPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.095, 0.3, 32, 1, false, 0, Math.PI), matSilver);
  lForearmPlate.position.y = -0.6;
  leftArmGroup.add(lForearmPlate);

  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32), matDarkMetal);
  lHand.position.y = -0.85;
  lHand.scale.set(1, 1.2, 1);
  leftArmGroup.add(lHand);

  for (let i = 0; i < 4; i++) {
    const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), matSilver);
    knuckle.position.set(-0.06 + (i * 0.04), -0.92, 0.08);
    leftArmGroup.add(knuckle);

    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), matGlowBlue);
    glow.position.set(-0.06 + (i * 0.04), -0.92, 0.1);
    leftArmGroup.add(glow);
  }

  leftArmGroup.rotation.z = Math.PI / 8;
  leftArmGroup.rotation.x = -Math.PI / 8;

  // 5. Right Arm (Golden Gauntlet)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.45, 0.4, 0);
  torsoGroup.add(rightArmGroup);

  const rShoulderGroup = new THREE.Group();
  rightArmGroup.add(rShoulderGroup);

  const shoulderBase = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32, 0, Math.PI, 0, Math.PI), matArmorBlack);
  shoulderBase.rotation.x = Math.PI / 2;
  shoulderBase.rotation.z = -Math.PI / 4;
  rShoulderGroup.add(shoulderBase);

  const shoulderGold = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32, 0, Math.PI * 0.8, 0, Math.PI * 0.8), matGold);
  shoulderGold.rotation.x = Math.PI / 2;
  shoulderGold.rotation.z = -Math.PI / 3;
  rShoulderGroup.add(shoulderGold);

  function createSpike(x, y, z, rotX, rotZ) {
    const spikeGroup = new THREE.Group();
    spikeGroup.position.set(x, y, z);
    spikeGroup.rotation.set(rotX, 0, rotZ);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), matArmorBlack);
    spikeGroup.add(base);

    const horn1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.15, 16), matSilver);
    horn1.position.y = 0.1;
    spikeGroup.add(horn1);

    const horn2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.005, 0.15, 16), matSilver);
    horn2.position.set(0.02, 0.22, 0);
    horn2.rotation.z = -0.2;
    spikeGroup.add(horn2);

    return spikeGroup;
  }

  rShoulderGroup.add(createSpike(0.2, 0.15, 0, 0, -Math.PI / 4));
  rShoulderGroup.add(createSpike(0.0, 0.22, -0.1, Math.PI / 6, 0));

  const shoulderGlow = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.05), matGlowRed);
  shoulderGlow.position.set(0.2, 0.1, 0.1);
  shoulderGlow.rotation.z = -Math.PI / 4;
  rShoulderGroup.add(shoulderGlow);

  const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.4, 32), matDarkMetal);
  rBicep.position.set(0.15, -0.25, 0);
  rightArmGroup.add(rBicep);

  const bicepGold = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.125, 0.2, 32, 1, false, 0, Math.PI), matGold);
  bicepGold.position.set(0.15, -0.25, 0);
  bicepGold.rotation.y = Math.PI / 2;
  rightArmGroup.add(bicepGold);

  const rElbow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 32, 32), matArmorBlack);
  rElbow.position.set(0.15, -0.45, 0);
  rightArmGroup.add(rElbow);

  // Gauntlet Forearm & Hand
  const gauntletGroup = new THREE.Group();
  gauntletGroup.position.set(0.15, -0.45, 0);
  rightArmGroup.add(gauntletGroup);

  const gauntletBase = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.65, 32), matDarkMetal);
  gauntletBase.position.y = -0.3;
  gauntletBase.scale.set(0.9, 1, 0.8);
  gauntletGroup.add(gauntletBase);

  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.19, 0.6, 32, 1, false, 0, Math.PI), matGold);
  topPlate.position.y = -0.3;
  topPlate.scale.set(0.9, 1, 0.8);
  gauntletGroup.add(topPlate);

  const sidePlateGeom = new THREE.BoxGeometry(0.15, 0.4, 0.3);
  const lSidePlate = new THREE.Mesh(sidePlateGeom, matGold);
  lSidePlate.position.set(-0.25, -0.3, 0);
  lSidePlate.rotation.z = 0.1;
  gauntletGroup.add(lSidePlate);

  const knuckleGuard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), matGold);
  knuckleGuard.position.set(0, -0.65, 0.15);
  gauntletGroup.add(knuckleGuard);

  const knuckleRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 16, 32), matGlowRed);
  knuckleRing1.position.set(-0.15, -0.65, 0.28);
  gauntletGroup.add(knuckleRing1);

  const knuckleRing2 = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 16, 32), matGlowRed);
  knuckleRing2.position.set(0.15, -0.65, 0.28);
  gauntletGroup.add(knuckleRing2);

  for (let i = 0; i < 3; i++) {
    const spikeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16), matDarkMetal);
    spikeBase.rotation.x = Math.PI / 2;
    spikeBase.position.set(-0.15 + (i * 0.15), -0.65, 0.28);
    gauntletGroup.add(spikeBase);

    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.15, 16), matSilver);
    spike.rotation.x = Math.PI / 2;
    spike.position.set(-0.15 + (i * 0.15), -0.65, 0.35);
    gauntletGroup.add(spike);
  }

  const fingersGroup = new THREE.Group();
  fingersGroup.position.set(0, -0.75, 0);
  gauntletGroup.add(fingersGroup);

  function createFinger(x) {
    const finger = new THREE.Group();
    finger.position.x = x;

    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), matGold);
    hinge.rotation.z = Math.PI / 2;
    finger.add(hinge);

    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.08), matSilver);
    p1.position.set(0, -0.08, 0.04);
    const p1c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 16), matSilver);
    p1c.position.set(0, -0.08, 0.08);
    finger.add(p1, p1c);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.07), matSilver);
    p2.position.set(0, -0.15, 0.12);
    p2.rotation.x = -Math.PI / 4;
    finger.add(p2);

    return finger;
  }

  for (let i = 0; i < 4; i++) {
    fingersGroup.add(createFinger(-0.18 + (i * 0.12)));
  }

  const thumb = createFinger(0);
  thumb.position.set(-0.25, 0.05, -0.05);
  thumb.rotation.z = -Math.PI / 3;
  thumb.rotation.y = -Math.PI / 4;
  fingersGroup.add(thumb);

  rightArmGroup.rotation.z = -Math.PI / 6;
  rightArmGroup.rotation.x = -Math.PI / 8;
  gauntletGroup.rotation.x = -Math.PI / 3;
  gauntletGroup.rotation.y = -Math.PI / 6;

  // Add all main components to hit meshes
  hitMeshes.push(gauntletBase, topPlate, knuckleGuard);

  // Position at floor level (feet at y = 0)
  doomfistRoot.position.y = 0.26;
  if (parentGroup) parentGroup.add(doomfistRoot);

  return {
    rootGroup: doomfistRoot,
    bodyMesh: chest,
    headMesh: head,
    hitMeshes,
    animNodes: {
      root: doomfistRoot,
      torso: torsoGroup,
      head: headGroup,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg,
      rightLeg,
      weapon: gauntletGroup
    }
  };
}


