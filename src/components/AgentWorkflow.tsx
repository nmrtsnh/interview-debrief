import { AgentStep } from "@/components/AgentCard";
import type { AgentStatus } from "@/types/debrief";

const AGENTS = [
  { id: "evidence", label: "Evidence" },
  { id: "rubric", label: "Rubric" },
  { id: "pack", label: "Pack" },
] as const;

interface AgentWorkflowProps {
  statuses: Record<(typeof AGENTS)[number]["id"], AgentStatus>;
  activeLabel?: string;
}

export function AgentWorkflow({ statuses, activeLabel }: AgentWorkflowProps) {
  return (
    <section aria-labelledby="workflow-heading" className="mt-8 border-t border-stone-200 pt-6">
      {activeLabel && (
        <p className="mb-4 text-center text-sm text-stone-500" aria-live="polite">
          {activeLabel}
        </p>
      )}
      <div className="flex items-start gap-0">
        {AGENTS.map((agent, index) => (
          <AgentStep
            key={agent.id}
            label={agent.label}
            status={statuses[agent.id]}
            isLast={index === AGENTS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

export type AgentId = (typeof AGENTS)[number]["id"];

export const INITIAL_AGENT_STATUSES: Record<AgentId, AgentStatus> = {
  evidence: "waiting",
  rubric: "waiting",
  pack: "waiting",
};

export const AGENT_LABELS: Record<AgentId, string> = {
  evidence: "Extracting evidence from your debrief…",
  rubric: "Scoring against rubric and checking feedback quality…",
  pack: "Building your decision pack…",
};
