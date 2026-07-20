import type {
  DebriefContext,
  EvidenceOutput,
  RubricOutput,
} from "@/types/debrief";

export const PACK_JSON_SCHEMA = `{
  "recommendation": "Advance | Hold | Reject",
  "recommendationRationale": "string",
  "scorecardSummary": {
    "headline": "string",
    "topStrengths": ["string"],
    "topRisks": ["string"],
    "competencyTable": [
      { "competency": "string", "score": "string", "note": "string" }
    ]
  },
  "panelDebriefNotes": "string — bullet notes for hiring committee, one per line starting with '- '",
  "slackMessageDraft": "string — short message for #hiring channel",
  "candidateFollowUpDraft": "string | null — only if Hold or Advance with clarifying questions needed",
  "nextStepChecklist": ["string"]
}`;

export function buildPackPrompt(
  transcript: string,
  evidence: EvidenceOutput,
  rubric: RubricOutput,
  context: DebriefContext,
): string {
  return `You are the Decision Pack Agent. Produce hiring artifacts for the panel. The recommendation is a DRAFT for human review only.

Role: ${context.roleTitle}
Stage: ${context.stage}

Evidence JSON:
${JSON.stringify(evidence, null, 2)}

Rubric JSON:
${JSON.stringify(rubric, null, 2)}

Return ONLY valid JSON matching this schema (no markdown fences, no commentary):
${PACK_JSON_SCHEMA}

Rules:
- recommendation must be Advance, Hold, or Reject
- panelDebriefNotes: one bullet per line starting with "- ". Use "**Label:** detail" for labeled bullets (e.g. "- **Screen outcome:** Hold pending analytics follow-up"). Match the role in context: ${context.roleTitle}
- slackMessageDraft should be 2-4 sentences
- candidateFollowUpDraft only if follow-up questions are needed before deciding
- nextStepChecklist should be actionable items for the hiring team

Original debrief:
"""
${transcript}
"""`;
}
