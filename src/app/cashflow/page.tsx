// Cash Flow â Server Component.
// Shows bank transactions and credit card spending by category.

import { fetchBankTransactions, fetchCreditCardTransactions } from '@/lib/supabase/queries';
import { formatILS } from '@/lib/engines/fx';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { BankTransaction, CreditCardTransaction } from '@/types';

export const revalidate = 300;

function groupByCategory(txns: (BankTransaction | CreditCardTransaction)[]) {
  const map: Record<string, number> = {};
  for (const t of txns) {
    const cat = (t as BankTransaction).category ?? 'Other';
    const amt = Math.abs((t as BankTransaction).amount ?? 0);
    map[cat] = (map[cat] ?? 0) + amt;
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
}

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7',
];

export default async function CashFlowPage() {
  const [bankTxns, ccTxns] = await Promise.all([
    fetchBankTransactions(500),
    fetchCreditCardTransactions(500),
  ]);

  // Totals
  const bankDebits = bankTxns.filter(t => (t.amount ?? 0) < 0);
  const bankCredits = bankTxns.filter(t => (t.amount ?? 0) > 0);

  const totalIncome   = bankCredits.reduce((s, t) => s + (t.amount ?? 0), 0);
  const totalBankSpend = Math.abs(bankDebits.reduce((s, t) => s + (t.amount ?? 0), 0));
  const totalCCSpend  = ccTxns.reduce((s, t) => s + Math.abs(t.amount ?? 0), 0);
  const totalSpend    = totalBankSpend + totalCCSpend;

  const ccCategories = groupByCategory(ccTxns);

  return (
    <div>
      <SectionHeader
        title="Cash Flow"
        subtitle="Bank transactions and credit card spending"
      />

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Bank Income (credits)', value: totalIncome, color: '#10b981', count: bankCredits.length },
          { label: 'Bank Debits', value: -totalBankSpend, color: '#ef4444', count: bankDebits.length },
          { label: 'CC Spending', value: -totalCCSpend, color: '#f59e0b', count: ccTxns.length },
        ].map(({ label, value, color, count }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <div className="text-xs mb-2" style={{ color: '#64748b' }}>{label}</div>
            <div className="text-2xl font-bold" style={{ color }}>
              {value >= 0 ? '' : '-'}{formatILS(Math.abs(value), true)}
            </div>
            <div className="text-xs mt-1" style={{ color: '#64748b' }}>{count} transactions</div>
          </div>
        ))}
      </div>

      {/* CC Category breakdown */}
      <div className="rounded-xl p-5 mb-6" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="text-sm font-semibold text-white mb-4">Credit Card â Spending by Category</div>
        <div className="space-y-3">
          {ccCategories.map(([cat, amt], i) => {
            const pct = totalCCSpend > 0 ? (amt / totalCCSpend) * 100 : 0;
            const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-sm text-white">{cat}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#64748b' }}>{pct.toFixed(1)}%</span>
                    <span className="text-sm font-semibold text-white">{formatILS(amt, true)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#0f172a' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent bank transactions */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#334155' }}>
          <span className="text-sm font-semibold text-white">Recent Bank Transactions</span>
          <span className="text-xs ml-2" style={{ color: '#64748b' }}>last {Math.min(bankTxns.length, 50)} of {bankTxns.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Date', 'Description', 'Category', 'Amount', 'Balance', 'Institution'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bankTxns.slice(0, 50).map(t => (
                <tr key={t.id} className="border-b" style={{ borderColor: '#1e293b' }}>
                  <td className="px-4 py-3 text-xs text-white">{t.date}</td>
                  <td className="px-4 py-3 text-xs text-white max-w-xs truncate">{t.description}</td>
                  <td className="px-4 py-3">
                    {t.category && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
                        {t.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: (t.amount ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                    {(t.amount ?? 0) >= 0 ? '+' : ''}{formatILS(t.amount ?? 0, true)}
                  </td>
                  <td className="px-4 py-3 text-xs text-white">{t.balance ? formatILS(t.balance, true) : 'â'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{t.institution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
