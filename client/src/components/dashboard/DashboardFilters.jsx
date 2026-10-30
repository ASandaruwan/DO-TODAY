import { useState, useEffect } from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';

export default function DashboardFilters() {
  const { filters, setFilters, resetFilters } = useTasks();
  const [searchTerm, setSearchTerm] = useState(filters.q || '');

  // Keep local search in sync if filters are reset externally
  useEffect(() => {
    setSearchTerm(filters.q || '');
  }, [filters.q]);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if ((filters.q || '') !== searchTerm.trim()) {
        setFilters((prev) => ({ ...prev, q: searchTerm.trim() }));
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchTerm, filters.q, setFilters]);

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handlePriorityChange = (e) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handleFromDateChange = (e) => {
    setFilters((prev) => ({ ...prev, from: e.target.value }));
  };

  const handleToDateChange = (e) => {
    setFilters((prev) => ({ ...prev, to: e.target.value }));
  };

  const hasActiveFilters = Boolean(
    (filters.q && filters.q.trim()) ||
    filters.status ||
    filters.priority ||
    filters.from ||
    filters.to
  );

  const inputBaseStyle =
    'w-full h-[50px] px-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-[#13151F] text-content-strong dark:text-white placeholder-content-muted dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm sm:text-base transition-colors shadow-2xs';

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-[20px] p-6 sm:p-7 border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark transition-colors">
      {/* Filters Title Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <Filter className="w-5 h-5 text-primary stroke-[2.2]" />
          <h2 className="font-outfit font-semibold text-lg text-content-strong dark:text-white">
            Filters
          </h2>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              resetFilters();
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary-soft dark:hover:bg-primary/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* 5 Form Controls in 1 Row (wrapping responsively) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-5">
        {/* 1. Search tasks... with leading search icon */}
        <div className="relative">
          <Search className="w-4 h-4 text-content-muted dark:text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className={`${inputBaseStyle} pl-11`}
          />
        </div>

        {/* 2. Status dropdown */}
        <div className="relative">
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            aria-label="Filter by status"
            className={`${inputBaseStyle} cursor-pointer appearance-none pr-10`}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-content-muted dark:text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* 3. Priority dropdown */}
        <div className="relative">
          <select
            value={filters.priority || ''}
            onChange={handlePriorityChange}
            aria-label="Filter by priority"
            className={`${inputBaseStyle} cursor-pointer appearance-none pr-10`}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-content-muted dark:text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>

        {/* 4. Date input - From */}
        <div className="relative">
          <input
            type="date"
            value={filters.from || ''}
            onChange={handleFromDateChange}
            aria-label="Filter by from date"
            className={`${inputBaseStyle} dark:[color-scheme:dark] cursor-pointer`}
          />
        </div>

        {/* 5. Date input - To */}
        <div className="relative">
          <input
            type="date"
            value={filters.to || ''}
            onChange={handleToDateChange}
            aria-label="Filter by to date"
            className={`${inputBaseStyle} dark:[color-scheme:dark] cursor-pointer`}
          />
        </div>
      </div>
    </div>
  );
}
