// Helper utilities for date handling and greeting

/**
 * Returns greeting based on time of day:
 * Morning: 05:00–11:59
 * Afternoon: 12:00–16:59
 * Evening: 17:00–04:59
 */
export function getGreeting(date = new Date()) {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'Good Morning';
  }
  if (hours >= 12 && hours < 17) {
    return 'Good Afternoon';
  }
  return 'Good Evening';
}

/**
 * Format a Date object to YYYY-MM-DD local string
 */
export function toISODateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for header pill chip: "Monday, Sep 14, 2026"
 */
export function formatHeaderDate(date = new Date()) {
  const d = typeof date === 'string' && date.includes('-') && !date.includes('T')
    ? parseLocalISODate(date)
    : new Date(date);

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date for display in cards or chips: "Sep 14, 2026"
 */
export function formatDisplayDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' && date.includes('-') && !date.includes('T')
    ? parseLocalISODate(date)
    : new Date(date);

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Safely parse a local YYYY-MM-DD string into a Date without UTC shifting
 */
export function parseLocalISODate(isoStr) {
  if (!isoStr) return new Date();
  const parts = isoStr.split('T')[0].split('-');
  if (parts.length !== 3) return new Date(isoStr);
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

/**
 * Check if a task matches a specific date (YYYY-MM-DD).
 * Spec rule:
 * a task matches when startDate <= D <= dueDate,
 * or dueDate is on D when there is no startDate,
 * or startDate is on D when there is no dueDate.
 */
export function isTaskForDate(task, dateStr) {
  if (!task || !dateStr) return false;

  const targetDateStr = dateStr.slice(0, 10);

  const startStr = task.startDate ? toISODateString(new Date(task.startDate)) : null;
  const dueStr = task.dueDate ? toISODateString(new Date(task.dueDate)) : null;

  if (startStr && dueStr) {
    return targetDateStr >= startStr && targetDateStr <= dueStr;
  }
  if (dueStr) {
    return targetDateStr === dueStr;
  }
  if (startStr) {
    return targetDateStr === startStr;
  }

  // If no dates set, check if created on that date
  if (task.createdAt) {
    return toISODateString(new Date(task.createdAt)) === targetDateStr;
  }

  return false;
}

/**
 * Returns month matrix for calendar
 */
export function getMonthCalendarDays(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const totalDays = new Date(year, month + 1, 0).getDate();

  const days = [];
  // Leading empty blanks
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    days.push({
      day,
      dateString: `${year}-${monthStr}-${dayStr}`,
    });
  }

  return days;
}

