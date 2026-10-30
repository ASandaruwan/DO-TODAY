import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import ViewSwitcher from '../components/dashboard/ViewSwitcher';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskList from '../components/list/TaskList';
import TimelineView from '../components/timeline/TimelineView';
import Toast from '../components/ui/Toast';

export default function Dashboard() {
  const { openNewTaskModal } = useTasks();

  // Selected view persisted in localStorage (default: 'kanban' matching 02-dashboard-kanban.png)
  const [activeView, setActiveView] = useState(() => {
    const saved = localStorage.getItem('dt_view');
    return ['list', 'kanban', 'timeline'].includes(saved) ? saved : 'kanban';
  });

  const [toast, setToast] = useState({ message: '', type: 'info' });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ message: '', type: 'info' });
  }, []);

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    localStorage.setItem('dt_view', viewId);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-in fade-in duration-300">
      {/* 1. Header Row matching 02-dashboard-kanban.png */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white tracking-tight">
            Task Dashboard
          </h1>
          <p className="text-content-muted dark:text-gray-400 text-base sm:text-lg mt-1 font-normal">
            Track, prioritize, and manage all your project goals in one place.
          </p>
        </div>

        {/* Right Actions: View Switcher + New Task Button */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-start md:self-auto">
          {/* View switcher segmented control */}
          <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />

          {/* Large primary + New Task button */}
          <button
            type="button"
            onClick={() => openNewTaskModal()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 sm:px-6 py-2.5 rounded-xl shadow-btn-red text-sm sm:text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* 2. Filters Card */}
      <DashboardFilters />

      {/* 3. Multi-View Area (Kanban / List / Timeline) */}
      <div className="transition-all duration-200">
        {activeView === 'kanban' && <KanbanBoard onShowToast={showToast} />}
        {activeView === 'list' && <TaskList onShowToast={showToast} />}
        {activeView === 'timeline' && <TimelineView onShowToast={showToast} />}
      </div>

      {/* Toast notifications */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
