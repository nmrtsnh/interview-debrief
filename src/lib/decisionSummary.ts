import type {
  CompetencyRating,
  ConfidenceLevel,
  DebriefResult,
  DecisionSummary,
  EvidenceQuality,
  Recommendation,
  RubricOutput,
} from "@/types/debrief";
import { shortCompetencyLabel } from "@/lib/evidenceFormat";

export function buildDecisionSummary(result: DebriefResult): DecisionSummary {
  const { rubric, pack, evidence } = result;

  const strongestEntry = rubric.competencyScores.find((c) => c.score === "Strong");
  const weakestEntry = rubric.competencyScores.find((c) => c.score === "Weak");
  const notAssessedEntries = rubric.competencyScores.filter(
    (c) => c.score === "Not assessed",
  );

  const strongestSignal = strongestEntry
    ? shortCompetencyLabel(strongestEntry.competency)
    : evidence.demonstratedStrengths[0] ?? "No strong signal captured";

  const mainConcern = weakestEntry
    ? shortCompetencyLabel(weakestEntry.competency)
    : evidence.demonstratedConcerns[0]?.replace(
        /^Metrics and success criteria answers lacked specificity$/i,
        "Metrics depth",
      ) ??
      rubric.criticalGaps[0] ??
      "None noted";

  const notAssessed =
    notAssessedEntries.length > 0
      ? notAssessedEntries
          .map((c) => labelNotAssessed(c.competency, evidence.missingTopicsNotCovered))
          .sort((a, b) => {
            if (a.includes("Stakeholder")) return -1;
            if (b.includes("Stakeholder")) return 1;
            return 0;
          })
          .slice(0, 2)
          .join(", ")
      : "None noted";

  const suggestedNextStep = deriveSuggestedNextStep(
    pack.recommendation,
    rubric,
  );

  return {
    strongestSignal,
    mainConcern,
    notAssessed,
    suggestedNextStep,
  };
}

function labelNotAssessed(competency: string, missingTopics: string[]): string {
  const lower = competency.toLowerCase();
  if (lower.includes("stakeholder")) {
    const missing = missingTopics.find((topic) => /stakeholder/i.test(topic));
    if (missing && /conflict/i.test(missing)) {
      return "Stakeholder conflict";
    }
  }
  return shortCompetencyLabel(competency);
}

function deriveSuggestedNextStep(
  recommendation: Recommendation,
  rubric: RubricOutput,
): string {
  const followUp = rubric.recommendedFollowUpsBeforeDecision[0];
  if (followUp) {
    if (/analytics|metric/i.test(followUp)) {
      return "Focused analytics follow-up";
    }
    if (/stakeholder|pushback|behavioral/i.test(followUp)) {
      return "Stakeholder scenario follow-up";
    }
    return followUp.length > 48 ? `${followUp.slice(0, 45)}…` : followUp;
  }

  switch (recommendation) {
    case "Proceed to next stage":
      return "Proceed to next interview stage";
    case "Focused follow-up required":
      return "Schedule focused follow-up";
    case "Panel review required":
      return "Panel review before next step";
    case "Insufficient evidence":
      return "Collect additional interview evidence";
  }
}

export function deriveRecommendation(
  transcript: string,
  rubric: RubricOutput,
): Recommendation {
  if (/reject|no hire|\bpass\b on this|would pass|insufficient evidence/i.test(transcript)) {
    return "Insufficient evidence";
  }

  const weakCount = rubric.competencyScores.filter((c) => c.score === "Weak").length;
  const notAssessedCount = rubric.competencyScores.filter(
    (c) => c.score === "Not assessed",
  ).length;
  const hasFollowUps = rubric.recommendedFollowUpsBeforeDecision.length > 0;

  if (weakCount > 0 || hasFollowUps) {
    return "Focused follow-up required";
  }

  if (notAssessedCount >= 2) {
    return "Panel review required";
  }

  if (/lean yes|advance|strong signal|would advance/i.test(transcript)) {
    return "Proceed to next stage";
  }

  if (notAssessedCount === 1) {
    return "Panel review required";
  }

  return "Proceed to next stage";
}

export function deriveAssessmentConfidence(
  scores: Array<{ score: CompetencyRating; confidence: ConfidenceLevel }>,
): ConfidenceLevel {
  const weak = scores.filter((c) => c.score === "Weak").length;
  const notAssessed = scores.filter((c) => c.score === "Not assessed").length;
  const lowConfidence = scores.filter((c) => c.confidence === "Low").length;

  if (weak > 0 || notAssessed >= 2 || lowConfidence >= 3) {
    return "Medium";
  }
  if (notAssessed >= 1 || lowConfidence >= 1) {
    return "Medium";
  }
  return "High";
}

export function mapEvidenceQualityToConfidence(quality: EvidenceQuality): ConfidenceLevel {
  switch (quality) {
    case "Specific":
      return "High";
    case "Partial":
      return "Medium";
    case "Vague":
    case "None":
      return "Low";
  }
}
