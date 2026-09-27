import React, { useState } from 'react';
import { SchoolData, SchoolItem, Room, ArchitectMessage } from '../types';
import confetti from 'canvas-confetti';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Film, 
  Armchair, 
  FlaskConical, 
  Layers, 
  Building2, 
  CheckCircle2, 
  Flame, 
  Wand2, 
  Loader2,
  HelpCircle
} from 'lucide-react';

interface ArchitectAssistantProps {
  schoolData: SchoolData;
  onUpdateSchool: (newSchool: SchoolData) => void;
  activeFloorIndex: number;
  onSetActiveFloor: (index: number) => void;
  selectedRoomId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectAssistant: React.FC<ArchitectAssistantProps> = ({
  schoolData,
  onUpdateSchool,
  activeFloorIndex,
  onSetActiveFloor,
  selectedRoomId,
  isOpen,
  onClose,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ArchitectMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'architect',
      text: "Xin chào! I am your AI Master School Architect. I can design and build any school space in 3D—from authentic Vietnamese 4-floor campuses with 36 classrooms, ergonomic answer comfort chairs, and separate subject buildings, to lush gardens, football pitches, 2 cinemas, gaming rooms, and big toy rooms. What would you like to construct?",
      timestamp: 'Just now',
      suggestions: [
        'Add 12 student answer comfort chairs to classroom',
        'Add Phoenix trees & granite benches to the schoolyard',
        'Add a Film Theater with 18 cinema seats & curved screen',
        'Furnish Gaming Room with dual-monitor RGB rigs & racing chairs',
        'Add giant Lego tables & toy shelves to the Big Toy Room',
      ],
    },
  ]);

  const handleSendCommand = async (textToSend?: string) => {
    const query = (textToSend || prompt).trim();
    if (!query || isLoading) return;

    // Add user message
    const userMsg: ArchitectMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/architect/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          currentFloorIndex: activeFloorIndex,
          schoolSummary: {
            name: schoolData.name,
            totalFloors: schoolData.floors.length,
            totalRooms: schoolData.rooms.length,
            totalItems: schoolData.items.length,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        let updatedFloors = [...schoolData.floors];
        let updatedRooms = [...schoolData.rooms];
        let updatedItems = [...schoolData.items];
        let actionDesc = '';

        // 1. Add Room
        if (data.roomToAdd) {
          const r = data.roomToAdd;
          const newRoomId = `room_gen_${Date.now()}`;
          const newRoom: Room = {
            id: newRoomId,
            name: r.name || 'Architect Spec Space',
            type: r.type || 'classroom',
            floorIndex: activeFloorIndex,
            x: -9.5,
            z: -7.5,
            width: 17,
            depth: 15,
            height: 3.6,
            wallColor: r.wallColor || '#f8fafc',
            floorMaterial: r.floorMaterial || 'wood_parquet',
            themeColor: r.themeColor || '#3b82f6',
            description: 'Custom designed by AI Master Architect.',
            capacity: r.items?.length || 20,
          };

          // If room already occupied spot, shift or replace
          updatedRooms = updatedRooms.filter((existing) => !(existing.floorIndex === activeFloorIndex && Math.abs(existing.x - newRoom.x) < 2 && Math.abs(existing.z - newRoom.z) < 2));
          updatedRooms.push(newRoom);

          // Remove old items in that room spot
          updatedItems = updatedItems.filter((i) => !(i.floorIndex === activeFloorIndex && Math.abs(i.x - newRoom.x) < 8 && Math.abs(i.z - newRoom.z) < 8));

          // Add generated room items
          if (Array.isArray(r.items)) {
            r.items.forEach((item: any, idx: number) => {
              const fullItem: SchoolItem = {
                id: `item_gen_${Date.now()}_${idx}`,
                type: item.type,
                name: item.name || `Item ${idx + 1}`,
                category: item.type.includes('chair') ? 'seating' : item.type.includes('theater') || item.type.includes('screen') ? 'theater' : 'academic',
                roomId: newRoomId,
                floorIndex: activeFloorIndex,
                x: item.x + newRoom.x,
                y: item.y || 0,
                z: item.z + newRoom.z,
                rotationY: item.rotationY || 0,
                scale: item.scale || [1, 1, 1],
                color: item.color,
              };
              updatedItems.push(fullItem);
            });
          }

          actionDesc = `Created ${newRoom.name} with ${r.items?.length || 0} items!`;
        }

        // 2. Add Loose Items (e.g. adding answer chairs)
        if (Array.isArray(data.itemsToAdd) && data.itemsToAdd.length > 0) {
          data.itemsToAdd.forEach((item: any, idx: number) => {
            const fullItem: SchoolItem = {
              id: `item_batch_${Date.now()}_${idx}`,
              type: item.type || 'answer_chair',
              name: item.name || `Answer Chair #${idx + 1}`,
              category: 'seating',
              floorIndex: activeFloorIndex,
              x: (item.x ?? 0) - 9.5,
              y: item.y ?? 0,
              z: (item.z ?? 0) - 7.5,
              rotationY: item.rotationY ?? 0,
              scale: item.scale ?? [0.85, 0.9, 0.85],
              color: item.color || '#2563eb',
            };
            updatedItems.push(fullItem);
          });
          actionDesc = `Added ${data.itemsToAdd.length} items to Floor ${activeFloorIndex}!`;
        }

        // 3. Add Floor
        if (data.actionType === 'add_floor') {
          const nextLevel = updatedFloors.length;
          const newFloorElevation = nextLevel * 3.8;
          const newFloor = {
            id: `floor_${nextLevel}`,
            level: nextLevel,
            name: `${nextLevel === 3 ? '3rd Floor' : `${nextLevel}th Floor`} Expansion`,
            height: 3.8,
            elevation: newFloorElevation,
            color: '#06b6d4',
          };
          updatedFloors.push(newFloor);
          actionDesc = `Constructed new vertical floor level (Floor ${nextLevel})!`;
          onSetActiveFloor(nextLevel);
        }

        onUpdateSchool({
          ...schoolData,
          floors: updatedFloors,
          rooms: updatedRooms,
          items: updatedItems,
        });

        // Trigger confetti celebration
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });

        // Add architect response
        const archMsg: ArchitectMessage = {
          id: `msg_arch_${Date.now()}`,
          sender: 'architect',
          text: data.speech || 'Architectural request executed with precision.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appliedAction: actionDesc,
          suggestions: data.recommendations || [
            'Add 20 answer chairs with tablet arms',
            'Construct a Film Theater with tiered seating',
            'Add a Science Lab with sinks',
          ],
        };

        setMessages((prev) => [...prev, archMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_err_${Date.now()}`,
            sender: 'architect',
            text: data?.error || "I was unable to complete this layout request right now. Try one of the suggested spaces below!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: ['Add a Film Theater', 'Add 16 Answer Chairs', 'Add a Chemistry Lab'],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'architect',
          text: "I encountered a blueprint calculation issue. You can try another space from the suggestions below!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: ['Add a Film Theater', 'Add 16 Answer Chairs', 'Add a Chemistry Lab'],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900/95 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl flex flex-col transition-all">
      {/* Architect Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/60 to-purple-950/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              AI School Architect
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                Gemini 3.8
              </span>
            </h3>
            <p className="text-xs text-slate-300">Build 3D rooms, answer chairs, theaters & floors</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* One-Click Architectural Quick Synthesizers */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1.5">
          <Wand2 className="w-3.5 h-3.5 text-blue-400" />
          Instant Architectural Presets
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSendCommand('Build a Film Theater with tiered seating and 4K screen on this floor')}
            className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-left transition-all group"
          >
            <Film className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-semibold text-rose-200 block">+ Film Theater</span>
              <span className="text-[10px] text-rose-400/80">Tiered cinema seats & screen</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSendCommand('Add 16 student answer chairs with tablet desks in clean rows')}
            className="flex items-center gap-2 p-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800/50 text-left transition-all group"
          >
            <Armchair className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-semibold text-blue-200 block">+ Answer Chairs</span>
              <span className="text-[10px] text-blue-400/80">Ergonomic tablet armchairs</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSendCommand('Design a full Chemistry & Science Discovery Laboratory with sinks and benches')}
            className="flex items-center gap-2 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 text-left transition-all group"
          >
            <FlaskConical className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-semibold text-cyan-200 block">+ Science Lab</span>
              <span className="text-[10px] text-cyan-400/80">Island benches & sinks</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSendCommand('Add a new upper floor level to expand campus capacity')}
            className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 text-left transition-all group"
          >
            <Layers className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-xs font-semibold text-purple-200 block">+ New Floor</span>
              <span className="text-[10px] text-purple-400/80">Vertical campus expansion</span>
            </div>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-bl-none'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[11px] font-bold text-slate-300">
                  {msg.sender === 'user' ? 'You' : 'Architect'}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {msg.appliedAction && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {msg.appliedAction}
                </div>
              )}
            </div>

            {/* Suggested Follow-up Actions */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                {msg.suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendCommand(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-900/50 text-slate-300 hover:text-blue-300 border border-slate-700/80 hover:border-blue-500/50 transition-all text-left"
                  >
                    ✨ {sug}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs w-64 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Architect is drafting 3D layout...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendCommand();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="architect-prompt-input"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'Add a film theater with 24 seats' or 'Add 20 answer chairs'..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            id="architect-send-btn"
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
