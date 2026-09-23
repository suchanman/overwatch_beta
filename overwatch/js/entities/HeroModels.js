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
    hitMeshes
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
    hitMeshes
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
    hitMeshes
  };
}
