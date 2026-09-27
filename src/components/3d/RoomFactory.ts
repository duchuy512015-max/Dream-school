import * as THREE from 'three';
import { Room } from '../../types';

// Cached shared architectural materials to maintain high performance
const archSharedMaterials = {
  doorFrame: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }),
  doorWood: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }),
  doorGlass: new THREE.MeshPhysicalMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.55, roughness: 0.1 }),
  doorHandle: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 }),
  windowFrame: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }),
  windowGlass: new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65, roughness: 0.1, metalness: 0.3 }),
  windowSunshade: new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 }),
  windowSill: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.4 }),
  plaqueBase: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.4 }),
  plaqueGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 }),
  terracottaRoof: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6, metalness: 0.1 }),
  roofFascia: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }),
  roofRidge: new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.5 }),
  skylightGlass: new THREE.MeshPhysicalMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5, roughness: 0.1 }),
  solarPanel: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 }),
  solarFrame: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.8 }),
};

Object.values(archSharedMaterials).forEach((m) => {
  m.userData = { isShared: true };
});

export function createRoomMesh(
  room: Room,
  isSelected: boolean,
  showCeiling: boolean,
  wallOpacity: number = 0.95,
  showRoof: boolean = true,
  isIsolatedFloor: boolean = false
): THREE.Group {
  const roomGroup = new THREE.Group();
  roomGroup.name = `room_${room.id}`;
  roomGroup.userData = { roomId: room.id, roomData: room };

  const { width, depth, height, floorMaterial, wallColor, themeColor } = room;

  // 1. Floor Slab
  let floorColorHex = 0xe2e8f0;
  let roughness = 0.5;
  let metalness = 0.1;

  if (floorMaterial === 'carpet_red') {
    floorColorHex = 0x881337; // deep cinema theater maroon
    roughness = 0.95;
  } else if (floorMaterial === 'carpet_charcoal') {
    floorColorHex = 0x27272a;
    roughness = 0.9;
  } else if (floorMaterial === 'wood_parquet') {
    floorColorHex = 0xb45309;
    roughness = 0.4;
  } else if (floorMaterial === 'gym_hardwood') {
    floorColorHex = 0xf59e0b; // amber polished basketball gym court
    roughness = 0.2;
    metalness = 0.15;
  } else if (floorMaterial === 'linoleum_blue') {
    floorColorHex = 0x0284c7;
    roughness = 0.3;
  } else if (floorMaterial === 'polished_concrete') {
    floorColorHex = 0x64748b;
    roughness = 0.25;
    metalness = 0.2;
  } else if (floorMaterial === 'tile_white') {
    floorColorHex = 0xf1f5f9;
    roughness = 0.15;
  } else if (floorMaterial === 'turf_green') {
    floorColorHex = 0x15803d; // vibrant artificial football turf
    roughness = 0.85;
  } else if (floorMaterial === 'garden_grass') {
    floorColorHex = 0x166534; // lush botanical garden grass
    roughness = 0.9;
  } else if (floorMaterial === 'terracotta_tile') {
    floorColorHex = 0x9a3412; // Vietnamese traditional clay red tile
    roughness = 0.6;
  } else if (floorMaterial === 'rubber_playground') {
    floorColorHex = 0x0284c7; // colorful safety rubber playground
    roughness = 0.7;
  } else if (floorMaterial === 'pool_water') {
    floorColorHex = 0x0ea5e9;
    roughness = 0.1;
    metalness = 0.2;
  } else if (floorMaterial === 'canteen_tile') {
    floorColorHex = 0xf8fafc;
    roughness = 0.25;
  } else if (floorMaterial === 'badminton_green') {
    floorColorHex = 0x059669; // professional tournament non-slip green mat
    roughness = 0.35;
    metalness = 0.05;
  }

  const floorGeom = new THREE.BoxGeometry(width, 0.2, depth);
  const floorMat = new THREE.MeshStandardMaterial({
    color: floorColorHex,
    roughness,
    metalness,
  });
  const floorMesh = new THREE.Mesh(floorGeom, floorMat);
  floorMesh.position.set(0, -0.1, 0);
  floorMesh.receiveShadow = true;
  roomGroup.add(floorMesh);

  // Badminton Court Lines (Regulation 13.4m x 6.1m singles & doubles marked lines)
  if (room.type === 'badminton_court' || floorMaterial === 'badminton_green') {
    const bWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const courtW = Math.min(width * 0.85, 14);
    const courtD = Math.min(depth * 0.85, 8.5);

    // Boundary outer lines
    const hLine = new THREE.PlaneGeometry(courtW, 0.08);
    [-courtD / 2, courtD / 2].forEach((z) => {
      const line = new THREE.Mesh(hLine, bWhiteMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.015, z);
      roomGroup.add(line);
    });

    const vLine = new THREE.PlaneGeometry(0.08, courtD);
    [-courtW / 2, courtW / 2].forEach((x) => {
      const line = new THREE.Mesh(vLine, bWhiteMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.015, 0);
      roomGroup.add(line);
    });

    // Center Service Line & Net Line
    const centerDiv = new THREE.Mesh(new THREE.PlaneGeometry(courtW * 0.7, 0.06), bWhiteMat);
    centerDiv.rotation.x = -Math.PI / 2;
    centerDiv.position.set(0, 0.015, 0);
    roomGroup.add(centerDiv);

    // Short service lines (1.98m from net)
    [-courtW * 0.22, courtW * 0.22].forEach((x) => {
      const sLine = new THREE.Mesh(new THREE.PlaneGeometry(0.06, courtD), bWhiteMat);
      sLine.rotation.x = -Math.PI / 2;
      sLine.position.set(x, 0.015, 0);
      roomGroup.add(sLine);
    });
  }

  // Football / Soccer Pitch Field Lines
  if (room.type === 'pitch' || floorMaterial === 'turf_green') {
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pw = width * 0.9;
    const pd = depth * 0.9;

    // Perimeter boundary lines
    const periGeom = new THREE.RingGeometry(0, 0, 4); // placeholder or lines
    // Top & Bottom touchlines
    const hLineGeom = new THREE.PlaneGeometry(pw, 0.12);
    [-pd / 2, pd / 2].forEach((z) => {
      const line = new THREE.Mesh(hLineGeom, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.01, z);
      roomGroup.add(line);
    });

    // Left & Right touchlines
    const vLineGeom = new THREE.PlaneGeometry(0.12, pd);
    [-pw / 2, pw / 2].forEach((x) => {
      const line = new THREE.Mesh(vLineGeom, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.01, 0);
      roomGroup.add(line);
    });

    // Center Halfway Line
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(pw, 0.12), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.01, 0);
    roomGroup.add(centerLine);

    // Center Circle & Spot
    const centerCircle = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.52, 32), lineMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, 0.01, 0);
    roomGroup.add(centerCircle);

    const centerSpot = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), lineMat);
    centerSpot.rotation.x = -Math.PI / 2;
    centerSpot.position.set(0, 0.012, 0);
    roomGroup.add(centerSpot);

    // Penalty Boxes at North & South ends
    [-pd / 2 + 3.0, pd / 2 - 3.0].forEach((pz, idx) => {
      const boxW = pw * 0.45;
      const boxD = 3.0;
      // Front line
      const fl = new THREE.Mesh(new THREE.PlaneGeometry(boxW, 0.1), lineMat);
      fl.rotation.x = -Math.PI / 2;
      fl.position.set(0, 0.01, pz);
      roomGroup.add(fl);

      // Side lines
      [-boxW / 2, boxW / 2].forEach((bx) => {
        const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.1, boxD), lineMat);
        sl.rotation.x = -Math.PI / 2;
        sl.position.set(bx, 0.01, idx === 0 ? pz - boxD / 2 : pz + boxD / 2);
        roomGroup.add(sl);
      });
    });
  }

  // If open air space like pitch or garden, build low perimeter border fence instead of high walls!
  const isOpenAir = room.type === 'pitch' || room.type === 'garden';
  const effectiveWallH = isOpenAir ? 0.8 : height;

  // If gym court, add basketball court line markings!
  if (floorMaterial === 'gym_hardwood') {
    const courtLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // Center circle
    const circleGeom = new THREE.RingGeometry(1.8, 1.9, 32);
    const circle = new THREE.Mesh(circleGeom, courtLineMat);
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(0, 0.01, 0);
    roomGroup.add(circle);

    // Center divider line
    const divGeom = new THREE.PlaneGeometry(width * 0.9, 0.1);
    const divLine = new THREE.Mesh(divGeom, courtLineMat);
    divLine.rotation.x = -Math.PI / 2;
    divLine.position.set(0, 0.01, 0);
    roomGroup.add(divLine);

    // Key area keys on both sides
    [-depth * 0.35, depth * 0.35].forEach((kz) => {
      const keyBox = new THREE.RingGeometry(2.5, 2.6, 24, 1, 0, Math.PI);
      const keyMesh = new THREE.Mesh(keyBox, courtLineMat);
      keyMesh.rotation.x = -Math.PI / 2;
      keyMesh.rotation.z = kz > 0 ? Math.PI : 0;
      keyMesh.position.set(0, 0.01, kz);
      roomGroup.add(keyMesh);
    });
  }

  // 2. Interior Walls (FrontSide & Early-Z accelerated when opaque)
  const isOpaque = wallOpacity >= 0.95;
  const wallMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(wallColor || '#ffffff'),
    roughness: 0.8,
    transparent: !isOpaque,
    opacity: isOpaque ? 1.0 : wallOpacity,
    side: isOpaque ? THREE.FrontSide : THREE.DoubleSide,
    depthWrite: isOpaque,
  });

  const wallThickness = 0.3;
  const wallH = effectiveWallH;

  // North wall (Z = -depth/2)
  const northWallGeom = new THREE.BoxGeometry(width, wallH, wallThickness);
  const northWall = new THREE.Mesh(northWallGeom, wallMat);
  northWall.position.set(0, wallH / 2, -depth / 2);
  northWall.receiveShadow = true;
  northWall.castShadow = true;
  roomGroup.add(northWall);

  // Exterior Windows on North Wall (omitted for cinemas/theaters to prevent exterior light leaks)
  if (!isOpenAir && wallH >= 2.5 && room.type !== 'theater') {
    const winCount = width >= 14 ? 3 : 2;
    const winSpacing = width / (winCount + 1);
    for (let w = 1; w <= winCount; w++) {
      const wx = -width / 2 + w * winSpacing;

      // Outer window trim frame
      const wFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 0.36), archSharedMaterials.windowFrame);
      wFrame.position.set(wx, 1.85, -depth / 2);
      roomGroup.add(wFrame);

      // Reflective glass panel
      const wGlass = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.2, 0.38), archSharedMaterials.windowGlass);
      wGlass.position.set(wx, 1.85, -depth / 2);
      roomGroup.add(wGlass);

      // Window sill ledge
      const wSill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.46), archSharedMaterials.windowSill);
      wSill.position.set(wx, 1.06, -depth / 2);
      roomGroup.add(wSill);

      // Tropical sunshade visor hood
      const wVisor = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.42), archSharedMaterials.windowSunshade);
      wVisor.rotation.x = 0.15;
      wVisor.position.set(wx, 2.65, -depth / 2 - 0.12);
      roomGroup.add(wVisor);
    }
  }

  // South wall with entryway cutout (Z = depth/2)
  // Divide into left segment, right segment, and door header
  const isLargeVenue = room.type === 'swimming_pool' || room.type === 'canteen' || room.type === 'gym';
  const doorWidth = isLargeVenue ? 5.6 : 3.0;
  const doorHeight = isLargeVenue ? 2.8 : 2.4;
  const sideWidth = (width - doorWidth) / 2;

  // South Left
  const southLeftGeom = new THREE.BoxGeometry(sideWidth, wallH, wallThickness);
  const southLeft = new THREE.Mesh(southLeftGeom, wallMat);
  southLeft.position.set(-width / 2 + sideWidth / 2, wallH / 2, depth / 2);
  southLeft.receiveShadow = true;
  roomGroup.add(southLeft);

  // South Right
  const southRightGeom = new THREE.BoxGeometry(sideWidth, wallH, wallThickness);
  const southRight = new THREE.Mesh(southRightGeom, wallMat);
  southRight.position.set(width / 2 - sideWidth / 2, wallH / 2, depth / 2);
  southRight.receiveShadow = true;
  roomGroup.add(southRight);

  // Door lintel header above opening
  const headerHeight = wallH - doorHeight;
  const headerGeom = new THREE.BoxGeometry(doorWidth, headerHeight, wallThickness);
  const headerMesh = new THREE.Mesh(headerGeom, wallMat);
  headerMesh.position.set(0, doorHeight + headerHeight / 2, depth / 2);
  roomGroup.add(headerMesh);

  // Architectural Doors & Entrance Details
  if (!isOpenAir && wallH >= 2.5) {
    if (isLargeVenue) {
      // Grand open double-wide welcoming archway for swimming pool & canteen
      const pillarGeom = new THREE.BoxGeometry(0.35, doorHeight, 0.4);
      const pillarL = new THREE.Mesh(pillarGeom, archSharedMaterials.doorFrame);
      pillarL.position.set(-doorWidth / 2 + 0.18, doorHeight / 2, depth / 2);
      roomGroup.add(pillarL);

      const pillarR = new THREE.Mesh(pillarGeom, archSharedMaterials.doorFrame);
      pillarR.position.set(doorWidth / 2 - 0.18, doorHeight / 2, depth / 2);
      roomGroup.add(pillarR);

      // Transom glass header
      const transomGlass = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.4, 0.4, 0.1), archSharedMaterials.doorGlass);
      transomGlass.position.set(0, doorHeight - 0.25, depth / 2);
      roomGroup.add(transomGlass);

      // Glass panels neatly placed at side borders so the 4m+ central entryway is wide open for walking in
      [-doorWidth / 2 + 0.7, doorWidth / 2 - 0.7].forEach((dx) => {
        const sideDoor = new THREE.Mesh(new THREE.BoxGeometry(0.8, doorHeight - 0.6, 0.08), archSharedMaterials.doorGlass);
        sideDoor.position.set(dx, (doorHeight - 0.6) / 2, depth / 2);
        roomGroup.add(sideDoor);
      });
    } else {
      // Standard room entrance: door frame and doors swung wide open ajar into room
      const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorHeight, 0.34), archSharedMaterials.doorFrame);
      jambL.position.set(-1.45, doorHeight / 2, depth / 2);
      roomGroup.add(jambL);

      const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.1, doorHeight, 0.34), archSharedMaterials.doorFrame);
      jambR.position.set(1.45, doorHeight / 2, depth / 2);
      roomGroup.add(jambR);

      // Transom bar & glass
      const transomBar = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.1, 0.08, 0.34), archSharedMaterials.doorFrame);
      transomBar.position.set(0, 2.0, depth / 2);
      roomGroup.add(transomBar);

      const transomGlass = new THREE.Mesh(new THREE.BoxGeometry(doorWidth - 0.2, 0.32, 0.1), archSharedMaterials.doorGlass);
      transomGlass.position.set(0, 2.2, depth / 2);
      roomGroup.add(transomGlass);

      // Open ajar door leaves (swung 70 degrees inward so visitors can walk through freely)
      const leafGeom = new THREE.BoxGeometry(0.68, 1.94, 0.08);
      const doorLeafL = new THREE.Mesh(leafGeom, archSharedMaterials.doorWood);
      doorLeafL.position.set(-1.1, 0.98, depth / 2 - 0.3);
      doorLeafL.rotation.y = 1.2;
      roomGroup.add(doorLeafL);

      const doorLeafR = new THREE.Mesh(leafGeom, archSharedMaterials.doorWood);
      doorLeafR.position.set(1.1, 0.98, depth / 2 - 0.3);
      doorLeafR.rotation.y = -1.2;
      roomGroup.add(doorLeafR);
    }

    // Room Name Plaque above Door Lintel
    const plaqueW = isLargeVenue ? 3.6 : 2.6;
    const plaqueBorder = new THREE.Mesh(new THREE.BoxGeometry(plaqueW, 0.44, 0.04), archSharedMaterials.plaqueGold);
    plaqueBorder.position.set(0, doorHeight + 0.3, depth / 2 + 0.17);
    roomGroup.add(plaqueBorder);

    const plaqueBg = new THREE.Mesh(new THREE.BoxGeometry(plaqueW - 0.1, 0.36, 0.06), archSharedMaterials.plaqueBase);
    plaqueBg.position.set(0, doorHeight + 0.3, depth / 2 + 0.18);
    roomGroup.add(plaqueBg);
  }

  // West wall (X = -width/2)
  const westWallGeom = new THREE.BoxGeometry(wallThickness, wallH, depth);
  const westWall = new THREE.Mesh(westWallGeom, wallMat);
  westWall.position.set(-width / 2, wallH / 2, 0);
  westWall.receiveShadow = true;
  westWall.castShadow = true;
  roomGroup.add(westWall);

  // East wall (X = width/2)
  const eastWallGeom = new THREE.BoxGeometry(wallThickness, wallH, depth);
  const eastWall = new THREE.Mesh(eastWallGeom, wallMat);
  eastWall.position.set(width / 2, wallH / 2, 0);
  eastWall.receiveShadow = true;
  eastWall.castShadow = true;
  roomGroup.add(eastWall);

  // Windows on West / East for standalone or large rooms
  if (!isOpenAir && (room.type === 'swimming_pool' || room.type === 'canteen' || room.type === 'gym' || width >= 16)) {
    [-width / 2, width / 2].forEach((wx) => {
      [-depth * 0.25, depth * 0.25].forEach((wz) => {
        const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.6, 2.2), archSharedMaterials.windowFrame);
        sideFrame.position.set(wx, 1.9, wz);
        roomGroup.add(sideFrame);

        const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.38, 1.3, 1.9), archSharedMaterials.windowGlass);
        sideGlass.position.set(wx, 1.9, wz);
        roomGroup.add(sideGlass);
      });
    });
  }

  // Proper Architectural Roof (Mái Ngói Trường Học Truyền Thống / Eaves & Ridge)
  // Building identification to prevent lower floors from rendering roofs under upper floors
  const isBuildingA =
    room.id.startsWith('room_cr_f') ||
    room.id.startsWith('room_class_') ||
    room.id === 'room_smart_classroom' ||
    room.id === 'room_ai_robotics' ||
    (room.building?.includes('Tòa Nhà A') ?? false);

  const isBuildingB =
    room.id.startsWith('room_sub_') ||
    (room.building?.includes('Tòa Nhà B') ?? false);

  const isStandaloneFacility = 
    room.floorIndex === 0 && (
      room.type === 'swimming_pool' || 
      room.type === 'canteen' || 
      room.type === 'gym' || 
      room.type === 'theater' || 
      room.type === 'library' || 
      room.type === 'gaming' || 
      room.type === 'toy_room' ||
      room.type === 'sports'
    );

  const isSmartInnovation = 
    room.type === 'smart_classroom' ||
    room.id.includes('smart') ||
    room.name.toLowerCase().includes('smart') ||
    room.name.toLowerCase().includes('innovation') ||
    room.name.toLowerCase().includes('sáng tạo');

  // CRITICAL ARCHITECTURAL INTEGRITY:
  // In full multi-floor campus view:
  // - Building A has 5 floors (0, 1, 2, 3, and top floor 4).
  //   Lower floors (0, 1, 2, 3) must NEVER render exterior roofs, because Floor 4 (the 5th floor sky terrace & labs)
  //   sits directly on top! If Floor 3 rendered roofs, they would poke through the 5th floor slab and cover the terrace chairs.
  // - Building B top floor is floorIndex 3.
  // - Standalone facilities top floor is floorIndex 0.
  // In Solo Isolated Floor mode (isIsolatedFloor === true):
  // - The user isolates a single floor to inspect it alone, so rooms on that floor can show roofs if desired.
  const isTopFloorOrStandalone = isIsolatedFloor
    ? true
    : isBuildingA
      ? room.floorIndex === 4
      : isBuildingB
        ? room.floorIndex === 3
        : (isStandaloneFacility || room.floorIndex >= 3);
  
  if (showRoof && isTopFloorOrStandalone && !isOpenAir) {
    // Keep 5th floor lab roofs contained within their footprint so they never encroach onto the sky terrace or chairs
    const roofOverhang = (isBuildingA && room.floorIndex === 4) ? 0.0 : 0.35;
    const roofW = width + roofOverhang * 2;
    const roofD = depth + roofOverhang * 2;
    const roofH = isSmartInnovation ? 1.4 : 1.6;

    // Overhanging Eaves Fascia Board
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(roofW, 0.2, roofD), archSharedMaterials.roofFascia);
    fascia.position.set(0, wallH + 0.1, 0);
    roomGroup.add(fascia);

    // Hipped Terracotta Roof Body
    // Using 4-sided pyramid cone scaled to rectangular dimensions
    const baseDiag = Math.sqrt(roofW * roofW + roofD * roofD);
    const roofPyramid = new THREE.ConeGeometry(baseDiag * 0.5, roofH, 4);
    const roofMesh = new THREE.Mesh(roofPyramid, archSharedMaterials.terracottaRoof);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.scale.set(roofW / baseDiag * 1.414, 1.0, roofD / baseDiag * 1.414);
    roofMesh.position.set(0, wallH + 0.2 + roofH / 2, 0);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roomGroup.add(roofMesh);

    // Terracotta Ridge Crest Cap along peak
    const ridgeLen = Math.max(1.2, Math.abs(roofW - roofD) * 0.8);
    const ridge = new THREE.Mesh(new THREE.BoxGeometry(roofW > roofD ? ridgeLen : 0.35, 0.2, roofW > roofD ? 0.35 : ridgeLen), archSharedMaterials.roofRidge);
    ridge.position.set(0, wallH + 0.2 + roofH, 0);
    roomGroup.add(ridge);

    // Skylight Glass Strip for Swimming Pool Pavilion
    if (room.type === 'swimming_pool') {
      const skylight = new THREE.Mesh(new THREE.BoxGeometry(roofW * 0.6, 0.25, 2.5), archSharedMaterials.skylightGlass);
      skylight.position.set(0, wallH + 0.2 + roofH * 0.65, 0);
      roomGroup.add(skylight);
    }

    // High-Tech Roof Solar Panels & Skylight for Smart Innovation Classroom
    if (isSmartInnovation) {
      // 4 High-Efficiency Photovoltaic Solar Panels on roof slope
      [-roofW * 0.25, roofW * 0.25].forEach((px) => {
        [-roofD * 0.22, roofD * 0.22].forEach((pz) => {
          const panelFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.6), archSharedMaterials.solarFrame);
          panelFrame.position.set(px, wallH + 0.2 + roofH * 0.55, pz);
          panelFrame.rotation.x = pz > 0 ? 0.45 : -0.45;
          roomGroup.add(panelFrame);

          const panelCell = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 1.4), archSharedMaterials.solarPanel);
          panelCell.position.set(px, wallH + 0.22 + roofH * 0.55, pz);
          panelCell.rotation.x = pz > 0 ? 0.45 : -0.45;
          roomGroup.add(panelCell);
        });
      });

      // Central Smart Innovation Roof Glass Skylight Band
      const smartSkylight = new THREE.Mesh(new THREE.BoxGeometry(roofW * 0.5, 0.22, 1.8), archSharedMaterials.skylightGlass);
      smartSkylight.position.set(0, wallH + 0.2 + roofH * 0.82, 0);
      roomGroup.add(smartSkylight);
    }
  } else if (showCeiling) {
    // Flat ceiling fallback when roof is toggled off
    const ceilingGeom = new THREE.BoxGeometry(width, 0.15, depth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const ceiling = new THREE.Mesh(ceilingGeom, ceilingMat);
    ceiling.position.set(0, wallH + 0.08, 0);
    roomGroup.add(ceiling);
  }

  // Architectural Crown / Border Accent
  const borderGeom = new THREE.BoxGeometry(width + 0.1, 0.08, depth + 0.1);
  const borderMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(themeColor || '#3b82f6'),
    metalness: 0.5,
    roughness: 0.3,
  });
  const border = new THREE.Mesh(borderGeom, borderMat);
  border.position.set(0, 0.04, 0);
  roomGroup.add(border);

  // Position entire room group in world space
  roomGroup.position.set(room.x, 0, room.z);

  return roomGroup;
}
