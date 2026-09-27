import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SchoolData, SchoolItem, Room, ViewMode, TourWaypoint, FocusRequest } from '../types';
import { createItemMesh } from './3d/MeshFactory';
import { createRoomMesh } from './3d/RoomFactory';
import { TOUR_WAYPOINTS } from '../data/defaultSchool';
import { 
  Eye, 
  Compass, 
  Layers, 
  Maximize2, 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  Sparkles,
  MapPin,
  Move,
  Zap,
  Gauge,
  Plus,
  Minus,
  Rabbit,
  FastForward,
  Wind
} from 'lucide-react';

// Memory cleanup helper to prevent GPU VRAM memory leaks during floor/room updates
function disposeHierarchy(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry && !mesh.geometry.userData?.isShared) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if (!m.userData?.isShared) m.dispose();
          });
        } else if (!mesh.material.userData?.isShared) {
          mesh.material.dispose();
        }
      }
    }
  });
}

interface ThreeCanvasProps {
  schoolData: SchoolData;
  activeFloorIndex: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string | null) => void;
  explodedOffset: number; // 0 to 1
  isolateFloor: boolean;
  showCeiling: boolean;
  showRoof?: boolean;
  wallOpacity: number;
  onItemMove?: (itemId: string, dx: number, dz: number) => void;
  hideTelemetry?: boolean;
  onToggleHideTelemetry?: () => void;
  moveSpeedMultiplier?: number;
  onMoveSpeedChange?: (speed: number) => void;
  transitionSpeed?: 'instant' | 'fast' | 'normal' | 'cinematic';
  onTransitionSpeedChange?: (speed: 'instant' | 'fast' | 'normal' | 'cinematic') => void;
  focusRequest?: FocusRequest | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  schoolData,
  activeFloorIndex,
  viewMode,
  onViewModeChange,
  selectedItemId,
  onSelectItem,
  selectedRoomId,
  onSelectRoom,
  explodedOffset,
  isolateFloor,
  showCeiling,
  showRoof = true,
  wallOpacity,
  onItemMove,
  hideTelemetry = false,
  onToggleHideTelemetry,
  moveSpeedMultiplier = 1.8,
  onMoveSpeedChange,
  transitionSpeed = 'fast',
  onTransitionSpeedChange,
  focusRequest,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Orbit state
  const orbitState = useRef({
    isMouseDown: false,
    prevMouseX: 0,
    prevMouseY: 0,
    spherical: new THREE.Spherical(95, Math.PI / 3.4, Math.PI / 4.2),
    target: new THREE.Vector3(0, 5, 0),
  });

  // First-person walk state
  const walkState = useRef({
    keys: { 
      w: false, 
      a: false, 
      s: false, 
      d: false, 
      ArrowUp: false, 
      ArrowDown: false, 
      ArrowLeft: false, 
      ArrowRight: false,
      Shift: false,
    },
    yaw: -Math.PI / 2,
    pitch: 0,
    position: new THREE.Vector3(-9.5, 1.65, 0), // Default starting position in front of theater
    moveSpeed: 0.18,
    isLooking: false,
    prevLookX: 0,
    prevLookY: 0,
  });

  // Camera smooth transition state
  const transitionState = useRef({
    isTransitioning: false,
    desiredTarget: new THREE.Vector3(0, 5, 0),
    desiredRadius: 95,
    desiredPhi: Math.PI / 3.4,
    desiredWalkPos: null as THREE.Vector3 | null,
  });

  const schoolDataRef = useRef(schoolData);
  schoolDataRef.current = schoolData;
  const transitionSpeedRef = useRef(transitionSpeed);
  transitionSpeedRef.current = transitionSpeed;

  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Cinematic Tour state
  const [tourIndex, setTourIndex] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);
  const tourProgressRef = useRef(0);
  const currentWaypoint = TOUR_WAYPOINTS[tourIndex] || TOUR_WAYPOINTS[0];

  // Selection outline indicator
  const highlightMeshRef = useRef<THREE.BoxHelper | null>(null);
  const roomHighlightMeshRef = useRef<THREE.BoxHelper | null>(null);

  // Minimap position state for HUD
  const [playerMapCoords, setPlayerMapCoords] = useState<{ x: number; z: number; yaw: number }>({ x: 0, z: 0, yaw: 0 });
  const lastRadarUpdateRef = useRef(0);

  // Performance Mode (60 FPS Turbo vs HD Shadows)
  const [highPerformanceMode, setHighPerformanceMode] = useState(true);

  // Dynamic Performance / Graphics Tuning
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    if (highPerformanceMode) {
      renderer.setPixelRatio(1.0);
      renderer.shadowMap.enabled = false;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }, [highPerformanceMode]);

  // Update FPS position when active floor changes
  useEffect(() => {
    const floor = schoolData.floors[activeFloorIndex] || schoolData.floors[0];
    const floorElev = floor?.elevation ?? 0;
    walkState.current.position.y = floorElev + 1.65;
  }, [activeFloorIndex, schoolData.floors]);

  // Jump to specific tour waypoint
  const goToWaypoint = useCallback((index: number) => {
    const wp = TOUR_WAYPOINTS[index];
    if (!wp) return;
    setTourIndex(index);
    tourProgressRef.current = 0;

    if (cameraRef.current) {
      cameraRef.current.position.set(wp.position[0], wp.position[1], wp.position[2]);
      cameraRef.current.lookAt(wp.target[0], wp.target[1], wp.target[2]);
      
      // Update walk state yaw/pitch to match waypoint target
      const dir = new THREE.Vector3(wp.target[0] - wp.position[0], 0, wp.target[2] - wp.position[2]).normalize();
      walkState.current.yaw = Math.atan2(dir.x, -dir.z);
      walkState.current.position.set(wp.position[0], wp.position[1], wp.position[2]);
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer (starts in high performance mode)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(1.0);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Architectural dusk deep blue-gray
    scene.fog = new THREE.FogExp2(0x090d16, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 800);
    camera.position.set(55, 45, 75);
    camera.lookAt(0, 5, 0);
    cameraRef.current = camera;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Main Architectural Sunlight (optimized 1024 shadow map)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.45);
    sunLight.position.set(60, 80, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 250;
    sunLight.shadow.camera.left = -90;
    sunLight.shadow.camera.right = 90;
    sunLight.shadow.camera.top = 90;
    sunLight.shadow.camera.bottom = -90;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Fill Soft Blue Sky Light
    const skyLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    skyLight.position.set(-50, 60, -60);
    scene.add(skyLight);

    // Ground Landscape / Campus Plaza Grass (Expanded for full campus with pool, canteen, sports & garden)
    const groundGeom = new THREE.PlaneGeometry(360, 320);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // lush campus lawn green
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Architectural Paving Plaza surrounding school (Vietnamese Schoolyard Terracotta / Paving)
    const plazaGeom = new THREE.PlaneGeometry(240, 210);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412, // authentic Vietnamese school terracotta red brick courtyard
      roughness: 0.7,
      metalness: 0.1,
    });
    const plaza = new THREE.Mesh(plazaGeom, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = -0.02;
    plaza.receiveShadow = true;
    scene.add(plaza);

    // Granite Walkway to Rear Facilities (Swimming Pool & Canteen)
    const rearPathGeom = new THREE.PlaneGeometry(16, 55);
    const rearPathMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      roughness: 0.5,
    });
    const rearPath = new THREE.Mesh(rearPathGeom, rearPathMat);
    rearPath.rotation.x = -Math.PI / 2;
    rearPath.position.set(0, -0.018, -65);
    rearPath.receiveShadow = true;
    scene.add(rearPath);

    // Lateral Walkway between Pool and Canteen
    const latPathGeom = new THREE.PlaneGeometry(70, 10);
    const latPath = new THREE.Mesh(latPathGeom, rearPathMat);
    latPath.rotation.x = -Math.PI / 2;
    latPath.position.set(0, -0.017, -76);
    latPath.receiveShadow = true;
    scene.add(latPath);

    // Central circular flagpole plaza
    const centerCircleGeom = new THREE.CircleGeometry(12, 32);
    const centerCircleMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc, // granite ceremonial courtyard
      roughness: 0.5,
    });
    const centerCircle = new THREE.Mesh(centerCircleGeom, centerCircleMat);
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(0, -0.015, 0);
    centerCircle.receiveShadow = true;
    scene.add(centerCircle);

    // Grid Floor Guide
    const grid = new THREE.GridHelper(220, 70, 0x38bdf8, 0x334155);
    grid.position.y = 0.001;
    scene.add(grid);

    // Selection highlight helper
    const highlightBox = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)), 0x38bdf8);
    highlightBox.visible = false;
    scene.add(highlightBox);
    highlightMeshRef.current = highlightBox;

    // Room Selection highlight helper (amber outline, instant 0ms response)
    const roomHighlightBox = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1)), 0xf59e0b);
    roomHighlightBox.visible = false;
    scene.add(roomHighlightBox);
    roomHighlightMeshRef.current = roomHighlightBox;

    // Handle Window Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
    };
  }, []);

  // Rebuild 3D Model whenever schoolData, floors, rooms, or items change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove existing school groups with full GPU VRAM memory disposal
    const oldBuilding = scene.getObjectByName('school_building_root');
    if (oldBuilding) {
      disposeHierarchy(oldBuilding);
      scene.remove(oldBuilding);
    }

    const rootGroup = new THREE.Group();
    rootGroup.name = 'school_building_root';

    // Find the highest floor index that contains Building A rooms across the entire school
    const allBldgARooms = schoolData.rooms.filter(
      (r) =>
        r.id.startsWith('room_cr_f') ||
        r.id.startsWith('room_class_') ||
        r.id === 'room_smart_classroom' ||
        r.id === 'room_ai_robotics' ||
        (r.building?.includes('Tòa Nhà A') ?? false)
    );
    const allBldgAFloors = Array.from(new Set(allBldgARooms.map((r) => r.floorIndex)));
    const topBldgAFloor = allBldgAFloors.length > 0 ? Math.max(...allBldgAFloors) : 3;

    // Loop through each floor
    schoolData.floors.forEach((floor, fIdx) => {
      // If floor isolation is active and this isn't the active floor, skip or hide
      if (isolateFloor && fIdx !== activeFloorIndex) {
        return;
      }

      const floorGroup = new THREE.Group();
      floorGroup.name = `floor_group_${fIdx}`;

      // Calculate vertical offset (taking exploded view slider into account)
      const explodedDist = explodedOffset * (fIdx * 14); // 0 to 14m separation per floor
      // When isolating floor (Solo Floor view), ground it at y = 0 for perfect unobstructed inspection
      const worldElevation = isolateFloor ? 0 : floor.elevation + explodedDist;
      floorGroup.position.y = worldElevation;

      // Add a stylish architectural foundation pedestal slab under the isolated solo floor
      if (isolateFloor) {
        const soloSlabGeom = new THREE.BoxGeometry(160, 0.35, 140);
        const soloSlabMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          roughness: 0.7,
          metalness: 0.1,
        });
        const soloSlab = new THREE.Mesh(soloSlabGeom, soloSlabMat);
        soloSlab.position.set(0, -0.2, 0);
        soloSlab.receiveShadow = true;
        floorGroup.add(soloSlab);
      }

      // Add Floor Level Indicator Sign in 3D
      const labelPoleGeom = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 8);
      const labelPole = new THREE.Mesh(labelPoleGeom, new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
      labelPole.position.set(-21, 1.75, 0);
      floorGroup.add(labelPole);

      // Floor Rooms
      const floorRooms = schoolData.rooms.filter((r) => r.floorIndex === fIdx);
      floorRooms.forEach((room) => {
        const roomMesh = createRoomMesh(room, false, showCeiling, wallOpacity, showRoof, isolateFloor);
        floorGroup.add(roomMesh);
      });

      // Identify Building A rooms on this floor
      const bldgARoomsOnThisFloor = floorRooms.filter(
        (r) =>
          r.id.startsWith('room_cr_f') ||
          r.id.startsWith('room_class_') ||
          r.id === 'room_smart_classroom' ||
          r.id === 'room_ai_robotics' ||
          (r.building?.includes('Tòa Nhà A') ?? false)
      );

      // Special Architectural Support for Building A 5th Floor (Penthouse Innovation Center) if fIdx === 4
      if (fIdx === 4 && bldgARoomsOnThisFloor.length > 0) {
        // 1. Reinforced Structural Foundation Slab of Building A (Tầng 5)
        // Perfectly sized to span Building A's full 36m x 33m footprint
        const bldgASlabGeom = new THREE.BoxGeometry(36, 0.35, 33);
        const bldgASlabMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b, // Engineered dark structural concrete
          roughness: 0.7,
          metalness: 0.1,
        });
        const bldgASlab = new THREE.Mesh(bldgASlabGeom, bldgASlabMat);
        bldgASlab.position.set(-52, -0.18, -23);
        bldgASlab.receiveShadow = true;
        floorGroup.add(bldgASlab);

        // Architectural White Cornice Trim around 5th floor perimeter
        const corniceGeom = new THREE.BoxGeometry(36.4, 0.18, 33.4);
        const corniceMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.3,
        });
        const cornice = new THREE.Mesh(corniceGeom, corniceMat);
        cornice.position.set(-52, -0.18, -23);
        floorGroup.add(cornice);

        // 2. Safety Railing / Balustrade around the 5th floor sky terrace perimeter
        const balustradeMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.45,
          roughness: 0.1,
        });
        const railHandMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.2,
          metalness: 0.8,
        });

        const halfW = 18;
        const halfD = 16.5;
        const railH = 1.05;

        // North terrace rail
        const nRail = new THREE.Mesh(new THREE.BoxGeometry(36, 0.08, 0.08), railHandMat);
        nRail.position.set(-52, railH, -23 - halfD);
        floorGroup.add(nRail);
        const nGlass = new THREE.Mesh(new THREE.BoxGeometry(35.6, railH * 0.8, 0.04), balustradeMat);
        nGlass.position.set(-52, railH * 0.45, -23 - halfD);
        floorGroup.add(nGlass);

        // South terrace rail
        const sRail = new THREE.Mesh(new THREE.BoxGeometry(36, 0.08, 0.08), railHandMat);
        sRail.position.set(-52, railH, -23 + halfD);
        floorGroup.add(sRail);
        const sGlass = new THREE.Mesh(new THREE.BoxGeometry(35.6, railH * 0.8, 0.04), balustradeMat);
        sGlass.position.set(-52, railH * 0.45, -23 + halfD);
        floorGroup.add(sGlass);

        // West terrace rail
        const wRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 33), railHandMat);
        wRail.position.set(-52 - halfW, railH, -23);
        floorGroup.add(wRail);
        const wGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, railH * 0.8, 32.6), balustradeMat);
        wGlass.position.set(-52 - halfW, railH * 0.45, -23);
        floorGroup.add(wGlass);

        // East terrace rail
        const eRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 33), railHandMat);
        eRail.position.set(-52 + halfW, railH, -23);
        floorGroup.add(eRail);
        const eGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, railH * 0.8, 32.6), balustradeMat);
        eGlass.position.set(-52 + halfW, railH * 0.45, -23);
        floorGroup.add(eGlass);

        // 3. Central Connecting Sky-Bridge Hallway between West Wing and East Wing
        const bridgeFloor = new THREE.Mesh(
          new THREE.BoxGeometry(4.0, 0.15, 27),
          new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 })
        );
        bridgeFloor.position.set(-52, 0.05, -23);
        floorGroup.add(bridgeFloor);
      }

      // Floor Items
      const floorItems = schoolData.items.filter((item) => item.floorIndex === fIdx);
      floorItems.forEach((item) => {
        const itemMesh = createItemMesh(item);
        floorGroup.add(itemMesh);
      });

      rootGroup.add(floorGroup);
    });

    // 4 Grand Structural Corner Pillars for Building A (anchoring ground up to 5th floor)
    if (!isolateFloor) {
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a, // Building A matching school yellow
        roughness: 0.6,
        metalness: 0.1,
      });
      const pillarBaseMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, // Granite gray foundation base
        roughness: 0.4,
        metalness: 0.3,
      });

      const corners = [
        { x: -69.2, z: -38.8 },
        { x: -34.8, z: -38.8 },
        { x: -69.2, z: -7.2 },
        { x: -34.8, z: -7.2 },
      ];

      const topFloorObj = schoolData.floors[topBldgAFloor];
      const pillarHeight = topFloorObj ? topFloorObj.elevation : topBldgAFloor * 3.8;
      if (pillarHeight > 0) {
        corners.forEach((c) => {
          // Base stone foot
          const foot = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.4), pillarBaseMat);
          foot.position.set(c.x, 0.3, c.z);
          rootGroup.add(foot);

          // Vertical reinforced column
          const column = new THREE.Mesh(new THREE.BoxGeometry(1.0, pillarHeight - 0.6, 1.0), pillarMat);
          column.position.set(c.x, 0.6 + (pillarHeight - 0.6) / 2, c.z);
          rootGroup.add(column);

          // Capital header under top floor slab
          const cap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.4), pillarBaseMat);
          cap.position.set(c.x, pillarHeight - 0.15, c.z);
          rootGroup.add(cap);
        });
      }
    }

    scene.add(rootGroup);
  }, [schoolData, activeFloorIndex, isolateFloor, explodedOffset, showCeiling, showRoof, wallOpacity]);

  // Update Selected Item Highlight
  useEffect(() => {
    const scene = sceneRef.current;
    const highlightBox = highlightMeshRef.current;
    if (!scene || !highlightBox) return;

    if (!selectedItemId) {
      highlightBox.visible = false;
      return;
    }

    const itemMesh = scene.getObjectByName(`item_${selectedItemId}`);
    if (itemMesh) {
      highlightBox.setFromObject(itemMesh);
      highlightBox.visible = true;
    } else {
      highlightBox.visible = false;
    }
  }, [selectedItemId, schoolData.items]);

  // Update Selected Room Highlight (Instant, 0ms lag, no scene rebuild)
  useEffect(() => {
    const scene = sceneRef.current;
    const roomBox = roomHighlightMeshRef.current;
    if (!scene || !roomBox) return;

    if (!selectedRoomId) {
      roomBox.visible = false;
      return;
    }

    const roomMesh = scene.getObjectByName(`room_${selectedRoomId}`);
    if (roomMesh) {
      roomBox.setFromObject(roomMesh);
      roomBox.visible = true;
    } else {
      roomBox.visible = false;
    }
  }, [selectedRoomId]);

  // Main Render & Animation Loop
  useEffect(() => {
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;

      if (camera && renderer && scene) {
        if (viewMode === 'orbit' || viewMode === 'exploded') {
          // Orbit Camera Movement & Smooth Location Transition
          if (transitionState.current.isTransitioning && transitionSpeed !== 'instant') {
            const lerpFactor = transitionSpeed === 'fast' ? 0.22 : transitionSpeed === 'normal' ? 0.10 : 0.04;
            orbitState.current.target.lerp(transitionState.current.desiredTarget, lerpFactor);
            orbitState.current.spherical.radius += (transitionState.current.desiredRadius - orbitState.current.spherical.radius) * lerpFactor;
            orbitState.current.spherical.phi += (transitionState.current.desiredPhi - orbitState.current.spherical.phi) * lerpFactor;
            if (orbitState.current.target.distanceTo(transitionState.current.desiredTarget) < 0.05) {
              transitionState.current.isTransitioning = false;
            }
          }

          const s = orbitState.current.spherical;
          camera.position.setFromSpherical(s).add(orbitState.current.target);
          camera.lookAt(orbitState.current.target);
        } else if (viewMode === 'first_person') {
          // Smooth jump fly-to transition in Walkthrough mode
          if (transitionState.current.desiredWalkPos && transitionSpeed !== 'instant') {
            const lerpFactor = transitionSpeed === 'fast' ? 0.25 : transitionSpeed === 'normal' ? 0.12 : 0.05;
            walkState.current.position.lerp(transitionState.current.desiredWalkPos, lerpFactor);
            if (walkState.current.position.distanceTo(transitionState.current.desiredWalkPos) < 0.1) {
              transitionState.current.desiredWalkPos = null;
            }
          }

          // First-Person Walkthrough Movement with Speed Multiplier & Shift Sprint Boost
          const { keys, yaw, pitch, position } = walkState.current;
          const isShiftSprint = (keys as any).Shift || (keys as any).ShiftLeft || (keys as any).ShiftRight;
          const effectiveSpeed = 0.18 * (moveSpeedMultiplier || 1.8) * (isShiftSprint ? 1.65 : 1.0);

          // Forward & Sideways directional vectors based on yaw
          const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)).normalize();
          const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

          let moveX = 0;
          let moveZ = 0;

          if (keys.w || keys.ArrowUp) {
            moveX += forward.x * effectiveSpeed;
            moveZ += forward.z * effectiveSpeed;
          }
          if (keys.s || keys.ArrowDown) {
            moveX -= forward.x * effectiveSpeed;
            moveZ -= forward.z * effectiveSpeed;
          }
          if (keys.a || keys.ArrowLeft) {
            moveX -= right.x * effectiveSpeed;
            moveZ -= right.z * effectiveSpeed;
          }
          if (keys.d || keys.ArrowRight) {
            moveX += right.x * effectiveSpeed;
            moveZ += right.z * effectiveSpeed;
          }

          // Cancel auto transition when user actively presses movement keys
          if (moveX !== 0 || moveZ !== 0) {
            transitionState.current.desiredWalkPos = null;
          }

          // Apply movement with bounds clamping to full campus perimeter (covering swimming pool, canteen, sports courts & gardens)
          position.x = Math.max(-110, Math.min(110, position.x + moveX));
          position.z = Math.max(-110, Math.min(95, position.z + moveZ));

          // Set active floor elevation
          const activeFloor = schoolData.floors[activeFloorIndex] || schoolData.floors[0];
          position.y = (activeFloor?.elevation ?? 0) + 1.65; // Eye height

          camera.position.copy(position);

          // Calculate look target from yaw & pitch
          const lookTarget = new THREE.Vector3(
            position.x - Math.sin(yaw) * Math.cos(pitch),
            position.y + Math.sin(pitch),
            position.z - Math.cos(yaw) * Math.cos(pitch)
          );
          camera.lookAt(lookTarget);

          // Update radar state throttled to ~7 times/sec to eliminate React render lag
          if (now - lastRadarUpdateRef.current > 150) {
            lastRadarUpdateRef.current = now;
            setPlayerMapCoords({ x: position.x, z: position.z, yaw });
          }
        } else if (viewMode === 'tour') {
          // Automated Tour Interpolation with Speed Multiplier
          if (isTourPlaying) {
            tourProgressRef.current += delta * 0.15 * (moveSpeedMultiplier || 1.8);
            if (tourProgressRef.current >= 1) {
              tourProgressRef.current = 0;
              setTourIndex((prev) => (prev + 1) % TOUR_WAYPOINTS.length);
            }
          }

          const wp = TOUR_WAYPOINTS[tourIndex];
          if (wp) {
            const nextWp = TOUR_WAYPOINTS[(tourIndex + 1) % TOUR_WAYPOINTS.length];
            const t = isTourPlaying ? tourProgressRef.current : 0;

            const curPos = new THREE.Vector3(...wp.position);
            const nextPos = new THREE.Vector3(...nextWp.position);
            const curTarget = new THREE.Vector3(...wp.target);
            const nextTarget = new THREE.Vector3(...nextWp.target);

            camera.position.lerpVectors(curPos, nextPos, t);
            const targetVec = new THREE.Vector3().lerpVectors(curTarget, nextTarget, t);
            camera.lookAt(targetVec);
          }
        }

        renderer.render(scene, camera);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [viewMode, isTourPlaying, tourIndex, activeFloorIndex, schoolData.floors, moveSpeedMultiplier, transitionSpeed]);

  // Keyboard Event Listeners for First-Person Walk & Quick Speed Tuning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key in walkState.current.keys) {
        (walkState.current.keys as any)[e.key] = true;
      }
      if (e.key === 'Shift') {
        (walkState.current.keys as any).Shift = true;
      }
      // Speed keyboard shortcuts (1: 1.0x, 2: 1.8x, 3: 2.8x, 4: 4.5x)
      if (e.key === '1') onMoveSpeedChange?.(1.0);
      if (e.key === '2') onMoveSpeedChange?.(1.8);
      if (e.key === '3') onMoveSpeedChange?.(2.8);
      if (e.key === '4') onMoveSpeedChange?.(4.5);
      // Speed stepping: + or = increases, - or _ decreases
      if (e.key === '=' || e.key === '+') {
        onMoveSpeedChange?.(Math.min(5.0, +((moveSpeedMultiplier || 1.8) + 0.3).toFixed(1)));
      }
      if (e.key === '-' || e.key === '_') {
        onMoveSpeedChange?.(Math.max(0.5, +((moveSpeedMultiplier || 1.8) - 0.3).toFixed(1)));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key in walkState.current.keys) {
        (walkState.current.keys as any)[e.key] = false;
      }
      if (e.key === 'Shift') {
        (walkState.current.keys as any).Shift = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [moveSpeedMultiplier, onMoveSpeedChange]);

  // Smooth camera refocus when an explicit focusRequest is triggered (e.g. facility jump button or focus action)
  useEffect(() => {
    if (!focusRequest) return;
    const { type, id } = focusRequest;
    const currentSchoolData = schoolDataRef.current;
    const currentTransitionSpeed = transitionSpeedRef.current || 'fast';

    if (type === 'room') {
      const room = currentSchoolData.rooms.find((r) => r.id === id);
      if (room) {
        const floorY = room.floorIndex * 4.2;
        const targetRadius = Math.max(22, Math.max(room.width, room.depth) * 1.5);
        const targetPhi = Math.PI / 4.2;
        const targetTarget = new THREE.Vector3(room.x, floorY + 2.0, room.z);

        // Precise player placement inside or at the doorway looking into the room
        let walkTargetX = room.x;
        let walkTargetZ = room.z;
        let walkYaw = 0; // facing North into the facility

        if (room.id === 'room_swimming_pool') {
          walkTargetX = -24;
          walkTargetZ = -74; // Safely inside the aquatic center, standing on the poolside observation deck
          walkYaw = 0;
        } else if (room.id === 'room_canteen') {
          walkTargetX = 24;
          walkTargetZ = -74; // Safely inside the dining hall facing the buffet and tables
          walkYaw = 0;
        } else if (room.id === 'room_badminton_court') {
          walkTargetX = 54;
          walkTargetZ = -14;
          walkYaw = -Math.PI / 4;
        } else if (room.id === 'room_football_pitch') {
          walkTargetX = -54;
          walkTargetZ = -14;
          walkYaw = Math.PI / 4;
        } else {
          walkTargetZ = room.z + Math.min(room.depth / 2 - 2, 2);
        }

        const targetWalk = new THREE.Vector3(walkTargetX, floorY + 1.65, walkTargetZ);
        walkState.current.yaw = walkYaw;
        walkState.current.pitch = -0.05;

        if (currentTransitionSpeed === 'instant') {
          orbitState.current.target.copy(targetTarget);
          orbitState.current.spherical.radius = targetRadius;
          orbitState.current.spherical.phi = targetPhi;
          walkState.current.position.copy(targetWalk);
          transitionState.current.desiredWalkPos = null;
          transitionState.current.isTransitioning = false;
        } else {
          transitionState.current.desiredTarget.copy(targetTarget);
          transitionState.current.desiredRadius = targetRadius;
          transitionState.current.desiredPhi = targetPhi;
          transitionState.current.desiredWalkPos = targetWalk;
          transitionState.current.isTransitioning = true;
        }
      }
    } else if (type === 'item') {
      const item = currentSchoolData.items.find((i) => i.id === id);
      if (item) {
        const floorY = item.floorIndex * 4.2;
        const targetTarget = new THREE.Vector3(item.x, floorY + item.y + 0.8, item.z);
        const targetRadius = 12;

        if (currentTransitionSpeed === 'instant') {
          orbitState.current.target.copy(targetTarget);
          orbitState.current.spherical.radius = targetRadius;
          transitionState.current.isTransitioning = false;
        } else {
          transitionState.current.desiredTarget.copy(targetTarget);
          transitionState.current.desiredRadius = targetRadius;
          transitionState.current.isTransitioning = true;
        }
      }
    }
  }, [focusRequest]);

  // Mouse & Touch Controls Handling
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const isPrimary = e.button === 0;
    if (!isPrimary) return;

    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    hasMovedRef.current = false;

    if (viewMode === 'orbit' || viewMode === 'exploded') {
      orbitState.current.isMouseDown = true;
      orbitState.current.prevMouseX = e.clientX;
      orbitState.current.prevMouseY = e.clientY;
    } else if (viewMode === 'first_person') {
      walkState.current.isLooking = true;
      walkState.current.prevLookX = e.clientX;
      walkState.current.prevLookY = e.clientY;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const dist = Math.hypot(e.clientX - pointerDownPos.current.x, e.clientY - pointerDownPos.current.y);
    if (dist > 5) {
      hasMovedRef.current = true;
    }

    if (viewMode === 'orbit' || viewMode === 'exploded') {
      if (!orbitState.current.isMouseDown) return;
      const dx = e.clientX - orbitState.current.prevMouseX;
      const dy = e.clientY - orbitState.current.prevMouseY;
      orbitState.current.prevMouseX = e.clientX;
      orbitState.current.prevMouseY = e.clientY;

      const s = orbitState.current.spherical;
      s.theta -= dx * 0.006;
      s.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, s.phi - dy * 0.006));
    } else if (viewMode === 'first_person') {
      if (!walkState.current.isLooking) return;
      const dx = e.clientX - walkState.current.prevLookX;
      const dy = e.clientY - walkState.current.prevLookY;
      walkState.current.prevLookX = e.clientX;
      walkState.current.prevLookY = e.clientY;

      walkState.current.yaw -= dx * 0.004;
      walkState.current.pitch = Math.max(-0.8, Math.min(0.8, walkState.current.pitch - dy * 0.004));
    }
  };

  const handlePointerUp = () => {
    orbitState.current.isMouseDown = false;
    walkState.current.isLooking = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (viewMode === 'orbit' || viewMode === 'exploded') {
      const s = orbitState.current.spherical;
      s.radius = Math.max(10, Math.min(120, s.radius + e.deltaY * 0.05));
    }
  };

  // Raycasting Click to Select Item or Room
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If user was dragging to orbit or look around, ignore this click event
    if (hasMovedRef.current) return;

    const container = containerRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

    const root = scene.getObjectByName('school_building_root');
    if (!root) return;

    const intersects = raycaster.intersectObjects(root.children, true);

    // In first-person walkthrough mode: clicking never resets or teleports the player!
    if (viewMode === 'first_person') {
      if (intersects.length > 0) {
        let curr: THREE.Object3D | null = intersects[0].object;
        while (curr && curr !== root) {
          if (curr.userData?.itemId) {
            onSelectItem(curr.userData.itemId);
            return;
          }
          curr = curr.parent;
        }
      }
      return;
    }

    // In orbit or exploded mode:
    if (intersects.length > 0) {
      let curr: THREE.Object3D | null = intersects[0].object;
      while (curr && curr !== root) {
        if (curr.userData?.itemId) {
          onSelectItem(curr.userData.itemId);
          onSelectRoom(null);
          return;
        }
        if (curr.userData?.roomId) {
          onSelectRoom(curr.userData.roomId);
          onSelectItem(null);
          return;
        }
        curr = curr.parent;
      }
    } else {
      // Clicked on empty space
      onSelectItem(null);
      onSelectRoom(null);
    }
  };

  // Quick reset camera position
  const resetCamera = () => {
    orbitState.current.spherical.set(95, Math.PI / 3.4, Math.PI / 4.2);
    orbitState.current.target.set(0, 5, 0);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas Container */}
      <div
        id="canvas-3d-viewport"
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Top Floating View Controls Header */}
      {!hideTelemetry && (
        <div 
          className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-2xl">
            <button
              id="view-orbit-btn"
              type="button"
              onClick={() => onViewModeChange('orbit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'orbit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              3D Orbit
            </button>

            <button
              id="view-walk-btn"
              type="button"
              onClick={() => onViewModeChange('first_person')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'first_person'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Walk Tour (FPS)
            </button>

            <button
              id="view-tour-btn"
              type="button"
              onClick={() => onViewModeChange('tour')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'tour'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Curated 3D Tour
            </button>

            <button
              id="view-exploded-btn"
              type="button"
              onClick={() => onViewModeChange('exploded')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'exploded'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Exploded Floors
            </button>
          </div>

          <button
            id="camera-reset-btn"
            type="button"
            onClick={resetCamera}
            title="Reset Camera View"
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick floating restore button when telemetry is hidden */}
      {hideTelemetry && onToggleHideTelemetry && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleHideTelemetry();
          }}
          className="absolute top-4 right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-slate-200 hover:text-white text-xs font-semibold shadow-2xl transition-all hover:scale-105"
          title="Hiện lại toàn bộ giao diện & thông số (Phím H)"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Hiện Giao Diện (H)</span>
        </button>
      )}

      {/* First-Person Walkthrough HUD Overlay */}
      {!hideTelemetry && viewMode === 'first_person' && (
        <div 
          className="absolute bottom-6 left-6 z-20 flex flex-col gap-2.5"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl text-xs text-slate-300 w-80">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                Tham Quan Walkthrough (FPS)
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono font-bold">
                  ⚡ {moveSpeedMultiplier || 1.8}x
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  Tầng {activeFloorIndex + 1}
                </span>
              </div>
            </div>

            {/* Quick Speed Selection in Walkthrough HUD */}
            <div className="mb-2.5 bg-slate-800/80 rounded-xl p-2 border border-slate-700/60">
              <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-300 font-semibold px-0.5">
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tốc độ di chuyển:</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {moveSpeedMultiplier === 1.0 ? '1.0x (Đi bộ)' : moveSpeedMultiplier === 1.8 ? '1.8x (Hợp lý)' : moveSpeedMultiplier === 2.8 ? '2.8x (Nhanh)' : moveSpeedMultiplier === 4.5 ? '4.5x (Siêu tốc)' : `${moveSpeedMultiplier}x`}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1 mb-1.5">
                {[
                  { val: 1.0, label: '1x Đi bộ' },
                  { val: 1.8, label: '1.8x Hợp lý', recommended: true },
                  { val: 2.8, label: '2.8x Nhanh' },
                  { val: 4.5, label: '4.5x Siêu tốc' },
                ].map((s) => {
                  const isActive = Math.abs((moveSpeedMultiplier || 1.8) - s.val) < 0.15;
                  return (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => onMoveSpeedChange?.(s.val)}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold ring-1 ring-emerald-300'
                          : s.recommended
                          ? 'bg-slate-700/90 text-emerald-300 hover:bg-slate-700 border border-emerald-500/40'
                          : 'bg-slate-700/70 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[9px] text-slate-400 px-0.5 pt-1 border-t border-slate-700/50">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onMoveSpeedChange?.(Math.max(0.5, +((moveSpeedMultiplier || 1.8) - 0.3).toFixed(1)))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    title="Giảm tốc độ (-)"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSpeedChange?.(Math.min(5.0, +((moveSpeedMultiplier || 1.8) + 0.3).toFixed(1)))}
                    className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                    title="Tăng tốc độ (+)"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-[10px] text-slate-300 font-mono">Tùy chỉnh</span>
                </div>
                <span className="text-amber-300 font-semibold flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" /> Giữ Shift chạy nhanh
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Dùng phím <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">W</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">A</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">S</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-200">D</kbd>{' '}
              để bước đi. Nhấp chuột & kéo để đổi góc nhìn.
            </p>

            {/* Quick Virtual Walk Joystick Buttons */}
            <div className="grid grid-cols-3 gap-1 w-28 mx-auto my-1">
              <div />
              <button
                type="button"
                onMouseDown={() => (walkState.current.keys.w = true)}
                onMouseUp={() => (walkState.current.keys.w = false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded text-center text-white text-xs font-bold"
              >
                ▲
              </button>
              <div />
              <button
                type="button"
                onMouseDown={() => (walkState.current.keys.a = true)}
                onMouseUp={() => (walkState.current.keys.a = false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded text-center text-white text-xs font-bold"
              >
                ◀
              </button>
              <button
                type="button"
                onMouseDown={() => (walkState.current.keys.s = true)}
                onMouseUp={() => (walkState.current.keys.s = false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded text-center text-white text-xs font-bold"
              >
                ▼
              </button>
              <button
                type="button"
                onMouseDown={() => (walkState.current.keys.d = true)}
                onMouseUp={() => (walkState.current.keys.d = false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 active:bg-emerald-600 rounded text-center text-white text-xs font-bold"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curated 3D Tour Controller HUD */}
      {viewMode === 'tour' && (
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-slate-900/95 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{currentWaypoint.title}</h4>
                  <span className="text-[11px] text-purple-300 font-medium">
                    Floor {currentWaypoint.floorIndex} • Stop {tourIndex + 1} of {TOUR_WAYPOINTS.length}
                  </span>
                </div>
              </div>

              {/* Tour Navigation Controls with Speed Presets */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-slate-800/90 rounded-xl p-1 border border-slate-700">
                  {[
                    { val: 1.0, label: '1x' },
                    { val: 1.8, label: '1.8x' },
                    { val: 2.8, label: '2.8x' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => onMoveSpeedChange?.(s.val)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        Math.abs((moveSpeedMultiplier || 1.8) - s.val) < 0.15
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 bg-slate-800/80 rounded-xl p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => goToWaypoint((tourIndex - 1 + TOUR_WAYPOINTS.length) % TOUR_WAYPOINTS.length)}
                    className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTourPlaying(!isTourPlaying)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    {isTourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isTourPlaying ? 'Pause' : 'Auto Play'}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToWaypoint((tourIndex + 1) % TOUR_WAYPOINTS.length)}
                    className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">{currentWaypoint.description}</p>

            {/* Quick Stop Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {TOUR_WAYPOINTS.map((wp, idx) => (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => goToWaypoint(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    idx === tourIndex
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {wp.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Floating Gizmo / Quick Actions */}
      {selectedItemId && (
        <div className="absolute top-18 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-sky-500/40 rounded-xl p-2.5 shadow-2xl flex items-center gap-2 text-xs">
          <span className="text-sky-400 font-semibold flex items-center gap-1">
            <Move className="w-3.5 h-3.5" />
            Selected Item:
          </span>
          <span className="text-white font-medium max-w-[140px] truncate">
            {schoolData.items.find((i) => i.id === selectedItemId)?.name || 'Item'}
          </span>
          {onItemMove && (
            <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
              <button
                type="button"
                title="Move Left"
                onClick={() => onItemMove(selectedItemId, -0.5, 0)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono"
              >
                ◀ X
              </button>
              <button
                type="button"
                title="Move Right"
                onClick={() => onItemMove(selectedItemId, 0.5, 0)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono"
              >
                X ▶
              </button>
              <button
                type="button"
                title="Move Forward"
                onClick={() => onItemMove(selectedItemId, 0, -0.5)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono"
              >
                ▲ Z
              </button>
              <button
                type="button"
                title="Move Back"
                onClick={() => onItemMove(selectedItemId, 0, 0.5)}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono"
              >
                ▼ Z
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mini Radar Map (shows campus orientation) */}
      {!hideTelemetry && (
        <div className="absolute bottom-6 right-6 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 shadow-2xl flex flex-col items-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Campus Radar
          </span>
          <div className="w-32 h-24 bg-slate-950 rounded-lg relative overflow-hidden border border-slate-800 text-[7px] font-medium select-none">
            {/* Back Zone: Swimming Pool & Canteen */}
            <div className="absolute top-1 left-2 w-12 h-4 bg-cyan-950/70 border border-cyan-700/60 rounded flex items-center justify-center text-cyan-300">
              🏊 Bể Bơi
            </div>
            <div className="absolute top-1 right-2 w-12 h-4 bg-amber-950/70 border border-amber-700/60 rounded flex items-center justify-center text-amber-300">
              🍽️ Căng Tin
            </div>

            {/* Mid Zone: School Buildings */}
            <div className="absolute top-6 left-2 right-2 h-7 bg-slate-900/80 border border-slate-700/60 rounded flex items-center justify-around px-1 text-slate-300">
              <span className="text-yellow-400 font-bold">Tòa A (5T)</span>
              <span className="text-blue-400">Tòa B</span>
              <span className="text-rose-400">Rạp VIP</span>
            </div>

            {/* Wings: Football pitch & Big Garden */}
            <div className="absolute bottom-6 left-1 w-6 h-8 bg-emerald-950/70 border border-emerald-700/60 rounded flex items-center justify-center text-[6px] text-emerald-300 -rotate-90">
              ⚽ Sân Bóng
            </div>
            <div className="absolute bottom-6 right-1 w-6 h-8 bg-teal-950/70 border border-teal-700/60 rounded flex items-center justify-center text-[6px] text-teal-300 rotate-90">
              🌳 Vườn
            </div>

            {/* Front Yard & Gate */}
            <div className="absolute bottom-1 left-8 right-8 h-4 bg-red-950/60 border border-red-800/60 rounded flex items-center justify-center text-red-300">
              Cổng Chính
            </div>

            {/* Player marker */}
            {viewMode === 'first_person' && (
              <div
                className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] -translate-x-1/2 -translate-y-1/2 transition-all duration-75 border border-white"
                style={{
                  left: `${Math.max(4, Math.min(96, ((playerMapCoords.x + 95) / 190) * 100))}%`,
                  top: `${Math.max(4, Math.min(96, ((playerMapCoords.z + 95) / 160) * 100))}%`,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
