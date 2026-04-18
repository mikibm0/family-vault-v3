// Balance Sheet â Server Component.
// Groups all assets into a structured, drillable table.

import { fetchAllAssets } from '@/lib/supabase/queries';
import { buildFxMap, formatILS } from '@/lib/engines/fx';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FreshnessTag } from '@/components/ui/FreshnessTag';

export const revalidate = 300;

function Row({ label, value, sub, currency, freshnessDate }: {
  label: string; value: number; sub?: string;
  currency?: string; freshnessDate?: string | null;
}) {
  return (
    <tr className="border-b" style={{ borderColor: '#1e293b' }}>
      <td className="py-3 pr-4">
        <div className="text-sm text-white">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{sub}</div>}
      </td>
      <td className="py-3 pr-4 text-right">
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
          {currency ?? 'ILS'}
        </span>
      </td>
      <td className="py-3 text-right font-semibold text-white text-sm">
        {formatILS(value, true)}
      </td>
      <td className="py-3 pl-4 text-right">
        {freshnessDate && <FreshnessTag updatedAt={freshnessDate} />}
      </td>
    </tr>
  );
}

function Section({ title, color, rows, total }: {
  title: string; color: string;
  rows: { label: string; value: number; sub?: string; currency?: string; freshnessDate?: string | null }[];
  total: number;
}) {
  return (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: '#1e293b', border: '1px solid #334155' }}>
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <span className="text-sm font-bold text-white">{formatILS(total, true)}</span>
      </div>
      <div className="px-5">
        <table className="w-full">
          <tbody>
            {rows.map((r, i) => <Row key={i} {...r} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function BalanceSheetPage() {
  const assets = await fetchAllAssets();
  const fxMap = buildFxMap(assets.marketData);

  const toILS = (v: number, cur: string) => {
    if (cur === 'ILS') return v;
    return v * (fxMap[cur] ?? 1);
  };

  // ââ Assets ââââââââââââââââââââââââââââââââââââââââââââââ
  const cashRows = assets.cashItems.map(c => ({
    label: c.n,
    value: toILS(c.v, c.currency),
    sub: c.institution ?? undefined,
    currency: c.currency,
    freshnessDate: c.updated_at,
  }));

  const investmentRows = assets.investments.map(i => ({
    label: i.n,
    value: toILS(i.v, i.currency),
    sub: i.institution ?? undefined,
    currency: i.currency,
    freshnessDate: i.updated_at,
  }));

  const pensionRows = assets.pensions.map(p => ({
    label: p.n,
    value: p.v,
    sub: p.company ?? undefined,
    freshnessDate: p.updated_at,
  }));

  const rsuTotal = assets.rsuGrants.reduce((s, r) => s + (r.net_ils ?? r.value_ils ?? 0), 0);
  const rsuRows = [{
    label: 'Teva RSU (net after-tax)',
    value: rsuTotal,
    sub: `${assets.rsuGrants.length} grants`,
    freshnessDate: assets.rsuGrants[0]?.updated_at,
  }];

  const reRows = assets.euRealEstate.map(re => ({
    label: re.n,
    value: re.curr_ils ?? 0,
    sub: re.location ?? undefined,
    currency: re.currency,
    freshnessDate: re.updated_at,
  }));

  const childrenRows = assets.childrenSavings.map(c => ({
    label: c.name,
    value: c.balance,
    sub: c.institution,
    freshnessDate: c.last_updated,
  }));

  // ââ Liabilities ââââââââââââââââââââââââââââââââââââââââââ
  const mortgageRows = assets.mortgages.map(m => ({
    label: m.description,
    value: -(m.remain ?? 0),
    sub: m.property ?? undefined,
    freshnessDate: m.updated_at,
  }));

  const totalAssets =
    cashRows.reduce((s, r) => s + r.value, 0) +
    investmentRows.reduce((s, r) => s + r.value, 0) +
    pensionRows.reduce((s, r) => s + r.value, 0) +
    rsuTotal +
    reRows.reduce((s, r) => s + r.value, 0) +
    childrenRows.reduce((s, r) => s + r.value, 0);

  const totalLiabilities = mortgageRows.reduce((s, r) => s + Math.abs(r.value), 0);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div>
      <SectionHeader
        title="Balance Sheet"
        subtitle="All assets and liabilities â single source of truth"
      />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Assets', value: totalAssets, color: '#10b981' },
          { label: 'Total Liabilities', value: -totalLiabilities, color: '#ef4444' },
          { label: 'Net Worth', value: netWorth, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4"
            style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <div className="text-xs mb-2" style={{ color: '#64748b' }}>{label}</div>
            <div className="text-xl font-bold" style={{ color }}>{formatILS(value, true)}</div>
          </div>
        ))}
      </div>

      {/* Asset sections */}
      <Section title="Cash & Bank Accounts" color="#10b981"
        rows={cashRows} total={cashRows.reduce((s, r) => s + r.value, 0)} />
      <Section title="Investments & Securities" color="#3b82f6"
        rows={investmentRows} total={investmentRows.reduce((s, r) => s + r.value, 0)} />
      <Section title="Pension Funds" color="#8b5cf6"
        rows={pensionRows} total={pensionRows.reduce((s, r) => s + r.value, 0)} />
      <Section title="RSU â Teva" color="#ec4899"
        rows={rsuRows} total={rsuTotal} />
      <Section title="EU Real Estate" color="#f59e0b"
        rows={reRows} total={reRows.reduce((s, r) => s + r.value, 0)} />
      <Section title="Children Savings" color="#f59e0b"
        rows={childrenRows} total={childrenRows.reduce((s, r) => s + r.value, 0)} />

      {/* Liabilities */}
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: '#1e293b', border: '1px solid #ef444430' }}>
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ef4444' }} />
            <span className="text-sm font-semibold text-white">Mortgages</span>
          </div>
          <span className="text-sm font-bold" style={{ color: '#ef4444' }}>
            -{formatILS(totalLiabilities, true)}
          </span>
        </div>
        <div className="px-5">
          <table className="w-full">
            <tbody>
              {mortgageRows.map((r, i) => <Row key={i} {...r} value={r.value} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
