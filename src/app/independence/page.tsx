// Independence (FI/FIRE) â Server Component.
// Shows FI ratio, Wealth Velocity, 3-scenario projections, and required savings.

import { fetchAllAssets } from '@/lib/supabase/queries';
import { buildFxMap, formatILS, formatPercent } from '@/lib/engines/fx';
import { calculateNetWorth } from '@/lib/engines/net-worth';
import { calculateFIProjections, getFIRatio, getWealthVelocity, formatYearsMonths, getCurrentAge } from '@/lib/engines/fi-engine';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FI_CONFIG } from '@/constants/fi';

export const revalidate = 300;

export default async function IndependencePage() {
  const assets = await fetchAllAssets();
  const fxMap = buildFxMap(assets.marketData);
  const summary = calculateNetWorth({ ...assets, fxMap });
  const projections = calculateFIProjections({ currentLiquid: summary.liquid });
  const fiRatio = getFIRatio(summary.liquid);
  const velocity = getWealthVelocity(summary.liquid);
  const currentAge = getCurrentAge();
  const gap = Math.max(0, FI_CONFIG.fiTargetPortfolio - summary.liquid);

  return (
    <div>
      <SectionHeader
        title="Financial Independence"
        subtitle="FI/FIRE tracker â Ben Moshe Family"
      />

      {/* ââ Hero metric ââ */}
      <div className="rounded-xl p-8 mb-6 text-center"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid #334155' }}>
        <div className="text-5xl font-bold mb-2" style={{ color: '#10b981' }}>
          {formatPercent(fiRatio)}
        </div>
        <div className="text-sm mb-4" style={{ color: '#94a3b8' }}>of FI target achieved</div>

        {/* Mini progress bar */}
        <div className="max-w-sm mx-auto h-2 rounded-full overflow-hidden mb-4" style={{ background: '#0f172a' }}>
          <div className="h-full rounded-full"
            style={{
              width: `${Math.min(fiRatio * 100, 100)}%`,
              background: 'linear-gradient(90deg, #10b981, #3b82f6)',
            }} />
        </div>

        <div className="flex items-center justify-center gap-8 text-sm">
          <div>
            <div style={{ color: '#64748b' }}>Current liquid</div>
            <div className="font-semibold text-white mt-0.5">{formatILS(summary.liquid, true)}</div>
          </div>
          <div style={{ color: '#334155', fontSize: 20 }}>â</div>
          <div>
            <div style={{ color: '#64748b' }}>FI target (25Ã)</div>
            <div className="font-semibold text-white mt-0.5">{formatILS(FI_CONFIG.fiTargetPortfolio, true)}</div>
          </div>
          <div style={{ color: '#334155', fontSize: 20 }}>â</div>
          <div>
            <div style={{ color: '#64748b' }}>Gap remaining</div>
            <div className="font-semibold mt-0.5" style={{ color: '#ef4444' }}>{formatILS(gap, true)}</div>
          </div>
        </div>
      </div>

      {/* ââ Wealth Velocity ââ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Wealth Velocity</div>
          <div className="text-2xl font-bold" style={{ color: '#10b981' }}>
            +{formatILS(velocity, true)}/mo
          </div>
          <div className="text-xs mt-2" style={{ color: '#64748b' }}>
            Savings + {formatPercent(FI_CONFIG.returns.base)} portfolio return
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Annual Expenses (target)</div>
          <div className="text-2xl font-bold text-white">
            {formatILS(FI_CONFIG.annualExpenses, true)}/yr
          </div>
          <div className="text-xs mt-2" style={{ color: '#64748b' }}>
            {formatILS(FI_CONFIG.monthlyExpenses, true)}/month
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="text-xs mb-2" style={{ color: '#64748b' }}>Your Age</div>
          <div className="text-2xl font-bold text-white">{currentAge}</div>
          <div className="text-xs mt-2" style={{ color: '#64748b' }}>
            Born {FI_CONFIG.ownerBirthYear}
          </div>
        </div>
      </div>

      {/* ââ 3 Scenario Table ââ */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="px-5 py-3 border-b" style={{ borderColor: '#334155' }}>
          <span className="text-sm font-semibold text-white">FI Projections â 3 Scenarios</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Scenario', 'Annual Return', 'FI Year', 'Age at FI', 'Time Remaining', 'Wealth Velocity'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium" style={{ color: '#64748b' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projections.map((p, i) => {
              const colors = { conservative: '#ef4444', base: '#3b82f6', optimistic: '#10b981' };
              const color = colors[p.scenario];
              const isBase = p.scenario === 'base';
              return (
                <tr key={p.scenario}
                  className="border-b"
                  style={{ borderColor: '#334155', background: isBase ? '#1a2744' : 'transparent' }}>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold capitalize px-2 py-1 rounded"
                      style={{ background: `${color}22`, color }}>
                      {p.scenario}
                    </span>
                    {isBase && (
                      <span className="ml-2 text-xs" style={{ color: '#64748b' }}>â base case</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-white">{formatPercent(p.annualReturn)}</td>
                  <td className="px-5 py-4 text-sm font-bold text-white">{p.targetYear}</td>
                  <td className="px-5 py-4 text-sm text-white">{p.targetAge}</td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color }}>
                    {formatYearsMonths(p.monthsRemaining)}
                  </td>
                  <td className="px-5 py-4 text-sm text-white">
                    +{formatILS(p.wealthVelocity, true)}/mo
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ââ Model assumptions ââ */}
      <div className="rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
        <div className="text-sm font-semibold text-white mb-3">Model Assumptions</div>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Safe Withdrawal Rate', value: formatPercent(FI_CONFIG.safeWithdrawalRate) },
            { label: 'Monthly Savings', value: formatILS(FI_CONFIG.estimatedMonthlySavings, true) },
            { label: 'Inflation', value: formatPercent(FI_CONFIG.inflationRate) },
            { label: 'FI Target (25Ã expenses)', value: formatILS(FI_CONFIG.fiTargetPortfolio, true) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-xs mb-1" style={{ color: '#64748b' }}>{label}</div>
              <div className="font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
