import React, { useState, useEffect, useCallback } from 'react';
import { SchoolData, SchoolItem, Room, ViewMode, FloorMaterial, FocusRequest } from './types';
import { INITIAL_SCHOOL } from './data/defaultSchool';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { FloorManager } from './components/FloorManager';
import { ItemCatalog } from './components/ItemCatalog';
import { ArchitectAssistant } from './components/ArchitectAssistant';
import { InspectorPanel } from './components/InspectorPanel';
import { CampusStatsModal } from './components/CampusStatsModal';
import { SavingModeModal } from './components/SavingModeModal';
import { 
  isAutoSaveEnabled, 
  setAutoSaveEnabled as saveAutoSaveSetting, 
  saveAutoSaveData, 
  loadAutoSaveData,
  clearAutoSaveData,
  saveToSlot 
} from './utils/storage';
import { 
  Gauge, 
  Zap, 
  Plus, 
  Minus, 
  Rabbit, 
  Footprints, 
  ChevronDown, 
  SlidersHorizontal,
  Compass,
  Rocket
} from 'lucide-react';

export default function App() {
  const [schoolData, setSchoolData] = useState<SchoolData>(() => {
    const saved = loadAutoSaveData();
    if (saved && saved.data && saved.data.floors && saved.data.floors.length > 0) {
      const data = saved.data;
      // Auto-migrate smart classroom & AI lab coordinates to Building A 5th floor
      const needsMigration = data.rooms.some(
        (r) => 
          (r.id === 'room_smart_classroom' && (r.x === 36 || r.x === -59 || r.width === 16)) || 
          (r.id === 'room_ai_robotics' && (r.x === -16 || r.width === 16))
      );
      if (needsMigration) {
        data.rooms = data.rooms.map((r) => {
          if (r.id === 'room_smart_classroom') {
            return {
              ...r,
              building: 'Tòa Nhà A (Tầng 5)',
              floorIndex: 4,
              x: -60,
              z: -23,
              width: 14.5,
              depth: 27,
              height: 3.8,
              wallColor: '#fef08a',
            };
          }
          if (r.id === 'room_ai_robotics') {
            return {
              ...r,
              building: 'Tòa Nhà A (Tầng 5)',
              floorIndex: 4,
              x: -44,
              z: -23,
              width: 14.5,
              depth: 27,
              height: 3.8,
              wallColor: '#fef08a',
            };
          }
          return r;
        });

        // Update items to Building A 5th floor
        const freshItems = INITIAL_SCHOOL.items.filter(
          (i) => i.roomId === 'room_smart_classroom' || i.roomId === 'room_ai_robotics'
        );
        data.items = data.items.filter(
          (i) => i.roomId !== 'room_smart_classroom' && i.roomId !== 'room_ai_robotics'
        );
        data.items.push(...freshItems);
      }

      // Ensure data.floors contains floor_4 if any room is placed on floor index 4
      if (data.rooms.some((r) => r.floorIndex === 4) && !data.floors.some((f) => f.level === 4 || f.id === 'floor_4')) {
        const floor4 = INITIAL_SCHOOL.floors.find((f) => f.id === 'floor_4' || f.level === 4);
        if (floor4) {
          data.floors.push(floor4);
        }
      }

      // Ensure rooftop terrace items on Building A 5th floor are properly organized without roof obstructions
      const hasTerraceItems = data.items.some((i) => i.id?.startsWith('terrace_'));
      if (!hasTerraceItems) {
        // Remove any old misplaced loose benches/chairs on floor 4
        data.items = data.items.filter(
          (i) => i.floorIndex !== 4 || i.roomId === 'room_smart_classroom' || i.roomId === 'room_ai_robotics'
        );
        const freshTerraceItems = INITIAL_SCHOOL.items.filter((i) => i.id?.startsWith('terrace_'));
        data.items.push(...freshTerraceItems);
      }

      // Ensure swimming pool and canteen exist in saved school data
      const hasPool = data.rooms.some((r) => r.id === 'room_swimming_pool');
      const hasCanteen = data.rooms.some((r) => r.id === 'room_canteen');
      if (!hasPool) {
        const poolRoom = INITIAL_SCHOOL.rooms.find((r) => r.id === 'room_swimming_pool');
        if (poolRoom) data.rooms.push(poolRoom);
      }
      if (!hasCanteen) {
        const canteenRoom = INITIAL_SCHOOL.rooms.find((r) => r.id === 'room_canteen');
        if (canteenRoom) data.rooms.push(canteenRoom);
      }
      // Ensure pool and canteen items exist
      const hasPoolItems = data.items.some((i) => i.roomId === 'room_swimming_pool');
      if (!hasPoolItems) {
        const poolItems = INITIAL_SCHOOL.items.filter((i) => i.roomId === 'room_swimming_pool');
        data.items.push(...poolItems);
      }
      const hasCanteenItems = data.items.some((i) => i.roomId === 'room_canteen');
      if (!hasCanteenItems) {
        const canteenItems = INITIAL_SCHOOL.items.filter((i) => i.roomId === 'room_canteen');
        data.items.push(...canteenItems);
      }

      return data;
    }
    return INITIAL_SCHOOL;
  });

  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('orbit');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Telemetry & Clean View state
  const [hideTelemetry, setHideTelemetry] = useState<boolean>(false);

  // 3D architectural display settings (default to 1.0 opaque for maximum 60 FPS performance)
  const [explodedOffset, setExplodedOffset] = useState<number>(0);
  const [isolateFloor, setIsolateFloor] = useState<boolean>(false);
  const [showCeiling, setShowCeiling] = useState<boolean>(false);
  const [showRoof, setShowRoof] = useState<boolean>(true);
  const [wallOpacity, setWallOpacity] = useState<number>(1.0);

  // Modals & Drawers
  const [isArchitectOpen, setIsArchitectOpen] = useState<boolean>(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSavingModeOpen, setIsSavingModeOpen] = useState<boolean>(false);

  // Saving state
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(() => isAutoSaveEnabled());
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    const saved = loadAutoSaveData();
    return saved?.timestamp ? new Date(saved.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Movement & Fast Travel Speed Controls
  const [moveSpeedMultiplier, setMoveSpeedMultiplier] = useState<number>(1.8);
  const [transitionSpeed, setTransitionSpeed] = useState<'instant' | 'fast' | 'normal' | 'cinematic'>('fast');
  const [isSpeedControlOpen, setIsSpeedControlOpen] = useState<boolean>(true);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Jump to specific campus facility reliably without unintended camera resets
  const handleJumpToFacility = useCallback((roomId: string, floorIdx: number = 0, label: string) => {
    setActiveFloorIndex(floorIdx);
    setIsolateFloor(false);
    setSelectedRoomId(roomId);
    setSelectedItemId(null);
    setFocusRequest({ type: 'room', id: roomId, timestamp: Date.now() });
    showToast(`📍 Đang di chuyển tới: ${label}`);
  }, [showToast]);

  // Handle Auto-save debounce effect
  useEffect(() => {
    if (!autoSaveEnabled) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      saveAutoSaveData(schoolData);
      setIsSaving(false);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 800);

    return () => clearTimeout(timer);
  }, [schoolData, autoSaveEnabled]);

  // Handle Shortcuts: Ctrl+S (Save), H (Toggle Hide Telemetry)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Telemetry & HUD
      if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
        e.preventDefault();
        setHideTelemetry((prev) => {
          const next = !prev;
          showToast(next ? 'Đã ẩn toàn bộ thông số & HUD - Chế độ toàn cảnh (Phím H)' : 'Đã hiện lại đầy đủ thông số & giao diện (Phím H)');
          return next;
        });
        return;
      }

      // Quick Save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveAutoSaveData(schoolData);
        saveToSlot('Quick Save Snapshot', schoolData);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        showToast('Dream School saved successfully! (Ctrl+S)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [schoolData, showToast]);

  const handleToggleAutoSave = (enabled: boolean) => {
    setAutoSaveEnabled(enabled);
    saveAutoSaveSetting(enabled);
    if (enabled) {
      saveAutoSaveData(schoolData);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast('Auto-save enabled');
    } else {
      showToast('Auto-save disabled');
    }
  };

  // Add Item to campus
  const handleAddItem = (itemData: Omit<SchoolItem, 'id'>) => {
    const newItem: SchoolItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setSchoolData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    setSelectedItemId(newItem.id);
  };

  // Update existing item
  const handleUpdateItem = (updatedItem: SchoolItem) => {
    setSchoolData((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
    }));
  };

  // Delete item
  const handleDeleteItem = (itemId: string) => {
    setSchoolData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  // Duplicate item
  const handleDuplicateItem = (item: SchoolItem) => {
    const dup: SchoolItem = {
      ...item,
      id: `item_${Date.now()}_dup`,
      name: `${item.name} (Copy)`,
      x: item.x + 1.2,
      z: item.z + 1.2,
    };
    setSchoolData((prev) => ({
      ...prev,
      items: [...prev.items, dup],
    }));
    setSelectedItemId(dup.id);
  };

  // Nudge item position in 3D
  const handleItemMove = (itemId: string, dx: number, dz: number) => {
    setSchoolData((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            x: Math.round((i.x + dx) * 10) / 10,
            z: Math.round((i.z + dz) * 10) / 10,
          };
        }
        return i;
      }),
    }));
  };

  // Add new floor
  const handleAddFloor = () => {
    const nextLevel = schoolData.floors.length;
    const newElevation = nextLevel * 3.8;
    const colors = ['#0284c7', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
    const newFloor = {
      id: `floor_${nextLevel}`,
      level: nextLevel,
      name: `${nextLevel === 3 ? '3rd Floor' : `${nextLevel}th Floor`} Campus Wing`,
      height: 3.8,
      elevation: newElevation,
      color: colors[nextLevel % colors.length],
    };

    setSchoolData((prev) => ({
      ...prev,
      floors: [...prev.floors, newFloor],
    }));
    setActiveFloorIndex(nextLevel);
  };

  // Update room
  const handleUpdateRoom = (updatedRoom: Room) => {
    setSchoolData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)),
    }));
  };

  // Delete room
  const handleDeleteRoom = (roomId: string) => {
    setSchoolData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((r) => r.id !== roomId),
      items: prev.items.filter((i) => i.roomId !== roomId),
    }));
    if (selectedRoomId === roomId) setSelectedRoomId(null);
  };

  // Quick auto-furnish room templates
  const handleFurnishRoom = (roomId: string, template: 'answer_chairs' | 'theater' | 'lab') => {
    const room = schoolData.rooms.find((r) => r.id === roomId);
    if (!room) return;

    // Filter out existing loose items inside room
    const otherItems = schoolData.items.filter((i) => i.roomId !== roomId);
    const newItems: SchoolItem[] = [];

    if (template === 'answer_chairs') {
      // 16 Answer chairs + teacher desk + board
      newItems.push({
        id: `gen_board_${Date.now()}`,
        type: 'smartboard',
        name: 'Interactive Smartboard',
        category: 'academic',
        roomId,
        floorIndex: room.floorIndex,
        x: room.x,
        y: 1.8,
        z: room.z - room.depth / 2 + 0.6,
        rotationY: 0,
        scale: [6, 2.2, 0.15],
        color: '#1e293b',
      });
      newItems.push({
        id: `gen_tdesk_${Date.now()}`,
        type: 'teacher_desk',
        name: 'Instructor Podium',
        category: 'academic',
        roomId,
        floorIndex: room.floorIndex,
        x: room.x,
        y: 0,
        z: room.z - room.depth / 2 + 2.2,
        rotationY: 0,
        scale: [2.8, 0.85, 1.2],
        color: '#0f172a',
      });

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          newItems.push({
            id: `gen_achair_${Date.now()}_${r}_${c}`,
            type: 'answer_chair',
            name: `Answer Chair R${r + 1}C${c + 1}`,
            category: 'seating',
            roomId,
            floorIndex: room.floorIndex,
            x: room.x + (c - 1.5) * 2.2,
            y: 0,
            z: room.z - 2 + r * 2.2,
            rotationY: 0,
            scale: [0.85, 0.9, 0.85],
            color: '#2563eb',
          });
        }
      }

      handleUpdateRoom({
        ...room,
        name: 'Classroom with Answer Chairs',
        type: 'classroom',
        floorMaterial: 'wood_parquet',
        themeColor: '#16a34a',
      });
    } else if (template === 'theater') {
      // Cinema Screen + Stage + Tiered Cinema Rockers
      newItems.push({
        id: `gen_screen_${Date.now()}`,
        type: 'film_screen',
        name: 'Panoramic 4K Screen',
        category: 'theater',
        roomId,
        floorIndex: room.floorIndex,
        x: room.x,
        y: 1.8,
        z: room.z - room.depth / 2 + 0.8,
        rotationY: 0,
        scale: [12, 3.2, 0.4],
        color: '#ffffff',
      });
      newItems.push({
        id: `gen_stage_${Date.now()}`,
        type: 'stage_podium',
        name: 'Theater Stage',
        category: 'theater',
        roomId,
        floorIndex: room.floorIndex,
        x: room.x,
        y: 0.2,
        z: room.z - room.depth / 2 + 2.0,
        rotationY: 0,
        scale: [13, 0.4, 2.5],
        color: '#3b0764',
      });

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 6; c++) {
          newItems.push({
            id: `gen_cinema_${Date.now()}_${r}_${c}`,
            type: 'cinema_chair',
            name: `VIP Cinema Rocker R${r + 1}S${c + 1}`,
            category: 'theater',
            roomId,
            floorIndex: room.floorIndex,
            x: room.x + (c - 2.5) * 2.0,
            y: r * 0.35,
            z: room.z - 1.5 + r * 2.4,
            rotationY: 0,
            scale: [0.85, 0.95, 0.85],
            color: '#e11d48',
          });
        }
      }

      handleUpdateRoom({
        ...room,
        name: 'Grand Film Theater & Cinema',
        type: 'theater',
        floorMaterial: 'carpet_red',
        themeColor: '#e11d48',
      });
    } else if (template === 'lab') {
      // Science Lab Benches with Sinks
      [-3.5, 3.5].forEach((lx) => {
        [-2.5, 2.5].forEach((lz, idx) => {
          newItems.push({
            id: `gen_lab_${Date.now()}_${idx}_${lx}`,
            type: 'lab_bench',
            name: `Science Discovery Station ${idx + 1}`,
            category: 'science',
            roomId,
            floorIndex: room.floorIndex,
            x: room.x + lx,
            y: 0,
            z: room.z + lz,
            rotationY: 0,
            scale: [3.6, 0.95, 1.5],
            color: '#0f766e',
          });
        });
      });

      handleUpdateRoom({
        ...room,
        name: 'Science & Chemistry Lab',
        type: 'lab',
        floorMaterial: 'polished_concrete',
        themeColor: '#0891b2',
      });
    }

    setSchoolData((prev) => ({
      ...prev,
      items: [...otherItems, ...newItems],
    }));
  };

  // Reset to default sample campus with all facilities
  const handleResetSchool = () => {
    clearAutoSaveData();
    setSchoolData(INITIAL_SCHOOL);
    setActiveFloorIndex(0);
    setIsolateFloor(false);
    setSelectedItemId(null);
    setSelectedRoomId(null);
    showToast('Đã tải lại khuôn viên mới nhất: Bể Bơi, Căng Tin, Sân Cầu Lông & Toàn Bộ Ghế Mát-Xa 4D!');
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Navbar */}
      <Navbar
        schoolData={schoolData}
        activeFloorIndex={activeFloorIndex}
        viewMode={viewMode}
        onOpenArchitect={() => setIsArchitectOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onResetSchool={handleResetSchool}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSavingMode={() => setIsSavingModeOpen(true)}
        autoSaveEnabled={autoSaveEnabled}
        isSaving={isSaving}
        hideTelemetry={hideTelemetry}
        onToggleHideTelemetry={() => {
          setHideTelemetry((prev) => {
            const next = !prev;
            showToast(next ? 'Đã ẩn toàn bộ thông số & HUD - Chế độ toàn cảnh (Phím H)' : 'Đã hiện lại đầy đủ thông số & giao diện (Phím H)');
            return next;
          });
        }}
      />

      {/* Floating Save Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-slate-900/95 border border-emerald-500/60 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main 3D Viewport Workspace */}
      <main className="relative flex-1 w-full h-[calc(100vh-56px)] overflow-hidden">
        {/* Floating Quick Facility Jump & Speed Control Center */}
        {!hideTelemetry && (
          <div 
            className="absolute top-16 left-4 z-20 flex flex-col gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl max-w-[calc(100vw-32px)] md:max-w-2xl overflow-x-auto"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Row 1: Fast Location Jump Buttons (Di chuyển nhanh tới từng vị trí trong trường) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1 pr-1 border-r border-slate-700/60">
                <Compass className="w-3 h-3 text-cyan-400" />
                Vị trí:
              </span>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_swimming_pool', 0, 'Bể Bơi Bán Olympic')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🏊</span>
                <span>Bể Bơi</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_canteen', 0, 'Căng Tin & Nhà Ăn')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🍽️</span>
                <span>Căng Tin</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_badminton_court', 0, 'Sân Cầu Lông Thi Đấu')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-lime-950/80 hover:bg-lime-900 border border-lime-700/60 text-lime-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🏸</span>
                <span>Cầu Lông</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_football_pitch', 0, 'Sân Bóng Đá Chuẩn')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>⚽</span>
                <span>Sân Bóng</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_cinema_1', 0, 'Rạp Phim VIP 1 (Ghế Mát-Xa Đỏ)')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🎬</span>
                <span>Rạp VIP 1</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_class_1a', 0, 'Lớp Học 4D Mát-Xa')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🏫</span>
                <span>Lớp 4D</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_smart_classroom', 4, 'Tầng 5 Tòa Nhà A (Smart Innovation & AI Lab)')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/60 text-purple-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🚀</span>
                <span>Tòa A Tầng 5</span>
              </button>

              <button
                type="button"
                onClick={() => handleJumpToFacility('room_smart_classroom', 4, 'Sân Thượng Tầng 5 (Ghế Đá & Bàn Trà)')}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-teal-950/80 hover:bg-teal-900 border border-teal-700/60 text-teal-200 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
              >
                <span>🌅</span>
                <span>Sân Thượng T5</span>
              </button>
            </div>

            {/* Row 2: Movement Speed & Transition Speed Controls (Nút chỉnh tốc độ di chuyển hợp lý) */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
              {/* Tốc độ di chuyển bước chân / tham quan */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tốc độ di chuyển:</span>
                </span>

                <div className="flex items-center gap-0.5 bg-slate-800/90 rounded-xl p-0.5 border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      const newSpeed = Math.max(0.5, +(moveSpeedMultiplier - 0.3).toFixed(1));
                      setMoveSpeedMultiplier(newSpeed);
                      showToast(`⚡ Tốc độ di chuyển: ${newSpeed}x`);
                    }}
                    className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    title="Giảm tốc độ di chuyển (Phím -)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>

                  <div className="px-1.5 py-0.5 min-w-[70px] text-center font-mono font-bold text-[11px] rounded bg-slate-900 border border-slate-700/80 text-emerald-400">
                    {moveSpeedMultiplier}x {moveSpeedMultiplier === 1.8 ? '✨' : ''}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newSpeed = Math.min(5.0, +(moveSpeedMultiplier + 0.3).toFixed(1));
                      setMoveSpeedMultiplier(newSpeed);
                      showToast(`⚡ Tốc độ di chuyển: ${newSpeed}x`);
                    }}
                    className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    title="Tăng tốc độ di chuyển (Phím +)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Preset Speed Buttons */}
                <div className="flex items-center gap-1">
                  {[
                    { val: 1.0, label: '1x Đi bộ' },
                    { val: 1.8, label: '1.8x Hợp lý', recommended: true },
                    { val: 2.8, label: '2.8x Nhanh' },
                    { val: 4.5, label: '4.5x Siêu tốc' },
                  ].map((s) => {
                    const isActive = Math.abs(moveSpeedMultiplier - s.val) < 0.15;
                    return (
                      <button
                        key={s.val}
                        type="button"
                        onClick={() => {
                          setMoveSpeedMultiplier(s.val);
                          showToast(`⚡ Đã chỉnh tốc độ di chuyển: ${s.label}`);
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-black shadow-md ring-1 ring-emerald-300'
                            : s.recommended
                            ? 'bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900/90 border border-emerald-700/60'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tốc độ bay / chuyển vị trí */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <Rocket className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tới vị trí:</span>
                </span>

                <div className="flex items-center gap-0.5 bg-slate-800/90 rounded-xl p-0.5 border border-slate-700/60">
                  {[
                    { id: 'instant' as const, label: '⚡ Tức thì' },
                    { id: 'fast' as const, label: '🚀 Bay nhanh' },
                    { id: 'normal' as const, label: '✨ Hợp lý' },
                    { id: 'cinematic' as const, label: '🎬 Điện ảnh' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTransitionSpeed(t.id);
                        showToast(`🎯 Tốc độ chuyển vị trí: ${t.label}`);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                        transitionSpeed === t.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <ThreeCanvas
          schoolData={schoolData}
          activeFloorIndex={activeFloorIndex}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          explodedOffset={explodedOffset}
          isolateFloor={isolateFloor}
          showCeiling={showCeiling}
          showRoof={showRoof}
          wallOpacity={wallOpacity}
          onItemMove={handleItemMove}
          hideTelemetry={hideTelemetry}
          onToggleHideTelemetry={() => {
            setHideTelemetry((prev) => {
              const next = !prev;
              showToast(next ? 'Đã ẩn toàn bộ thông số & HUD - Chế độ toàn cảnh (Phím H)' : 'Đã hiện lại đầy đủ thông số & giao diện (Phím H)');
              return next;
            });
          }}
          moveSpeedMultiplier={moveSpeedMultiplier}
          onMoveSpeedChange={(speed) => {
            setMoveSpeedMultiplier(speed);
            const label = speed === 1.0 ? '1.0x (Thong thả)' : speed === 1.8 ? '1.8x (Hợp lý - khuyên dùng)' : speed === 2.8 ? '2.8x (Nhanh)' : speed === 4.5 ? '4.5x (Siêu tốc)' : `${speed}x`;
            showToast(`⚡ Tốc độ di chuyển: ${label}`);
          }}
          transitionSpeed={transitionSpeed}
          onTransitionSpeedChange={(speed) => {
            setTransitionSpeed(speed);
            const label = speed === 'instant' ? 'Tức thì (Instant)' : speed === 'fast' ? 'Bay nhanh (Fast)' : speed === 'normal' ? 'Hợp lý (Normal)' : 'Điện ảnh (Cinematic)';
            showToast(`🎯 Tốc độ tới vị trí: ${label}`);
          }}
          focusRequest={focusRequest}
        />

        {/* Bottom Floating Floor Manager Bar (Hidden when hideTelemetry is active) */}
        {!hideTelemetry && (
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-2xl"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <FloorManager
              schoolData={schoolData}
              activeFloorIndex={activeFloorIndex}
              onSelectFloor={(idx) => {
                setActiveFloorIndex(idx);
                setSelectedItemId(null);
              }}
              onAddFloor={handleAddFloor}
              isolateFloor={isolateFloor}
              onToggleIsolate={() => setIsolateFloor(!isolateFloor)}
              explodedOffset={explodedOffset}
              onChangeExplodedOffset={setExplodedOffset}
              showCeiling={showCeiling}
              onToggleCeiling={() => setShowCeiling(!showCeiling)}
              showRoof={showRoof}
              onToggleRoof={() => setShowRoof(!showRoof)}
              wallOpacity={wallOpacity}
              onChangeWallOpacity={setWallOpacity}
            />
          </div>
        )}

        {/* Inspector Panel (When an item or room is clicked) */}
        <InspectorPanel
          schoolData={schoolData}
          selectedItemId={selectedItemId}
          selectedRoomId={selectedRoomId}
          onClose={() => {
            setSelectedItemId(null);
            setSelectedRoomId(null);
          }}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onDuplicateItem={handleDuplicateItem}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onFurnishRoom={handleFurnishRoom}
        />

        {/* Item Catalog Drawer */}
        <ItemCatalog
          activeFloorIndex={activeFloorIndex}
          selectedRoomId={selectedRoomId}
          onAddItem={handleAddItem}
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
        />

        {/* AI School Architect Panel */}
        <ArchitectAssistant
          schoolData={schoolData}
          onUpdateSchool={setSchoolData}
          activeFloorIndex={activeFloorIndex}
          onSetActiveFloor={setActiveFloorIndex}
          selectedRoomId={selectedRoomId}
          isOpen={isArchitectOpen}
          onClose={() => setIsArchitectOpen(false)}
        />

        {/* Campus Analytics Modal */}
        <CampusStatsModal
          schoolData={schoolData}
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          onImportSchool={setSchoolData}
        />

        {/* Saving Mode Modal */}
        <SavingModeModal
          isOpen={isSavingModeOpen}
          onClose={() => setIsSavingModeOpen(false)}
          schoolData={schoolData}
          onLoadSchool={(loadedSchool) => {
            setSchoolData(loadedSchool);
            setActiveFloorIndex(0);
            setSelectedItemId(null);
            setSelectedRoomId(null);
            showToast(`Loaded "${loadedSchool.name}" successfully!`);
          }}
          onResetSchool={handleResetSchool}
          autoSaveEnabled={autoSaveEnabled}
          onToggleAutoSave={handleToggleAutoSave}
          lastSavedTime={lastSavedTime}
        />
      </main>
    </div>
  );
}
