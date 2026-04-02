export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getISODay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

export function isWeekday(dateStr: string): boolean {
  const d = new Date(dateStr + 'T12:00:00');
  const isoDay = getISODay(d.getDay());
  return isoDay >= 1 && isoDay <= 5;
}

export function today(): string {
  return formatDate(new Date());
}
