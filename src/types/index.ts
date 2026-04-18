// ============================================================
// Family Vault v3.0 â Core Type Definitions
// Single source of truth for all TypeScript interfaces.
// These mirror the Supabase schema exactly.
// ============================================================

// --- Asset Tables ---

export interface CashItem {
  id: string;
  n: string;               // name
  v: number;               // value in ILS
  currency: string;
  institution: string | null;
  owner: string | null;
  updated_at: string;
  as_of: string | null;
}

export interface Investment {
  id: string;
  n: string;
  asset_type: string | null;
  institution: string | null;
  bucket: string | null;
  asset_class: string | null;
  quantity: number | null;
  price: number | null;
  v: number;               // value in ILS
  v_orig: number | null;   // value in original currency
  basis: number | null;
  pl: number | null;
  pl_pct: number | null;
  currency: string;
  owner: string | null;
  as_of: string | null;
  updated_at: string;
}

export interface Pension {
  id: string;
  n: string;
  account_num: string | null;
  owner: string | null;
  company: string | null;
  v: number;
  track: string | null;
  is_liquid: boolean;
  end_date: string | null;
  dm_acc: string | null;
  dm_dep: string | null;
  as_of: string | null;
  updated_at: string;
}

export interface RsuGrant {
  id: string;
  grant_date: string | null;
  grant_type: string | null;
  quantity: number | null;
  vest_date: string | null;
  price_usd: number | null;
  curr_price: number | null;
  value_ils: number | null;
  tax_rate: number | null;
  net_ils: number | null;
  as_of: string | null;
  updated_at: string;
}

export interface Mortgage {
  id: string;
  description: string;
  loan_type: string | null;
  orig: number | null;
  remain: number | null;
  monthly: number | null;
  end_date: string | null;
  rate: number | null;
  rate_desc: string | null;
  property: string | null;
  updated_at: string;
  as_of: string | null;
}

export interface EuRealEstate {
  id: string;
  n: string;
  location: string | null;
  currency: string;
  orig_cur: number | null;
  orig_ils: number | null;
  curr_ils: number | null;
  fx_at_buy: number | null;
  property_type: string | null;
  held_via: string | null;
  updated_at: string;
}

export interface ChildrenSavings {
  id: string;
  name: string;
  balance: number;
  yield: number;
  institution: string;
  last_updated: string;
}

export interface InsurancePolicy {
  id: string;
  who: string | null;
  policy_num: string | null;
  category: string | null;
  subcategory: string | null;
  company: string | null;
  monthly_premium: number | null;
  annual_premium: number | null;
  payment_method: string | null;
  coverage_period: string | null;
  updated_at: string;
}

// --- Transaction Tables ---

export interface BankTransaction {
  id: string;
  date: string;
  description: string | null;
  amount: number | null;
  balance: number | null;
  category: string | null;
  institution: string | null;
  reference: string | null;
  as_of: string | null;
  created_at: string;
}

export interface CreditCardTransaction {
  id: string;
  card: string | null;
  billing_period: string | null;
  date: string | null;
  merchant: string | null;
  category: string | null;
  amount: number | null;
  currency: string;
  orig_amount: number | null;
  tx_type: string | null;
  note: string | null;
  card_last4: string | null;
  identifier: string | null;
  created_at: string;
}

export interface MarketData {
  symbol: string;
  price: number | null;
  currency: string | null;
  as_of: string | null;
  updated_at: string;
}

export interface NetWorthHistory {
  id: string;
  d: string;
  total: number;
  liquid: number | null;
  pension: number | null;
  real_estate: number | null;
  created_at: string;
}

// --- Calculated / Aggregated Types ---

export interface NetWorthSummary {
  total: number;
  liquid: number;         // cash + investments (non-pension)
  pension: number;        // pension funds
  realEstate: number;     // EU real estate equity (value - mortgage)
  rsu: number;            // RSU net after tax
  children: number;       // children savings
  mortgageDebt: number;   // total remaining mortgage debt
  asOf: string;           // latest data timestamp
}

export interface Pillar {
  id: 'strategic' | 'active' | 'children';
  label: string;
  value: number;
  color: string;
  items: PillarItem[];
}

export interface PillarItem {
  label: string;
  value: number;
  currency?: string;
  institution?: string;
  asOf?: string | null;
}

export interface FIProjection {
  scenario: 'conservative' | 'base' | 'optimistic';
  targetYear: number;
  targetAge: number;
  monthsRemaining: number;
  fiRatio: number;           // current portfolio / FI target
  wealthVelocity: number;    // âª / month net growth
  annualReturn: number;      // assumed annual return
  annualExpenses: number;    // assumed annual expenses
  fiTarget: number;          // portfolio needed (25x rule)
}

export interface CashFlowSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingRate: number;
  categoryBreakdown: { category: string; amount: number }[];
}

export type DataFreshness = 'live' | 'today' | 'recent' | 'stale' | 'unknown';
