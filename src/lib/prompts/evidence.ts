import type { DebriefContext } from "@/types/debrief";

export const EVIDENCE_JSON_SCHEMA = `{
  "candidateName": "string | null",
  "roleDiscussed": "string | null",
  "interviewFormat": "string",
  "keyMoments": [
    {
      "topic": "string",
      "whatHappened": "string",
      "candidateQuoteOrParaphrase": "string | null",
      "interviewerObservation": "string"
    }
  ],
  "demonstratedStrengths": ["string"],
  "demonstratedConcerns": ["string"],
  "skillsMentioned": ["string"],
  "openQuestions": ["string"],
  "missingTopicsNotCovered": ["string"],
  "overallImpressionRaw": "string"
}`;

export function buildEvidencePrompt(
  transcript: string,
  context: DebriefContext,
): string {
  return `You are the Evidence Agent for interview debriefs. Extract structured facts only — do NOT make a hiring recommendation.

Role: ${context.roleTitle}
Stage: ${context.stage}

Return ONLY valid JSON matching this schema (no markdown, no commentary):
${EVIDENCE_JSON_SCHEMA}

Rules:
- Separate facts from interviewer opinions
- Capture specific examples when mentioned
- Note topics that were not covered
- Do not score competencies or recommend hire/no-hire

Original debrief:
"""
${transcript}
"""`;
}
