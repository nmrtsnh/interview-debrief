import { runAgentStep } from "@/lib/agents/orchestrator";
import type {
  AgentStep,
  DebriefContext,
  EvidenceOutput,
  RubricOutput,
} from "@/types/debrief";

export const runtime = "nodejs";

interface DebriefRequestBody {
  transcript: string;
  step: AgentStep;
  context: DebriefContext;
  prior?: {
    evidence?: EvidenceOutput;
    rubric?: RubricOutput;
  };
}

export async function POST(request: Request) {
  let body: DebriefRequestBody;

  try {
    body = (await request.json()) as DebriefRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const transcript = body.transcript?.trim();
  if (!transcript) {
    return Response.json({ error: "transcript is required" }, { status: 400 });
  }

  if (!body.step || !["evidence", "rubric", "pack"].includes(body.step)) {
    return Response.json({ error: "Valid step is required" }, { status: 400 });
  }

  if (!body.context?.roleTitle || !body.context?.stage) {
    return Response.json({ error: "context with roleTitle and stage is required" }, { status: 400 });
  }

  const candidateName = body.context.candidateName?.trim();
  if (!candidateName) {
    return Response.json({ error: "context.candidateName is required" }, { status: 400 });
  }

  const context = {
    ...body.context,
    candidateName,
  };

  try {
    const result = await runAgentStep(
      body.step,
      transcript,
      context,
      body.prior,
    );
    return Response.json({
      step: body.step,
      data: result.data,
      source: result.source,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Agent step failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
