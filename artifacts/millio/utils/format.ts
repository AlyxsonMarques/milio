export function formatCurrency(amount: number, compact = false): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (compact) {
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
  const formatted = abs
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${formatted}`;
}

export function formatDelta(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${formatCurrency(delta, true)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatMonthsAway(months: number): string {
  if (months <= 0) return "now";
  if (months === 1) return "1 month away";
  if (months < 12) return `${months} months away`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return years === 1 ? "1 year away" : `${years} years away`;
  return `${years}y ${rem}m away`;
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}
