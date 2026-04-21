// Alpha Trading â IBKR positions and performance.

import { fetchAllAssets } from '@/lib/supabase/queries';
import { buildFxMap, formatILS } from '@/lib/engines/fx';
import { SectionHeader } from '@/components/ui/SectionHeader';

export const revalidate = 300;

export default async function TradingPage() {
  const assets = await fetchAllAssets();
  const fxMap = buildFxMap(assets.marketData);

  const ibkrPositions = assets.investments.filter(
    i => i.institution?.toLowerCase().includes('ibkr') ||
         i.bucket === 'active'
  );

  const totalValue = ibkrPositions.reduce(
    (s, i) => s + (i.currency === 'ILS' ? i.v : i.v * (fxMap[i.currency] ?? 1)),
    0
  );

  const totalPL = ibkrPositions.reduce((s, i) => s + (i.pl ?? 0), 0);
  const plPct = ibkrPositions.length
    ? ibkrPositions.reduce((s, i) => s + (i.pl_pct ?? 0), 0) / ibkrPositions.length
    : 0;

  return (
    <div>
      <SectionHeader
        title="Alpha Trading â IBKR"
        subtitle="Active portfolio positions and performance"
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Portfolio Value</div>
          <div className="text-2xl font-bold text-white">{formatILS(totalValue, true)}</div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Total P&L</div>
          <div className="text-2xl font-bold" style={{ color: totalPL >= 0 ? '#10b981' : '#ef4444' }}>
            {totalPL >= 0 ? '+' : ''}{formatILS(totalPL, true)}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Avg P&L %</div>
          <div className="text-2xl font-bold" style={{ color: plPct >= 0 ? '#10b981' : '#ef4444' }}>
            {plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%
          </div>
        </div>
      </div>

      {ibkrPositions.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: '#334155', background: '#0f172a' }}>
            <span className="text-sm font-semibold text-white">Positions ({ibkrPositions.length})</span>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Name', 'Asset Type', 'Quantity', 'Price', 'Value (ILS)', 'P&L', 'P&L %', 'As Of'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ibkrPositions.map(p => {
                const valueILS = p.currency === 'ILS' ? p.v : p.v * (fxMap[p.currency] ?? 1);
                return (
                  <tr key={p.id} className="border-b" style={{ borderColor: '#1e293b' }}>
                    <td className="px-4 py-3 text-sm text-white font-medium">{p.n}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#334155', color: '#94a3b8' }}>
                        {p.asset_type ?? 'â'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white">{p.quantity?.toLocaleString() ?? 'â'}</td>
                    <td className="px-4 py-3 text-xs text-white">
                      {p.price ? `${p.currency === 'USD' ? '$' : 'âª'}${p.price.toFixed(2)}` : 'â'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-white">{formatILS(valueILS, true)}</td>
                    <td className="px-4 py-3 text-xs font-medium"
                      style={{ color: (p.pl ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                      {p.pl != null ? `${p.pl >= 0 ? '+' : ''}${formatILS(p.pl, true)}` : 'â'}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium"
                      style={{ color: (p.pl_pct ?? 0) >= 0 ? '#10b981' : '#ef4444' }}>
                      {p.pl_pct != null ? `${p.pl_pct >= 0 ? '+' : ''}${p.pl_pct.toFixed(2)}%` : 'â'}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#64748b' }}>{p.as_of}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-sm" style={{ color: '#64748b' }}>
            No IBKR positions found. Run the sync to pull latest data.
          </div>
        </div>
      )}
    </div>
  );
}
