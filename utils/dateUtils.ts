
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfWeek, endOfWeek, parseISO } from 'date-fns';

// Helper to adjust for Sat-Fri week
export const getCustomWeekRange = (date: Date) => {
  // date-fns startOfWeek defaults to Sunday(0). We want Saturday(6).
  const start = startOfWeek(date, { weekStartsOn: 6 });
  const end = endOfWeek(date, { weekStartsOn: 6 });
  return { start, end };
};

export const isInRange = (dateStr: string, filterType: string, customRange?: { start: string, end: string }): boolean => {
  const date = parseISO(dateStr);
  const now = new Date();

  switch (filterType) {
    case 'اليوم':
      return isWithinInterval(date, { start: startOfDay(now), end: endOfDay(now) });
    
    case 'الأسبوع الحالي': {
      const { start, end } = getCustomWeekRange(now);
      return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
    }

    case 'الأسبوع الماضي': {
      const lastWeekDate = subDays(now, 7);
      const { start, end } = getCustomWeekRange(lastWeekDate);
      return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
    }

    case 'الشهر الحالي':
      return isWithinInterval(date, { start: startOfMonth(now), end: endOfMonth(now) });

    case 'الشهر الماضي': {
      const lastMonth = subMonths(now, 1);
      return isWithinInterval(date, { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
    }

    case 'مخصص':
      if (!customRange) return false;
      return isWithinInterval(date, { 
        start: startOfDay(parseISO(customRange.start)), 
        end: endOfDay(parseISO(customRange.end)) 
      });

    default:
      return true;
  }
};
