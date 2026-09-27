import React, { useState } from 'react';
import { Floor, SchoolData } from '../types';
import { Layers, Plus, Eye, EyeOff, Sliders, Building, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface FloorManagerProps {
  schoolData: SchoolData;
  activeFloorIndex: number;
  onSelectFloor: (index: number) => void;
  onAddFloor: () => void;
  isolateFloor: boolean;
  onToggleIsolate: () => void;
  explodedOffset: number;
  onChangeExplodedOffset: (val: number) => void;
  showCeiling: boolean;
  onToggleCeiling: () => void;
  showRoof?: boolean;
  onToggleRoof?: () => void;
  wallOpacity: number;
  onChangeWallOpacity: (val: number) => void;
}

export const FloorManager: React.FC<FloorManagerProps> = ({
  schoolData,
  activeFloorIndex,
  onSelectFloor,
  onAddFloor,
  isolateFloor,
  onToggleIsolate,
  explodedOffset,
  onChangeExplodedOffset,
  showCeiling,
  onToggleCeiling,
  showRoof = true,
  onToggleRoof,
  wallOpacity,
  onChangeWallOpacity,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-2 shadow-2xl flex items-center gap-3 text-xs">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
          <Building className="w-3.5 h-3.5 text-sky-400" />
          <span>Tầng:</span>
          <strong className="text-sky-300">
            {activeFloorIndex === 0 ? 'Tầng 1 (Ground)' : `Tầng ${activeFloorIndex + 1}`}
          </strong>
        </span>

        <div className="flex items-center gap-1">
          {schoolData.floors.map((floor, idx) => (
            <button
              key={floor.id}
              type="button"
              onClick={() => onSelectFloor(idx)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                idx === activeFloorIndex
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              T{idx + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
          title="Mở rộng bảng quản lý tầng"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>Chi tiết</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-col gap-3 text-xs">
      {/* Floor Selection Tabs Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
          <Building className="w-3.5 h-3.5 text-sky-400" />
          Campus Floors ({schoolData.floors.length})
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddFloor}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-[11px]"
          >
            <Plus className="w-3 h-3" />
            Add Floor
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
            title="Thu gọn bảng điều khiển tầng"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Thu gọn</span>
          </button>
        </div>
      </div>

      {/* Solo Floor Banner when isolated */}
      {isolateFloor && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-[11px]">
          <span className="flex items-center gap-1.5 font-medium">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            Solo Mode: <strong className="text-white font-bold">{schoolData.floors[activeFloorIndex]?.name || `Tầng ${activeFloorIndex + 1}`}</strong>
          </span>
          <button
            type="button"
            onClick={onToggleIsolate}
            className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[10px] transition-colors"
          >
            Show All Floors
          </button>
        </div>
      )}

      {/* Floor Buttons List */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {schoolData.floors.map((floor, idx) => {
          const isActive = idx === activeFloorIndex;
          const roomCount = schoolData.rooms.filter((r) => r.floorIndex === idx).length;
          const itemCount = schoolData.items.filter((i) => i.floorIndex === idx).length;

          return (
            <button
              key={floor.id}
              type="button"
              onClick={() => onSelectFloor(idx)}
              className={`flex flex-col text-left px-3 py-2 rounded-xl transition-all min-w-[124px] ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs">
                  {idx === 0 ? 'Tầng 1 (Ground)' : `Tầng ${idx + 1} (F${idx})`}
                </span>
                {isActive && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                {roomCount} rooms • {itemCount} items
              </span>
            </button>
          );
        })}
      </div>

      {/* Architectural Layer & Transparency Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
        {/* Isolate Active Floor */}
        <button
          type="button"
          onClick={onToggleIsolate}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            isolateFloor
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          {isolateFloor ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isolateFloor ? 'Solo Floor' : 'Stack All'}</span>
        </button>

        {/* Roof Toggle */}
        {onToggleRoof && (
          <button
            type="button"
            onClick={onToggleRoof}
            className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              showRoof
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <span>{showRoof ? 'Roof: On' : 'Roof: Off'}</span>
          </button>
        )}

        {/* Ceiling Toggle */}
        <button
          type="button"
          onClick={onToggleCeiling}
          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
            showCeiling
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
        >
          <span>{showCeiling ? 'Ceiling: On' : 'Open Top'}</span>
        </button>

        {/* Exploded View Slider */}
        <div className="flex flex-col gap-1 px-2 py-1 bg-slate-800/80 rounded-lg">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Explode</span>
            <span className="font-mono text-slate-200">{Math.round(explodedOffset * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={explodedOffset}
            onChange={(e) => onChangeExplodedOffset(parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Wall Opacity Slider */}
        <div className="flex flex-col gap-1 px-2 py-1 bg-slate-800/80 rounded-lg">
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>Walls</span>
            <span className="font-mono text-slate-200">{Math.round(wallOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="1.0"
            step="0.05"
            value={wallOpacity}
            onChange={(e) => onChangeWallOpacity(parseFloat(e.target.value))}
            className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
