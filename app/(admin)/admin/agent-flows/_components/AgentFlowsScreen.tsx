import Link from "next/link";
import { GitBranch, FileText, MessageSquare } from "lucide-react";

import { AGENT_FLOW_NOTES, AGENT_FLOWS } from "../_data/agentFlows";
import { AgentFlowCard } from "./AgentFlowCard";

export function AgentFlowsScreen() {
  return (
    <div className="w-full min-w-0 space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-on-surface">
          <GitBranch className="h-5 w-5 text-primary" />
          Agent Flows
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Which agents run for each product path. Prompt chips open System Prompts;
          model chips open AI Manager.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/admin/system-prompts"
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high"
          >
            <FileText className="h-3.5 w-3.5" />
            System Prompts
          </Link>
          <Link
            href="/admin/ai-manager"
            className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/25 bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-surface-container-high"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            AI Manager
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {AGENT_FLOWS.map((flow) => (
          <AgentFlowCard key={flow.id} flow={flow} />
        ))}
      </div>

      <ul className="space-y-1.5 rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
        {AGENT_FLOW_NOTES.map((note) => (
          <li key={note}>• {note}</li>
        ))}
      </ul>
    </div>
  );
}
