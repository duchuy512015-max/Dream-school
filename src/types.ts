export type ItemCategory = 
  | 'seating'
  | 'theater'
  | 'academic'
  | 'science'
  | 'sports'
  | 'library'
  | 'arts'
  | 'gaming'
  | 'toys'
  | 'decor'
  | 'structure'
  | 'furniture'
  | 'electronics';

export type ItemType = 
  | 'massage_chair'
  | 'answer_chair'
  | 'cinema_chair'
  | 'film_screen'
  | 'stage_podium'
  | 'projector_rig'
  | 'speaker_tower'
  | 'teacher_desk'
  | 'student_desk'
  | 'blackboard'
  | 'green_board'
  | 'ceiling_fan'
  | 'smartboard'
  | 'lab_bench'
  | 'fume_hood'
  | 'bookshelf'
  | 'study_table'
  | 'basketball_hoop'
  | 'football_goal'
  | 'flagpole'
  | 'stone_bench'
  | 'phoenix_tree'
  | 'fountain_pond'
  | 'gaming_rig'
  | 'gaming_chair'
  | 'toy_shelf'
  | 'lego_table'
  | 'play_block'
  | 'gym_bleacher'
  | 'cafeteria_table'
  | 'locker_bank'
  | 'locker'
  | 'plant'
  | 'wall_clock'
  | 'computer_station'
  | 'piano'
  | 'easel'
  | 'telescope'
  | 'door'
  | 'window_pane'
  | 'staircase'
  | 'water_fountain'
  | 'school_gate'
  | 'guardhouse'
  | 'swimming_pool_basin'
  | 'pool_lane_divider'
  | 'pool_starter_block'
  | 'lifeguard_tower'
  | 'canteen_counter'
  | 'canteen_table'
  | 'canteen_tray_shelf'
  | 'canteen_menu_board'
  | 'badminton_net'
  | 'badminton_umpire_chair'
  | 'badminton_racket_caddy'
  | 'library_desk'
  | 'book_stack'
  | 'globe'
  | 'reading_nook'
  | 'study_carrel'
  | 'pc_workstation'
  | 'physics_bench'
  | 'vietnam_relief_map'
  | 'bronze_drum'
  | 'smartboard'
  | 'vr_headset_station'
  | 'robotics_table'
  | 'printer_3d'
  | 'garden_gazebo'
  | 'flower_planter'
  | 'treadmill'
  | 'gym_weight_bench'
  | 'weight_bench'
  | 'gym_dumbbells'
  | 'dumbbell_rack'
  | 'punching_bag'
  | 'exercise_bike'
  | 'gym_scoreboard';

export interface SchoolItem {
  id: string;
  type: ItemType;
  name: string;
  category: ItemCategory;
  roomId?: string;
  floorIndex: number;
  x: number;
  y: number; // elevation within floor
  z: number;
  rotationY: number; // in radians
  scale: [number, number, number];
  color?: string;
  description?: string;
}

export type FloorMaterial = 
  | 'carpet_red'
  | 'carpet_charcoal'
  | 'wood_parquet'
  | 'linoleum_blue'
  | 'polished_concrete'
  | 'gym_hardwood'
  | 'tile_white'
  | 'turf_green'
  | 'garden_grass'
  | 'terracotta_tile'
  | 'rubber_playground'
  | 'pool_water'
  | 'canteen_tile'
  | 'badminton_green';

export interface Room {
  id: string;
  name: string;
  type: 'theater' | 'classroom' | 'lab' | 'library' | 'auditorium' | 'gym' | 'cafeteria' | 'arts' | 'lounge' | 'hallway' | 'gaming' | 'toy_room' | 'garden' | 'pitch' | 'sports' | 'swimming_pool' | 'canteen' | 'badminton_court' | 'smart_classroom';
  building?: string;
  floorIndex: number;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  wallColor: string;
  floorMaterial: FloorMaterial;
  themeColor: string;
  description: string;
  capacity?: number;
}

export interface Floor {
  id: string;
  level: number; // 0 = Ground Floor, 1 = 1st Floor, etc.
  name: string;
  height: number; // in meters (default 3.8)
  elevation: number; // world Y offset
  color: string;
  isRooftop?: boolean;
}

export interface SchoolData {
  name: string;
  floors: Floor[];
  rooms: Room[];
  items: SchoolItem[];
}

export type ViewMode = 'orbit' | 'first_person' | 'exploded' | 'tour';

export interface TourWaypoint {
  id: string;
  name: string;
  floorIndex: number;
  position: [number, number, number];
  target: [number, number, number];
  title: string;
  description: string;
  roomName: string;
}

export interface ArchitectMessage {
  id: string;
  sender: 'user' | 'architect';
  text: string;
  timestamp: string;
  appliedAction?: string;
  suggestions?: string[];
}

export interface SaveSlot {
  id: string;
  name: string;
  savedAt: string;
  data: SchoolData;
  roomCount: number;
  itemCount: number;
  floorCount: number;
}

export interface FocusRequest {
  type: 'room' | 'item';
  id: string;
  timestamp: number;
}
