// RSU Page â Teva vesting schedule, current value, and net after-tax.

import { fetchAllAssets } from '@/lib/supabase/queries';
import { formatILS } from '@/lib/engines/fx';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FreshnessTag } from '@/components/ui/FreshnessTag';

export const revalidate = 300;

export default async function RSUPage() {
  const assets = await fetchAllAssets();
  const grants = assets.rsuGrants;

  const vested   = grants.filter(g => g.vest_date && new Date(g.vest_date) <= new Date());
  const unvested = grants.filter(g => g.vest_date && new Date(g.vest_date) > new Date());

  const totalNet     = grants.reduce((s, g) => s + (g.net_ils ?? 0), 0);
  const totalGross   = grants.reduce((s, g) => s + (g.value_ils ?? 0), 0);
  const totalTax     = totalGross - totalNet;
  const tevaPrice    = grants[0]?.curr_price ?? null;
  const asOf         = grants[0]?.updated_at ?? null;

  return (
    <div>
      <SectionHeader
        title="RSU â Teva Pharmaceuticals"
        subtitle="Vesting schedule, current value, and tax estimate"
        asOf={asOf}
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Net Value (after-tax)', value: totalNet, color: '#10b981' },
          { label: 'Gross Value', value: totalGross, color: '#3b82f6' },
          { label: 'Estimated Tax', value: totalTax, color: '#ef4444' },
          { label: 'Teva Current Price', value: tevaPrice ? `$${tevaPrice.toFixed(2)}` : 'â', color: '#f59e0b', isText: true },
        ].map(({ label, value, color, isText }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <div className="text-xs mb-2" style={{ color: '#64748b' }}>{label}</div>
            <div className="text-xl font-bold" style={{ color }}>
              {isText ? value : formatILS(value as number, true)}
            </div>
          </div>
        ))}
      </div>

      {/* Grants table */}
      {[
        { title: 'Unvested Grants', grants: unvested, color: '#3b82f6' },
        { title: 'Vested Grants', grants: vested, color: '#10b981' },
      ].map(({ title, grants: g, color }) => g.length > 0 && (
        <div key={title} className="rounded-xl overflow-hidden mb-4" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#334155', background: '#0f172a' }}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-sm font-semibold text-white">{title}</span>
              <span className="text-xs" style={{ color: '#64748b' }}>({g.length})</span>
            </div>
            <span className="text-sm font-bold text-white">
              {formatILS(g.reduce((s, r) => s + (r.net_ils ?? 0), 0), true)} net
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: '#0f172a' }}>
                  {['Grant Date', 'Type', 'Quantity', 'Vest Date', 'Grant Price', 'Current Price', 'Gross (âª)', 'Tax Rate', 'Net (âª)'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.map(grant => (
                  <tr key={grant.id} className="border-b" style={{ borderColor: '#1e293b' }}>
                    <td className="px-4 py-3 text-xs text-white">{grant.grant_date}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
                        {grant.grant_type ?? 'RSU'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">{grant.quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-white">{grant.vest_date}</td>
                    <td className="px-4 py-3 text-xs text-white">${grant.price_usd?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: '#10b981' }}>${grant.curr_price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-white">{formatILS(grant.value_ils ?? 0, true)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#f59e0b' }}>{grant.tax_rate ? `${grant.tax_rate}%` : 'â'}</td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#10b981' }}>{formatILS(grant.net_ils ?? 0, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
