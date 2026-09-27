import React from 'react';
import { SchoolData, SchoolItem, Room, FloorMaterial } from '../types';
import { 
  Trash2, 
  Copy, 
  RotateCw, 
  Palette, 
  Move, 
  Sliders, 
  Layers, 
  Armchair, 
  Film, 
  FlaskConical,
  X
} from 'lucide-react';

interface InspectorPanelProps {
  schoolData: SchoolData;
  selectedItemId: string | null;
  selectedRoomId: string | null;
  onClose: () => void;
  onUpdateItem: (item: SchoolItem) => void;
  onDeleteItem: (itemId: string) => void;
  onDuplicateItem: (item: SchoolItem) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (roomId: string) => void;
  onFurnishRoom: (roomId: string, template: 'answer_chairs' | 'theater' | 'lab') => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  schoolData,
  selectedItemId,
  selectedRoomId,
  onClose,
  onUpdateItem,
  onDeleteItem,
  onDuplicateItem,
  onUpdateRoom,
  onDeleteRoom,
  onFurnishRoom,
}) => {
  const selectedItem = schoolData.items.find((i) => i.id === selectedItemId);
  const selectedRoom = schoolData.rooms.find((r) => r.id === selectedRoomId);

  if (!selectedItem && !selectedRoom) return null;

  return (
    <div 
      className="absolute top-18 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col gap-3 text-xs"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white flex items-center gap-1.5 text-xs">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          {selectedItem ? 'Item Properties' : 'Room Blueprint'}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ITEM INSPECTION */}
      {selectedItem && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Item Name</label>
            <input
              type="text"
              value={selectedItem.name}
              onChange={(e) => onUpdateItem({ ...selectedItem, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* Color Palettes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">Color Finish</label>
            <div className="flex items-center gap-2">
              {['#2563eb', '#e11d48', '#0f766e', '#d97706', '#8b5cf6', '#09090b', '#f8fafc'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onUpdateItem({ ...selectedItem, color: c })}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    selectedItem.color === c ? 'scale-110 border-white' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Position and Rotation */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Position (X, Z)</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.5"
                  value={Math.round(selectedItem.x * 10) / 10}
                  onChange={(e) => onUpdateItem({ ...selectedItem, x: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white font-mono"
                />
                <input
                  type="number"
                  step="0.5"
                  value={Math.round(selectedItem.z * 10) / 10}
                  onChange={(e) => onUpdateItem({ ...selectedItem, z: parseFloat(e.target.value) || 0 })}
                  className="w-1/2 bg-slate-950 border border-slate-700 rounded px-1.5 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Rotate 45°</label>
              <button
                type="button"
                onClick={() => onUpdateItem({ ...selectedItem, rotationY: selectedItem.rotationY + Math.PI / 4 })}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                Turn
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onDuplicateItem(selectedItem)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </button>
            <button
              type="button"
              onClick={() => onDeleteItem(selectedItem.id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ROOM INSPECTION */}
      {selectedRoom && !selectedItem && (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Room Name</label>
            <input
              type="text"
              value={selectedRoom.name}
              onChange={(e) => onUpdateRoom({ ...selectedRoom, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          {/* Floor Material Selection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Floor Material</label>
            <select
              value={selectedRoom.floorMaterial}
              onChange={(e) => onUpdateRoom({ ...selectedRoom, floorMaterial: e.target.value as FloorMaterial })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="carpet_red">Carpet Red (Film Theater)</option>
              <option value="carpet_charcoal">Carpet Charcoal (Library)</option>
              <option value="wood_parquet">Wood Parquet (Classroom)</option>
              <option value="terracotta_tile">Terracotta Red Tile (Vietnamese School)</option>
              <option value="turf_green">Artificial Turf (Football Pitch)</option>
              <option value="garden_grass">Botanical Garden Grass</option>
              <option value="rubber_playground">Rubber Safety Floor (Toy Room)</option>
              <option value="gym_hardwood">Gym Hardwood with Court Lines</option>
              <option value="polished_concrete">Polished Concrete (Lab)</option>
              <option value="linoleum_blue">Linoleum Blue (Hallway / Gaming)</option>
              <option value="tile_white">Tile White (Atrium)</option>
            </select>
          </div>

          {/* Room Furnishing Quick Actions */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Auto-Furnish Room
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onFurnishRoom(selectedRoom.id, 'answer_chairs')}
                className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800/60 text-center text-blue-200 text-[10px] font-semibold transition-colors"
              >
                <Armchair className="w-3.5 h-3.5 mx-auto mb-1 text-blue-400" />
                Answer Chairs
              </button>
              <button
                type="button"
                onClick={() => onFurnishRoom(selectedRoom.id, 'theater')}
                className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-center text-rose-200 text-[10px] font-semibold transition-colors"
              >
                <Film className="w-3.5 h-3.5 mx-auto mb-1 text-rose-400" />
                Cinema Rows
              </button>
              <button
                type="button"
                onClick={() => onFurnishRoom(selectedRoom.id, 'lab')}
                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 text-center text-cyan-200 text-[10px] font-semibold transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5 mx-auto mb-1 text-cyan-400" />
                Science Lab
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onDeleteRoom(selectedRoom.id)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
