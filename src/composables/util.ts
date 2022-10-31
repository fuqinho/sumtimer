import { date } from 'quasar';
import { startDayOfWeek, startHourOfDay } from 'src/common/constants';

export function useUtil() {
  function startOfDay(time: Date) {
    let result = date.startOfDate(time, 'day');
    result = date.addToDate(result, { hours: startHourOfDay });
    if (time < result) result = date.subtractFromDate(result, { days: 1 });
    return result;
  }

  function startOfWeek(time: Date) {
    let result = startOfDay(time);
    while (date.getDayOfWeek(result) != startDayOfWeek)
      result = date.subtractFromDate(result, { days: 1 });
    return result;
  }

  return { startOfDay, startOfWeek };
}
