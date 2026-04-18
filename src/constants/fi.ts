// ============================================================
// Family Vault v3.0 â FI/FIRE Constants
// Central config for all financial independence calculations.
// Edit this file to update targets without touching engine code.
// ============================================================

export const FI_CONFIG = {
  // --- Identity ---
  ownerBirthYear: 1981,        // Michael's birth year (age = currentYear - 1981)
  familyMembers: 4,

  // --- FI Targets ---
  fiTargetPortfolio: 9_000_000,  // âª9M liquid portfolio = FI
  monthlyExpenses: 35_000,       // âª35K/month baseline family expenses
  annualExpenses: 420_000,       // = monthlyExpenses * 12
  safeWithdrawalRate: 0.04,      // 4% SWR (25x rule)

  // --- Return Assumptions ---
  returns: {
    conservative: 0.05,          // 5% nominal annual
    base: 0.07,                  // 7% nominal annual
    optimistic: 0.10,            // 10% nominal annual
  },

  // --- Monthly Savings Estimate ---
  estimatedMonthlySavings: 30_000,  // âª30K/month net savings (salary - expenses - RSU)

  // --- Inflation ---
  inflationRate: 0.03,             // 3% annual ILS inflation

  // --- Currency ---
  defaultCurrency: 'ILS',
  displayCurrency: 'ILS',
} as const;

export const PILLARS = {
  strategic: {
    id: 'strategic' as const,
    label: 'Strategic',
    labelHe: '××¡××¨×××',
    color: '#3b82f6',
    description: 'Long-term wealth: pensions, real estate, Excellence investments',
  },
  active: {
    id: 'active' as const,
    label: 'Active',
    labelHe: '××§××××',
    color: '#10b981',
    description: 'Active management: IBKR, RSU, cash reserves',
  },
  children: {
    id: 'children' as const,
    label: "Children",
    labelHe: "×××××",
    color: '#f59e0b',
    description: "Children's savings (Psagot + other)",
  },
} as const;

export const INSTITUTION_BUCKETS: Record<string, 'strategic' | 'active' | 'children'> = {
  // Strategic
  'excellence': 'strategic',
  'harel': 'strategic',
  'menora': 'strategic',
  'psagot': 'strategic',
  'eu_real_estate': 'strategic',
  // Active
  'ibkr': 'active',
  'mizrahi': 'active',
  'hapoalim': 'active',
  'max': 'active',
  'diners': 'active',
  'teva': 'active',
  // Children
  'children': 'children',
  'psagot_kids': 'children',
};

export const CURRENCIES = ['ILS', 'USD', 'GBP', 'EUR'] as const;
export type Currency = typeof CURRENCIES[number];

// Approximate FX rates (updated via market_data table at runtime)
export const FX_FALLBACK: Record<string, number> = {
  USD: 3.65,    // 1 USD = 3.65 ILS (approx)
  GBP: 4.70,    // 1 GBP = 4.70 ILS (approx)
  EUR: 4.00,    // 1 EUR = 4.00 ILS (approx)
  ILS: 1.00,
};
