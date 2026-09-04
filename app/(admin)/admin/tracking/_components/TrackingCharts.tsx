"use client";

import { useState } from "react";

import type { LabeledValue } from "@/lib/admin/trackingApi";
import { formatCount, niceTicks, roundedBarPath } from "@/lib/admin/trackingApi";

/**
 * Hand-rolled SVG horizontal bar charts (dataviz skill: single-series nominal
 * bars in one hue, 4px rounded data-ends square at the baseline, hairline
 * gridlines, direct value labels, per-mark hover tooltip, no legend).
 * Mark hue is validated per theme mode (see the scoped style block below).
 */

const VB_W = 640;
const ROW_H = 30;
const BAR_H = 20;
const TOP_PAD = 6;
const AXIS_H = 26;
const VALUE_PAD = 64;

function truncateLabel(label: string, max: number): string {
  return label.length <= max ? label : `${label.slice(0, max - 1)}…`;
}

interface HoverState {
  index: number;
  x: number;
  y: number;
}

export function HBarChart({
  data,
  labelWidth = 210,
  emptyText,
}: {
  data: LabeledValue[];
  labelWidth?: number;
  emptyText: string;
}) {
  const [hover, setHover] = useState<HoverState | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-on-surface-variant">
        {emptyText}
      </p>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const ticks = niceTicks(maxValue);
  const scaleMax = ticks[ticks.length - 1] || 1;
  const plotLeft = labelWidth + 10;
  const plotRight = VB_W - VALUE_PAD;
  const plotWidth = plotRight - plotLeft;
  const height = TOP_PAD + data.length * ROW_H + AXIS_H;
  const plotBottom = TOP_PAD + data.length * ROW_H;
  const labelChars = Math.floor(labelWidth / 6.4);

  const trackMouse = (index: number) => (e: React.MouseEvent<SVGRectElement>) => {
    const host = (e.currentTarget as SVGElement)
      .closest("figure")
      ?.getBoundingClientRect();
    if (!host) return;
    setHover({ index, x: e.clientX - host.left, y: e.clientY - host.top });
  };

  return (
    <figure className="relative m-0">
      <svg
        viewBox={`0 0 ${VB_W} ${height}`}
        className="w-full"
        role="img"
        aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t) => {
          const x = plotLeft + (t / scaleMax) * plotWidth;
          return (
            <g key={t}>
              <line
                x1={x}
                y1={TOP_PAD}
                x2={x}
                y2={plotBottom}
                strokeWidth={1}
                style={{
                  stroke: "var(--color-outline-variant)",
                  strokeOpacity: t === 0 ? 0.6 : 0.25,
                }}
              />
              <text
                x={x}
                y={plotBottom + 16}
                textAnchor="middle"
                fontSize={10}
                style={{ fill: "var(--color-on-surface-variant)" }}
              >
                {formatCount(t)}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const y = TOP_PAD + i * ROW_H;
          const barY = y + (ROW_H - BAR_H) / 2;
          const barW = (Math.max(0, d.value) / scaleMax) * plotWidth;
          return (
            <g key={d.label}>
              <text
                x={labelWidth}
                y={y + ROW_H / 2 + 3.5}
                textAnchor="end"
                fontSize={11}
                style={{ fill: "var(--color-on-surface-variant)" }}
              >
                {truncateLabel(d.label, labelChars)}
              </text>
              {barW > 0 ? (
                <path
                  d={roundedBarPath(plotLeft, barY, barW, BAR_H, 4)}
                  style={{
                    fill: "var(--admin-chart-mark)",
                    opacity: hover && hover.index !== i ? 0.55 : 1,
                  }}
                />
              ) : null}
              <text
                x={plotLeft + barW + 6}
                y={y + ROW_H / 2 + 3.5}
                fontSize={11}
                fontWeight={600}
                style={{ fill: "var(--color-on-surface)" }}
              >
                {formatCount(d.value)}
              </text>
              <rect
                x={0}
                y={y}
                width={VB_W}
                height={ROW_H}
                fill="transparent"
                onMouseEnter={trackMouse(i)}
                onMouseMove={trackMouse(i)}
              />
            </g>
          );
        })}
      </svg>
      {hover ? (
        <figcaption
          className="pointer-events-none absolute z-10 max-w-xs -translate-y-full rounded-lg border border-outline-variant/20 bg-surface-container-high px-2.5 py-1.5 text-xs shadow-sm"
          style={{ left: Math.min(hover.x + 12, 999), top: hover.y - 8 }}
        >
          <span className="block break-all font-medium text-on-surface">
            {data[hover.index].label}
          </span>
          <span className="text-on-surface-variant">
            {formatCount(data[hover.index].value)} hits
          </span>
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
      <h2 className="text-sm font-bold text-on-surface">{title}</h2>
      <p className="mb-3 mt-0.5 text-xs text-on-surface-variant">{subtitle}</p>
      {children}
    </section>
  );
}

/**
 * Scoped mark color per theme mode. Both values pass the dataviz palette
 * validator (lightness band, chroma floor, >=3:1 contrast) against the
 * light (#f0f4ff/#f5f0eb/#ffffff) and dark (#191b26/#0f1e2e/#1f0f3a)
 * card surfaces used by the app themes.
 */
export function TrackingVizStyle() {
  return (
    <style>{`
      .admin-tracking-viz { --admin-chart-mark: #8b6ff0; }
      [data-theme="light"] .admin-tracking-viz,
      [data-theme="warm"] .admin-tracking-viz,
      [data-theme="arctic"] .admin-tracking-viz { --admin-chart-mark: #1a56db; }
    `}</style>
  );
}
