// ============================================================
// Family Vault v3.0 â Supabase Query Layer
// All DB access goes through here. Zero raw Supabase calls in components.
// ============================================================

import { createServerClient } from './server';
import type {
  CashItem, Investment, Pension, RsuGrant,
  Mortgage, EuRealEstate, ChildrenSavings,
  BankTransaction, CreditCardTransaction,
  MarketData, NetWorthHistory, InsurancePolicy,
} from '@/types';

export async function fetchAllAssets() {
  const db = createServerClient();

  const [
    cashItems,
    investments,
    pensions,
    rsuGrants,
    mortgages,
    euRealEstate,
    childrenSavings,
    insurancePolicies,
    marketData,
  ] = await Promise.all([
    db.from('cash_items').select('*').order('v', { ascending: false }),
    db.from('investments').select('*').order('v', { ascending: false }),
    db.from('pensions').select('*').order('v', { ascending: false }),
    db.from('rsu_grants').select('*').order('vest_date', { ascending: true }),
    db.from('mortgages').select('*'),
    db.from('eu_real_estate').select('*'),
    db.from('children_savings').select('*'),
    db.from('insurance_policies').select('*'),
    db.from('market_data').select('*'),
  ]);

  return {
    cashItems: (cashItems.data ?? []) as CashItem[],
    investments: (investments.data ?? []) as Investment[],
    pensions: (pensions.data ?? []) as Pension[],
    rsuGrants: (rsuGrants.data ?? []) as RsuGrant[],
    mortgages: (mortgages.data ?? []) as Mortgage[],
    euRealEstate: (euRealEstate.data ?? []) as EuRealEstate[],
    childrenSavings: (childrenSavings.data ?? []) as ChildrenSavings[],
    insurancePolicies: (insurancePolicies.data ?? []) as InsurancePolicy[],
    marketData: (marketData.data ?? []) as MarketData[],
  };
}

export async function fetchNetWorthHistory(limit = 24) {
  const db = createServerClient();
  const { data } = await db
    .from('net_worth_history')
    .select('*')
    .order('d', { ascending: true })
    .limit(limit);
  return (data ?? []) as NetWorthHistory[];
}

export async function fetchBankTransactions(limit = 500) {
  const db = createServerClient();
  const { data } = await db
    .from('bank_transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  return (data ?? []) as BankTransaction[];
}

export async function fetchCreditCardTransactions(limit = 500) {
  const db = createServerClient();
  const { data } = await db
    .from('credit_card_transactions')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  return (data ?? []) as CreditCardTransaction[];
}

export async function fetchMarketData() {
  const db = createServerClient();
  const { data } = await db.from('market_data').select('*');
  return (data ?? []) as MarketData[];
}
