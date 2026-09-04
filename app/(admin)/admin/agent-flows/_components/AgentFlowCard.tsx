import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { AgentFlow, FlowStep } from "../_data/agentFlows";

function StepChip({ step }: { step: FlowStep }) {
  const base =
    "inline-flex max-w-full flex-col rounded-xl border px-2.5 py-1.5 text-left";
  if (step.kind === "prompt") {
    const inner = (
      <>
        <span className="text-xs font-bold text-on-surface">{step.label}</span>
        {step.key ? (
          <span className="font-mono text-[10px] text-primary">{step.key}</span>
        ) : null}
      </>
    );
    if (step.href) {
      const href =
        step.kind === "prompt" && step.key && !step.href.includes("?")
          ? `${step.href}?key=${encodeURIComponent(step.key)}`
          : step.href;
      return (
        <Link
          href={href}
          className={`${base} border-primary/30 bg-primary/10 hover:bg-primary/15`}
        >
          {inner}
        </Link>
      );
    }
    return (
      <span className={`${base} border-primary/30 bg-primary/10`}>{inner}</span>
    );
  }
  if (step.kind === "model") {
    const inner = (
      <>
        <span className="text-xs font-bold text-on-surface">{step.label}</span>
        {step.key ? (
          <span className="font-mono text-[10px] text-tertiary">{step.key}</span>
        ) : null}
        <span className="text-[10px] text-on-surface-variant">AI Manager</span>
      </>
    );
    if (step.href) {
      return (
        <Link
          href={step.href}
          className={`${base} border-tertiary/35 bg-tertiary/10 hover:bg-tertiary/15`}
        >
          {inner}
        </Link>
      );
    }
    return (
      <span className={`${base} border-tertiary/35 bg-tertiary/10`}>{inner}</span>
    );
  }
  return (
    <span
      className={`${base} border-outline-variant/25 bg-surface-container text-on-surface-variant`}
    >
      <span className="text-xs font-medium">{step.label}</span>
    </span>
  );
}

export function AgentFlowCard({ flow }: { flow: AgentFlow }) {
  return (
    <article className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-4">
      <h2 className="text-sm font-bold text-on-surface">{flow.title}</h2>
      <p className="mt-1 text-xs text-on-surface-variant">{flow.summary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {flow.steps.map((step, i) => (
          <span key={`${flow.id}-${i}`} className="inline-flex items-center gap-1.5">
            {i > 0 ? (
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-on-surface-variant/60" />
            ) : null}
            <StepChip step={step} />
          </span>
        ))}
      </div>
    </article>
  );
}
