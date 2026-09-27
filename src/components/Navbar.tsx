import React from 'react';
import { SchoolData, ViewMode } from '../types';
import { 
  Building2, 
  Sparkles, 
  PlusCircle, 
  Eye, 
  Bot, 
  Film, 
  Armchair, 
  BarChart3, 
  RotateCcw,
  SlidersHorizontal,
  Save,
  HardDrive
} from 'lucide-react';

interface NavbarProps {
  schoolData: SchoolData;
  activeFloorIndex: number;
  viewMode: ViewMode;
  onOpenArchitect: () => void;
  onOpenCatalog: () => void;
  onResetSchool: () => void;
  onOpenStats: () => void;
  onOpenSavingMode: () => void;
  autoSaveEnabled: boolean;
  isSaving?: boolean;
  hideTelemetry: boolean;
  onToggleHideTelemetry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  schoolData,
  activeFloorIndex,
  viewMode,
  onOpenArchitect,
  onOpenCatalog,
  onResetSchool,
  onOpenStats,
  onOpenSavingMode,
  autoSaveEnabled,
  isSaving,
  hideTelemetry,
  onToggleHideTelemetry,
}) => {
  // Compute campus metrics
  const massageChairsCount = schoolData.items.filter((i) => i.type === 'massage_chair').length;
  const answerChairsCount = schoolData.items.filter((i) => i.type === 'answer_chair').length;
  const cinemaSeatsCount = schoolData.items.filter((i) => i.type === 'cinema_chair').length;
  const totalChairs = massageChairsCount || (answerChairsCount + cinemaSeatsCount);
  const hasPool = schoolData.rooms.some((r) => r.id === 'room_swimming_pool');
  const hasCanteen = schoolData.rooms.some((r) => r.id === 'room_canteen');
  const hasBadminton = schoolData.rooms.some((r) => r.id === 'room_badminton_court');

  return (
    <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Name */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-white tracking-tight">
              {schoolData.name || 'Dream School'}
            </h1>
            <span className="text-[10px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-semibold">
              3D Dream Campus Studio
            </span>
          </div>
          {!hideTelemetry && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Tầng {activeFloorIndex === 0 ? '1' : activeFloorIndex + 1}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Armchair className="w-3 h-3 text-emerald-400" />
                {massageChairsCount} Ghế Mát-Xa 4D VIP
              </span>
              {hasPool && (
                <>
                  <span>•</span>
                  <span className="text-cyan-400 font-medium hidden md:inline">🏊 Bể Bơi</span>
                </>
              )}
              {hasCanteen && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-medium hidden md:inline">🍽️ Căng Tin</span>
                </>
              )}
              {hasBadminton && (
                <>
                  <span>•</span>
                  <span className="text-lime-400 font-medium hidden lg:inline">🏸 Cầu Lông</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center gap-2">
        {/* Hide/Show Telemetry & HUD Toggle Button */}
        <button
          id="toggle-telemetry-btn"
          type="button"
          onClick={onToggleHideTelemetry}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
            hideTelemetry
              ? 'bg-amber-500/25 border-amber-500/60 text-amber-200 hover:bg-amber-500/35 ring-1 ring-amber-400/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
          }`}
          title={hideTelemetry ? 'Hiện lại tất cả thông số & HUD (Phím H)' : 'Ẩn thông số & bảng điều khiển để nhìn thoáng toàn màn hình (Phím H)'}
        >
          {hideTelemetry ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
          <span>{hideTelemetry ? 'Hiện Chỉ Số' : 'Ẩn Chỉ Số'}</span>
          <kbd className="hidden sm:inline px-1 py-0.2 bg-slate-950/60 rounded text-[9px] font-mono text-slate-400">H</kbd>
        </button>
        {/* Saving Mode Button */}
        <button
          id="open-save-mode-btn"
          type="button"
          onClick={onOpenSavingMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 hover:text-white text-xs font-semibold shadow-sm transition-all"
          title="Open Saving Mode: Auto-save, save slots, export/import JSON"
        >
          <Save className={`w-3.5 h-3.5 text-emerald-400 ${isSaving ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Save Mode</span>
          {autoSaveEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" title="Auto-save enabled" />
          )}
        </button>

        {/* Open Catalog */}
        <button
          id="open-catalog-btn"
          type="button"
          onClick={onOpenCatalog}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Add Object</span>
        </button>

        {/* Campus Analytics / Specs */}
        <button
          id="open-stats-btn"
          type="button"
          onClick={onOpenStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition-all"
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Campus Specs</span>
        </button>

        {/* Reset Default Campus */}
        <button
          id="reset-campus-btn"
          type="button"
          onClick={onResetSchool}
          title="Reset to default multi-floor school"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Primary AI Architect Button */}
        <button
          id="open-architect-btn"
          type="button"
          onClick={onOpenArchitect}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Bot className="w-4 h-4 text-sky-200" />
          <span>AI Architect</span>
          <span className="bg-white/20 text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
            New
          </span>
        </button>
      </div>
    </header>
  );
};
