import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import {
  getMonthCalendarDays,
  toISODateString,
  isTaskForDate,
} from '../../utils/dateUtils';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function MiniCalendar() {
  const { selectedDate, setSelectedDate, tasks } = useTasks();

  const todayIso = useMemo(() => toISODateString(new Date()), []);
  const initialDate = useMemo(() => {
    // If selectedDate is valid, use its year & month, otherwise use current
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      if (y && m) return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, [selectedDate]);

  const [currentYear, setCurrentYear] = useState(initialDate.year);
  const [currentMonth, setCurrentMonth] = useState(initialDate.month);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(todayIso);
  };

  // Calendar days grid
  const days = useMemo(() => {
    return getMonthCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Map of which dates have tasks for indicator dots
  const taskDatesMap = useMemo(() => {
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) return {};
    const map = {};
    for (const d of days) {
      if (d && d.dateString) {
        const hasTask = tasks.some((t) => isTaskForDate(t, d.dateString));
        if (hasTask) {
          map[d.dateString] = true;
        }
      }
    }
    return map;
  }, [tasks, days]);

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h2 className="font-outfit font-bold text-2xl sm:text-[28px] text-content-strong dark:text-white tracking-tight">
        Calendar
      </h2>

      {/* Calendar Card matching 03-home.png */}
      <div className="bg-surface-light dark:bg-[#1A1D27] rounded-[20px] p-6 border border-border-light dark:border-border-dark shadow-card">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between mb-1">
          <button
            type="button"
            onClick={prevMonth}
            aria-label="Previous Month"
            className="p-2 rounded-xl text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Next Month"
            className="p-2 rounded-xl text-content-muted hover:text-content-strong dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Red "Today" action label centered under month */}
        <div className="text-center mb-4">
          <button
            type="button"
            onClick={jumpToToday}
            className="text-primary hover:text-primary-dark dark:hover:text-red-400 text-xs font-semibold hover:underline transition-colors focus:outline-none"
          >
            Today
          </button>
        </div>

        {/* Weekday Row */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="text-xs font-semibold text-content-muted dark:text-gray-400 py-1.5"
            >
              {weekday}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1.5 justify-items-center text-center">
          {days.map((item, index) => {
            if (!item) {
              return <div key={`empty-${index}`} className="w-10 h-10" />;
            }

            const isToday = item.dateString === todayIso;
            const isSelected = item.dateString === selectedDate;
            const hasTasks = taskDatesMap[item.dateString];

            // Styling based on state
            let cellStyle =
              'text-content-strong dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800';
            let dotColor = 'bg-primary';

            if (isToday) {
              cellStyle = 'bg-primary text-white font-bold shadow-btn-red';
              dotColor = 'bg-white';
            } else if (isSelected) {
              cellStyle =
                'bg-primary-soft dark:bg-primary/25 text-primary font-bold border border-primary/30';
              dotColor = 'bg-primary';
            }

            return (
              <button
                key={item.dateString}
                type="button"
                onClick={() => setSelectedDate(item.dateString)}
                className={`relative w-10 h-10 rounded-[12px] flex flex-col items-center justify-center text-sm transition-all focus:outline-none ${cellStyle}`}
              >
                <span className="leading-none">{item.day}</span>

                {/* Dot indicator under day number */}
                {hasTasks && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${dotColor}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

