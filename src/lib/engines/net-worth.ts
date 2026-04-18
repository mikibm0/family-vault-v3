// ============================================================
// Net Worth Engine â Single source of truth for all totals.
// Pure functions: in â out. No side effects, no DB calls.
// ============================================================

import type {
  CashItem, Investment, Pension, RsuGrant,
  Mortgage, EuRealEstate, ChildrenSavings,
  NetWorthSummary, Pillar, PillarItem,
} from '@/types';
import { PILLARS } from '@/constants/fi';
import { toILS } from './fx';

export interface AssetBundle {
  cashItems: CashItem[];
  investments: Investment[];
  pensions: Pension[];
  rsuGrants: RsuGrant[];
  mortgages: Mortgage[];
  euRealEstate: EuRealEstate[];
  childrenSavings: ChildrenSavings[];
  fxMap: Record<string, number>;
}

// --- Top-level summary ---

export function calculateNetWorth(bundle: AssetBundle): NetWorthSummary {
  const {
    cashItems, investments, pensions, rsuGrants,
    mortgages, euRealEstate, childrenSavings, fxMap,
  } = bundle;

  const cash = cashItems.reduce((s, r) => s + toILS(r.v, r.currency, fxMap), 0);

  const investmentsTotal = investments.reduce(
    (s, r) => s + toILS(r.v, r.currency, fxMap), 0
  );

  const pensionTotal = pensions.reduce(
    (s, r) => s + toILS(r.v, 'ILS', fxMap), 0
  );

  // RSU: use net_ils (after-tax) if available, fall back to value_ils
  const rsuTotal = rsuGrants.reduce(
    (s, r) => s + (r.net_ils ?? r.value_ils ?? 0), 0
  );

  const realEstateValue = euRealEstate.reduce(
    (s, r) => s + toILS(r.curr_ils ?? 0, 'ILS', fxMap), 0
  );

  const mortgageDebt = mortgages.reduce(
    (s, r) => s + (r.remain ?? 0), 0
  );

  const childrenTotal = childrenSavings.reduce(
    (s, r) => s + r.balance, 0
  );

  const realEstateEquity = realEstateValue - mortgageDebt;

  // Liquid = cash + investments + RSU (excludable from FI calc but counted here)
  const liquid = cash + investmentsTotal + rsuTotal;

  // Total net worth
  const total = liquid + pensionTotal + realEstateEquity + childrenTotal;

  // Determine freshest timestamp
  const allDates = [
    ...cashItems.map(r => r.updated_at),
    ...investments.map(r => r.updated_at),
    ...pensions.map(r => r.updated_at),
    ...rsuGrants.map(r => r.updated_at),
  ].filter(Boolean);
  const asOf = allDates.length
    ? allDates.sort().reverse()[0]
    : new Date().toISOString();

  return {
    total,
    liquid,
    pension: pensionTotal,
    realEstate: realEstateEquity,
    rsu: rsuTotal,
    children: childrenTotal,
    mortgageDebt,
    asOf,
  };
}

// --- Pillar breakdown ---
// Strategic: pensions + excellence investments + EU real estate
// Active: IBKR + cash + RSU + other investments
// Children: children savings

export function calculatePillars(bundle: AssetBundle): Pillar[] {
  const { cashItems, investments, pensions, rsuGrants, euRealEstate, childrenSavings, fxMap } = bundle;

  // STRATEGIC pillar
  const strategicInvestments = investments.filter(
    r => r.bucket === 'strategic' || r.institution?.toLowerCase().includes('excellence') || r.institution?.toLowerCase().includes('psagot')
  );
  const strategicItems: PillarItem[] = [
    ...pensions.map(p => ({
      label: p.n,
      value: p.v,
      institution: p.company ?? undefined,
      asOf: p.as_of,
    })),
    ...strategicInvestments.map(i => ({
      label: i.n,
      value: toILS(i.v, i.currency, fxMap),
      institution: i.institution ?? undefined,
      asOf: i.as_of,
    })),
    ...euRealEstate.map(re => ({
      label: re.n,
      value: re.curr_ils ?? 0,
      institution: re.held_via ?? 'EU Real Estate',
      asOf: re.updated_at,
    })),
  ];

  // ACTIVE pillar
  const activeInvestments = investments.filter(
    r => !strategicInvestments.includes(r)
  );
  const rsuTotalValue = rsuGrants.reduce((s, r) => s + (r.net_ils ?? r.value_ils ?? 0), 0);
  const activeItems: PillarItem[] = [
    ...cashItems.map(c => ({
      label: c.n,
      value: toILS(c.v, c.currency, fxMap),
      institution: c.institution ?? undefined,
      asOf: c.as_of,
    })),
    ...activeInvestments.map(i => ({
      label: i.n,
      value: toILS(i.v, i.currency, fxMap),
      institution: i.institution ?? undefined,
      asOf: i.as_of,
    })),
    { label: 'RSU (Teva, net after-tax)', value: rsuTotalValue, institution: 'Teva' },
  ];

  // CHILDREN pillar
  const childrenItems: PillarItem[] = childrenSavings.map(c => ({
    label: c.name,
    value: c.balance,
    institution: c.institution,
    asOf: c.last_updated,
  }));

  const sum = (items: PillarItem[]) => items.reduce((s, i) => s + i.value, 0);

  return [
    { ...PILLARS.strategic, value: sum(strategicItems), items: strategicItems },
    { ...PILLARS.active,    value: sum(activeItems),    items: activeItems    },
    { ...PILLARS.children,  value: sum(childrenItems),  items: childrenItems  },
  ];
}

// --- FI-relevant liquid (excludes pensions, real estate) ---
export function getFILiquid(summary: NetWorthSummary): number {
  return summary.liquid; // cash + investments + RSU
}
