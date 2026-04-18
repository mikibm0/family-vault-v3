// ============================================================
// FX Engine â Currency conversion
// Always converts TO ILS. Falls back to hardcoded rates if
// market_data is unavailable.
// ============================================================

import { FX_FALLBACK } from '@/constants/fi';
import type { MarketData } from '@/types';

export function buildFxMap(marketData: MarketData[]): Record<string, number> {
  const map: Record<string, number> = { ...FX_FALLBACK };

  for (const row of marketData) {
    // market_data stores symbols like "USD/ILS", "GBP/ILS"
    const [from] = row.symbol.split('/');
    if (from && row.price) {
      map[from] = row.price;
    }
  }

  return map;
}

export function toILS(
  amount: number,
  currency: string,
  fxMap: Record<string, number>
): number {
  if (!currency || currency === 'ILS') return amount;
  const rate = fxMap[currency] ?? FX_FALLBACK[currency] ?? 1;
  return amount * rate;
}

export function formatILS(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `âª${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `âª${(value / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
