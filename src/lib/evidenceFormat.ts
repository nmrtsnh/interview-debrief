import type { ConfidenceLevel, EvidenceQuality } from "@/types/debrief";

export function formatEvidenceLine(
  quote: string | null,
  paraphrase: string | null,
): string {
  if (quote) {
    return `Quote: "${quote}"`;
  }
  if (paraphrase) {
    return `Paraphrase (interviewer observation): ${paraphrase}`;
  }
  return "Insufficient evidence";
}

export function confidenceFromQuality(quality: EvidenceQuality): ConfidenceLevel {
  switch (quality) {
    case "Specific":
      return "High";
    case "Partial":
      return "Medium";
    case "Vague":
      return "Low";
    case "None":
      return "Low";
  }
}

/** Extract a verbatim substring from the transcript when it clearly appears. */
export function extractVerbatimSnippet(
  transcript: string,
  pattern: RegExp,
): string | null {
  const match = transcript.match(pattern);
  if (!match) return null;
  const snippet = (match[1] ?? match[0]).trim();
  if (snippet.length < 8 || snippet.length > 160) return null;
  return snippet.replace(/^["']|["']$/g, "");
}

export function shortCompetencyLabel(competency: string): string {
  const lower = competency.toLowerCase();
  if (lower.includes("priorit") || lower.includes("strategy")) return "Roadmap prioritisation";
  if (lower.includes("metric") || lower.includes("analytical")) return "Metrics depth";
  if (lower.includes("communication")) return "Communication clarity";
  if (lower.includes("stakeholder")) return "Stakeholder management";
  if (lower.includes("culture") || lower.includes("collaboration")) return "Culture add";
  return competency.split(/[&/]/)[0]?.trim() ?? competency;
}
