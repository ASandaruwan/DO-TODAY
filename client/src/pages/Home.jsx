import { useMemo, useEffect } from 'react';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import StatCard from '../components/home/StatCard';
import TodayTasks from '../components/home/TodayTasks';
import MiniCalendar from '../components/home/MiniCalendar';
import { getGreeting, formatHeaderDate } from '../utils/dateUtils';

export default function Home() {
  const { user } = useAuth();
  const { stats, filters, resetFilters } = useTasks();

  // Reset filters if navigating back from Dashboard so calendar & Today's tasks aren't restricted
  useEffect(() => {
    if (filters.q || filters.status || filters.priority || filters.from || filters.to) {
      resetFilters();
    }
  }, [filters, resetFilters]);

  const greeting = useMemo(() => getGreeting(), []);
  const todayFormatted = useMemo(() => formatHeaderDate(new Date()), []);

  const displayName = user?.fullName || 'Achira Sandaruwan';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Row matching 03-home.png */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white tracking-tight">
            {greeting},{' '}
            <span className="text-greeting-gradient">{displayName}</span>!
          </h1>
          <p className="text-content-muted dark:text-gray-400 text-base sm:text-lg mt-1 font-normal">
            Manage your daily tasks and keep track of your schedule.
          </p>
        </div>

        {/* Date Chip Pill */}
        <div className="self-start sm:self-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-surface-light dark:bg-[#1A1D27] border border-border-light dark:border-border-dark shadow-sm">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base text-content-strong dark:text-gray-200">
            {todayFormatted}
          </span>
        </div>
      </div>

      {/* 2. Three Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Active Tasks Card */}
        <StatCard
          title="Active Tasks"
          value={stats?.active ?? 0}
          icon={ClipboardList}
          borderColor="border-l-stat-red"
          tileBg="bg-primary-soft dark:bg-primary/20"
          iconColor="text-primary"
        />

        {/* Pending / In Progress Card */}
        <StatCard
          title="Pending / In Progress"
          value={stats?.pendingInProgress ?? 0}
          icon={Clock}
          borderColor="border-l-stat-amber"
          tileBg="bg-[#FFF3DD] dark:bg-amber-950/30"
          iconColor="text-[#B7791F] dark:text-[#F5C46B]"
        />

        {/* Completed Card */}
        <StatCard
          title="Completed"
          value={stats?.completed ?? 0}
          icon={CheckCircle2}
          borderColor="border-l-stat-olive"
          tileBg="bg-[#EFEEDC] dark:bg-emerald-950/30"
          iconColor="text-[#8A9A2B] dark:text-emerald-400"
        />
      </div>

      {/* 3. Two-Column Area: Today's Tasks & Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Today's Tasks (~65% width) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <TodayTasks />
        </div>

        {/* Right Column: Calendar (~35% width) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <MiniCalendar />
        </div>
      </div>
    </div>
  );
}
