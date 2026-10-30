import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function TimelineView() {
  const { tasks, openEditTaskModal, openNewTaskModal, resetFilters } = useTasks();

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const timelineScrollRef = useRef(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in current month
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const monthName = useMemo(() => {
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentDate]);

  const today = useMemo(() => new Date(), []);
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;
  const todayDayNumber = today.getDate();

  // Array of day objects for the current month
  const daysArray = useMemo(() => {
    const arr = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      arr.push({
        dayNumber: day,
        dayOfWeek,
        dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        isToday: isCurrentMonthToday && day === todayDayNumber,
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
    return arr;
  }, [year, month, daysInMonth, isCurrentMonthToday, todayDayNumber]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  // Scroll to today if in current month
  useEffect(() => {
    if (isCurrentMonthToday && timelineScrollRef.current) {
      const dayWidth = 44; // cell width
      const targetScroll = Math.max(0, (todayDayNumber - 4) * dayWidth);
      timelineScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [isCurrentMonthToday, todayDayNumber]);

  // Calculate bar position for each task
  const taskTimelineData = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    const monthStart = new Date(year, month, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, daysInMonth, 23, 59, 59, 999);

    return tasks.map((task) => {
      // Determine effective start and end dates
      const taskStart = task.startDate
        ? new Date(task.startDate)
        : task.dueDate
        ? new Date(task.dueDate)
        : task.createdAt
        ? new Date(task.createdAt)
        : new Date();

      const taskEnd = task.dueDate
        ? new Date(task.dueDate)
        : task.startDate
        ? new Date(task.startDate)
        : new Date(taskStart);

      // Normalize time
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(23, 59, 59, 999);

      // Check if task intersects with the visible month
      const isVisibleInMonth = taskStart <= monthEnd && taskEnd >= monthStart;

      let startDay = 1;
      let endDay = 1;
      let durationDays = 1;

      if (isVisibleInMonth) {
        // Clamp to current month boundaries
        const clampedStart = taskStart < monthStart ? 1 : taskStart.getDate();
        const clampedEnd = taskEnd > monthEnd ? daysInMonth : taskEnd.getDate();

        startDay = clampedStart;
        endDay = Math.max(clampedStart, clampedEnd);
        durationDays = Math.max(1, Math.round((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1);
      }

      return {
        task,
        isVisibleInMonth,
        startDay,
        endDay,
        durationDays,
        spanCols: endDay - startDay + 1,
      };
    });
  }, [tasks, year, month, daysInMonth]);

  const statusStyles = {
    pending: {
      bar: 'bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500/40',
      badge: 'bg-[#FFF3DD] text-[#B7791F]',
      label: 'Pending',
    },
    'in-progress': {
      bar: 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-600/40',
      badge: 'bg-[#EAF2FF] text-[#2563EB]',
      label: 'In Progress',
    },
    completed: {
      bar: 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600/40',
      badge: 'bg-[#EFEEDC] text-[#8A9A2B]',
      label: 'Completed',
    },
  };

  const priorityStyles = {
    low: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200',
    medium: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200',
    high: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200',
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1A1D27] rounded-[20px] p-12 border border-border-light dark:border-border-dark shadow-card text-center">
        <div className="w-16 h-16 rounded-full bg-primary-soft dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-1">
          No tasks to display in Timeline
        </h3>
        <p className="text-content-muted dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
          Adjust your filters or create a new task to view project schedule.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-border-light dark:border-border-dark text-content-strong dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Clear Filters
          </button>
          <button
            type="button"
            onClick={() => openNewTaskModal()}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-btn-red transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1D27] rounded-[20px] border border-border-light dark:border-border-dark shadow-card dark:shadow-card-dark overflow-hidden transition-colors">
      {/* Top Controls: Month Nav & Legend */}
      <div className="p-5 sm:p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F1F3F7] dark:bg-[#13151F] rounded-xl p-1 border border-border-light/60 dark:border-border-dark">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-content-muted dark:text-gray-400 hover:text-content-strong dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1D27] transition-all"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-outfit font-bold text-base sm:text-lg text-content-strong dark:text-white px-3 min-w-[150px] text-center select-none">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-content-muted dark:text-gray-400 hover:text-content-strong dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1D27] transition-all"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToday}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isCurrentMonthToday
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'border-border-light dark:border-border-dark text-content-strong dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Today
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-content-muted dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-2xs" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-2xs" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-2xs" />
            <span>Completed</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Grid Area */}
      <div className="flex flex-col lg:flex-row overflow-hidden">
        {/* Left Fixed Column: Task Titles */}
        <div className="w-full lg:w-[280px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border-light dark:border-border-dark bg-[#FAFAFA] dark:bg-[#151722]/80">
          {/* Header */}
          <div className="h-[60px] px-5 flex items-center border-b border-border-light dark:border-border-dark font-semibold text-xs text-content-muted dark:text-gray-400 uppercase tracking-wider">
            Tasks ({tasks.length})
          </div>

          {/* Task rows */}
          <div className="divide-y divide-border-light/60 dark:divide-border-dark/60">
            {taskTimelineData.map(({ task }) => (
              <div
                key={task._id}
                onClick={() => openEditTaskModal(task)}
                className="h-[54px] px-5 flex items-center justify-between gap-3 hover:bg-[#FAF9F5] dark:hover:bg-[#1F2330]/50 cursor-pointer transition-colors"
                title={`Click to edit: ${task.title}`}
              >
                <span className="font-outfit font-semibold text-sm text-content-strong dark:text-white truncate flex-1">
                  {task.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${
                    priorityStyles[task.priority] || priorityStyles.medium
                  }`}
                >
                  {task.priority || 'medium'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Horizontally Scrollable Days & Gantt Bars Area */}
        <div ref={timelineScrollRef} className="flex-1 overflow-x-auto relative">
          <div style={{ minWidth: `${daysInMonth * 44}px` }} className="relative">
            {/* Days Header Row */}
            <div className="h-[60px] flex border-b border-border-light dark:border-border-dark bg-[#FAFAFA] dark:bg-[#151722]/80">
              {daysArray.map((day) => (
                <div
                  key={day.dayNumber}
                  style={{ width: '44px' }}
                  className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-border-light/40 dark:border-border-dark/40 ${
                    day.isToday
                      ? 'bg-primary-soft/60 dark:bg-primary/20'
                      : day.isWeekend
                      ? 'bg-gray-50/50 dark:bg-[#13151F]/40'
                      : ''
                  }`}
                >
                  <span className="text-[10px] font-medium text-content-muted dark:text-gray-400">
                    {day.dayOfWeek}
                  </span>
                  <span
                    className={`text-xs font-bold mt-0.5 ${
                      day.isToday
                        ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-xs'
                        : 'text-content-strong dark:text-gray-200'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                </div>
              ))}
            </div>

            {/* Today Vertical Line Marker */}
            {isCurrentMonthToday && (
              <div
                style={{
                  left: `${(todayDayNumber - 1) * 44 + 22}px`,
                  top: 0,
                  bottom: 0,
                }}
                className="absolute z-20 pointer-events-none flex flex-col items-center"
              >
                <div className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm mt-0.5 uppercase tracking-wider">
                  Today
                </div>
                <div className="w-[2px] flex-1 bg-primary/70 shadow-sm" />
              </div>
            )}

            {/* Task Bars Rows */}
            <div className="divide-y divide-border-light/60 dark:divide-border-dark/60 relative">
              {taskTimelineData.map(({ task, isVisibleInMonth, startDay, durationDays, spanCols }) => {
                const style = statusStyles[task.status] || statusStyles.pending;

                return (
                  <div
                    key={task._id}
                    className="h-[54px] relative flex items-center hover:bg-[#FAF9F5] dark:hover:bg-[#1F2330]/30 transition-colors"
                  >
                    {/* Day background grid cells */}
                    <div className="absolute inset-0 flex pointer-events-none">
                      {daysArray.map((day) => (
                        <div
                          key={day.dayNumber}
                          style={{ width: '44px' }}
                          className={`flex-shrink-0 h-full border-r border-border-light/25 dark:border-border-dark/25 ${
                            day.isToday
                              ? 'bg-primary-soft/20 dark:bg-primary/5'
                              : day.isWeekend
                              ? 'bg-gray-50/30 dark:bg-[#13151F]/20'
                              : ''
                          }`}
                        />
                      ))}
                    </div>

                    {/* Timeline Bar */}
                    {isVisibleInMonth ? (
                      <div
                        onClick={() => openEditTaskModal(task)}
                        style={{
                          left: `${(startDay - 1) * 44 + 4}px`,
                          width: `${Math.max(36, spanCols * 44 - 8)}px`,
                        }}
                        className={`absolute z-10 h-8 rounded-lg px-2.5 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md ${style.bar}`}
                        title={`${task.title}\nStatus: ${task.status}\nDue: ${
                          task.dueDate ? formatDisplayDate(task.dueDate) : 'No due date'
                        }`}
                      >
                        <span className="font-outfit font-semibold text-xs truncate">
                          {task.title}
                        </span>
                        {spanCols > 1 && (
                          <span className="text-[10px] opacity-80 whitespace-nowrap ml-1 font-medium">
                            {durationDays}d
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="px-6 text-xs text-content-muted dark:text-gray-500 italic">
                        Scheduled outside {monthName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
