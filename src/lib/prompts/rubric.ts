import type { DebriefContext, EvidenceOutput } from "@/types/debrief";

export const RUBRIC_JSON_SCHEMA = `{
  "competencyScores": [
    {
      "competency": "string",
      "score": "Strong | Mixed | Weak | Not assessed",
      "evidenceSummary": "string",
      "evidenceQuality": "Specific | Partial | Vague | None"
    }
  ],
  "biasAndQualityFlags": [
    {
      "flag": "string",
      "severity": "Info | Warning",
      "suggestion": "string"
    }
  ],
  "criticalGaps": ["string"],
  "recommendedFollowUpsBeforeDecision": ["string"],
  "confidenceInAssessment": "High | Medium | Low"
}`;

export function buildRubricPrompt(
  transcript: string,
  evidence: EvidenceOutput,
  context: DebriefContext,
): string {
  return `You are the Bias & Rubric Agent. Score the candidate against each competency using ONLY the evidence provided. Flag vague, unsupported, or potentially biased feedback.

Role: ${context.roleTitle}
Stage: ${context.stage}
Competencies to score:
${context.rubric.map((c) => `- ${c}`).join("\n")}

Evidence JSON:
${JSON.stringify(evidence, null, 2)}

Return ONLY valid JSON matching this schema (no markdown, no commentary):
${RUBRIC_JSON_SCHEMA}

Rules:
- Score each listed competency
- Flag feedback that lacks behavioral evidence (e.g. vague "culture fit")
- Note competencies that were not assessed
- Do NOT produce final hire/no-hire recommendation — that is the next agent's job

Original debrief:
"""
${transcript}
"""`;
}
