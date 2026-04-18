// ============================================================
// FI Engine â Financial Independence projection engine.
// Calculates FI ratio, Wealth Velocity, and 3-scenario projections.
// Pure functions. No DB calls.
// ============================================================

import { FI_CONFIG } from '@/constants/fi';
import type { FIProjection } from '@/types';

export interface FIInput {
  currentLiquid: number;           // current FI-relevant portfolio (âª)
  monthlyNetSavings?: number;      // optional override (âª/month)
  currentYear?: number;
}

// --- Core metric: FI Ratio ---
export function getFIRatio(currentLiquid: number): number {
  return currentLiquid / FI_CONFIG.fiTargetPortfolio;
}

// --- Wealth Velocity (âª/month net portfolio growth) ---
// Simple: savings + return on existing portfolio
export function getWealthVelocity(
  currentLiquid: number,
  monthlySavings: number = FI_CONFIG.estimatedMonthlySavings,
  annualReturn: number = FI_CONFIG.returns.base
): number {
  const monthlyReturn = (currentLiquid * annualReturn) / 12;
  return monthlySavings + monthlyReturn;
}

// --- Months to FI ---
// Uses compound growth formula. Returns months from today.
export function monthsToFI(
  currentLiquid: number,
  monthlySavings: number,
  annualReturn: number,
  targetPortfolio: number = FI_CONFIG.fiTargetPortfolio
): number {
  if (currentLiquid >= targetPortfolio) return 0;

  const r = annualReturn / 12; // monthly rate
  if (r === 0) {
    return (targetPortfolio - currentLiquid) / monthlySavings;
  }

  // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for n numerically (Newton's method would be overkill, iterate)
  let months = 0;
  let balance = currentLiquid;
  const maxMonths = 600; // 50 years cap

  while (balance < targetPortfolio && months < maxMonths) {
    balance = balance * (1 + r) + monthlySavings;
    months++;
  }

  return months;
}

// --- Three scenario projections ---
export function calculateFIProjections(input: FIInput): FIProjection[] {
  const {
    currentLiquid,
    monthlyNetSavings = FI_CONFIG.estimatedMonthlySavings,
    currentYear = new Date().getFullYear(),
  } = input;

  const scenarios: Array<{ scenario: FIProjection['scenario']; return: number }> = [
    { scenario: 'conservative', return: FI_CONFIG.returns.conservative },
    { scenario: 'base',         return: FI_CONFIG.returns.base         },
    { scenario: 'optimistic',   return: FI_CONFIG.returns.optimistic   },
  ];

  return scenarios.map(({ scenario, return: annualReturn }) => {
    const months = monthsToFI(currentLiquid, monthlyNetSavings, annualReturn);
    const targetYear = currentYear + Math.floor(months / 12);
    const targetAge  = targetYear - FI_CONFIG.ownerBirthYear;
    const velocity   = getWealthVelocity(currentLiquid, monthlyNetSavings, annualReturn);
    const fiRatio    = getFIRatio(currentLiquid);

    return {
      scenario,
      targetYear,
      targetAge,
      monthsRemaining: months,
      fiRatio,
      wealthVelocity: velocity,
      annualReturn,
      annualExpenses: FI_CONFIG.annualExpenses,
      fiTarget: FI_CONFIG.fiTargetPortfolio,
    };
  });
}

// --- Formatted helpers ---
export function formatYearsMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = Math.round(totalMonths % 12);
  if (years === 0) return `${months}m`;
  if (months === 0) return `${years}y`;
  return `${years}y ${months}m`;
}

export function getCurrentAge(): number {
  return new Date().getFullYear() - FI_CONFIG.ownerBirthYear;
}
