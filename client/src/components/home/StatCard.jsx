export default function StatCard({ title, value, icon: Icon, borderColor, tileBg, iconColor }) {
  return (
    <div
      className={`bg-surface-light dark:bg-[#1A1D27] rounded-[20px] p-6 border border-border-light dark:border-border-dark shadow-card flex items-center gap-5 transition-transform hover:-translate-y-0.5 duration-200 border-l-4 ${borderColor}`}
    >
      {/* Tinted Icon Tile: 60x60px */}
      <div
        className={`w-[60px] h-[60px] rounded-[16px] flex items-center justify-center flex-shrink-0 ${tileBg}`}
      >
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>

      {/* Label and Big Bold Value */}
      <div className="flex flex-col">
        <span className="text-content-muted dark:text-gray-400 text-[16px] font-medium tracking-tight">
          {title}
        </span>
        <span className="font-outfit font-bold text-3xl sm:text-[34px] leading-tight text-content-strong dark:text-white mt-1">
          {value ?? 0}
        </span>
      </div>
    </div>
  );
}

