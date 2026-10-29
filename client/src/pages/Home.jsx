import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Plus } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const { openNewTaskModal } = useTasks();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white">
            Good Evening,{' '}
            <span className="text-greeting-gradient">
              {user?.fullName || 'Achira Sandaruwan'}
            </span>
            !
          </h1>
          <p className="text-content-muted dark:text-gray-400 text-lg mt-1">
            Manage your daily tasks and keep track of your schedule.
          </p>
        </div>
      </div>

      <div className="bg-surface-light dark:bg-[#1A1D27] p-8 rounded-card border border-border-light dark:border-border-dark shadow-card text-center py-16">
        <p className="text-content-muted dark:text-gray-400 text-base">
          Home page content and widgets ready for Phase 5.
        </p>
        <button
          onClick={() => openNewTaskModal()}
          className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-5 py-2.5 rounded-xl shadow-btn-red"
        >
          <Plus className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
}
