import * as THREE from 'three';
import { SchoolItem } from '../../types';

// Cache reusable materials and geometries to maximize performance
const materials = {
  metalChrome: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.2, metalness: 0.8 }),
  metalDark: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 }),
  woodDesk: new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.7, metalness: 0.1 }),
  woodDark: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7, metalness: 0.1 }),
  whiteGloss: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 }),
  blackGloss: new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.2 }),
  screenGlow: new THREE.MeshBasicMaterial({ color: 0xe0f2fe }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.7,
    thickness: 0.5,
  }),
  cushionRed: new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.8, metalness: 0.1 }),
  cushionBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.8, metalness: 0.1 }),
  labTop: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 }),
  goldBrass: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 }),
  vietnamRed: new THREE.MeshStandardMaterial({ color: 0xda251d, roughness: 0.5 }),
  vietnamGold: new THREE.MeshBasicMaterial({ color: 0xffff00 }),
  chalkboardGreen: new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 }),
  phoenixRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }),
  graniteStone: new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.4 }),
  gamingRgbCyan: new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
  gamingRgbPurple: new THREE.MeshBasicMaterial({ color: 0xa855f7 }),
  waterPond: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8 }),
  toyYellow: new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 }),
  toyRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }),
  toyBlue: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.4 }),
  toyGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 }),
  poolWater: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.82 }),
  poolDeckTile: new THREE.MeshStandardMaterial({ color: 0xf0f9ff, roughness: 0.3 }),
  stainlessSteel: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.9 }),
  gateIron: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.7 }),
  gateGold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 }),
  roofTile: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5, metalness: 0.1 }),
  canteenFood: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }),
  canteenGreenSalad: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 }),
  badmintonNet: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),
  badmintonTape: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  badmintonPost: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.7 }),
  badmintonRacket: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 }),
  bookNavy: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 }),
  bookCrimson: new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 }),
  bookEmerald: new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.6 }),
  bookGold: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 }),
  bookPaper: new THREE.MeshStandardMaterial({ color: 0xfef9c3, roughness: 0.8 }),
  globeSphere: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }),
  globeBrass: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3, metalness: 0.8 }),
  dongSonBronze: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.35, metalness: 0.85 }),
  techCyanScreen: new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
  techGlowGreen: new THREE.MeshBasicMaterial({ color: 0x10b981 }),
  flowerPetalPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.7 }),
  flowerPetalYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7 }),
  woodOak: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7, metalness: 0.1 }),
  plasticBlack: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.2 }),
  plasticWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.1 }),
  leatherBrown: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6, metalness: 0.15 }),
  leatherNavy: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6, metalness: 0.2 }),
  leatherRuby: new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6, metalness: 0.2 }),
  leatherSapphire: new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6, metalness: 0.2 }),
  techGlowCyan: new THREE.MeshBasicMaterial({ color: 0x06b6d4 }),
  gymIron: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4, metalness: 0.8 }),
  gymRubber: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 }),
  ledRed: new THREE.MeshBasicMaterial({ color: 0xef4444 }),
  ledYellow: new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
};

// Reusable static geometries to eliminate GPU memory allocations & GC thrashing
export const sharedGeoms = {
  // Answer chair
  chairLeg: new THREE.CylinderGeometry(0.02, 0.02, 0.45, 6),
  chairSeat: new THREE.BoxGeometry(0.48, 0.06, 0.46),
  chairBack: new THREE.BoxGeometry(0.46, 0.42, 0.05),
  armPost: new THREE.CylinderGeometry(0.025, 0.025, 0.45, 6),
  tablet: new THREE.BoxGeometry(0.4, 0.025, 0.32),
  cup: new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8),
  book: new THREE.BoxGeometry(0.18, 0.015, 0.22),

  // Massage chair shared geometries (ultra-optimized 60 FPS)
  mBase: new THREE.CylinderGeometry(0.36, 0.42, 0.16, 12),
  mPod: new THREE.BoxGeometry(0.88, 0.65, 0.95),
  mSeat: new THREE.BoxGeometry(0.56, 0.18, 0.52),
  mBack: new THREE.BoxGeometry(0.58, 0.72, 0.18),
  mHead: new THREE.BoxGeometry(0.44, 0.24, 0.12),
  mOttoman: new THREE.BoxGeometry(0.52, 0.38, 0.42),
  mArmPod: new THREE.BoxGeometry(0.16, 0.42, 0.84),
  mArmPad: new THREE.BoxGeometry(0.14, 0.06, 0.72),
  mLightStrip: new THREE.BoxGeometry(0.02, 0.03, 0.78),
  mScreen: new THREE.BoxGeometry(0.12, 0.18, 0.02),

  // Gym Fitness shared geometries
  treadmillBase: new THREE.BoxGeometry(0.9, 0.22, 1.9),
  treadmillBelt: new THREE.BoxGeometry(0.65, 0.02, 1.5),
  treadmillPost: new THREE.BoxGeometry(0.08, 1.15, 0.08),
  treadmillConsole: new THREE.BoxGeometry(0.75, 0.28, 0.2),
  benchPad: new THREE.BoxGeometry(0.42, 0.1, 1.3),
  barbellBar: new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8),
  weightPlate: new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12),
  dumbbellRack: new THREE.BoxGeometry(1.6, 0.8, 0.6),
  scoreboardFrame: new THREE.BoxGeometry(2.6, 1.5, 0.1),

  // Cinema chair
  cinemaBase: new THREE.CylinderGeometry(0.15, 0.2, 0.25, 8),
  cinemaSeat: new THREE.BoxGeometry(0.65, 0.16, 0.62),
  cinemaBack: new THREE.BoxGeometry(0.62, 0.65, 0.14),
  cinemaHead: new THREE.BoxGeometry(0.55, 0.2, 0.1),
  cinemaArm: new THREE.BoxGeometry(0.1, 0.1, 0.5),
  cupHolder: new THREE.CylinderGeometry(0.04, 0.035, 0.06, 8),

  // Desks
  studentDesk: new THREE.BoxGeometry(1.2, 0.75, 0.6),
  teacherDeskTop: new THREE.BoxGeometry(2.8, 0.08, 1.2),
  teacherPed: new THREE.BoxGeometry(0.7, 0.8, 1.1),
  laptopBase: new THREE.BoxGeometry(0.35, 0.015, 0.25),
  laptopScreen: new THREE.BoxGeometry(0.35, 0.22, 0.015),

  // Fan & Green Board
  fanRod: new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6),
  fanMotor: new THREE.CylinderGeometry(0.18, 0.15, 0.15, 10),
  fanBlade: new THREE.BoxGeometry(0.65, 0.015, 0.12),
  boardFrame: new THREE.BoxGeometry(4.8, 2.0, 0.08),
  boardSurface: new THREE.BoxGeometry(4.6, 1.8, 0.02),
  boardMotto: new THREE.BoxGeometry(2.8, 0.22, 0.04),
  boardTray: new THREE.BoxGeometry(4.6, 0.04, 0.12),

  // Outdoor Granite Bench
  benchSeat: new THREE.BoxGeometry(1.4, 0.08, 0.42),
  benchBack: new THREE.BoxGeometry(1.4, 0.35, 0.06),
  benchLeg: new THREE.BoxGeometry(0.12, 0.45, 0.36),
};

// Tag shared objects to protect them from disposal on scene rebuild
Object.values(materials).forEach((m) => {
  m.userData = { isShared: true };
});
Object.values(sharedGeoms).forEach((g) => {
  g.userData = { isShared: true };
});

export function createItemMesh(item: SchoolItem): THREE.Group {
  const group = new THREE.Group();
  group.name = `item_${item.id}`;
  group.userData = { itemId: item.id, itemData: item };

  const customColor = item.color ? new THREE.Color(item.color) : undefined;
  const customMaterial = customColor 
    ? new THREE.MeshStandardMaterial({ color: customColor, roughness: 0.6, metalness: 0.2 })
    : undefined;

  switch (item.type) {
    case 'massage_chair': {
      // Ultra-Deluxe Zero-Gravity 4D Heated Massage Chair (Optimized Shared Geometry)
      // Oriented facing -Z (Front faces -Z towards screen/blackboard!)
      const leatherMat = item.color === '#1e3a8a' 
        ? materials.leatherNavy 
        : item.color === '#be123c' 
          ? materials.leatherRuby 
          : item.color === '#1d4ed8' 
            ? materials.leatherSapphire 
            : (customMaterial || materials.leatherBrown);

      // 1. Swivel Pedestal Base
      const baseMesh = new THREE.Mesh(sharedGeoms.mBase, materials.metalDark);
      baseMesh.position.set(0, 0.08, 0.02);
      group.add(baseMesh);

      // 2. Outer Ergonomic Pod Body Shell
      const podMesh = new THREE.Mesh(sharedGeoms.mPod, materials.plasticBlack);
      podMesh.position.set(0, 0.46, 0.05);
      group.add(podMesh);

      // 3. Ergonomic Plush Seat Cushion
      const seatMesh = new THREE.Mesh(sharedGeoms.mSeat, leatherMat);
      seatMesh.position.set(0, 0.42, -0.06);
      group.add(seatMesh);

      // 4. High-Contoured Reclining Backrest
      const backMesh = new THREE.Mesh(sharedGeoms.mBack, leatherMat);
      backMesh.position.set(0, 0.82, 0.22);
      backMesh.rotation.x = 0.22;
      group.add(backMesh);

      // 5. Headrest Pillow
      const headMesh = new THREE.Mesh(sharedGeoms.mHead, leatherMat);
      headMesh.position.set(0, 1.20, 0.32);
      headMesh.rotation.x = 0.22;
      group.add(headMesh);

      // 6. Extended Calf & Foot Ottoman
      const ottoman = new THREE.Mesh(sharedGeoms.mOttoman, materials.plasticBlack);
      ottoman.position.set(0, 0.24, -0.42);
      ottoman.rotation.x = -0.15;
      group.add(ottoman);

      // 7. Enclosed Armrest Pods (Left & Right)
      [-0.42, 0.42].forEach((ax) => {
        const armPod = new THREE.Mesh(sharedGeoms.mArmPod, materials.plasticBlack);
        armPod.position.set(ax, 0.62, 0.02);
        group.add(armPod);

        const armPad = new THREE.Mesh(sharedGeoms.mArmPad, leatherMat);
        armPad.position.set(ax, 0.84, 0.02);
        group.add(armPad);

        const lightStrip = new THREE.Mesh(sharedGeoms.mLightStrip, materials.techGlowCyan);
        lightStrip.position.set(ax > 0 ? ax + 0.085 : ax - 0.085, 0.65, 0.02);
        group.add(lightStrip);
      });

      // 8. Digital LCD Touchscreen Remote Controller
      const remoteScreen = new THREE.Mesh(sharedGeoms.mScreen, materials.techGlowCyan);
      remoteScreen.position.set(0.44, 0.98, -0.18);
      remoteScreen.rotation.y = -0.3;
      remoteScreen.rotation.x = -0.4;
      group.add(remoteScreen);
      break;
    }

    case 'answer_chair': {
      // Ergonomic student answer chair with integrated swivel tablet desk
      const seatMat = customMaterial || materials.cushionBlue;
      
      // Chair base & legs (reusable geometry, no expensive shadow pass on thin wires)
      const legPositions = [
        [-0.22, 0.22, 0.2],
        [0.22, 0.22, 0.2],
        [-0.22, 0.22, -0.2],
        [0.22, 0.22, -0.2],
      ];
      legPositions.forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(sharedGeoms.chairLeg, materials.metalChrome);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });

      // Seat pan (casts shadow)
      const seat = new THREE.Mesh(sharedGeoms.chairSeat, seatMat);
      seat.position.set(0, 0.45, 0);
      seat.castShadow = true;
      group.add(seat);

      // Backrest
      const back = new THREE.Mesh(sharedGeoms.chairBack, seatMat);
      back.position.set(0, 0.72, -0.2);
      back.rotation.x = -0.1;
      group.add(back);

      // Tablet arm post
      const armPost = new THREE.Mesh(sharedGeoms.armPost, materials.metalChrome);
      armPost.position.set(0.26, 0.62, 0.05);
      armPost.rotation.z = -0.15;
      group.add(armPost);

      // Tablet desk surface
      const tablet = new THREE.Mesh(sharedGeoms.tablet, materials.woodDesk);
      tablet.position.set(0.12, 0.78, 0.16);
      tablet.rotation.y = -0.12;
      group.add(tablet);

      // Pencil / cup groove on tablet
      const cup = new THREE.Mesh(sharedGeoms.cup, materials.metalDark);
      cup.position.set(0.26, 0.8, 0.24);
      group.add(cup);

      // Student Notebook detail
      const book = new THREE.Mesh(sharedGeoms.book, materials.whiteGloss);
      book.position.set(0.08, 0.8, 0.14);
      group.add(book);
      break;
    }

    case 'cinema_chair': {
      // Luxury cinema rocker seat with plush cushions, folding armrests & cup holder
      const plushMat = customMaterial || materials.cushionRed;

      // Base pedestal
      const base = new THREE.Mesh(sharedGeoms.cinemaBase, materials.metalDark);
      base.position.set(0, 0.12, 0);
      group.add(base);

      // Seat cushion (casts shadow)
      const seat = new THREE.Mesh(sharedGeoms.cinemaSeat, plushMat);
      seat.position.set(0, 0.36, 0.02);
      seat.castShadow = true;
      group.add(seat);

      // High backrest with headrest
      const back = new THREE.Mesh(sharedGeoms.cinemaBack, plushMat);
      back.position.set(0, 0.72, -0.24);
      back.rotation.x = -0.18;
      group.add(back);

      // Headrest pillow
      const head = new THREE.Mesh(sharedGeoms.cinemaHead, plushMat);
      head.position.set(0, 1.05, -0.32);
      group.add(head);

      // Armrests (left & right) with cup holders
      [-0.36, 0.36].forEach((ax) => {
        const arm = new THREE.Mesh(sharedGeoms.cinemaArm, materials.metalDark);
        arm.position.set(ax, 0.55, 0.05);
        group.add(arm);

        const cupHolder = new THREE.Mesh(sharedGeoms.cupHolder, materials.metalChrome);
        cupHolder.position.set(ax, 0.61, 0.22);
        group.add(cupHolder);
      });
      break;
    }

    case 'film_screen': {
      // Sleek Wall-Mounted 4K Cinema Theater Screen (Completely flush interior design, NEVER pokes outside!)
      const sWidth = item.scale[0] || 12;
      const sHeight = item.scale[1] || 3.5;
      
      // Outer acoustic velvet masking frame (flat 0.08m thin, sits completely inside the wall)
      const frameGeom = new THREE.BoxGeometry(sWidth, sHeight, 0.08);
      const frame = new THREE.Mesh(frameGeom, materials.blackGloss);
      frame.position.set(0, 0, 0);
      group.add(frame);

      // Gold trim perimeter bezel
      const goldTrimGeom = new THREE.BoxGeometry(sWidth + 0.1, sHeight + 0.1, 0.04);
      const goldTrim = new THREE.Mesh(goldTrimGeom, materials.goldBrass);
      goldTrim.position.set(0, 0, -0.02);
      group.add(goldTrim);

      // 4K Cinema Projection Canvas (pure white 16:9 canvas facing into room toward +Z)
      const screenGeom = new THREE.PlaneGeometry(sWidth - 0.4, sHeight - 0.3);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const screen = new THREE.Mesh(screenGeom, screenMat);
      screen.position.set(0, 0, 0.042);
      group.add(screen);

      // Cinema Left & Right Acoustic Line-Array Speakers (Inside theater)
      [-sWidth / 2 - 0.4, sWidth / 2 + 0.4].forEach((sx) => {
        const spkGeom = new THREE.BoxGeometry(0.35, sHeight * 0.8, 0.25);
        const speaker = new THREE.Mesh(spkGeom, materials.metalDark);
        speaker.position.set(sx, 0, 0.1);
        group.add(speaker);
      });
      break;
    }

    case 'treadmill': {
      // Electronic treadmill with inclined running belt and console
      const base = new THREE.Mesh(sharedGeoms.treadmillBase, materials.plasticBlack);
      base.position.set(0, 0.11, 0);
      group.add(base);

      const belt = new THREE.Mesh(sharedGeoms.treadmillBelt, materials.gymRubber);
      belt.position.set(0, 0.22, -0.05);
      group.add(belt);

      // Upright handlebars
      [-0.42, 0.42].forEach((px) => {
        const post = new THREE.Mesh(sharedGeoms.treadmillPost, materials.metalChrome);
        post.position.set(px, 0.65, -0.65);
        group.add(post);
      });

      const consoleMesh = new THREE.Mesh(sharedGeoms.treadmillConsole, materials.plasticBlack);
      consoleMesh.position.set(0, 1.25, -0.65);
      consoleMesh.rotation.x = -0.35;
      group.add(consoleMesh);

      const display = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.16), materials.techGlowCyan);
      display.position.set(0, 1.27, -0.64);
      display.rotation.x = -0.35;
      group.add(display);
      break;
    }

    case 'gym_weight_bench': {
      // Olympic flat weight bench with barbell and rack
      const pad = new THREE.Mesh(sharedGeoms.benchPad, materials.leatherNavy);
      pad.position.set(0, 0.45, 0);
      group.add(pad);

      // Bench frame & upright rack posts
      const frameMat = materials.gymIron;
      [-0.4, 0.4].forEach((rx) => {
        const upright = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), frameMat);
        upright.position.set(rx, 0.55, -0.55);
        group.add(upright);
      });

      // Chrome Olympic Barbell
      const bar = new THREE.Mesh(sharedGeoms.barbellBar, materials.metalChrome);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 1.05, -0.55);
      group.add(bar);

      // Weight plates on ends
      [-0.72, -0.62, 0.62, 0.72].forEach((wx) => {
        const plate = new THREE.Mesh(sharedGeoms.weightPlate, materials.gymIron);
        plate.rotation.z = Math.PI / 2;
        plate.position.set(wx, 1.05, -0.55);
        group.add(plate);
      });
      break;
    }

    case 'gym_dumbbells': {
      // Multi-tier commercial dumbbell rack
      const rack = new THREE.Mesh(sharedGeoms.dumbbellRack, materials.gymIron);
      rack.position.set(0, 0.4, 0);
      group.add(rack);

      // Row of chrome dumbbells on rack
      [-0.6, -0.3, 0, 0.3, 0.6].forEach((dx) => {
        const dbBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8), materials.metalChrome);
        dbBar.position.set(dx, 0.85, 0);
        dbBar.rotation.x = Math.PI / 2;
        group.add(dbBar);

        [-0.1, 0.1].forEach((dz) => {
          const dbW = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), materials.gymRubber);
          dbW.position.set(dx, 0.85, dz);
          dbW.rotation.x = Math.PI / 2;
          group.add(dbW);
        });
      });
      break;
    }

    case 'gym_scoreboard': {
      // Electronic gym multisport LED digital scoreboard
      const frame = new THREE.Mesh(sharedGeoms.scoreboardFrame, materials.plasticBlack);
      frame.position.set(0, 0, 0);
      group.add(frame);

      // HOME & GUEST score displays
      const homeLED = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), materials.ledRed);
      homeLED.position.set(-0.6, 0.15, 0.052);
      group.add(homeLED);

      const guestLED = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), materials.ledYellow);
      guestLED.position.set(0.6, 0.15, 0.052);
      group.add(guestLED);
      break;
    }

    case 'stage_podium': {
      // Theater stage riser platform with wooden lectern
      const pWidth = item.scale[0] || 10;
      const pDepth = item.scale[2] || 3;
      const platformGeom = new THREE.BoxGeometry(pWidth, 0.4, pDepth);
      const platMat = new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.8 });
      const platform = new THREE.Mesh(platformGeom, platMat);
      platform.position.set(0, 0.2, 0);
      platform.receiveShadow = true;
      group.add(platform);

      // Stage edge lighting line
      const edgeGeom = new THREE.BoxGeometry(pWidth, 0.05, 0.05);
      const edgeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const edge = new THREE.Mesh(edgeGeom, edgeMat);
      edge.position.set(0, 0.41, pDepth / 2 - 0.05);
      group.add(edge);

      // Speaker lectern in center
      const lecternGeom = new THREE.BoxGeometry(0.8, 1.1, 0.6);
      const lectern = new THREE.Mesh(lecternGeom, materials.woodDark);
      lectern.position.set(0, 0.95, 0);
      lectern.castShadow = true;
      group.add(lectern);

      // Lectern mic
      const micGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
      const mic = new THREE.Mesh(micGeom, materials.metalChrome);
      mic.position.set(0.1, 1.6, 0.1);
      mic.rotation.x = 0.4;
      group.add(mic);
      break;
    }

    case 'speaker_tower': {
      // Dolby Cinema Surround Audio Stack
      const spkGeom = new THREE.BoxGeometry(0.7, 2.2, 0.7);
      const spk = new THREE.Mesh(spkGeom, materials.metalDark);
      spk.position.set(0, 1.1, 0);
      spk.castShadow = true;
      group.add(spk);

      // Dual subwoofers
      [0.6, 1.2, 1.8].forEach((sy) => {
        const coneGeom = new THREE.CylinderGeometry(0.22, 0.15, 0.05, 16);
        const cone = new THREE.Mesh(coneGeom, materials.blackGloss);
        cone.rotation.x = Math.PI / 2;
        cone.position.set(0, sy, 0.36);
        group.add(cone);
      });
      break;
    }

    case 'projector_rig': {
      // Ceiling hanging laser projector
      const rodGeom = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
      const rod = new THREE.Mesh(rodGeom, materials.metalDark);
      rod.position.set(0, 0.4, 0);
      group.add(rod);

      const projGeom = new THREE.BoxGeometry(0.8, 0.3, 0.7);
      const proj = new THREE.Mesh(projGeom, materials.whiteGloss);
      proj.position.set(0, 0, 0);
      group.add(proj);

      const lensGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.1, 16);
      const lens = new THREE.Mesh(lensGeom, materials.screenGlow);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(0, 0, -0.4);
      group.add(lens);
      break;
    }

    case 'lab_bench': {
      // Chemistry discovery island with sinks, gas taps & chemical glassware
      const benchGeom = new THREE.BoxGeometry(3.6, 0.9, 1.4);
      const benchBase = new THREE.Mesh(benchGeom, materials.labTop);
      benchBase.position.set(0, 0.45, 0);
      benchBase.castShadow = true;
      group.add(benchBase);

      // Epoxy countertop top lip
      const topGeom = new THREE.BoxGeometry(3.8, 0.08, 1.5);
      const benchTop = new THREE.Mesh(topGeom, new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.1, metalness: 0.5 }));
      benchTop.position.set(0, 0.94, 0);
      group.add(benchTop);

      // Central lab sink
      const sinkGeom = new THREE.BoxGeometry(0.7, 0.3, 0.6);
      const sink = new THREE.Mesh(sinkGeom, materials.metalChrome);
      sink.position.set(0, 0.8, 0);
      group.add(sink);

      // Gooseneck faucet
      const faucetGeom = new THREE.TorusGeometry(0.12, 0.02, 8, 16, Math.PI);
      const faucet = new THREE.Mesh(faucetGeom, materials.goldBrass);
      faucet.position.set(0, 1.15, -0.15);
      faucet.rotation.z = Math.PI;
      group.add(faucet);

      // Glass Flasks & Beakers with colored liquid
      const colors = [0xef4444, 0x10b981, 0x3b82f6, 0xa855f7];
      [-1.2, -0.6, 0.7, 1.3].forEach((fx, idx) => {
        const flaskGeom = new THREE.ConeGeometry(0.09, 0.18, 12);
        const flaskMat = new THREE.MeshPhysicalMaterial({
          color: colors[idx % colors.length],
          transparent: true,
          opacity: 0.85,
          roughness: 0.1,
          transmission: 0.6,
        });
        const flask = new THREE.Mesh(flaskGeom, flaskMat);
        flask.position.set(fx, 1.07, 0.3);
        group.add(flask);
      });
      break;
    }

    case 'fume_hood': {
      // Chemical safety fume hood
      const hoodGeom = new THREE.BoxGeometry(2.2, 2.4, 1.2);
      const hood = new THREE.Mesh(hoodGeom, materials.whiteGloss);
      hood.position.set(0, 1.2, 0);
      hood.castShadow = true;
      group.add(hood);

      // Glass sliding sash window
      const sashGeom = new THREE.BoxGeometry(1.9, 1.1, 0.05);
      const sash = new THREE.Mesh(sashGeom, materials.glass);
      sash.position.set(0, 1.2, 0.58);
      group.add(sash);
      break;
    }

    case 'teacher_desk': {
      // Professor smart desk with laptop and drawer pedestal
      const deskTop = new THREE.Mesh(sharedGeoms.teacherDeskTop, materials.woodDesk);
      deskTop.position.set(0, 0.85, 0);
      deskTop.castShadow = true;
      group.add(deskTop);

      // Legs / pedestals
      [-1.0, 1.0].forEach((px) => {
        const ped = new THREE.Mesh(sharedGeoms.teacherPed, materials.metalDark);
        ped.position.set(px, 0.4, 0);
        group.add(ped);
      });

      // Laptop on desk
      const laptopBase = new THREE.Mesh(sharedGeoms.laptopBase, materials.metalChrome);
      laptopBase.position.set(0, 0.9, 0);
      group.add(laptopBase);

      const laptopScreen = new THREE.Mesh(sharedGeoms.laptopScreen, materials.blackGloss);
      laptopScreen.position.set(0, 1.01, -0.11);
      laptopScreen.rotation.x = -0.2;
      group.add(laptopScreen);
      break;
    }

    case 'student_desk': {
      const desk = new THREE.Mesh(sharedGeoms.studentDesk, materials.woodDesk);
      desk.position.set(0, 0.375, 0);
      desk.castShadow = true;
      group.add(desk);
      break;
    }

    case 'smartboard':
    case 'blackboard': {
      // Large Wall-mounted Smartboard / Blackboard
      const bWidth = item.scale[0] || 5.5;
      const bHeight = item.scale[1] || 2.2;
      const boardGeom = new THREE.BoxGeometry(bWidth, bHeight, 0.08);
      const boardMat = item.type === 'smartboard'
        ? new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
        : new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
      const board = new THREE.Mesh(boardGeom, boardMat);
      board.position.set(0, 0, 0);
      group.add(board);

      // Silver frame
      const bFrameGeom = new THREE.BoxGeometry(bWidth + 0.2, bHeight + 0.2, 0.06);
      const bFrame = new THREE.Mesh(bFrameGeom, materials.metalChrome);
      bFrame.position.set(0, 0, -0.02);
      group.add(bFrame);

      // Chalk/stylus tray
      const trayGeom = new THREE.BoxGeometry(bWidth, 0.04, 0.15);
      const tray = new THREE.Mesh(trayGeom, materials.metalChrome);
      tray.position.set(0, -bHeight / 2 - 0.02, 0.06);
      group.add(tray);
      break;
    }

    case 'basketball_hoop': {
      // Regulation gymnasium basketball hoop & backboard
      const postGeom = new THREE.BoxGeometry(0.2, 3.4, 0.2);
      const post = new THREE.Mesh(postGeom, materials.metalDark);
      post.position.set(0, 1.7, -0.6);
      group.add(post);

      // Acrylic backboard
      const bbGeom = new THREE.BoxGeometry(2.0, 1.3, 0.04);
      const bb = new THREE.Mesh(bbGeom, materials.glass);
      bb.position.set(0, 2.7, 0);
      group.add(bb);

      // Target outline box
      const targetGeom = new THREE.BoxGeometry(0.7, 0.55, 0.05);
      const target = new THREE.Mesh(targetGeom, new THREE.MeshBasicMaterial({ color: 0xea580c, wireframe: true }));
      target.position.set(0, 2.6, 0.01);
      group.add(target);

      // Orange metal rim
      const rimGeom = new THREE.TorusGeometry(0.25, 0.02, 8, 20);
      const rim = new THREE.Mesh(rimGeom, new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.4 }));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 2.4, 0.32);
      group.add(rim);
      break;
    }

    case 'gym_bleacher': {
      // 4-tier spectator bleachers
      const bWidth = item.scale[0] || 8;
      for (let t = 0; t < 4; t++) {
        const stepGeom = new THREE.BoxGeometry(bWidth, 0.4, 0.6);
        const step = new THREE.Mesh(stepGeom, materials.metalChrome);
        step.position.set(0, 0.2 + t * 0.4, t * 0.6);
        step.castShadow = true;
        group.add(step);
      }
      break;
    }

    case 'bookshelf': {
      // Tall library bookstack with colorful book block rows (consolidated for 60 FPS)
      const sWidth = item.scale[0] || 4.2;
      const sHeight = item.scale[1] || 2.6;
      const frameGeom = new THREE.BoxGeometry(sWidth, sHeight, 0.7);
      const frame = new THREE.Mesh(frameGeom, materials.woodDark);
      frame.position.set(0, sHeight / 2, 0);
      frame.castShadow = true;
      group.add(frame);

      // 4 consolidated shelf book tiers
      const bookColors = [materials.cushionRed, materials.cushionBlue, materials.chalkboardGreen, materials.woodDesk];
      for (let row = 0; row < 4; row++) {
        const by = 0.35 + row * 0.58;
        const rowGeom = new THREE.BoxGeometry(sWidth * 0.9, 0.42, 0.5);
        const rowMesh = new THREE.Mesh(rowGeom, bookColors[row % bookColors.length]);
        rowMesh.position.set(0, by, 0.05);
        group.add(rowMesh);
      }
      break;
    }

    case 'locker_bank': {
      // School hallway locker bank
      const lWidth = item.scale[0] || 6;
      const lockerGeom = new THREE.BoxGeometry(lWidth, 2.1, 0.8);
      const lockerMat = customMaterial || new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.5 });
      const locker = new THREE.Mesh(lockerGeom, lockerMat);
      locker.position.set(0, 1.05, 0);
      locker.castShadow = true;
      group.add(locker);

      // Vertical door divisions
      const numDoors = 6;
      for (let d = 0; d < numDoors; d++) {
        const dx = -lWidth / 2 + (d + 0.5) * (lWidth / numDoors);
        const handleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
        const handle = new THREE.Mesh(handleGeom, materials.metalChrome);
        handle.position.set(dx + 0.3, 1.1, 0.42);
        group.add(handle);
      }
      break;
    }

    case 'piano': {
      // Concert grand piano
      const bodyGeom = new THREE.BoxGeometry(2.0, 0.5, 2.2);
      const pianoBody = new THREE.Mesh(bodyGeom, materials.blackGloss);
      pianoBody.position.set(0, 0.8, 0);
      pianoBody.castShadow = true;
      group.add(pianoBody);

      // Keyboard with ivory keys
      const keysGeom = new THREE.BoxGeometry(1.6, 0.05, 0.3);
      const keys = new THREE.Mesh(keysGeom, materials.whiteGloss);
      keys.position.set(0, 0.85, 1.15);
      group.add(keys);

      // Piano 3 legs
      const pLegGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.75, 8);
      [
        [-0.8, 0.375, -0.8],
        [0.8, 0.375, -0.8],
        [0, 0.375, 0.9],
      ].forEach(([lx, ly, lz]) => {
        const leg = new THREE.Mesh(pLegGeom, materials.blackGloss);
        leg.position.set(lx, ly, lz);
        group.add(leg);
      });
      break;
    }

    case 'easel': {
      // Art easel holding canvas
      const eGeom = new THREE.ConeGeometry(0.5, 1.8, 3);
      const easel = new THREE.Mesh(eGeom, materials.woodDesk);
      easel.position.set(0, 0.9, 0);
      group.add(easel);

      // Canvas with art
      const cGeom = new THREE.BoxGeometry(0.8, 1.0, 0.04);
      const cMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.8 });
      const canvas = new THREE.Mesh(cGeom, cMat);
      canvas.position.set(0, 1.05, 0.2);
      canvas.rotation.x = -0.15;
      group.add(canvas);
      break;
    }

    case 'telescope': {
      // High-power astronomy telescope on tripod
      const tLegGeom = new THREE.CylinderGeometry(0.02, 0.02, 1.3, 8);
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(tLegGeom, materials.metalChrome);
        leg.position.set(Math.cos(angle) * 0.35, 0.65, Math.sin(angle) * 0.35);
        leg.rotation.z = -Math.cos(angle) * 0.3;
        leg.rotation.x = Math.sin(angle) * 0.3;
        group.add(leg);
      }

      // Optical Tube
      const tubeGeom = new THREE.CylinderGeometry(0.09, 0.12, 1.4, 16);
      const tube = new THREE.Mesh(tubeGeom, materials.whiteGloss);
      tube.position.set(0, 1.5, 0);
      tube.rotation.x = -0.7; // pointed up towards night sky
      group.add(tube);
      break;
    }

    case 'plant': {
      // Modern architectural planter with leafy foliage
      const potGeom = new THREE.CylinderGeometry(0.35, 0.25, 0.7, 16);
      const pot = new THREE.Mesh(potGeom, materials.whiteGloss);
      pot.position.set(0, 0.35, 0);
      pot.castShadow = true;
      group.add(pot);

      const bushGeom = new THREE.DodecahedronGeometry(0.55, 1);
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
      const bush = new THREE.Mesh(bushGeom, bushMat);
      bush.position.set(0, 0.9, 0);
      bush.castShadow = true;
      group.add(bush);
      break;
    }

    case 'wall_clock': {
      const clockGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.06, 24);
      const clock = new THREE.Mesh(clockGeom, materials.whiteGloss);
      clock.rotation.x = Math.PI / 2;
      group.add(clock);

      const rimGeom = new THREE.TorusGeometry(0.3, 0.02, 8, 24);
      const rim = new THREE.Mesh(rimGeom, materials.metalDark);
      group.add(rim);
      break;
    }

    case 'green_board': {
      // Classic Vietnamese school magnetic chalkboard with motto
      const frame = new THREE.Mesh(sharedGeoms.boardFrame, materials.woodDark);
      frame.position.set(0, 1.6, 0);
      group.add(frame);

      // Green board surface
      const board = new THREE.Mesh(sharedGeoms.boardSurface, materials.chalkboardGreen);
      board.position.set(0, 1.6, 0.04);
      group.add(board);

      // Gold Vietnamese Motto Plaque on top: "TIÊN HỌC LỄ - HẬU HỌC VĂN"
      const motto = new THREE.Mesh(sharedGeoms.boardMotto, materials.goldBrass);
      motto.position.set(0, 2.7, 0.04);
      group.add(motto);

      // Chalk tray & chalks
      const tray = new THREE.Mesh(sharedGeoms.boardTray, materials.woodDesk);
      tray.position.set(0, 0.68, 0.06);
      group.add(tray);
      break;
    }

    case 'ceiling_fan': {
      // Classic Vietnamese school 3-blade white ceiling fan
      const rod = new THREE.Mesh(sharedGeoms.fanRod, materials.whiteGloss);
      rod.position.set(0, 3.2, 0);
      group.add(rod);

      const motor = new THREE.Mesh(sharedGeoms.fanMotor, materials.whiteGloss);
      motor.position.set(0, 2.85, 0);
      group.add(motor);

      // 3 Blades (shared geometry)
      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3;
        const blade = new THREE.Mesh(sharedGeoms.fanBlade, materials.whiteGloss);
        blade.position.set(Math.cos(angle) * 0.42, 2.84, Math.sin(angle) * 0.42);
        blade.rotation.y = -angle;
        blade.rotation.x = 0.08;
        group.add(blade);
      }
      break;
    }

    case 'flagpole': {
      // Vietnamese National Flagpole with Red Star Flag
      // Stepped granite base
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.25, 24), materials.graniteStone);
      b1.position.set(0, 0.125, 0);
      group.add(b1);
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.25, 24), materials.graniteStone);
      b2.position.set(0, 0.375, 0);
      group.add(b2);

      // Stainless steel pole (8m)
      const poleGeom = new THREE.CylinderGeometry(0.06, 0.1, 8.5, 16);
      const pole = new THREE.Mesh(poleGeom, materials.metalChrome);
      pole.position.set(0, 4.6, 0);
      pole.castShadow = true;
      group.add(pole);

      // Gold top sphere
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), materials.goldBrass);
      sphere.position.set(0, 8.9, 0);
      group.add(sphere);

      // Red Flag with gentle wave
      const flagGeom = new THREE.PlaneGeometry(1.8, 1.2, 8, 4);
      // add wave vertex displacement
      const pos = flagGeom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        pos.setZ(i, Math.sin(u * 2.5) * 0.08);
      }
      flagGeom.computeVertexNormals();
      const flag = new THREE.Mesh(flagGeom, materials.vietnamRed);
      flag.position.set(0.95, 8.0, 0);
      group.add(flag);

      // Yellow Star on flag
      const starGeom = new THREE.CircleGeometry(0.24, 5);
      const star = new THREE.Mesh(starGeom, materials.vietnamGold);
      star.position.set(0.95, 8.0, 0.02);
      group.add(star);
      break;
    }

    case 'stone_bench': {
      // Classic Vietnamese school granite bench ("Ghế đá")
      const seat = new THREE.Mesh(sharedGeoms.benchSeat, materials.graniteStone);
      seat.position.set(0, 0.45, 0);
      seat.castShadow = true;
      group.add(seat);

      // Backrest
      const back = new THREE.Mesh(sharedGeoms.benchBack, materials.graniteStone);
      back.position.set(0, 0.72, -0.18);
      back.rotation.x = -0.12;
      group.add(back);

      // Legs
      [-0.5, 0.5].forEach((lx) => {
        const leg = new THREE.Mesh(sharedGeoms.benchLeg, materials.graniteStone);
        leg.position.set(lx, 0.225, 0);
        group.add(leg);
      });
      break;
    }

    case 'phoenix_tree': {
      // Vietnamese schoolyard Phoenix tree ("Cây hoa phượng vĩ đỏ")
      // Trunk
      const trunkGeom = new THREE.CylinderGeometry(0.35, 0.5, 4.5, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.set(0, 2.25, 0);
      trunk.castShadow = true;
      group.add(trunk);

      // Canopy layers (green lush leaves)
      const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
      canopy1.position.set(0, 4.8, 0);
      group.add(canopy1);

      const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 }));
      canopy2.position.set(1.2, 5.2, -0.8);
      group.add(canopy2);

      const canopy3 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9, 1), new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 }));
      canopy3.position.set(-1.1, 5.0, 0.9);
      group.add(canopy3);

      // Clusters of vibrant red Phoenix flowers (Hoa phượng đỏ thắm)
      const redFlowerMat = materials.phoenixRed;
      const flowerPositions = [
        [0.8, 5.4, 0.7],
        [-0.9, 5.2, -0.8],
        [0.2, 5.9, 0.3],
        [-1.3, 4.6, 0.6],
        [1.4, 4.8, -0.5],
        [0.5, 4.2, 1.2],
        [-0.4, 4.3, -1.3],
      ];
      flowerPositions.forEach(([fx, fy, fz]) => {
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), redFlowerMat);
        fl.position.set(fx, fy, fz);
        group.add(fl);
      });
      break;
    }

    case 'football_goal': {
      // Steel regulation soccer goal with net
      const w = 4.2;
      const h = 2.2;
      const d = 1.6;
      const pipeMat = materials.whiteGloss;

      // Crossbar & uprights
      const uprightGeom = new THREE.CylinderGeometry(0.06, 0.06, h, 12);
      [-w / 2, w / 2].forEach((x) => {
        const post = new THREE.Mesh(uprightGeom, pipeMat);
        post.position.set(x, h / 2, 0);
        post.castShadow = true;
        group.add(post);
      });

      const crossbarGeom = new THREE.CylinderGeometry(0.06, 0.06, w + 0.12, 12);
      const crossbar = new THREE.Mesh(crossbarGeom, pipeMat);
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, h, 0);
      group.add(crossbar);

      // Ground back support & net
      const netMat = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.65 });
      const netBackGeom = new THREE.PlaneGeometry(w, Math.sqrt(h * h + d * d));
      const netBack = new THREE.Mesh(netBackGeom, netMat);
      netBack.position.set(0, h / 2, -d / 2);
      netBack.rotation.x = Math.atan2(d, h);
      group.add(netBack);
      break;
    }

    case 'fountain_pond': {
      // Ecological garden stone pond with lotus
      const rimGeom = new THREE.CylinderGeometry(2.4, 2.6, 0.45, 24);
      const rim = new THREE.Mesh(rimGeom, materials.graniteStone);
      rim.position.set(0, 0.225, 0);
      group.add(rim);

      const waterGeom = new THREE.CylinderGeometry(2.2, 2.2, 0.4, 24);
      const water = new THREE.Mesh(waterGeom, materials.waterPond);
      water.position.set(0, 0.22, 0);
      group.add(water);

      // Center fountain spout
      const spoutGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.8, 12);
      const spout = new THREE.Mesh(spoutGeom, materials.graniteStone);
      spout.position.set(0, 0.4, 0);
      group.add(spout);
      break;
    }

    case 'gaming_rig': {
      // High-performance student gaming PC workstation
      // Black gaming desk
      const deskGeom = new THREE.BoxGeometry(1.6, 0.06, 0.8);
      const desk = new THREE.Mesh(deskGeom, materials.blackGloss);
      desk.position.set(0, 0.74, 0);
      desk.castShadow = true;
      group.add(desk);

      // Metal Z-legs
      [-0.7, 0.7].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.74, 0.7), materials.metalDark);
        leg.position.set(lx, 0.37, 0);
        group.add(leg);
      });

      // Dual curved gaming monitors
      [-0.38, 0.38].forEach((mx, idx) => {
        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.38, 0.03), materials.screenGlow);
        screen.position.set(mx, 1.12, -0.15);
        screen.rotation.y = idx === 0 ? 0.15 : -0.15;
        group.add(screen);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.02), materials.blackGloss);
        frame.position.set(mx, 1.12, -0.16);
        frame.rotation.y = idx === 0 ? 0.15 : -0.15;
        group.add(frame);
      });

      // RGB Gaming Tower Case
      const towerGeom = new THREE.BoxGeometry(0.24, 0.48, 0.46);
      const tower = new THREE.Mesh(towerGeom, materials.blackGloss);
      tower.position.set(0.65, 0.98, 0.1);
      group.add(tower);

      const rgbStrip = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.4), materials.gamingRgbCyan);
      rgbStrip.position.set(0.65, 0.98, 0.34);
      group.add(rgbStrip);

      // Mechanical RGB keyboard & mouse
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.015, 0.16), materials.gamingRgbPurple);
      kb.position.set(0, 0.78, 0.15);
      group.add(kb);
      break;
    }

    case 'gaming_chair': {
      // Ergonomic bucket racing seat in black and red
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 12), materials.metalDark);
      base.position.set(0, 0.08, 0);
      group.add(base);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), materials.metalChrome);
      shaft.position.set(0, 0.28, 0);
      group.add(shaft);

      // Bucket seat cushion
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.5), customMaterial || materials.cushionRed);
      seat.position.set(0, 0.48, 0);
      group.add(seat);

      // High ergonomic backrest with head pillow
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.78, 0.08), materials.blackGloss);
      back.position.set(0, 0.88, -0.22);
      group.add(back);

      const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.06), customMaterial || materials.cushionRed);
      pillow.position.set(0, 1.18, -0.17);
      group.add(pillow);

      // Adjustable armrests
      [-0.28, 0.28].forEach((ax) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.26), materials.metalDark);
        arm.position.set(ax, 0.65, 0);
        group.add(arm);
      });
      break;
    }

    case 'toy_shelf': {
      // Colorful modular toy shelf with storage bins
      const shelfGeom = new THREE.BoxGeometry(1.8, 1.4, 0.45);
      const shelf = new THREE.Mesh(shelfGeom, materials.toyYellow);
      shelf.position.set(0, 0.7, 0);
      group.add(shelf);

      // Colorful bins
      const binColors = [materials.toyRed, materials.toyBlue, materials.toyGreen];
      [-0.55, 0, 0.55].forEach((bx, idx) => {
        const bin = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.35, 0.42), binColors[idx % 3]);
        bin.position.set(bx, 0.4, 0.02);
        group.add(bin);

        const binTop = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.35, 0.42), binColors[(idx + 1) % 3]);
        binTop.position.set(bx, 0.9, 0.02);
        group.add(binTop);
      });

      // Teddy bear / plush on top
      const bearHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), materials.woodDesk);
      bearHead.position.set(0, 1.56, 0);
      group.add(bearHead);
      break;
    }

    case 'lego_table': {
      // Giant Lego building table with studs and block towers
      const tableGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.08, 24);
      const table = new THREE.Mesh(tableGeom, materials.toyGreen);
      table.position.set(0, 0.58, 0);
      group.add(table);

      // Central pillar
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.58, 12), materials.toyYellow);
      leg.position.set(0, 0.29, 0);
      group.add(leg);

      // Miniature Lego brick castles on table
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), materials.toyRed);
      b1.position.set(0.3, 0.78, 0.2);
      group.add(b1);

      const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.2), materials.toyBlue);
      b2.position.set(-0.25, 0.82, -0.3);
      group.add(b2);

      const b3 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.3), materials.toyYellow);
      b3.position.set(-0.35, 0.72, 0.25);
      group.add(b3);
      break;
    }

    case 'play_block': {
      // Soft foam colorful gym play blocks (pyramid & cubes)
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), materials.toyRed);
      c1.position.set(-0.4, 0.45, 0);
      group.add(c1);

      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.2, 16), materials.toyBlue);
      c2.rotation.z = Math.PI / 2;
      c2.position.set(0.4, 0.35, 0.2);
      group.add(c2);

      const c3 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.8, 4), materials.toyYellow);
      c3.position.set(0.1, 0.4, -0.5);
      group.add(c3);
      break;
    }

    case 'locker_bank':
    case 'locker': {
      // Steel Student/Athlete Locker Unit
      const lockerW = item.scale[0] || 1.8;
      const lockerH = item.scale[1] || 2.0;
      const lockerD = item.scale[2] || 0.6;
      const body = new THREE.Mesh(new THREE.BoxGeometry(lockerW, lockerH, lockerD), materials.metalDark);
      body.position.set(0, lockerH / 2, 0);
      group.add(body);

      // Locker door divisions and vents
      const doorCols = Math.max(2, Math.round(lockerW / 0.4));
      const colStep = (lockerW - 0.1) / doorCols;
      for (let c = 0; c < doorCols; c++) {
        const dx = -(lockerW - 0.1) / 2 + (c + 0.5) * colStep;
        const door = new THREE.Mesh(new THREE.BoxGeometry(colStep * 0.92, lockerH * 0.92, 0.04), materials.cushionBlue);
        door.position.set(dx, lockerH / 2, lockerD / 2 + 0.02);
        group.add(door);

        // Chrome lock handle
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.15, 0.04), materials.metalChrome);
        handle.position.set(dx + colStep * 0.3, lockerH * 0.5, lockerD / 2 + 0.05);
        group.add(handle);
      }
      break;
    }

    case 'school_gate': {
      // Grand Vietnamese School Entrance Gate (Cổng Trường Dream School)
      // 1. Two Main Monumental Pillars (Granite & Yellow Stucco)
      [-4.5, 4.5].forEach((px) => {
        // Base Plinth
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 1.4), materials.graniteStone);
        base.position.set(px, 0.4, 0);
        group.add(base);

        // Main Column Shaft
        const col = new THREE.Mesh(new THREE.BoxGeometry(1.1, 3.8, 1.1), materials.woodDesk);
        col.position.set(px, 2.7, 0);
        group.add(col);

        // Column Capital & Trim
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.3), materials.graniteStone);
        cap.position.set(px, 4.8, 0);
        group.add(cap);

        // Spherical Bronze / Stone Finial
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), materials.gateGold);
        finial.position.set(px, 5.25, 0);
        group.add(finial);
      });

      // 2. Two Side Pedestrian Pillars
      [-7.5, 7.5].forEach((px) => {
        const pCol = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.6, 0.8), materials.graniteStone);
        pCol.position.set(px, 1.8, 0);
        group.add(pCol);

        const pCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 12), materials.gateGold);
        pCap.position.set(px, 3.85, 0);
        group.add(pCap);
      });

      // 3. Grand Arched Header Beam
      const beam = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.9, 0.8), materials.roofTile);
      beam.position.set(0, 4.8, 0);
      group.add(beam);

      // Pitched Tile Eave atop Header Beam
      const eave = new THREE.Mesh(new THREE.ConeGeometry(5.8, 0.6, 4), materials.roofTile);
      eave.rotation.y = Math.PI / 4;
      eave.scale.set(1.6, 1, 0.3);
      eave.position.set(0, 5.5, 0);
      group.add(eave);

      // School Name Board Banner
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.65, 0.1), materials.vietnamRed);
      signBoard.position.set(0, 4.8, 0.42);
      group.add(signBoard);

      // Gold Embellished Banner Trim
      const signBorder = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.75, 0.04), materials.gateGold);
      signBorder.position.set(0, 4.8, 0.4);
      group.add(signBorder);

      // 4. Main Ornamental Iron Gate Wings (Central Opening -4.0 to 4.0)
      [-2.1, 2.1].forEach((gx, idx) => {
        const gateLeaf = new THREE.Group();
        gateLeaf.position.set(gx, 0, 0);

        // Outer iron frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 0.08), materials.gateIron);
        frame.position.set(0, 1.5, 0);
        gateLeaf.add(frame);

        // Decorative vertical iron pickets with gold finials
        for (let i = -1.5; i <= 1.5; i += 0.3) {
          const picket = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.9, 6), materials.gateIron);
          picket.position.set(i, 1.55, 0.05);
          gateLeaf.add(picket);

          const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.12, 6), materials.gateGold);
          tip.position.set(i, 3.05, 0.05);
          gateLeaf.add(tip);
        }

        // Central gold crest rosette
        const rosette = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), materials.gateGold);
        rosette.rotation.x = Math.PI / 2;
        rosette.position.set(0, 1.5, 0.06);
        gateLeaf.add(rosette);

        // Slightly ajar angle for welcoming 3D entrance
        gateLeaf.rotation.y = idx === 0 ? 0.35 : -0.35;
        group.add(gateLeaf);
      });

      // 5. Side Pedestrian Gates (-6.0 and 6.0)
      [-6.0, 6.0].forEach((px) => {
        const sideGate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 0.06), materials.gateIron);
        sideGate.position.set(px, 1.2, 0);
        group.add(sideGate);
      });
      break;
    }

    case 'guardhouse': {
      // Security Guardhouse (Phòng Trực Bảo Vệ Cổng Trường)
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.3, 2.8), materials.graniteStone);
      base.position.set(0, 0.15, 0);
      group.add(base);

      const walls = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.6, 2.6), materials.woodDesk);
      walls.position.set(0, 1.6, 0);
      group.add(walls);

      // Glass viewing window
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.1), materials.glass);
      win.position.set(0, 1.8, 1.32);
      group.add(win);

      // Pitched terracotta roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 0.9, 4), materials.roofTile);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1.3, 1, 1.1);
      roof.position.set(0, 3.35, 0);
      group.add(roof);

      // Red/White automated barrier arm
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.1, 8), materials.toyYellow);
      post.position.set(1.9, 0.55, 0.8);
      group.add(post);

      const barArm = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.12, 0.06), materials.toyRed);
      barArm.position.set(3.5, 0.95, 0.8);
      group.add(barArm);
      break;
    }

    case 'swimming_pool_basin': {
      // Olympic 25m Semi-Olympic Pool with Turquoise Water and Lane Dividers
      const poolW = item.scale[0] || 22;
      const poolD = item.scale[2] || 14;

      // Outer Deck Border (Non-slip coping)
      const deckBorder = new THREE.Mesh(new THREE.BoxGeometry(poolW + 2.4, 0.3, poolD + 2.4), materials.poolDeckTile);
      deckBorder.position.set(0, 0.15, 0);
      group.add(deckBorder);

      // Swimming Pool Water Surface (Gleaming turquoise)
      const water = new THREE.Mesh(new THREE.BoxGeometry(poolW, 0.1, poolD), materials.poolWater);
      water.position.set(0, 0.12, 0);
      group.add(water);

      // 4 Floating Lane Divider Lines (Phao phân làn bơi)
      const laneCount = 4;
      const laneStep = poolD / (laneCount + 1);
      for (let l = 1; l <= laneCount; l++) {
        const lz = -poolD / 2 + l * laneStep;
        const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, poolW * 0.96, 8), materials.toyRed);
        rope.rotation.z = Math.PI / 2;
        rope.position.set(0, 0.18, lz);
        group.add(rope);

        // Buoy Floats along the rope
        for (let bx = -poolW * 0.44; bx <= poolW * 0.44; bx += 1.8) {
          const buoyMat = Math.abs(bx) < 3 ? materials.toyYellow : (bx > 0 ? materials.toyBlue : materials.whiteGloss);
          const buoy = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), buoyMat);
          buoy.position.set(bx, 0.18, lz);
          group.add(buoy);
        }
      }

      // 5 Competition Starting Blocks at Deep End (X = -poolW/2)
      for (let s = 1; s <= 5; s++) {
        const sz = -poolD / 2 + (s - 0.5) * (poolD / 5);
        const blockPost = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), materials.stainlessSteel);
        blockPost.position.set(-poolW / 2 + 0.35, 0.4, sz);
        group.add(blockPost);

        // Angled start step
        const blockStep = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), materials.cushionBlue);
        blockStep.rotation.z = -0.15;
        blockStep.position.set(-poolW / 2 + 0.35, 0.66, sz);
        group.add(blockStep);
      }

      // Stainless Steel Pool Entry Ladders
      [poolD * 0.35, -poolD * 0.35].forEach((lz) => {
        const ladderPost1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), materials.stainlessSteel);
        ladderPost1.position.set(poolW / 2 - 0.2, 0.6, lz - 0.25);
        group.add(ladderPost1);

        const ladderPost2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 8), materials.stainlessSteel);
        ladderPost2.position.set(poolW / 2 - 0.2, 0.6, lz + 0.25);
        group.add(ladderPost2);
      });
      break;
    }

    case 'lifeguard_tower': {
      // Elevated Lifeguard Watch Tower Chair with Lifebuoy
      // 4 Leg Posts
      const legGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6);
      [-0.45, 0.45].forEach((lx) => {
        [-0.45, 0.45].forEach((lz) => {
          const leg = new THREE.Mesh(legGeom, materials.whiteGloss);
          leg.position.set(lx, 1.1, lz);
          group.add(leg);
        });
      });

      // Tower Platform & Steps
      const plat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), materials.whiteGloss);
      plat.position.set(0, 1.8, 0);
      group.add(plat);

      // Elevated High Chair
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.55), materials.toyRed);
      seat.position.set(0, 2.2, 0);
      group.add(seat);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.06), materials.toyRed);
      chairBack.position.set(0, 2.5, -0.25);
      group.add(chairBack);

      // Red Life Ring Buoy (Phao cứu sinh)
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 12, 24), materials.vietnamRed);
      ring.position.set(0.62, 1.5, 0);
      group.add(ring);
      break;
    }

    case 'canteen_counter': {
      // Commercial Stainless Steel School Canteen Buffet Food Service Counter
      const counterLen = item.scale[0] || 8.0;
      // Main Stainless Counter Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(counterLen, 0.95, 1.4), materials.stainlessSteel);
      body.position.set(0, 0.475, 0);
      group.add(body);

      // Front decorative wooden panel
      const woodTrim = new THREE.Mesh(new THREE.BoxGeometry(counterLen - 0.2, 0.6, 0.04), materials.woodDesk);
      woodTrim.position.set(0, 0.45, 0.72);
      group.add(woodTrim);

      // Tray slide rails (Stainless tubing in front)
      const rail = new THREE.Mesh(new THREE.BoxGeometry(counterLen, 0.05, 0.35), materials.metalChrome);
      rail.position.set(0, 0.78, 0.88);
      group.add(rail);

      // Bain-Marie Hot Food Wells (Khay Đồ Ăn Nóng Số Sốt)
      const wellsCount = 5;
      const wellStep = (counterLen - 2.0) / wellsCount;
      const wellFoods = [materials.vietnamGold, materials.canteenFood, materials.canteenGreenSalad, materials.cushionRed, materials.whiteGloss];

      for (let i = 0; i < wellsCount; i++) {
        const wx = -(counterLen - 2.0) / 2 + (i + 0.5) * wellStep;
        // Stainless Tray Rim
        const trayRim = new THREE.Mesh(new THREE.BoxGeometry(wellStep * 0.85, 0.08, 0.75), materials.stainlessSteel);
        trayRim.position.set(wx, 0.98, 0);
        group.add(trayRim);

        // Food surface
        const food = new THREE.Mesh(new THREE.BoxGeometry(wellStep * 0.78, 0.04, 0.68), wellFoods[i % wellFoods.length]);
        food.position.set(wx, 1.01, 0);
        group.add(food);
      }

      // Curved Glass Sneeze Guard (Kính chắn giọt bắn an toàn vệ sinh thực phẩm)
      const glassGuard = new THREE.Mesh(new THREE.BoxGeometry(counterLen, 0.45, 0.04), materials.glass);
      glassGuard.position.set(0, 1.25, 0.65);
      group.add(glassGuard);

      // POS Cash Register / Touch Checkout Machine
      const posBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.35), materials.metalDark);
      posBase.position.set(counterLen / 2 - 0.6, 1.05, 0);
      group.add(posBase);

      const posScreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.28, 0.04), materials.screenGlow);
      posScreen.rotation.x = -0.3;
      posScreen.position.set(counterLen / 2 - 0.6, 1.25, 0.1);
      group.add(posScreen);
      break;
    }

    case 'canteen_table': {
      // School Cafeteria Dining Table with Integrated Benches
      const tableLen = item.scale[0] || 3.2;
      // Table Top (Hardwood / Stainless)
      const tableTop = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.06, 0.95), materials.woodDesk);
      tableTop.position.set(0, 0.75, 0);
      group.add(tableTop);

      // Underframe Legs
      [-tableLen * 0.38, tableLen * 0.38].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 1.8), materials.metalDark);
        leg.position.set(lx, 0.36, 0);
        group.add(leg);
      });

      // Dual Connected Dining Benches (Ghế băng dài học sinh)
      [-0.78, 0.78].forEach((bz) => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(tableLen, 0.05, 0.32), materials.woodDesk);
        bench.position.set(0, 0.45, bz);
        group.add(bench);
      });

      // Tabletop Napkin Holder & Condiment Caddy
      const napkin = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.15), materials.whiteGloss);
      napkin.position.set(0, 0.84, 0);
      group.add(napkin);
      break;
    }

    case 'canteen_tray_shelf': {
      // Stainless Steel Multi-Tier Tray Return Cart
      const cartFrame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.7, 0.75), materials.stainlessSteel);
      cartFrame.position.set(0, 0.85, 0);
      group.add(cartFrame);

      // Tray Shelves
      for (let y = 0.35; y <= 1.5; y += 0.3) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.7), materials.metalChrome);
        shelf.position.set(0, y, 0);
        group.add(shelf);
      }
      break;
    }

    case 'canteen_menu_board': {
      // Large Illuminated Canteen Menu Display
      const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.4, 0.1), materials.metalDark);
      board.position.set(0, 2.2, 0);
      group.add(board);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.2, 0.04), materials.screenGlow);
      screen.position.set(0, 2.2, 0.06);
      group.add(screen);

      const header = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 0.06), materials.vietnamRed);
      header.position.set(0, 2.7, 0.07);
      group.add(header);
      break;
    }

    case 'door': {
      // Architectural Double Door Assembly with Glass Transom and Handles
      const doorW = item.scale[0] || 2.4;
      const doorH = item.scale[1] || 2.4;

      // Outer Frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.12, doorH + 0.1, 0.12), materials.woodDark);
      frame.position.set(0, doorH / 2, 0);
      group.add(frame);

      // Left & Right Doors
      [-doorW * 0.25, doorW * 0.25].forEach((dx) => {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.48, doorH * 0.85, 0.06), materials.woodDesk);
        leaf.position.set(dx, doorH * 0.425, 0);
        group.add(leaf);

        // Glass Vision Panel
        const glassPan = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.28, doorH * 0.45, 0.04), materials.glass);
        glassPan.position.set(dx, doorH * 0.52, 0);
        group.add(glassPan);

        // Kickplate
        const kick = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.46, 0.2, 0.07), materials.stainlessSteel);
        kick.position.set(dx, 0.12, 0);
        group.add(kick);
      });

      // Metal Door Handles
      [-0.12, 0.12].forEach((hx) => {
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28, 6), materials.metalChrome);
        handle.position.set(hx, 1.0, 0.06);
        group.add(handle);
      });
      break;
    }

    case 'window_pane': {
      // Architectural Multi-Lite Window with Trim & Sills
      const winW = item.scale[0] || 2.4;
      const winH = item.scale[1] || 1.6;

      const frame = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.1), materials.woodDark);
      frame.position.set(0, winH / 2, 0);
      group.add(frame);

      const glassPane = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.2, winH - 0.2, 0.04), materials.glass);
      glassPane.position.set(0, winH / 2, 0);
      group.add(glassPane);

      // Window Sill
      const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.2, 0.06, 0.22), materials.graniteStone);
      sill.position.set(0, 0, 0);
      group.add(sill);
      break;
    }

    // ==========================================
    // BADMINTON COURT EQUIPMENT
    // ==========================================
    case 'badminton_net': {
      const netW = item.scale[0] || 6.4;
      const postH = 1.55;

      // Two steel side tension posts
      [-netW / 2, netW / 2].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, postH, 8), materials.badmintonPost);
        post.position.set(px, postH / 2, 0);
        post.castShadow = true;
        group.add(post);

        const postBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.08, 8), materials.badmintonPost);
        postBase.position.set(px, 0.04, 0);
        group.add(postBase);
      });

      // White top band/tape (76mm)
      const topTape = new THREE.Mesh(new THREE.BoxGeometry(netW, 0.08, 0.04), materials.badmintonTape);
      topTape.position.set(0, 1.51, 0);
      group.add(topTape);

      // Mesh netting (760mm deep)
      const netMesh = new THREE.Mesh(new THREE.BoxGeometry(netW, 0.72, 0.02), materials.badmintonNet);
      netMesh.position.set(0, 1.13, 0);
      group.add(netMesh);

      // Bottom tape
      const botTape = new THREE.Mesh(new THREE.BoxGeometry(netW, 0.04, 0.03), materials.badmintonTape);
      botTape.position.set(0, 0.75, 0);
      group.add(botTape);
      break;
    }

    case 'badminton_umpire_chair': {
      const chairH = 2.1;
      // 4 angled ladder legs
      [-0.4, 0.4].forEach((lx) => {
        [-0.45, 0.45].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, chairH, 6), materials.metalChrome);
          leg.position.set(lx, chairH / 2, lz);
          group.add(leg);
        });
      });

      // Climbing rungs
      for (let r = 1; r <= 4; r++) {
        const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), materials.metalChrome);
        rung.rotation.z = Math.PI / 2;
        rung.position.set(0, r * 0.35, 0.45);
        group.add(rung);
      }

      // High seat platform
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.08, 0.65), materials.cushionBlue);
      seat.position.set(0, 1.6, 0);
      group.add(seat);

      // Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.06), materials.cushionBlue);
      back.position.set(0, 1.85, -0.3);
      group.add(back);

      // Write-table for referee scorecard
      const table = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.3), materials.woodDark);
      table.position.set(0, 1.8, 0.35);
      group.add(table);
      break;
    }

    case 'badminton_racket_caddy': {
      // Wheeled equipment cart
      const cartBase = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.6), materials.badmintonPost);
      cartBase.position.set(0, 0.15, 0);
      group.add(cartBase);

      const cartBasket = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.7, 0.56), materials.metalChrome);
      cartBasket.position.set(0, 0.55, 0);
      group.add(cartBasket);

      // Rackets standing inside
      [-0.2, 0, 0.2].forEach((rx, idx) => {
        const racketShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.65, 6), materials.badmintonRacket);
        racketShaft.position.set(rx, 0.8, -0.05);
        racketShaft.rotation.z = (idx - 1) * 0.15;
        group.add(racketShaft);

        const racketHead = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.012, 6, 16), materials.badmintonRacket);
        racketHead.position.set(rx + (idx - 1) * 0.05, 1.2, -0.05);
        group.add(racketHead);
      });

      // Shuttlecock tube
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), materials.glass);
      tube.position.set(0.28, 0.65, 0.15);
      group.add(tube);
      break;
    }

    // ==========================================
    // LIBRARY & MEDIA COMMONS
    // ==========================================
    case 'library_desk': {
      // Main circulation counter
      const deskW = item.scale[0] || 2.8;
      const deskD = item.scale[2] || 1.4;
      const counterTop = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.08, deskD), materials.woodOak);
      counterTop.position.set(0, 0.88, 0);
      counterTop.castShadow = true;
      group.add(counterTop);

      // Front acoustic paneling
      const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.84, 0.08), materials.woodDark);
      frontPanel.position.set(0, 0.42, deskD / 2 - 0.04);
      group.add(frontPanel);

      // Librarian PC workstation
      const pcBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.18), materials.metalChrome);
      pcBase.position.set(-0.5, 0.93, 0);
      group.add(pcBase);

      const pcMonitor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.04), materials.plasticBlack);
      pcMonitor.position.set(-0.5, 1.15, 0);
      group.add(pcMonitor);

      const pcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.32, 0.01), materials.techCyanScreen);
      pcScreen.position.set(-0.5, 1.15, 0.025);
      group.add(pcScreen);

      // Barcode scanner
      const scanner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), materials.plasticBlack);
      scanner.position.set(-0.15, 0.98, 0.15);
      group.add(scanner);

      // Stack of books waiting for check-in
      const bStack = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 0.32), materials.bookCrimson);
      bStack.position.set(0.6, 0.99, 0);
      group.add(bStack);
      break;
    }

    case 'book_stack': {
      // Rich stack of colorful reference books
      const colors = [materials.bookNavy, materials.bookCrimson, materials.bookEmerald, materials.bookGold];
      for (let b = 0; b < 5; b++) {
        const bw = 0.28 + (b % 2) * 0.04;
        const bd = 0.38 + (b % 3) * 0.03;
        const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.05, bd), colors[b % colors.length]);
        bookMesh.position.set(0, 0.025 + b * 0.055, 0);
        bookMesh.rotation.y = (b * 0.18) - 0.2;
        group.add(bookMesh);

        // White paper pages trim
        const pageTrim = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.03, 0.04, bd - 0.03), materials.bookPaper);
        pageTrim.position.set(0, 0.025 + b * 0.055, 0);
        pageTrim.rotation.y = (b * 0.18) - 0.2;
        group.add(pageTrim);
      }
      break;
    }

    case 'globe': {
      // Educational desktop terrestrial globe
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.05, 12), materials.woodOak);
      base.position.set(0, 0.025, 0);
      group.add(base);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), materials.globeBrass);
      stem.position.set(0, 0.16, 0);
      group.add(stem);

      // Semi-meridian arc
      const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 16, Math.PI), materials.globeBrass);
      meridian.position.set(0, 0.42, 0);
      meridian.rotation.z = Math.PI / 8;
      group.add(meridian);

      // Globe sphere with tilted axis
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), materials.globeSphere);
      sphere.position.set(0, 0.42, 0);
      sphere.rotation.z = 0.41; // 23.5 degrees Earth axial tilt
      group.add(sphere);
      break;
    }

    case 'reading_nook': {
      // Cozy wingback reading armchair
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.25, 0.8), materials.cushionBlue);
      seat.position.set(0, 0.35, 0);
      group.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.16), materials.cushionBlue);
      back.position.set(0, 0.82, -0.32);
      group.add(back);

      // Left & right armrests
      [-0.42, 0.42].forEach((ax) => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.35, 0.78), materials.cushionBlue);
        arm.position.set(ax, 0.58, 0);
        group.add(arm);
      });

      // Wooden legs
      [-0.35, 0.35].forEach((lx) => {
        [-0.32, 0.32].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.25, 6), materials.woodOak);
          leg.position.set(lx, 0.125, lz);
          group.add(leg);
        });
      });

      // Standing brass reading floor lamp beside chair
      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.04, 12), materials.globeBrass);
      lampBase.position.set(0.7, 0.02, 0);
      group.add(lampBase);

      const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.45, 8), materials.globeBrass);
      lampPole.position.set(0.7, 0.75, 0);
      group.add(lampPole);

      const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.25, 12, 1, true), materials.bookGold);
      lampShade.position.set(0.7, 1.48, 0);
      group.add(lampShade);
      break;
    }

    case 'study_carrel': {
      // Individual acoustic study booth
      const deskW = item.scale[0] || 1.1;
      const deskD = item.scale[2] || 0.8;
      const surface = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.05, deskD), materials.woodOak);
      surface.position.set(0, 0.76, 0);
      group.add(surface);

      // Back partition
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.7, 0.04), materials.woodDark);
      backWall.position.set(0, 1.05, -deskD / 2 + 0.02);
      group.add(backWall);

      // Side acoustic privacy wings
      [-deskW / 2 + 0.02, deskW / 2 - 0.02].forEach((sx) => {
        const sideWing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, deskD), materials.woodDark);
        sideWing.position.set(sx, 1.05, 0);
        group.add(sideWing);
      });

      // Steel legs
      [-deskW / 2 + 0.1, deskW / 2 - 0.1].forEach((lx) => {
        [-deskD / 2 + 0.1, deskD / 2 - 0.1].forEach((lz) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.74, 6), materials.metalChrome);
          leg.position.set(lx, 0.37, lz);
          group.add(leg);
        });
      });

      // Top shelf with books
      const topShelf = new THREE.Mesh(new THREE.BoxGeometry(deskW - 0.08, 0.03, 0.28), materials.woodOak);
      topShelf.position.set(0, 1.35, -deskD / 2 + 0.15);
      group.add(topShelf);
      break;
    }

    // ==========================================
    // INFORMATICS & WORKSTATION
    // ==========================================
    case 'pc_workstation': {
      // Modern student computer desk
      const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.7), materials.woodOak);
      desk.position.set(0, 0.74, 0);
      group.add(desk);

      // Metal legs
      [-0.52, 0.52].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.72, 0.6), materials.metalChrome);
        leg.position.set(lx, 0.36, 0);
        group.add(leg);
      });

      // LED monitor
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.15), materials.plasticBlack);
      stand.position.set(0, 0.85, -0.15);
      group.add(stand);

      const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.04), materials.plasticBlack);
      monitor.position.set(0, 1.06, -0.15);
      group.add(monitor);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.34, 0.01), materials.techCyanScreen);
      screen.position.set(0, 1.06, -0.125);
      group.add(screen);

      // Keyboard & Mouse
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.14), materials.plasticBlack);
      kb.position.set(0, 0.77, 0.12);
      group.add(kb);

      const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.1), materials.plasticBlack);
      mouse.position.set(0.28, 0.77, 0.12);
      group.add(mouse);

      // CPU tower
      const cpu = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.42), materials.plasticBlack);
      cpu.position.set(0.45, 0.22, 0);
      group.add(cpu);
      break;
    }

    // ==========================================
    // SCIENCE LAB & PHYSICS
    // ==========================================
    case 'physics_bench': {
      // Heavy chemical/physics laboratory table
      const benchW = item.scale[0] || 2.4;
      const top = new THREE.Mesh(new THREE.BoxGeometry(benchW, 0.08, 1.2), materials.labTop);
      top.position.set(0, 0.85, 0);
      group.add(top);

      // Frame & legs
      [-benchW / 2 + 0.15, benchW / 2 - 0.15].forEach((bx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.81, 1.1), materials.metalChrome);
        leg.position.set(bx, 0.405, 0);
        group.add(leg);
      });

      // Optical Laser Rail with Laser diode, lenses and prism
      const rail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.08), materials.metalChrome);
      rail.position.set(0, 0.91, -0.2);
      group.add(rail);

      const laserEmitter = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), materials.plasticBlack);
      laserEmitter.position.set(-0.6, 0.96, -0.2);
      group.add(laserEmitter);

      const opticalPrism = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 3), materials.glass);
      opticalPrism.position.set(0.1, 0.97, -0.2);
      group.add(opticalPrism);

      // Digital Multimeter with probes
      const multimeter = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.24), materials.toyYellow);
      multimeter.position.set(0.7, 0.92, 0.2);
      group.add(multimeter);
      break;
    }

    // ==========================================
    // HISTORY & CULTURE ARTIFACTS
    // ==========================================
    case 'vietnam_relief_map': {
      // 3D Topographical Relief Map of Vietnam
      const frameW = 1.6;
      const frameH = 2.4;

      const frame = new THREE.Mesh(new THREE.BoxGeometry(frameW, frameH, 0.08), materials.gateGold);
      frame.position.set(0, frameH / 2, 0);
      group.add(frame);

      const mapBackdrop = new THREE.Mesh(new THREE.BoxGeometry(frameW - 0.12, frameH - 0.12, 0.02), materials.techCyanScreen);
      mapBackdrop.position.set(0, frameH / 2, 0.035);
      group.add(mapBackdrop);

      // Vietnam S-Shape representation in golden bronze relief
      const sShape = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 1.8, 8), materials.dongSonBronze);
      sShape.position.set(0.05, frameH / 2, 0.06);
      sShape.rotation.z = -0.15;
      group.add(sShape);

      // Display stand legs
      [-0.6, 0.6].forEach((sx) => {
        const standLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.6), materials.woodDark);
        standLeg.position.set(sx, 0.6, -0.15);
        group.add(standLeg);
      });
      break;
    }

    case 'bronze_drum': {
      // Dong Son Bronze Drum (Trống Đồng Đông Sơn) on carved plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), materials.woodDark);
      plinth.position.set(0, 0.25, 0);
      group.add(plinth);

      // Drum base
      const drumBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.22, 16), materials.dongSonBronze);
      drumBase.position.set(0, 0.61, 0);
      group.add(drumBase);

      // Drum waist
      const drumWaist = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.25, 16), materials.dongSonBronze);
      drumWaist.position.set(0, 0.84, 0);
      group.add(drumWaist);

      // Drum top head (Mặt trống đồng khắc hình ngôi sao mặt trời & chim lạc)
      const drumTop = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.48, 0.18, 16), materials.dongSonBronze);
      drumTop.position.set(0, 1.05, 0);
      group.add(drumTop);

      // Golden Solar Star disc center
      const starDisc = new THREE.Mesh(new THREE.CircleGeometry(0.18, 14), materials.gateGold);
      starDisc.rotation.x = -Math.PI / 2;
      starDisc.position.set(0, 1.15, 0);
      group.add(starDisc);
      break;
    }

    // ==========================================
    // SMART INNOVATION CLASSROOM EQUIPMENT
    // ==========================================
    case 'smartboard': {
      // 86-inch 4K Touch Interactive Display on mobile trolley
      const standW = 2.4;
      const baseFeet = new THREE.Mesh(new THREE.BoxGeometry(standW, 0.08, 0.8), materials.metalChrome);
      baseFeet.position.set(0, 0.1, 0);
      group.add(baseFeet);

      // Dual upright columns
      [-standW * 0.35, standW * 0.35].forEach((cx) => {
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.9, 0.08), materials.metalChrome);
        col.position.set(cx, 1.05, 0);
        group.add(col);
      });

      // Display frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.35, 0.08), materials.plasticBlack);
      frame.position.set(0, 1.65, 0);
      group.add(frame);

      // Glowing active interactive touch screen
      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.22, 1.27, 0.01), materials.techCyanScreen);
      screen.position.set(0, 1.65, 0.045);
      group.add(screen);

      // Stylus pen shelf
      const penTray = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.03, 0.08), materials.metalChrome);
      penTray.position.set(0, 0.98, 0.05);
      group.add(penTray);

      // Camera bar on top
      const cam = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.05, 0.05), materials.plasticBlack);
      cam.position.set(0, 2.36, 0);
      group.add(cam);
      break;
    }

    case 'vr_headset_station': {
      // VR Virtual Reality Headset Docking Station
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), materials.woodOak);
      table.position.set(0, 0.85, 0);
      group.add(table);

      // Legs
      [-0.7, 0.7].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.82, 0.7), materials.metalChrome);
        leg.position.set(lx, 0.43, 0);
        group.add(leg);
      });

      // 2 VR Headset Stands
      [-0.4, 0.4].forEach((vx) => {
        const dock = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.22, 12), materials.plasticBlack);
        dock.position.set(vx, 0.99, 0);
        group.add(dock);

        const headset = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.18), materials.plasticBlack);
        headset.position.set(vx, 1.15, 0);
        group.add(headset);

        // Cyan visor glow
        const visorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.02), materials.gamingRgbCyan);
        visorGlow.position.set(vx, 1.15, 0.095);
        group.add(visorGlow);
      });
      break;
    }

    case 'robotics_table': {
      // Competition robotics challenge arena table
      const arenaW = 2.4;
      const arenaD = 1.6;
      const arenaFloor = new THREE.Mesh(new THREE.BoxGeometry(arenaW, 0.06, arenaD), materials.woodOak);
      arenaFloor.position.set(0, 0.8, 0);
      group.add(arenaFloor);

      // Perimeter white bumpers
      const bumperN = new THREE.Mesh(new THREE.BoxGeometry(arenaW, 0.12, 0.04), materials.plasticWhite);
      bumperN.position.set(0, 0.86, -arenaD / 2);
      group.add(bumperN);

      const bumperS = new THREE.Mesh(new THREE.BoxGeometry(arenaW, 0.12, 0.04), materials.plasticWhite);
      bumperS.position.set(0, 0.86, arenaD / 2);
      group.add(bumperS);

      // Robot chassis rover
      const robotBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.38), materials.techGlowGreen);
      robotBody.position.set(0, 0.9, 0);
      group.add(robotBody);

      // Robot wheels
      [-0.19, 0.19].forEach((wx) => {
        [-0.14, 0.14].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), materials.plasticBlack);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.89, wz);
          group.add(wheel);
        });
      });
      break;
    }

    case 'printer_3d': {
      // 3D Printer cube enclosure
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.65), materials.plasticBlack);
      base.position.set(0, 0.86, 0);
      group.add(base);

      // Frame pillars
      [-0.28, 0.28].forEach((px) => {
        [-0.28, 0.28].forEach((pz) => {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.58, 0.04), materials.metalChrome);
          col.position.set(px, 1.21, pz);
          group.add(col);
        });
      });

      // Clear acrylic enclosure
      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.55, 0.6), materials.glass);
      cover.position.set(0, 1.21, 0);
      group.add(cover);

      // Build plate & model prototype
      const bed = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.38), materials.stainlessSteel);
      bed.position.set(0, 1.05, 0);
      group.add(bed);

      const proto = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 8), materials.gamingRgbCyan);
      proto.position.set(0, 1.15, 0);
      group.add(proto);
      break;
    }

    // ==========================================
    // GARDEN & OUTDOOR ENHANCEMENTS
    // ==========================================
    case 'garden_gazebo': {
      // Traditional Garden Pavilion / Vọng Lâu
      const gazeboW = item.scale[0] || 4.2;
      const gazeboD = item.scale[2] || 4.2;
      const gazeboH = 3.6;

      // Stone foundation
      const foundation = new THREE.Mesh(new THREE.BoxGeometry(gazeboW, 0.25, gazeboD), materials.graniteStone);
      foundation.position.set(0, 0.125, 0);
      group.add(foundation);

      // 4 wooden pillars
      const offset = gazeboW * 0.42;
      [-offset, offset].forEach((px) => {
        [-offset, offset].forEach((pz) => {
          const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, gazeboH, 8), materials.woodOak);
          pillar.position.set(px, gazeboH / 2 + 0.25, pz);
          pillar.castShadow = true;
          group.add(pillar);
        });
      });

      // Roof pyramid
      const roofGeom = new THREE.ConeGeometry(gazeboW * 0.78, 1.6, 4);
      const roof = new THREE.Mesh(roofGeom, materials.roofTile);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, gazeboH + 0.25 + 0.8, 0);
      group.add(roof);
      break;
    }

    case 'flower_planter': {
      // Raised masonry flowerbed with blossoms
      const pw = item.scale[0] || 2.4;
      const pd = item.scale[2] || 1.2;

      const brickBorder = new THREE.Mesh(new THREE.BoxGeometry(pw, 0.35, pd), materials.graniteStone);
      brickBorder.position.set(0, 0.175, 0);
      group.add(brickBorder);

      const soil = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.2, 0.36, pd - 0.2), materials.woodDark);
      soil.position.set(0, 0.18, 0);
      group.add(soil);

      // Colorful flowers (pink & yellow blooms)
      [-pw * 0.3, 0, pw * 0.3].forEach((fx, idx) => {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 6), materials.canteenGreenSalad);
        stem.position.set(fx, 0.48, 0);
        group.add(stem);

        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), idx % 2 === 0 ? materials.flowerPetalPink : materials.flowerPetalYellow);
        petal.position.set(fx, 0.62, 0);
        group.add(petal);
      });
      break;
    }

    default: {
      // Generic stylish block
      const defGeom = new THREE.BoxGeometry(
        item.scale[0] || 1,
        item.scale[1] || 1,
        item.scale[2] || 1
      );
      const defMesh = new THREE.Mesh(defGeom, customMaterial || materials.metalChrome);
      defMesh.position.set(0, (item.scale[1] || 1) / 2, 0);
      defMesh.castShadow = true;
      group.add(defMesh);
      break;
    }
  }

  // Set position and rotation
  group.position.set(item.x, item.y, item.z);
  group.rotation.y = item.rotationY;

  return group;
}
