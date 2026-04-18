// Dashboard â Server Component.
// Fetches all data server-side; UI components are dumb display layers.

import { fetchAllAssets, fetchNetWorthHistory } from '@/lib/supabase/queries';
import { buildFxMap, formatILS } from '@/lib/engines/fx';
import { calculateNetWorth, calculatePillars } from '@/lib/engines/net-worth';
import { calculateFIProjections } from '@/lib/engines/fi-engine';
import { KpiCard } from '@/components/ui/KpiCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { NetWorthHistoryChart } from '@/components/dashboard/NetWorthHistoryChart';
import { FIProgressBar } from '@/components/dashboard/FIProgressBar';
import { PillarBreakdown } from '@/components/dashboard/PillarBreakdown';
import {
  TrendingUp, Banknote, Building2, PiggyBank,
  Shield, Target,
} from 'lucide-react';

export const revalidate = 300; // revalidate every 5 minutes

export default async function DashboardPage() {
  // ââ Fetch âââââââââââââââââââââââââââââââââââââââââââââââââ
  const [assets, history] = await Promise.all([
    fetchAllAssets(),
    fetchNetWorthHistory(24),
  ]);

  // ââ Calculate ââââââââââââââââââââââââââââââââââââââââââââââ
  const fxMap = buildFxMap(assets.marketData);
  const summary = calculateNetWorth({ ...assets, fxMap });
  const pillars = calculatePillars({ ...assets, fxMap });
  const fiProjections = calculateFIProjections({ currentLiquid: summary.liquid });

  const baseProjection = fiProjections.find(p => p.scenario === 'base')!;

  // ââ Render ââââââââââââââââââââââââââââââââââââââââââââââââ
  return (
    <div>
      <SectionHeader
        title="Dashboard"
        subtitle={`Ben Moshe Family Office Â· ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
        asOf={summary.asOf}
      />

      {/* ââ KPI Row ââ */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Total Net Worth"
          value={formatILS(summary.total, true)}
          subValue={`Liquid: ${formatILS(summary.liquid, true)}`}
          trend="up"
          trendLabel={`FI ratio ${(baseProjection.fiRatio * 100).toFixed(0)}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          accent="#3b82f6"
        />
        <KpiCard
          label="Liquid Assets"
          value={formatILS(summary.liquid, true)}
          subValue="Cash + Investments + RSU"
          icon={<Banknote className="w-4 h-4" />}
          accent="#10b981"
        />
        <KpiCard
          label="Pension Funds"
          value={formatILS(summary.pension, true)}
          subValue="Harel + Menora"
          icon={<Shield className="w-4 h-4" />}
          accent="#8b5cf6"
        />
        <KpiCard
          label="Real Estate Equity"
          value={formatILS(summary.realEstate, true)}
          subValue={`Mortgage: -${formatILS(summary.mortgageDebt, true)}`}
          icon={<Building2 className="w-4 h-4" />}
          accent="#f59e0b"
        />
      </div>

      {/* ââ FI Progress ââ */}
      <div className="mb-6">
        <FIProgressBar liquid={summary.liquid} projections={fiProjections} />
      </div>

      {/* ââ Charts Row ââ */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Net Worth History â wider */}
        <div className="col-span-3 rounded-xl p-5" style={{ background: '#1e293b', border: '1px solid #334155' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-white">Net Worth History</span>
            <div className="flex gap-4 text-xs" style={{ color: '#64748b' }}>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} /> Total
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: '#10b981' }} /> Liquid
              </span>
            </div>
          </div>
          <NetWorthHistoryChart history={history} />
        </div>

        {/* Pillar Breakdown */}
        <div className="col-span-2">
          <PillarBreakdown pillars={pillars} total={summary.total} />
        </div>
      </div>

      {/* ââ Secondary KPIs ââ */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="RSU (net after-tax)"
          value={formatILS(summary.rsu, true)}
          subValue="Teva vested + unvested"
          icon={<PiggyBank className="w-4 h-4" />}
          accent="#ec4899"
        />
        <KpiCard
          label="Children Savings"
          value={formatILS(summary.children, true)}
          subValue="3 accounts"
          icon={<PiggyBank className="w-4 h-4" />}
          accent="#f59e0b"
        />
        <KpiCard
          label="Wealth Velocity"
          value={`+${formatILS(baseProjection.wealthVelocity, true)}/mo`}
          subValue="Savings + portfolio return"
          trend="up"
          icon={<TrendingUp className="w-4 h-4" />}
          accent="#10b981"
        />
        <KpiCard
          label="FI Base Case"
          value={`${baseProjection.targetYear}`}
          subValue={`Age ${baseProjection.targetAge}`}
          trendLabel={`${Math.floor(baseProjection.monthsRemaining / 12)}y ${Math.round(baseProjection.monthsRemaining % 12)}m remaining`}
          icon={<Target className="w-4 h-4" />}
          accent="#3b82f6"
        />
      </div>
    </div>
  );
}
