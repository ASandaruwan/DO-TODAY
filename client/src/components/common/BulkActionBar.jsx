import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function BulkActionBar({
  selectedCount = 0,
  onUpdateStatus,
  onDelete,
  onDeselectAll,
  loading = false,
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-full px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#1C1F2E]/95 dark:bg-[#11131B]/95 backdrop-blur-md text-white px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-white/10 flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Selection Count Pill */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold font-outfit text-white">
            {selectedCount}
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-wide whitespace-nowrap">
            {selectedCount === 1 ? '1 task selected' : `${selectedCount} tasks selected`}
          </span>
        </div>

        <div className="h-4 w-px bg-white/20 hidden sm:block" />

        {/* Normal Action Buttons vs Delete Confirmation */}
        {!showConfirmDelete ? (
          <>
            {/* Status Change Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-gray-400 uppercase font-semibold hidden md:inline mr-1">
                Set status:
              </span>

              {/* Set Pending */}
              <button
                type="button"
                disabled={loading}
                onClick={() => onUpdateStatus('pending')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
                title="Mark selected tasks as Pending"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Pending</span>
              </button>

              {/* Set In Progress */}
              <button
                type="button"
                disabled={loading}
                onClick={() => onUpdateStatus('in-progress')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
                title="Mark selected tasks as In Progress"
              >
                <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                <span>In Progress</span>
              </button>

              {/* Set Completed */}
              <button
                type="button"
                disabled={loading}
                onClick={() => onUpdateStatus('completed')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-xs font-medium transition-colors disabled:opacity-50"
                title="Mark selected tasks as Completed"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Completed</span>
              </button>
            </div>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            {/* Bulk Delete Trigger */}
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Delete all selected tasks"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </>
        ) : (
          /* Delete Confirmation State */
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-red-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Delete {selectedCount} tasks?</span>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                await onDelete();
                setShowConfirmDelete(false);
              }}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Yes, Delete</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowConfirmDelete(false)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-white/20 hidden sm:block" />

        {/* Deselect All / Close */}
        <button
          type="button"
          onClick={onDeselectAll}
          className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
