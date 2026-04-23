export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function todayForTimezone(tz: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(new Date());
}

export function formatDateForTimezone(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(date);
}

export function getISODay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

export function isWeekday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00');
  const isoDay = getISODay(d.getDay());
  return isoDay >= 1 && isoDay <= 5;
}

export function getHourInTimezone(tz: string): number {
  const now = new Date();
  return parseInt(
    new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: tz,
    }).format(now),
    10,
  );
}
