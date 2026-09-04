import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricsChartSectionProps {
  history: any[];
  period: string;
  compare: string;
  summaryMetrics: [string, any][];
}

function formatMetricLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Count", "")
    .trim();
}

export function MetricsChartSection({ history, period, compare, summaryMetrics }: MetricsChartSectionProps) {
  // Dynamically create tabs from summary metrics that have history data
  const availableMetrics = useMemo(() => {
    if (!history || history.length === 0) return [];
    const sample = history[0];
    return summaryMetrics.filter(([key]) => key in sample).map(([key]) => key);
  }, [history, summaryMetrics]);

  const [activeMetric, setActiveMetric] = useState<string | null>(null);

  // Set initial active metric
  useMemo(() => {
    if (!activeMetric && availableMetrics.length > 0) {
      setActiveMetric(availableMetrics[0]);
    }
  }, [activeMetric, availableMetrics]);

  // Calculate growth
  const growth = useMemo(() => {
    const label = activeMetric ? formatMetricLabel(activeMetric).toLowerCase() : "";
    const pluralLabel = label.endsWith('s') ? label : label + 's';
    const steadyMsg = `Your ${pluralLabel} held steady this period.`;

    if (!activeMetric || history.length < 2) return { val: 0, pct: 0, msg: steadyMsg };
    
    const latest = Number(history[history.length - 1][activeMetric]) || 0;
    const oldest = Number(history[0][activeMetric]) || 0;
    
    const diff = latest - oldest;
    let pct = 0;
    if (oldest > 0) pct = (diff / oldest) * 100;
    
    let msg = steadyMsg;
    if (diff > 0) msg = `Your ${pluralLabel} grew by ${diff.toLocaleString()} this period.`;
    if (diff < 0) msg = `Your ${pluralLabel} decreased by ${Math.abs(diff).toLocaleString()} this period.`;
    
    return { val: diff, pct, msg };
  }, [activeMetric, history]);

  if (!history || history.length === 0 || !activeMetric) {
    return null;
  }

  const chartData = history;
  
  const maxVal = Math.max(...chartData.map(h => Number(h[activeMetric]) || 0), 1);
  const minVal = Math.min(...chartData.map(h => Number(h[activeMetric]) || 0), 0);

  return (
    <div className="mt-4 rounded-md border border-slate-200 bg-[#f8f8f6] dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">Metrics</h2>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
              {period} &middot; {compare}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          {availableMetrics.map((key) => {
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => setActiveMetric(key)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                }`}
              >
                {formatMetricLabel(key)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 py-2.5 text-[13px] font-medium flex items-center gap-2 mx-5 my-2 rounded bg-blue-50/80 text-blue-900 border border-blue-100/50 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-800/30">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        {growth.msg}
      </div>

      {/* Chart Area (HTML/CSS Bar Chart) */}
      <div className="p-5 pt-2">
        <div className="h-48 flex items-end justify-between gap-1 relative mt-4 border-b border-slate-200 dark:border-slate-700">
          {/* Y Axis Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-0">
             <div className="border-t border-slate-100 dark:border-slate-800 w-full" />
             <div className="border-t border-slate-100 dark:border-slate-800 w-full" />
             <div className="border-t border-slate-100 dark:border-slate-800 w-full" />
          </div>

          {/* Bars */}
          {chartData.map((d, i) => {
            const val = Number(d[activeMetric]) || 0;
            const heightPct = maxVal > 0 ? ((val - minVal) / (maxVal - minVal || 1)) * 100 : 0;
            const fmtDate = new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            
            return (
              <div key={i} className="group relative flex flex-col items-center justify-end h-full flex-1 min-w-[12px] z-10">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {fmtDate}: {val.toLocaleString()}
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[40px] bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-400 cursor-pointer"
                  style={{ height: `${Math.max(heightPct, 1)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
          <span>{chartData.length > 0 ? new Date(chartData[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
          <span>{chartData.length > 0 ? new Date(chartData[chartData.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
        </div>
      </div>
    </div>
  );
}
