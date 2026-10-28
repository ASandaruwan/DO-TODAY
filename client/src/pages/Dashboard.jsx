import { useTasks } from '../context/TaskContext';
import { Plus } from 'lucide-react';

export default function Dashboard() {
  const { openNewTaskModal } = useTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white">
            Task Dashboard
          </h1>
          <p className="text-content-muted dark:text-gray-400 text-lg mt-1">
            Track, prioritize, and manage all your project goals in one place.
          </p>
        </div>
      </div>

      <div className="bg-surface-light dark:bg-[#1A1D27] p-8 rounded-card border border-border-light dark:border-border-dark shadow-card text-center py-16">
        <p className="text-content-muted dark:text-gray-400 text-base">
          Dashboard views (Kanban, List, Timeline) ready for Phase 6.
        </p>
        <button
          onClick={() => openNewTaskModal()}
          className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-xl shadow-btn-red"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
}
