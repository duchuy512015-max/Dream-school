import { SchoolData, SaveSlot } from '../types';

const AUTOSAVE_KEY = 'dream_school_autosave_data';
const AUTOSAVE_SETTINGS_KEY = 'dream_school_autosave_enabled';
const SLOTS_KEY = 'dream_school_save_slots';
export const DATA_VERSION = 'v8_rooftop_terrace_seating_organized';

/**
 * Check if auto-save is enabled (defaults to true)
 */
export function isAutoSaveEnabled(): boolean {
  try {
    const val = localStorage.getItem(AUTOSAVE_SETTINGS_KEY);
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
}

/**
 * Set auto-save enabled state
 */
export function setAutoSaveEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(AUTOSAVE_SETTINGS_KEY, String(enabled));
  } catch (err) {
    console.warn('Failed to save autosave setting:', err);
  }
}

/**
 * Auto-save current school data
 */
export function saveAutoSaveData(schoolData: SchoolData): void {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      version: DATA_VERSION,
      data: schoolData,
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('Auto-save to localStorage failed:', err);
  }
}

/**
 * Load auto-saved school data if available and up-to-date
 */
export function loadAutoSaveData(): { data: SchoolData; timestamp: string; version?: string } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    
    // Invalidate stale caches that do not have the latest facilities (swimming pool, canteen, badminton, massage chairs)
    if (!parsed || !parsed.data || parsed.version !== DATA_VERSION) {
      localStorage.removeItem(AUTOSAVE_KEY);
      return null;
    }

    const rooms: any[] = parsed.data.rooms || [];
    const hasPool = rooms.some((r) => r.id === 'room_swimming_pool');
    const hasCanteen = rooms.some((r) => r.id === 'room_canteen');
    const hasSmart = rooms.some((r) => r.id === 'room_smart_classroom');
    if (!hasPool || !hasCanteen || !hasSmart) {
      localStorage.removeItem(AUTOSAVE_KEY);
      return null;
    }

    if (parsed.data && Array.isArray(parsed.data.floors)) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load autosave data:', err);
  }
  return null;
}

/**
 * Clear auto-save data to force fresh reload of initial campus
 */
export function clearAutoSaveData(): void {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
  } catch (err) {
    console.warn('Failed to clear autosave data:', err);
  }
}

/**
 * Get all saved slots
 */
export function getSaveSlots(): SaveSlot[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (err) {
    console.warn('Failed to parse save slots:', err);
  }
  return [];
}

/**
 * Save current school into a named slot
 */
export function saveToSlot(name: string, schoolData: SchoolData, existingSlotId?: string): SaveSlot[] {
  const slots = getSaveSlots();
  const id = existingSlotId || `slot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newSlot: SaveSlot = {
    id,
    name: name.trim() || `Dream Campus ${slots.length + 1}`,
    savedAt: now,
    data: schoolData,
    roomCount: schoolData.rooms.length,
    itemCount: schoolData.items.length,
    floorCount: schoolData.floors.length,
  };

  const existingIdx = slots.findIndex((s) => s.id === id);
  if (existingIdx >= 0) {
    slots[existingIdx] = newSlot;
  } else {
    slots.unshift(newSlot);
  }

  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch (err) {
    console.error('Failed to save slot to localStorage:', err);
    throw new Error('Local storage quota exceeded. Please export to file or delete old slots.');
  }

  return slots;
}

/**
 * Delete a save slot
 */
export function deleteSlot(slotId: string): SaveSlot[] {
  const slots = getSaveSlots().filter((s) => s.id !== slotId);
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch (err) {
    console.warn('Failed to delete slot:', err);
  }
  return slots;
}

/**
 * Export school data as a downloadable JSON file
 */
export function exportSchoolToFile(schoolData: SchoolData): void {
  const jsonStr = JSON.stringify(schoolData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = (schoolData.name || 'dream-school').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeName}-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate uploaded JSON file
 */
export function parseSchoolFile(fileContent: string): SchoolData {
  const parsed = JSON.parse(fileContent);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid file format. Must be a valid JSON object.');
  }
  if (!Array.isArray(parsed.floors) || parsed.floors.length === 0) {
    throw new Error('Invalid blueprint: floors array is missing or empty.');
  }
  if (!Array.isArray(parsed.rooms)) {
    throw new Error('Invalid blueprint: rooms array is missing.');
  }
  if (!Array.isArray(parsed.items)) {
    throw new Error('Invalid blueprint: items array is missing.');
  }

  return {
    name: parsed.name || 'Imported Dream School',
    floors: parsed.floors,
    rooms: parsed.rooms,
    items: parsed.items,
  };
}
