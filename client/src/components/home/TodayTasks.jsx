import React, { useState, useMemo } from 'react';
import { Plus, ListFilter } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import TaskCard from '../tasks/TaskCard';
import { isTaskForDate, formatDisplayDate } from '../../utils/dateUtils';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export default function TodayTasks() {
  const { tasks, selectedDate, openNewTaskModal, loading } = useTasks();
  const [activeTab, setActiveTab] = useState('all');

  // Filter tasks for the selected date & active status tab
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    return tasks.filter((task) => {
      // 1. Must match selected date
      const dateMatches = isTaskForDate(task, selectedDate);
      if (!dateMatches) return false;

      // 2. Must match status tab
      if (activeTab === 'all') return true;
      return task.status === activeTab;
    });
  }, [tasks, selectedDate, activeTab]);

  return (
    <div className="space-y-4">
      {/* Header Row: Title & Status Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-outfit font-bold text-2xl sm:text-[28px] text-content-strong dark:text-white tracking-tight">
            Today's Tasks
          </h2>
        </div>

        {/* Segmented Filter Tab Control */}
        <div className="inline-flex items-center p-1 bg-[#F1F3F7] dark:bg-[#13151F] rounded-xl self-start sm:self-auto border border-border-light/40 dark:border-border-dark/60">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-[#1A1D27] text-primary font-semibold shadow-sm'
                    : 'text-content-muted dark:text-gray-400 hover:text-content-strong dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Area */}
      {loading && filteredTasks.length === 0 ? (
        <div className="bg-surface-light dark:bg-[#1A1D27] rounded-[20px] p-12 text-center border border-border-light dark:border-border-dark min-h-[260px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State with dashed/dotted border matching 03-home.png */
        <div className="border-2 border-dashed border-[#E5E7EB] dark:border-[#2A2E3B] bg-surface-light dark:bg-[#1A1D27] rounded-[20px] px-6 py-14 sm:py-16 text-center flex flex-col items-center justify-center min-h-[260px] transition-colors">
          <p className="text-content-muted dark:text-gray-400 text-[16px] max-w-md font-normal leading-relaxed mb-6">
            No tasks scheduled for this date matching the current filters.
          </p>

          <button
            type="button"
            onClick={() => openNewTaskModal(selectedDate)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl shadow-btn-red text-base transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>
      ) : (
        /* Populated Task List */
        <div className="space-y-3">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => openNewTaskModal(selectedDate)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark bg-primary-soft dark:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Task</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

