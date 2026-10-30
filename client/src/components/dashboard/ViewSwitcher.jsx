import { List, Kanban, BarChartHorizontal } from 'lucide-react';

const VIEWS = [
  { id: 'list', label: 'List', icon: List },
  { id: 'kanban', label: 'Kanban', icon: Kanban },
  { id: 'timeline', label: 'Timeline', icon: BarChartHorizontal },
];

export default function ViewSwitcher({ activeView, onViewChange }) {
  return (
    <div
      role="tablist"
      aria-label="Dashboard view switcher"
      className="inline-flex items-center p-1 bg-[#EEF1F6] dark:bg-[#13151F] rounded-xl border border-border-light/50 dark:border-border-dark/60 shadow-xs"
    >
      {VIEWS.map((view) => {
        const Icon = view.icon;
        const isActive = activeView === view.id;

        return (
          <button
            key={view.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(view.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white dark:bg-[#1A1D27] text-primary font-semibold shadow-sm'
                : 'text-content-muted dark:text-gray-400 hover:text-content-strong dark:hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-current'}`} />
            <span>{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}
