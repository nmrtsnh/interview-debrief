import {
  runFallbackEvidence,
  runFallbackPack,
  runFallbackRubric,
} from "@/lib/agents/fallback";
import { buildEvidencePrompt } from "@/lib/prompts/evidence";
import { buildPackPrompt } from "@/lib/prompts/pack";
import { buildRubricPrompt } from "@/lib/prompts/rubric";
import type {
  AgentStep,
  DebriefContext,
  DecisionPackOutput,
  EvidenceOutput,
  RubricOutput,
} from "@/types/debrief";

export type AgentSource = "cursor-sdk" | "fallback";

function shouldUseLiveAgents(): boolean {
  const mode = process.env.AGENT_MODE?.trim().toLowerCase();
  if (mode === "demo" || mode === "fallback") {
    return false;
  }
  return Boolean(process.env.CURSOR_API_KEY?.trim());
}

function extractJson<T>(text: string): T {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Agent did not return valid JSON");
    }
    return JSON.parse(match[0]) as T;
  }
}

async function runCursorPrompt(prompt: string): Promise<string> {
  const { Agent } = await import("@cursor/sdk");
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error("CURSOR_API_KEY is not configured");
  }

  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2.5" },
    local: { cwd: process.cwd() },
  });

  if (result.status !== "finished" || !result.result) {
    throw new Error(
      result.error?.message ?? "Cursor agent did not complete successfully",
    );
  }

  return result.result;
}

export async function runEvidenceAgent(
  transcript: string,
  context: DebriefContext,
): Promise<{ data: EvidenceOutput; source: AgentSource }> {
  if (!shouldUseLiveAgents()) {
    return { data: runFallbackEvidence(transcript, context), source: "fallback" };
  }

  try {
    const raw = await runCursorPrompt(buildEvidencePrompt(transcript, context));
    return { data: extractJson<EvidenceOutput>(raw), source: "cursor-sdk" };
  } catch {
    return { data: runFallbackEvidence(transcript, context), source: "fallback" };
  }
}

export async function runRubricAgent(
  transcript: string,
  evidence: EvidenceOutput,
  context: DebriefContext,
): Promise<{ data: RubricOutput; source: AgentSource }> {
  if (!shouldUseLiveAgents()) {
    return {
      data: runFallbackRubric(transcript, evidence, context),
      source: "fallback",
    };
  }

  try {
    const raw = await runCursorPrompt(
      buildRubricPrompt(transcript, evidence, context),
    );
    return { data: extractJson<RubricOutput>(raw), source: "cursor-sdk" };
  } catch {
    return {
      data: runFallbackRubric(transcript, evidence, context),
      source: "fallback",
    };
  }
}

export async function runPackAgent(
  transcript: string,
  evidence: EvidenceOutput,
  rubric: RubricOutput,
  context: DebriefContext,
): Promise<{ data: DecisionPackOutput; source: AgentSource }> {
  if (!shouldUseLiveAgents()) {
    return {
      data: runFallbackPack(transcript, evidence, rubric, context),
      source: "fallback",
    };
  }

  try {
    const raw = await runCursorPrompt(
      buildPackPrompt(transcript, evidence, rubric, context),
    );
    return { data: extractJson<DecisionPackOutput>(raw), source: "cursor-sdk" };
  } catch {
    return {
      data: runFallbackPack(transcript, evidence, rubric, context),
      source: "fallback",
    };
  }
}

export async function runAgentStep(
  step: AgentStep,
  transcript: string,
  context: DebriefContext,
  prior?: { evidence?: EvidenceOutput; rubric?: RubricOutput },
): Promise<{
  data: EvidenceOutput | RubricOutput | DecisionPackOutput;
  source: AgentSource;
}> {
  switch (step) {
    case "evidence":
      return runEvidenceAgent(transcript, context);
    case "rubric":
      if (!prior?.evidence) {
        throw new Error("Evidence output required for rubric agent");
      }
      return runRubricAgent(transcript, prior.evidence, context);
    case "pack":
      if (!prior?.evidence || !prior?.rubric) {
        throw new Error("Evidence and rubric outputs required for pack agent");
      }
      return runPackAgent(transcript, prior.evidence, prior.rubric, context);
  }
}
