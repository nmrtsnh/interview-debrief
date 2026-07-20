import { AgentWorkflow, type AgentId } from "@/components/AgentWorkflow";
import type { AgentStatus } from "@/types/debrief";

interface ProcessingPanelProps {
  statuses: Record<AgentId, AgentStatus>;
  activeLabel: string;
}

export function ProcessingPanel({ statuses, activeLabel }: ProcessingPanelProps) {
  return (
    <section
      aria-labelledby="processing-heading"
      className="motion-safe:animate-fade-in-up shadow-card rounded-2xl bg-surface px-6 py-10"
    >
      <h2 id="processing-heading" className="text-center text-base font-medium text-stone-800">
        Preparing your decision pack
      </h2>
      <p className="mt-1.5 text-center text-sm text-stone-500">
        Usually takes 30–60 seconds
      </p>
      <AgentWorkflow statuses={statuses} activeLabel={activeLabel} />
    </section>
  );
}
