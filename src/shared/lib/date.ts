export function toLocalISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toISODate(dateStr?: string): string {
  if (!dateStr) return toLocalISODate(new Date());

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const parsed = new Date(dateStr);
  if (!Number.isNaN(parsed.getTime())) return toLocalISODate(parsed);

  console.warn(`[toISODate] 파싱 불가한 날짜, 오늘로 대체: "${dateStr}"`);
  return toLocalISODate(new Date());
}
