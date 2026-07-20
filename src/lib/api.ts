import type {
  AgentStep,
  DebriefContext,
  DecisionPackOutput,
  EvidenceOutput,
  RubricOutput,
} from "@/types/debrief";

interface StepResponse {
  step: AgentStep;
  data: EvidenceOutput | RubricOutput | DecisionPackOutput;
  source: "cursor-sdk" | "fallback";
}

async function postStep(
  transcript: string,
  step: AgentStep,
  context: DebriefContext,
  prior?: { evidence?: EvidenceOutput; rubric?: RubricOutput },
): Promise<StepResponse> {
  const response = await fetch("/api/debrief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, step, context, prior }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error ?? "Debrief agent request failed");
  }

  return response.json() as Promise<StepResponse>;
}

export async function runDebriefStep(
  transcript: string,
  step: AgentStep,
  context: DebriefContext,
  prior?: { evidence?: EvidenceOutput; rubric?: RubricOutput },
): Promise<StepResponse> {
  return postStep(transcript, step, context, prior);
}
