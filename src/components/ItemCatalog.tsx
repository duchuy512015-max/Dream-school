import React, { useState } from 'react';
import { SchoolItem, ItemType, ItemCategory } from '../types';
import { 
  Armchair, 
  Film, 
  FlaskConical, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Plus,
  Monitor,
  Search
} from 'lucide-react';

interface ItemCatalogProps {
  activeFloorIndex: number;
  selectedRoomId: string | null;
  onAddItem: (item: Omit<SchoolItem, 'id'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CatalogEntry {
  type: ItemType;
  name: string;
  category: ItemCategory;
  scale: [number, number, number];
  color?: string;
  description: string;
  badge?: string;
}

const CATALOG_ITEMS: CatalogEntry[] = [
  // SEATING
  {
    type: 'massage_chair',
    name: 'Ghế Mát-Xa Toàn Thân 4D Zero-Gravity',
    category: 'seating',
    scale: [0.95, 0.95, 0.95],
    color: '#1e3a8a',
    description: 'Ghế mát-xa phi thuyền không trọng lực 4D có sưởi ấm, màn hình cảm ứng LCD điều khiển và đệm chân bọc da cao cấp.',
    badge: 'Ultra Deluxe',
  },
  {
    type: 'answer_chair',
    name: 'Ergonomic Answer Chair',
    category: 'seating',
    scale: [0.85, 0.9, 0.85],
    color: '#2563eb',
    description: 'Student answer chair with swiveling tablet desk and notebook groove.',
    badge: 'Popular',
  },
  {
    type: 'cinema_chair',
    name: 'VIP Cinema Rocker Seat',
    category: 'theater',
    scale: [0.85, 0.95, 0.85],
    color: '#e11d48',
    description: 'Plush velvet theater seat with folding armrest and cup holder.',
    badge: 'Cinema',
  },
  {
    type: 'teacher_desk',
    name: 'Professor Smart Desk',
    category: 'academic',
    scale: [2.8, 0.85, 1.2],
    color: '#0f172a',
    description: 'Instructor workstation with laptop dock and lockable storage.',
  },
  {
    type: 'student_desk',
    name: 'Standard Student Desk',
    category: 'academic',
    scale: [1.2, 0.75, 0.6],
    color: '#ca8a04',
    description: 'Classic classroom desk with hardwood surface.',
  },

  // THEATER & MEDIA
  {
    type: 'film_screen',
    name: 'Curved 4K Cinema Screen',
    category: 'theater',
    scale: [12, 3.5, 0.4],
    color: '#f8fafc',
    description: 'Micro-perforated acoustic projection screen.',
    badge: 'Cinema',
  },
  {
    type: 'stage_podium',
    name: 'Theatrical Stage & Lectern',
    category: 'theater',
    scale: [11, 0.4, 2.5],
    color: '#3b0764',
    description: 'Elevated presentation stage with wooden podium and mic.',
  },
  {
    type: 'projector_rig',
    name: 'Ceiling Laser Projector',
    category: 'theater',
    scale: [0.9, 0.4, 0.9],
    color: '#09090b',
    description: 'High lumen overhead projector with projection beam.',
  },
  {
    type: 'speaker_tower',
    name: 'Dolby Surround Sound Stack',
    category: 'theater',
    scale: [0.7, 2.2, 0.7],
    color: '#18181b',
    description: 'Dual-subwoofer tower for cinematic acoustic clarity.',
  },

  // STEM & LAB
  {
    type: 'lab_bench',
    name: 'Chemistry Island with Sinks',
    category: 'science',
    scale: [3.6, 0.95, 1.5],
    color: '#0f766e',
    description: 'Chemical-resistant lab island with sink and gas faucets.',
    badge: 'STEM',
  },
  {
    type: 'fume_hood',
    name: 'Safety Exhaust Fume Hood',
    category: 'science',
    scale: [2.2, 2.4, 1.2],
    color: '#e2e8f0',
    description: 'Ventilated glass cabinet for hazardous chemical reactions.',
  },
  {
    type: 'smartboard',
    name: '85" Digital Smartboard',
    category: 'academic',
    scale: [6, 2.2, 0.15],
    color: '#1e293b',
    description: 'Interactive touchscreen whiteboard with stylus tray.',
  },
  {
    type: 'bookshelf',
    name: 'Tall Library Bookstack',
    category: 'library',
    scale: [4.2, 2.6, 0.7],
    color: '#78350f',
    description: 'Four-tier hardwood bookstack with hundreds of volumes.',
  },

  // SPORTS & DECOR
  {
    type: 'basketball_hoop',
    name: 'Regulation Basketball Hoop',
    category: 'sports',
    scale: [2.2, 3.4, 1.4],
    color: '#ea580c',
    description: 'Tempered glass backboard with steel spring rim.',
    badge: 'Sports',
  },
  {
    type: 'gym_bleacher',
    name: '4-Tier Gym Bleachers',
    category: 'sports',
    scale: [8, 1.6, 2.4],
    color: '#334155',
    description: 'Spectator seating stands for athletic events.',
  },
  {
    type: 'locker_bank',
    name: 'Student Hallway Lockers',
    category: 'decor',
    scale: [6, 2.1, 0.8],
    color: '#0284c7',
    description: 'Bank of 6 secure student lockers with combo locks.',
  },
  {
    type: 'piano',
    name: 'Concert Grand Piano',
    category: 'decor',
    scale: [2.0, 1.1, 2.2],
    color: '#09090b',
    description: 'Fine acoustic concert piano with open lid.',
  },
  {
    type: 'easel',
    name: 'Studio Painting Easel',
    category: 'decor',
    scale: [1, 1.8, 0.9],
    color: '#d97706',
    description: 'Wooden A-frame easel holding stretched oil canvas.',
  },
  {
    type: 'telescope',
    name: 'Sky Refractor Telescope',
    category: 'science',
    scale: [1.2, 2.1, 1.2],
    color: '#38bdf8',
    description: 'Astronomy telescope mounted on precision tripod.',
  },
  {
    type: 'plant',
    name: 'Architectural Ficus Planter',
    category: 'decor',
    scale: [0.7, 1.6, 0.7],
    color: '#15803d',
    description: 'Lush indoor greenery in minimalist ceramic pot.',
  },

  // VIETNAMESE SCHOOL & COURTYARD
  {
    type: 'school_gate',
    name: 'Cổng Chính Trường Dream School',
    category: 'decor',
    scale: [1, 1, 1],
    color: '#ca8a04',
    description: 'Cổng trường bề thế với 4 trụ đá hoa cương, biển đồng đỏ mạ vàng, cánh cổng sắt nghệ thuật và lối vào rợp bóng mát.',
    badge: 'Exterior',
  },
  {
    type: 'guardhouse',
    name: 'Phòng Trực Bảo Vệ Cổng Trường',
    category: 'decor',
    scale: [1, 1, 1],
    color: '#ca8a04',
    description: 'Phòng an ninh với cửa kính quan sát, barie nâng hạ tự động và hệ thống kiểm soát ra vào.',
    badge: 'Exterior',
  },
  {
    type: 'swimming_pool_basin',
    name: 'Bể Bơi Tiêu Chuẩn 25m (Olympic Pool)',
    category: 'sports',
    scale: [22, 1, 14],
    color: '#0ea5e9',
    description: 'Bể bơi bán Olympic với 4 làn bơi phao nổi, 5 bục xuất phát thi đấu và thang inox.',
    badge: 'Pool',
  },
  {
    type: 'lifeguard_tower',
    name: 'Tháp Cứu Hộ Bể Bơi (Lifeguard Tower)',
    category: 'sports',
    scale: [1, 1, 1],
    color: '#ef4444',
    description: 'Tháp quan sát cứu sinh trên cao với ghế ngồi, bậc thang và phao cứu hộ màu đỏ.',
    badge: 'Pool',
  },
  {
    type: 'canteen_counter',
    name: 'Quầy Buffet Căng Tin Inox (Hot Food Bar)',
    category: 'academic',
    scale: [10, 1, 1.4],
    color: '#e2e8f0',
    description: 'Quầy phục vụ thức ăn nóng inox với các khay cơm, canh, kính chắn giọt bắn và máy thu ngân.',
    badge: 'Canteen',
  },
  {
    type: 'canteen_table',
    name: 'Bàn Ăn Căng Tin Liền Ghế (Cafeteria Table)',
    category: 'seating',
    scale: [3.4, 1, 1],
    color: '#ca8a04',
    description: 'Bàn ăn căng tin chắc chắn bằng gỗ kết hợp khung thép và 2 băng ghế dài cho học sinh.',
    badge: 'Canteen',
  },
  {
    type: 'canteen_tray_shelf',
    name: 'Kệ Thu Gom Khay & Bát Đĩa (Tray Return Cart)',
    category: 'academic',
    scale: [1, 1, 1],
    color: '#e2e8f0',
    description: 'Kệ inox nhiều tầng để học sinh tự giác trả khay ăn và dọn dẹp sau bữa trưa.',
    badge: 'Canteen',
  },
  {
    type: 'canteen_menu_board',
    name: 'Bảng Thực Đơn Dinh Dưỡng (Menu Display)',
    category: 'decor',
    scale: [3.6, 1.4, 0.1],
    color: '#da251d',
    description: 'Bảng điện tử hiển thị thực đơn bữa trưa dinh dưỡng trong tuần cho học sinh.',
    badge: 'Canteen',
  },
  {
    type: 'flagpole',
    name: 'Cột Cờ Tổ Quốc (Flagpole)',
    category: 'decor',
    scale: [1, 1, 1],
    color: '#da251d',
    description: 'Stepped granite pedestal with tall stainless steel mast and Vietnamese national flag.',
    badge: 'School Yard',
  },
  {
    type: 'phoenix_tree',
    name: 'Cây Hoa Phượng Vĩ Đỏ (Phoenix Tree)',
    category: 'decor',
    scale: [1, 1, 1],
    description: 'Iconic Vietnamese schoolyard Phoenix tree blooming with radiant red flowers.',
    badge: 'School Yard',
  },
  {
    type: 'stone_bench',
    name: 'Ghế Đá Hoa Cương (Granite Bench)',
    category: 'seating',
    scale: [1, 1, 1],
    description: 'Classic Vietnamese schoolyard polished granite bench for students to sit under shady trees.',
  },
  {
    type: 'green_board',
    name: 'Bảng Từ Chống Lóa (Green Chalkboard)',
    category: 'academic',
    scale: [1, 1, 1],
    description: 'Vietnamese magnetic green chalkboard with chalk tray and gold motto: Tiên Học Lễ - Hậu Học Văn.',
    badge: 'Classroom',
  },
  {
    type: 'ceiling_fan',
    name: 'Quạt Trần 3 Cánh (Ceiling Fan)',
    category: 'decor',
    scale: [1, 1, 1],
    description: 'Classic Vietnamese classroom white 3-blade electric ceiling fan.',
  },
  {
    type: 'football_goal',
    name: 'Khung Thành Bóng Đá (Football Goal)',
    category: 'sports',
    scale: [1, 1, 1],
    description: 'Regulation white tubular steel soccer goal with realistic net mesh backing.',
    badge: 'Football Pitch',
  },
  {
    type: 'treadmill',
    name: 'Máy Chạy Bộ Điện Tử Thông Minh (Smart Treadmill)',
    category: 'sports',
    scale: [1, 1, 1],
    color: '#18181b',
    description: 'Máy chạy bộ cao cấp với băng tải chống trượt, màn hình LED đo nhịp tim và quãng đường tập luyện.',
    badge: 'Gym',
  },
  {
    type: 'weight_bench',
    name: 'Ghế Tập Tạ Đa Năng Olympic (Olympic Weight Bench)',
    category: 'sports',
    scale: [1, 1, 1],
    color: '#ef4444',
    description: 'Dàn tạ ngực Olympic với khung thép chắc chắn, đệm da cao cấp và thanh đòn tạ bánh tạ màu sắc.',
    badge: 'Gym',
  },
  {
    type: 'dumbbell_rack',
    name: 'Giá Để Tạ Tay 2 Tầng (Dumbbell Rack)',
    category: 'sports',
    scale: [2.2, 1, 0.6],
    color: '#334155',
    description: 'Kệ thép 2 tầng chứa nhiều cặp tạ tay bọc cao su từ 5kg đến 30kg phục vụ tập thể lực.',
    badge: 'Gym',
  },
  {
    type: 'punching_bag',
    name: 'Bao Cát Boxing Chuyên Nghiệp (Heavy Punching Bag)',
    category: 'sports',
    scale: [1, 1, 1],
    color: '#be123c',
    description: 'Bao cát đấm bốc bọc da đỏ mận treo xích thép chịu lực rèn luyện phản xạ và sức bền.',
    badge: 'Gym',
  },
  {
    type: 'exercise_bike',
    name: 'Xe Đạp Tập Thể Lực Spinning (Exercise Bike)',
    category: 'sports',
    scale: [1, 1, 1],
    color: '#0284c7',
    description: 'Xe đạp tập thể lực trong nhà với bánh đà mạ chrome, yên xe điều chỉnh và tay lái khí động học.',
    badge: 'Gym',
  },
  {
    type: 'fountain_pond',
    name: 'Hồ Hoa Sen & Đài Phun Nước (Lotus Pond)',
    category: 'decor',
    scale: [1.2, 1, 1.2],
    description: 'Stone rim garden pond with rippling water, water jet, and floating lotus lily pads.',
    badge: 'Garden',
  },

  // GAMING ROOM
  {
    type: 'gaming_rig',
    name: 'Dàn Máy Tính Gaming eSports (Gaming Rig)',
    category: 'gaming',
    scale: [1, 1, 1],
    description: 'High-end gaming workstation with dual curved monitors, glowing RGB tower, and mechanical keyboard.',
    badge: 'Gaming',
  },
  {
    type: 'gaming_chair',
    name: 'Ghế Gaming Đua Xe (Racing Bucket Chair)',
    category: 'gaming',
    scale: [1, 1, 1],
    color: '#ef4444',
    description: 'Ergonomic gaming bucket seat with head pillow, lumbar support, and adjustable armrests.',
    badge: 'Gaming',
  },

  // TOY ROOM
  {
    type: 'lego_table',
    name: 'Bàn Xếp Hình Lego (Lego Play Table)',
    category: 'toys',
    scale: [1.2, 1, 1.2],
    description: 'Giant circular building block table with green stud surface and colorful brick towers.',
    badge: 'Toy Room',
  },
  {
    type: 'toy_shelf',
    name: 'Kệ Đồ Chơi Nhiều Tầng (Toy Storage Shelf)',
    category: 'toys',
    scale: [1.3, 1, 1],
    description: 'Multi-tier colorful organizer with bins, plush toys, and activity pieces.',
    badge: 'Toy Room',
  },
  {
    type: 'play_block',
    name: 'Khối Xốp Vận Động Sáng Tạo (Play Foam Blocks)',
    category: 'toys',
    scale: [1.2, 1.2, 1.2],
    description: 'Modular high-density soft foam geometric play blocks for children.',
    badge: 'Toy Room',
  },

  // BADMINTON COURT
  {
    type: 'badminton_net',
    name: 'Lưới Cầu Lông Tiêu Chuẩn (Badminton Net & Posts)',
    category: 'sports',
    scale: [6.4, 1, 1],
    description: 'Lưới thi đấu cầu lông chính thức kèm 2 trụ căng thép và dây căng chuyên dụng.',
    badge: 'Badminton',
  },
  {
    type: 'badminton_umpire_chair',
    name: 'Ghế Trọng Tài Cầu Lông (Umpire High Chair)',
    category: 'sports',
    scale: [1, 1, 1],
    description: 'Ghế ngồi trọng tài trên cao với bậc thang trèo và bàn ghi điểm chuẩn thi đấu.',
    badge: 'Badminton',
  },
  {
    type: 'badminton_racket_caddy',
    name: 'Xe Caddy Đựng Vợt & Quả Cầu Lông (Racket Caddy)',
    category: 'sports',
    scale: [1, 1, 1],
    description: 'Xe đẩy di động đựng vợt cầu lông và ống cầu lông tập luyện.',
    badge: 'Badminton',
  },

  // LIBRARY & MEDIA
  {
    type: 'library_desk',
    name: 'Quầy Tiếp Nhận & Mượn Trả Sách (Circulation Desk)',
    category: 'library',
    scale: [2.8, 1, 1.4],
    color: '#b45309',
    description: 'Quầy làm việc của thủ thư với máy tính, đầu đọc mã vạch và ngăn tiếp nhận sách mượn trả.',
    badge: 'Library',
  },
  {
    type: 'book_stack',
    name: 'Chồng Sách Tham Khảo Nhiều Màu (Stack of Books)',
    category: 'library',
    scale: [1, 1, 1],
    description: 'Chồng sách bách khoa tri thức bìa cứng nhiều màu sắc phong phú đặt trên bàn đọc.',
    badge: 'Library',
  },
  {
    type: 'globe',
    name: 'Quả Địa Cầu Tra Cứu Thế Giới (Terrestrial Globe)',
    category: 'library',
    scale: [1, 1, 1],
    color: '#0284c7',
    description: 'Quả địa cầu giáo khoa xoay trên trục nghiêng 23.5 độ với giá đỡ đồng sang trọng.',
    badge: 'Library',
  },
  {
    type: 'reading_nook',
    name: 'Góc Đọc Thư Giãn (Lounge Reading Chair & Lamp)',
    category: 'library',
    scale: [1, 1, 1],
    color: '#2563eb',
    description: 'Ghế bành đọc sách êm ái kèm đèn đứng vòm vàng ấm áp cho không gian đọc sách yên tĩnh.',
    badge: 'Library',
  },
  {
    type: 'study_carrel',
    name: 'Cabin Đọc Sách Cá Nhân Cách Âm (Study Carrel)',
    category: 'library',
    scale: [1.1, 1, 0.8],
    color: '#78350f',
    description: 'Bàn học vách ngăn riêng tư cách âm giúp học sinh tập trung tuyệt đối.',
    badge: 'Library',
  },

  // SMART INNOVATION & LAB
  {
    type: 'smartboard',
    name: 'Màn Hình Cảm Ứng Thông Minh 86" (Smartboard)',
    category: 'electronics',
    scale: [1, 1, 1],
    color: '#06b6d4',
    description: 'Màn hình tương tác 4K với bút cảm ứng và camera hội nghị cho lớp học thông minh.',
    badge: 'Smart Tech',
  },
  {
    type: 'vr_headset_station',
    name: 'Trạm Trải Nghiệm Thực Tế Ảo (VR Station)',
    category: 'electronics',
    scale: [1, 1, 1],
    description: 'Kính thực tế ảo VR kèm tay cầm điều khiển trên dock sạc thông minh.',
    badge: 'Smart Tech',
  },
  {
    type: 'robotics_table',
    name: 'Đấu Trường Sa Bàn Robotics (Robotics Arena)',
    category: 'science',
    scale: [2.4, 1, 1.6],
    description: 'Sa bàn thi đấu lập trình robot tự hành vượt chướng ngại vật.',
    badge: 'Smart Tech',
  },
  {
    type: 'printer_3d',
    name: 'Máy In 3D Sáng Tạo (3D Printer)',
    category: 'science',
    scale: [1, 1, 1],
    description: 'Máy in 3D buồng kín chế tác mô hình mẫu nhanh cho học sinh STEM.',
    badge: 'Smart Tech',
  },
  {
    type: 'pc_workstation',
    name: 'Trạm Máy Tính Học Sinh Tin Học (PC Workstation)',
    category: 'electronics',
    scale: [1.2, 1, 0.7],
    description: 'Bàn máy tính hiện đại với màn hình LED, bàn phím, chuột và case máy tính.',
  },
  {
    type: 'physics_bench',
    name: 'Băng Ghế Thí Nghiệm Vật Lý (Physics Optical Bench)',
    category: 'science',
    scale: [2.4, 1, 1.2],
    description: 'Bàn thí nghiệm chuyên dụng trang bị ray quang học laser, lăng kính và đồng hồ vạn năng.',
    badge: 'Science',
  },
  {
    type: 'vietnam_relief_map',
    name: 'Bản Đồ Nổi 3D Việt Nam (Vietnam 3D Relief Map)',
    category: 'arts',
    scale: [1.6, 1, 2.4],
    description: 'Bản đồ địa hình nổi 3D hình chữ S của Tổ quốc kèm quần đảo Hoàng Sa và Trường Sa.',
    badge: 'Culture',
  },
  {
    type: 'bronze_drum',
    name: 'Trống Đồng Đông Sơn Cổ Truyền (Dong Son Bronze Drum)',
    category: 'arts',
    scale: [1.2, 1, 1.2],
    color: '#b45309',
    description: 'Bản sao phục chế Trống đồng Đông Sơn trên bệ gỗ chạm khắc tinh xảo.',
    badge: 'Culture',
  },
  {
    type: 'garden_gazebo',
    name: 'Vọng Lâu Ngắm Cảnh Mái Ngói (Garden Gazebo)',
    category: 'decor',
    scale: [4.2, 1, 4.2],
    description: 'Nhà lục giác vọng lâu mái ngói truyền thống đặt giữa vườn hoa và hồ sen.',
    badge: 'Garden',
  },
  {
    type: 'flower_planter',
    name: 'Bồn Hoa Rực Rỡ Sắc Màu (Flower Planter)',
    category: 'decor',
    scale: [2.6, 1, 1.2],
    description: 'Bồn hoa đá hoa cương nở rộ hoa hồng, hoa cúc vàng tô điểm khuôn viên sân trường.',
    badge: 'Garden',
  },
];

export const ItemCatalog: React.FC<ItemCatalogProps> = ({
  activeFloorIndex,
  selectedRoomId,
  onAddItem,
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredItems = CATALOG_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlace = (item: CatalogEntry) => {
    onAddItem({
      type: item.type,
      name: item.name,
      category: item.category,
      roomId: selectedRoomId || undefined,
      floorIndex: activeFloorIndex,
      x: 0,
      y: 0,
      z: 0,
      rotationY: 0,
      scale: item.scale,
      color: item.color,
      description: item.description,
    });
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-2xl border-r border-slate-700/80 shadow-2xl flex flex-col transition-all">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            School Object & Furniture Catalog
          </h3>
          <p className="text-xs text-slate-400">Click to place directly onto Floor {activeFloorIndex}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search answer chairs, film screens, benches..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'seating', 'academic', 'theater', 'gaming', 'toys', 'sports', 'science', 'library', 'decor'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Objects' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-sky-500/50 transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-white truncate">{item.name}</span>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
            </div>

            <button
              type="button"
              onClick={() => handlePlace(item)}
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1 shadow-md transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Place
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
