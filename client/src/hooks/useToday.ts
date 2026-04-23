import { useState, useEffect } from 'react';

function computeToday(tz: string | undefined): string {
  if (!tz) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(new Date());
}

export function useToday(timezone: string | undefined): string {
  const [today, setToday] = useState(() => computeToday(timezone));

  useEffect(() => {
    setToday(computeToday(timezone));
    const interval = setInterval(() => {
      setToday(computeToday(timezone));
    }, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  return today;
}
