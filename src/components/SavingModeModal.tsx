import React, { useState, useRef } from 'react';
import { SchoolData, SaveSlot } from '../types';
import { 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Clock, 
  Trash2, 
  FolderOpen, 
  X, 
  HardDrive, 
  Sparkles, 
  Layers, 
  Plus,
  AlertCircle
} from 'lucide-react';
import { 
  getSaveSlots, 
  saveToSlot, 
  deleteSlot, 
  exportSchoolToFile, 
  parseSchoolFile 
} from '../utils/storage';

interface SavingModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolData: SchoolData;
  onLoadSchool: (newSchool: SchoolData) => void;
  onResetSchool: () => void;
  autoSaveEnabled: boolean;
  onToggleAutoSave: (enabled: boolean) => void;
  lastSavedTime: string | null;
}

export const SavingModeModal: React.FC<SavingModeModalProps> = ({
  isOpen,
  onClose,
  schoolData,
  onLoadSchool,
  onResetSchool,
  autoSaveEnabled,
  onToggleAutoSave,
  lastSavedTime,
}) => {
  const [slots, setSlots] = useState<SaveSlot[]>(() => getSaveSlots());
  const [newSlotName, setNewSlotName] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Save current school to a new or existing slot
  const handleSaveToSlot = (slotId?: string, defaultName?: string) => {
    try {
      const name = defaultName || newSlotName || `Dream School Save #${slots.length + 1}`;
      const updatedSlots = saveToSlot(name, schoolData, slotId);
      setSlots(updatedSlots);
      setNewSlotName('');
      showFeedback(`Saved "${name}" successfully!`, 'success');
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to save slot', 'error');
    }
  };

  // Delete a slot
  const handleDeleteSlot = (id: string, name: string) => {
    if (window.confirm(`Delete saved slot "${name}"?`)) {
      const updated = deleteSlot(id);
      setSlots(updated);
      showFeedback(`Slot "${name}" removed.`, 'success');
    }
  };

  // Load a slot
  const handleLoadSlot = (slot: SaveSlot) => {
    if (window.confirm(`Load saved school "${slot.name}"? Any unsaved changes in current session will be replaced.`)) {
      onLoadSchool(slot.data);
      showFeedback(`Loaded "${slot.name}" successfully!`, 'success');
      setTimeout(() => onClose(), 600);
    }
  };

  // Export current school as file
  const handleExport = () => {
    exportSchoolToFile(schoolData);
    showFeedback('Exported Dream School blueprint (.json) successfully!', 'success');
  };

  // Import school from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const importedData = parseSchoolFile(text);
        onLoadSchool(importedData);
        showFeedback(`Successfully loaded "${importedData.name}" from file!`, 'success');
        setTimeout(() => onClose(), 800);
      } catch (err: any) {
        showFeedback(err?.message || 'Failed to parse JSON file.', 'error');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      showFeedback('Error reading file from disk.', 'error');
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        id="saving-mode-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Dream School Saving Mode
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Local & File Storage
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manage your campus saves, export blueprints, or toggle auto-save.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div 
            className={`mx-6 mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium border ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/80 text-rose-300 border-rose-800'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Auto-Save Mode & Status */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Auto-Save Mode</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  autoSaveEnabled 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {autoSaveEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {autoSaveEnabled 
                  ? 'Automatically preserves school modifications in browser storage whenever you add or move items.'
                  : 'Manual saving only. Changes will not be saved automatically.'}
              </p>
              {lastSavedTime && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                  <Clock className="w-3 h-3" />
                  <span>Last auto-saved: {lastSavedTime}</span>
                </div>
              )}
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => onToggleAutoSave(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Section 2: Quick Save & Create Slot */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-blue-400" />
              Save Current Campus
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                placeholder="Enter save slot name (e.g. My Vietnamese Campus v2)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveToSlot()}
              />
              <button
                type="button"
                onClick={() => handleSaveToSlot()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Slot</span>
              </button>
            </div>
          </div>

          {/* Section 3: Saved Project Slots List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                Saved Campus Slots ({slots.length})
              </h3>
            </div>

            {slots.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-800/40 border border-dashed border-slate-700 text-xs text-slate-400">
                No custom save slots yet. Click &quot;Save Slot&quot; above to preserve your current design.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-white text-xs truncate">
                        {slot.name}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{slot.savedAt}</span>
                        <span>•</span>
                        <span>{slot.floorCount} Floors</span>
                        <span>•</span>
                        <span>{slot.roomCount} Rooms</span>
                        <span>•</span>
                        <span>{slot.itemCount} Items</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleLoadSlot(slot)}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        title="Overwrite with current campus"
                        onClick={() => handleSaveToSlot(slot.id, slot.name)}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg text-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete slot"
                        onClick={() => handleDeleteSlot(slot.id, slot.name)}
                        className="p-1.5 bg-slate-700 hover:bg-rose-900/60 text-rose-400 rounded-lg text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Blueprint File Import & Export */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              File Export & Import (Standalone Blueprint)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">Export Blueprint</div>
                  <div className="text-[10px] text-slate-400 font-normal">Download .json file</div>
                </div>
              </button>

              <button
                type="button"
                disabled={isImporting}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-bold">{isImporting ? 'Importing...' : 'Import Blueprint'}</div>
                  <div className="text-[10px] text-slate-400 font-normal">Upload .json file</div>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Section 5: Reset to Default Dream School */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-300">Restore Factory Blueprint</div>
              <div className="text-[11px] text-slate-500">Reset to initial 4-floor Dream School setup</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetSchool();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Dream School</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
