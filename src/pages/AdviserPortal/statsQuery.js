export function currentJalaliPeriod(momentFactory) {
  const now = momentFactory();
  return { year: now.jYear(), month: now.jMonth() + 1 };
}

export function parseAdviserStatsQuery(params, fallback) {
  const year = Number(params.get("year"));
  const month = Number(params.get("month"));
  return {
    year: Number.isInteger(year) && year > 0 ? year : fallback.year,
    month: Number.isInteger(month) && month >= 1 && month <= 12 ? month : fallback.month,
  };
}

export function serializeAdviserStatsQuery(period) {
  return new URLSearchParams({ year: String(period.year), month: String(period.month) });
}

export function shiftJalaliMonth(period, amount) {
  const zeroBased = period.year * 12 + period.month - 1 + amount;
  return {
    year: Math.floor(zeroBased / 12),
    month: ((zeroBased % 12) + 12) % 12 + 1,
  };
}

export function isCurrentJalaliPeriod(period, current) {
  return Number(period.year) === Number(current.year) && Number(period.month) === Number(current.month);
}
