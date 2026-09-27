import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// AI Architect endpoint
app.post('/api/architect/command', async (req, res) => {
  try {
    const { prompt, currentFloorIndex, schoolSummary } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGenAI();

    if (ai) {
      try {
        const systemPrompt = `You are a Master School Architect and 3D Campus Space Planner specializing in modern and authentic school designs, including Vietnamese school architectures.
You assist users in building 3D schools with multiple floors, complete interiors, and specialized educational spaces:
- 36 Ordinary Classrooms with Answer Comfort Chairs (ergonomic student tablet chairs)
- Separate Subject Buildings (Physics, Chemistry-Bio, Informatics, Foreign Languages, Music, Arts, STEM, Traditional Heritage)
- Big School Gardens & Lotus Ponds (stone fountains, lush trees, granite benches)
- Regulation Football Pitches (turf field, goal nets, spectator benches)
- 2 Film Theaters / Cinemas (tiered rows, cinema seats, giant projection screens, stage, surround audio)
- School Libraries & Media Commons
- Gaming & eSports Rooms (dual-monitor RGB PC rigs, racing chairs)
- Big Toy & Creative Rooms (giant Lego building tables, toy cubbies, foam play blocks)
- Gymnasium & Sports Arenas (basketball hoops, bleachers)
- Courtyards with National Flagpole (Vietnamese flag) and Phoenix trees (Cây hoa phượng vĩ đỏ).

Analyze the user's architectural request: "${prompt}".
Context: Current Floor Index: ${currentFloorIndex ?? 0}. School summary: ${JSON.stringify(schoolSummary || {})}.

Return a STRICT JSON response adhering to this schema:
{
  "speech": "Short professional architect response explaining what was added or changed (max 2 sentences)",
  "actionType": "add_room" | "add_items" | "add_floor" | "furnish_room" | "modify_school",
  "roomToAdd": {
    "name": string,
    "type": "theater" | "classroom" | "lab" | "library" | "auditorium" | "gym" | "cafeteria" | "arts" | "lounge" | "gaming" | "toy_room" | "garden" | "pitch" | "sports",
    "floorIndex": number,
    "themeColor": "#hex",
    "wallColor": "#hex",
    "floorMaterial": "carpet_red" | "wood_parquet" | "linoleum_blue" | "polished_concrete" | "tile_white" | "turf_green" | "garden_grass" | "terracotta_tile" | "rubber_playground",
    "items": [
      {
        "type": "answer_chair" | "cinema_chair" | "film_screen" | "stage_podium" | "projector_rig" | "teacher_desk" | "blackboard" | "green_board" | "ceiling_fan" | "flagpole" | "stone_bench" | "phoenix_tree" | "football_goal" | "fountain_pond" | "gaming_rig" | "gaming_chair" | "toy_shelf" | "lego_table" | "play_block" | "lab_bench" | "bookshelf" | "cafeteria_table" | "basketball_hoop" | "locker_bank" | "plant" | "wall_clock" | "speaker_tower" | "student_desk" | "computer_station",
        "name": string,
        "x": number,
        "y": number,
        "z": number,
        "rotationY": number,
        "scale": [number, number, number],
        "color": string
      }
    ]
  },
  "itemsToAdd": [
    {
      "type": string,
      "name": string,
      "x": number,
      "y": number,
      "z": number,
      "rotationY": number,
      "scale": [number, number, number],
      "color": string
    }
  ],
  "floorToAdd": {
    "name": string,
    "level": number,
    "height": 3.8,
    "elevation": number,
    "color": "#hex"
  },
  "recommendations": ["suggestion 1", "suggestion 2"]
}
Output pure valid JSON with no markdown tags.`;

        // Try primary model with fast failover to alternative models during spikes in demand
        const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
        let aiGeneratedResponse: any = null;

        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json',
              },
            });

            const text = response.text;
            if (text) {
              const parsed = JSON.parse(text);
              if (parsed && typeof parsed === 'object') {
                aiGeneratedResponse = parsed;
                break;
              }
            }
          } catch {
            // Model unavailable or experiencing high demand, proceed to next candidate or fallback
            continue;
          }
        }

        if (aiGeneratedResponse) {
          return res.json({ success: true, ...aiGeneratedResponse });
        }
      } catch {
        // Continue to rule-based architect generator
      }
    }

    // High quality intelligent fallback engine (works seamlessly offline or without API key)
    const lower = prompt.toLowerCase();
    let actionType = 'add_items';
    let speech = 'I have designed and added the requested space into your 3D school blueprint.';
    let roomToAdd: any = null;
    let itemsToAdd: any[] = [];
    const floorIndex = currentFloorIndex || 0;

    if (lower.includes('sân thượng') || lower.includes('terrace') || lower.includes('rooftop') || (lower.includes('ghế') && lower.includes('thượng'))) {
      actionType = 'add_items';
      speech = 'Architect đã sắp xếp lại toàn bộ ghế đá ngắm cảnh, bàn trà và cây xanh trên sân thượng Tầng 5 Tòa Nhà A theo bố cục thoáng đãng dọc lan can kính, hoàn toàn ngoài trời không bị mái nhà che khuất.';
      itemsToAdd = [
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Tây Bắc 1)', x: -62, y: 0, z: -37.6, rotationY: Math.PI, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'study_table', name: 'Bàn Trà Thư Giãn Sân Thượng (Tây Bắc)', x: -58.5, y: 0, z: -37.6, rotationY: 0, scale: [0.85, 0.85, 0.85], color: '#64748b' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Tây Bắc 2)', x: -55, y: 0, z: -37.6, rotationY: Math.PI, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'plant', name: 'Chậu Cây Cảnh Sân Thượng (Góc Tây Bắc)', x: -66.5, y: 0, z: -37.6, rotationY: 0, scale: [1.1, 1.1, 1.1], color: '#16a34a' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Đông Bắc 1)', x: -49, y: 0, z: -37.6, rotationY: Math.PI, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'study_table', name: 'Bàn Trà Thư Giãn Sân Thượng (Đông Bắc)', x: -45.5, y: 0, z: -37.6, rotationY: 0, scale: [0.85, 0.85, 0.85], color: '#64748b' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Đông Bắc 2)', x: -42, y: 0, z: -37.6, rotationY: Math.PI, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'plant', name: 'Chậu Cây Cảnh Sân Thượng (Góc Đông Bắc)', x: -37.5, y: 0, z: -37.6, rotationY: 0, scale: [1.1, 1.1, 1.1], color: '#16a34a' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Tây Nam 1)', x: -62, y: 0, z: -8.4, rotationY: 0, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'study_table', name: 'Bàn Trà Thư Giãn Sân Thượng (Tây Nam)', x: -58.5, y: 0, z: -8.4, rotationY: 0, scale: [0.85, 0.85, 0.85], color: '#64748b' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Tây Nam 2)', x: -55, y: 0, z: -8.4, rotationY: 0, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'plant', name: 'Chậu Cây Cảnh Sân Thượng (Góc Tây Nam)', x: -66.5, y: 0, z: -8.4, rotationY: 0, scale: [1.1, 1.1, 1.1], color: '#16a34a' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Đông Nam 1)', x: -49, y: 0, z: -8.4, rotationY: 0, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'study_table', name: 'Bàn Trà Thư Giãn Sân Thượng (Đông Nam)', x: -45.5, y: 0, z: -8.4, rotationY: 0, scale: [0.85, 0.85, 0.85], color: '#64748b' },
        { type: 'stone_bench', name: 'Ghế Đá Sân Thượng Tầng 5 (Đông Nam 2)', x: -42, y: 0, z: -8.4, rotationY: 0, scale: [1.15, 1, 1], color: '#cfd8dc' },
        { type: 'plant', name: 'Chậu Cây Cảnh Sân Thượng (Góc Đông Nam)', x: -37.5, y: 0, z: -8.4, rotationY: 0, scale: [1.1, 1.1, 1.1], color: '#16a34a' },
      ];
    } else if (lower.includes('theater') || lower.includes('film') || lower.includes('cinema') || lower.includes('movie')) {
      actionType = 'add_room';
      speech = 'Architect drafted a dedicated Film & Media Cinema Theater with 18 luxury cinema seats, acoustic wall panelling, elevated tiered rows, and a widescreen projection display.';
      
      const theaterItems: any[] = [
        { type: 'film_screen', name: 'Curved Cinema Screen', x: 0, y: 2.2, z: -7.2, rotationY: 0, scale: [10, 3.8, 0.4], color: '#ffffff' },
        { type: 'stage_podium', name: 'Stage Platform', x: 0, y: 0.25, z: -6.5, rotationY: 0, scale: [11, 0.5, 3], color: '#2a1a1f' },
        { type: 'projector_rig', name: 'Ceiling Laser Projector', x: 0, y: 3.8, z: 2, rotationY: 0, scale: [1, 0.5, 1], color: '#111827' },
        { type: 'speaker_tower', name: 'Left Audio Stack', x: -5, y: 2.2, z: -6.8, rotationY: 0.3, scale: [0.8, 2.2, 0.8], color: '#1f2937' },
        { type: 'speaker_tower', name: 'Right Audio Stack', x: 5, y: 2.2, z: -6.8, rotationY: -0.3, scale: [0.8, 2.2, 0.8], color: '#1f2937' },
      ];

      // Add tiered rows of cinema chairs
      const rows = 3;
      const cols = 6;
      for (let r = 0; r < rows; r++) {
        const rowZ = -2 + r * 2.2;
        const rowY = 0.1 + r * 0.45; // tiered riser
        for (let c = 0; c < cols; c++) {
          const seatX = (c - (cols - 1) / 2) * 1.5;
          theaterItems.push({
            type: 'cinema_chair',
            name: `Cinema Rocker R${r + 1}S${c + 1}`,
            x: seatX,
            y: rowY,
            z: rowZ,
            rotationY: 0,
            scale: [0.85, 1, 0.85],
            color: '#be123c', // rich velvet red
          });
        }
      }

      roomToAdd = {
        name: 'Film & Media Theater',
        type: 'theater',
        floorIndex,
        themeColor: '#be123c',
        wallColor: '#1c1917',
        floorMaterial: 'carpet_red',
        items: theaterItems,
      };
    } else if (lower.includes('answer chair') || lower.includes('chair') || lower.includes('answer desk') || lower.includes('tablet chair')) {
      actionType = 'add_items';
      speech = 'Architect placed a batch of ergonomic classroom answer chairs equipped with student tablet desks.';
      
      const count = lower.includes('25') ? 25 : lower.includes('12') ? 12 : 16;
      const cols = 4;
      const rows = Math.ceil(count / cols);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r * cols + c < count) {
            itemsToAdd.push({
              type: 'answer_chair',
              name: `Student Answer Chair #${r * cols + c + 1}`,
              x: (c - (cols - 1) / 2) * 1.6,
              y: 0,
              z: (r - (rows - 1) / 2) * 1.8 + 1,
              rotationY: 0,
              scale: [0.8, 0.9, 0.8],
              color: '#0284c7',
            });
          }
        }
      }
    } else if (lower.includes('science') || lower.includes('lab') || lower.includes('chemistry') || lower.includes('biology')) {
      actionType = 'add_room';
      speech = 'Architect created a full Science & Chemistry Discovery Laboratory featuring safety sinks, chemical benches, and experiment stations.';
      
      const labItems: any[] = [
        { type: 'teacher_desk', name: 'Instructor Demonstration Station', x: 0, y: 0, z: -5.5, rotationY: 0, scale: [3.5, 0.9, 1.2], color: '#334155' },
        { type: 'blackboard', name: 'Interactive Formula Board', x: 0, y: 2, z: -7.4, rotationY: 0, scale: [6, 2.2, 0.15], color: '#064e3b' },
        { type: 'lab_bench', name: 'Experiment Island A', x: -3.2, y: 0, z: -1.5, rotationY: 0, scale: [2.6, 0.95, 1.4], color: '#0f766e' },
        { type: 'lab_bench', name: 'Experiment Island B', x: 3.2, y: 0, z: -1.5, rotationY: 0, scale: [2.6, 0.95, 1.4], color: '#0f766e' },
        { type: 'lab_bench', name: 'Experiment Island C', x: -3.2, y: 0, z: 2.5, rotationY: 0, scale: [2.6, 0.95, 1.4], color: '#0f766e' },
        { type: 'lab_bench', name: 'Experiment Island D', x: 3.2, y: 0, z: 2.5, rotationY: 0, scale: [2.6, 0.95, 1.4], color: '#0f766e' },
        { type: 'bookshelf', name: 'Lab Manuals & Glassware Storage', x: -6.2, y: 0, z: 0, rotationY: Math.PI / 2, scale: [2.4, 2.2, 0.6], color: '#475569' },
      ];

      roomToAdd = {
        name: 'Advanced Science & Chemistry Lab',
        type: 'lab',
        floorIndex,
        themeColor: '#0d9488',
        wallColor: '#f1f5f9',
        floorMaterial: 'polished_concrete',
        items: labItems,
      };
    } else if (lower.includes('garden') || lower.includes('tree') || lower.includes('pond')) {
      actionType = 'add_room';
      speech = 'Architect constructed a lush School Garden with a lotus fountain pond, Phoenix trees, and granite relaxation benches.';
      roomToAdd = {
        name: 'Vườn Sinh Thái Trường Học (School Garden)',
        type: 'garden',
        floorIndex,
        themeColor: '#16a34a',
        wallColor: '#14532d',
        floorMaterial: 'garden_grass',
        items: [
          { type: 'fountain_pond', name: 'Hồ Hoa Sen & Đài Phun Nước', x: 0, y: 0, z: 0, rotationY: 0, scale: [1.2, 1, 1.2], color: '#0284c7' },
          { type: 'phoenix_tree', name: 'Cây Hoa Phượng Vĩ Đỏ', x: -6, y: 0, z: -4, rotationY: 0.3, scale: [1, 1, 1], color: '#dc2626' },
          { type: 'stone_bench', name: 'Ghế Đá Hoa Cương', x: -4, y: 0, z: 4, rotationY: 0.5, scale: [1, 1, 1], color: '#cfd8dc' },
          { type: 'stone_bench', name: 'Ghế Đá Hoa Cương', x: 4, y: 0, z: -4, rotationY: -0.5, scale: [1, 1, 1], color: '#cfd8dc' },
        ],
      };
    } else if (lower.includes('football') || lower.includes('pitch') || lower.includes('soccer')) {
      actionType = 'add_room';
      speech = 'Architect laid out a regulation artificial turf Football Pitch with white field markings and steel goal nets.';
      roomToAdd = {
        name: 'Sân Bóng Đá Cỏ Nhân Tạo',
        type: 'pitch',
        floorIndex,
        themeColor: '#22c55e',
        wallColor: '#166534',
        floorMaterial: 'turf_green',
        items: [
          { type: 'football_goal', name: 'Khung Thành Cầu Môn Tây', x: -14, y: 0, z: 0, rotationY: Math.PI / 2, scale: [1, 1, 1], color: '#ffffff' },
          { type: 'football_goal', name: 'Khung Thành Cầu Môn Đông', x: 14, y: 0, z: 0, rotationY: -Math.PI / 2, scale: [1, 1, 1], color: '#ffffff' },
          { type: 'stone_bench', name: 'Ghế Dự Bị Cầu Thủ', x: 0, y: 0, z: 10, rotationY: 0, scale: [1.2, 1, 1.2], color: '#cfd8dc' },
        ],
      };
    } else if (lower.includes('gaming') || lower.includes('esport')) {
      actionType = 'add_room';
      speech = 'Architect built a state-of-the-art Student eSports & Gaming Room with dual-monitor rigs and racing bucket chairs.';
      roomToAdd = {
        name: 'Phòng Game & eSports Học Đường',
        type: 'gaming',
        floorIndex,
        themeColor: '#06b6d4',
        wallColor: '#090d16',
        floorMaterial: 'linoleum_blue',
        items: [
          { type: 'gaming_rig', name: 'Dàn Máy Gaming #1', x: -3.5, y: 0, z: -2, rotationY: Math.PI / 2, scale: [1, 1, 1], color: '#000000' },
          { type: 'gaming_chair', name: 'Ghế Gaming Đua Xe #1', x: -2.2, y: 0, z: -2, rotationY: -Math.PI / 2, scale: [1, 1, 1], color: '#ef4444' },
          { type: 'gaming_rig', name: 'Dàn Máy Gaming #2', x: 3.5, y: 0, z: -2, rotationY: -Math.PI / 2, scale: [1, 1, 1], color: '#000000' },
          { type: 'gaming_chair', name: 'Ghế Gaming Đua Xe #2', x: 2.2, y: 0, z: -2, rotationY: Math.PI / 2, scale: [1, 1, 1], color: '#06b6d4' },
        ],
      };
    } else if (lower.includes('toy') || lower.includes('lego')) {
      actionType = 'add_room';
      speech = 'Architect designed a Big Toy & Creative Room equipped with giant Lego building tables, toy shelves, and play blocks.';
      roomToAdd = {
        name: 'Phòng Đồ Chơi & Sáng Tạo',
        type: 'toy_room',
        floorIndex,
        themeColor: '#eab308',
        wallColor: '#fef08a',
        floorMaterial: 'rubber_playground',
        items: [
          { type: 'lego_table', name: 'Bàn Xếp Hình Lego Khổng Lồ', x: -2.5, y: 0, z: 0, rotationY: 0, scale: [1.2, 1, 1.2], color: '#22c55e' },
          { type: 'toy_shelf', name: 'Kệ Đồ Chơi Nhiều Ngăn', x: 0, y: 0, z: -5.5, rotationY: 0, scale: [1.3, 1, 1], color: '#eab308' },
          { type: 'play_block', name: 'Bộ Khối Xốp Vận Động', x: 2.5, y: 0, z: 2, rotationY: 0, scale: [1.2, 1.2, 1.2], color: '#ef4444' },
        ],
      };
    } else if (lower.includes('floor') && (lower.includes('add') || lower.includes('new') || lower.includes('third') || lower.includes('second'))) {
      actionType = 'add_floor';
      speech = 'Architect added a brand new upper floor level to the campus vertical expansion plan.';
    } else {
      // Default smart classroom / academic multipurpose
      actionType = 'add_room';
      speech = 'Architect generated a modern Academic Innovation Classroom complete with answer chairs, teacher podium, and digital board.';
      
      const classroomItems: any[] = [
        { type: 'teacher_desk', name: 'Teacher Smart Desk', x: 0, y: 0, z: -5.2, rotationY: 0, scale: [2.6, 0.85, 1.1], color: '#3b82f6' },
        { type: 'blackboard', name: 'Digital Smartboard', x: 0, y: 2, z: -7.2, rotationY: 0, scale: [5.5, 2.2, 0.1], color: '#1e293b' },
        { type: 'plant', name: 'Air Purifying Ficus', x: -5.5, y: 0, z: -6.5, rotationY: 0, scale: [0.8, 1.6, 0.8], color: '#15803d' },
        { type: 'bookshelf', name: 'Classroom Library', x: 5.8, y: 0, z: -2, rotationY: -Math.PI / 2, scale: [2, 2.2, 0.5], color: '#78350f' },
      ];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
          classroomItems.push({
            type: 'answer_chair',
            name: `Answer Chair ${r * 4 + c + 1}`,
            x: (c - 1.5) * 1.8,
            y: 0,
            z: -1.5 + r * 2.2,
            rotationY: 0,
            scale: [0.85, 0.9, 0.85],
            color: '#2563eb',
          });
        }
      }

      roomToAdd = {
        name: 'Smart Innovation Classroom',
        type: 'classroom',
        floorIndex,
        themeColor: '#3b82f6',
        wallColor: '#f8fafc',
        floorMaterial: 'wood_parquet',
        items: classroomItems,
      };
    }

    return res.json({
      success: true,
      speech,
      actionType,
      roomToAdd,
      itemsToAdd,
      recommendations: [
        'Add a Film Theater with tiered seating',
        'Add 20 student answer chairs',
        'Build a Science Chemistry lab',
        'Add a 3rd floor rooftop conservatory',
      ],
    });
  } catch (err: any) {
    console.error('Architect API error:', err);
    res.status(500).json({ error: 'Architect failed to process request', details: err?.message });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const cwdDist = path.join(process.cwd(), 'dist');
    const distPath = fs.existsSync(cwdDist)
      ? cwdDist
      : typeof __dirname !== 'undefined'
      ? __dirname
      : cwdDist;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`3D School Builder Server listening on port ${PORT}`);
  });
}

startServer();
