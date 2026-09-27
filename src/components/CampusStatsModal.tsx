import React from 'react';
import { SchoolData } from '../types';
import { 
  Building2, 
  Armchair, 
  Film, 
  FlaskConical, 
  BookOpen, 
  Trophy, 
  Download, 
  Upload, 
  CheckCircle,
  X
} from 'lucide-react';

interface CampusStatsModalProps {
  schoolData: SchoolData;
  isOpen: boolean;
  onClose: () => void;
  onImportSchool: (data: SchoolData) => void;
}

export const CampusStatsModal: React.FC<CampusStatsModalProps> = ({
  schoolData,
  isOpen,
  onClose,
  onImportSchool,
}) => {
  if (!isOpen) return null;

  const totalAnswerChairs = schoolData.items.filter((i) => i.type === 'answer_chair').length;
  const totalCinemaChairs = schoolData.items.filter((i) => i.type === 'cinema_chair').length;
  const totalLabBenches = schoolData.items.filter((i) => i.type === 'lab_bench').length;
  const totalBookshelves = schoolData.items.filter((i) => i.type === 'bookshelf').length;
  const totalCapacity = schoolData.rooms.reduce((acc, r) => acc + (r.capacity || 20), 0);

  // Handle Export Blueprint
  const handleExport = () => {
    const jsonStr = JSON.stringify(schoolData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schoolData.name.toLowerCase().replace(/\s+/g, '_')}_blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Import Blueprint
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.floors && parsed.rooms && parsed.items) {
          onImportSchool(parsed);
          onClose();
        }
      } catch (err) {
        alert('Invalid blueprint JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{schoolData.name} Blueprint Specs</h3>
              <p className="text-xs text-slate-400">Campus architectural metrics & educational capacity</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Armchair className="w-3.5 h-3.5 text-blue-400" />
              Answer Chairs
            </span>
            <span className="text-2xl font-bold text-blue-300 font-mono">{totalAnswerChairs}</span>
            <span className="text-[10px] text-slate-400">Active learning desks</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              Film Cinema Seats
            </span>
            <span className="text-2xl font-bold text-rose-300 font-mono">{totalCinemaChairs}</span>
            <span className="text-[10px] text-slate-400">Tiered theater seats</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              Science Stations
            </span>
            <span className="text-2xl font-bold text-cyan-300 font-mono">{totalLabBenches * 4}</span>
            <span className="text-[10px] text-slate-400">Student experiment seats</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
              <Building2 className="w-3.5 h-3.5 text-purple-400" />
              Total Enrollment
            </span>
            <span className="text-2xl font-bold text-purple-300 font-mono">{totalCapacity}</span>
            <span className="text-[10px] text-slate-400">Simultaneous students</span>
          </div>
        </div>

        {/* Floor-by-Floor Breakdown Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Campus Floors Distribution
          </h4>
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-800/60 text-slate-400 text-[11px]">
                <tr>
                  <th className="p-3">Floor Level</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">Rooms</th>
                  <th className="p-3">Objects</th>
                  <th className="p-3 text-right">Floor Elevation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {schoolData.floors.map((fl) => {
                  const roomsOnFloor = schoolData.rooms.filter((r) => r.floorIndex === fl.level);
                  const itemsOnFloor = schoolData.items.filter((i) => i.floorIndex === fl.level);
                  return (
                    <tr key={fl.id} className="hover:bg-slate-800/30">
                      <td className="p-3 font-semibold text-white">Floor {fl.level}</td>
                      <td className="p-3 text-slate-300">{fl.name}</td>
                      <td className="p-3 font-mono text-sky-400">{roomsOnFloor.length} rooms</td>
                      <td className="p-3 font-mono text-indigo-400">{itemsOnFloor.length} items</td>
                      <td className="p-3 text-right font-mono text-slate-400">+{fl.elevation.toFixed(1)}m</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export / Import Blueprint */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export 3D Blueprint (.json)
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              Import Blueprint
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
};
