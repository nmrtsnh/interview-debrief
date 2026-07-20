import {
  confidenceFromQuality,
  extractVerbatimSnippet,
  formatEvidenceLine,
} from "@/lib/evidenceFormat";
import type {
  CompetencyRating,
  EvidenceQuality,
  QualityFlag,
} from "@/types/debrief";
import { assertNoProtectedCharacteristicReference } from "@/lib/protectedCharacteristics";

export interface CompetencyScoreResult {
  score: CompetencyRating;
  evidence: string;
  evidenceQuality: EvidenceQuality;
}

function hasMetricsWeakness(transcript: string): boolean {
  return /weak on metrics|metrics.*vague|success criteria.*vague|stayed vague|analytics/i.test(
    transcript,
  );
}

function hasPrioritizationStrength(transcript: string): boolean {
  return /prioritization|roadmap|killing.*features|usage data|deprioriti/i.test(
    transcript,
  );
}

function hasStakeholderGap(transcript: string): boolean {
  return /stakeholder|conflict|pushback/i.test(transcript);
}

function hasCommunicationEvidence(transcript: string): boolean {
  return /communication|clear|structured|articulate|explained well/i.test(transcript);
}

function hasSubjectiveRapportLanguage(transcript: string): boolean {
  return /good energy|culture fit|great vibe|likeable|likable/i.test(transcript);
}

function hasBehavioralExamples(transcript: string): boolean {
  return /example|specifically|walked through|when i asked|described|she walked|he walked/i.test(
    transcript,
  );
}

export function scoreCompetency(
  competency: string,
  transcript: string,
): CompetencyScoreResult {
  const lower = competency.toLowerCase();

  if (lower.includes("priorit") || lower.includes("strategy")) {
    if (hasPrioritizationStrength(transcript)) {
      const quote =
        extractVerbatimSnippet(
          transcript,
          /(?:walked through|described|gave)\s+([^.—]+(?:usage data|features)[^.—]*)/i,
        ) ??
        extractVerbatimSnippet(
          transcript,
          /(killing two features with usage data|killed two features with usage data)/i,
        );
      return {
        score: "Strong",
        evidence: formatEvidenceLine(
          quote,
          quote
            ? null
            : "Candidate described deprioritising features using usage data.",
        ),
        evidenceQuality: quote ? "Specific" : "Partial",
      };
    }
    if (/priorit|roadmap|strategy/i.test(transcript)) {
      return {
        score: "Mixed",
        evidence: formatEvidenceLine(
          null,
          "Product strategy mentioned in the debrief without a detailed example.",
        ),
        evidenceQuality: "Partial",
      };
    }
    return {
      score: "Not assessed",
      evidence: "Insufficient evidence",
      evidenceQuality: "None",
    };
  }

  if (lower.includes("metric") || lower.includes("analytical")) {
    if (hasMetricsWeakness(transcript)) {
      const quote = extractVerbatimSnippet(
        transcript,
        /(weak on metrics[^.—]*|success criteria[^.—]*vague[^.—]*|when I asked about success criteria[^.—]*)/i,
      );
      return {
        score: "Weak",
        evidence: formatEvidenceLine(
          quote,
          quote ? null : "Interviewer noted vague answers on success criteria when probed.",
        ),
        evidenceQuality: quote ? "Specific" : "Partial",
      };
    }
    if (/north-star|success criteria|metric|kpi|analytics/i.test(transcript)) {
      return {
        score: "Mixed",
        evidence: formatEvidenceLine(
          null,
          "Metrics or success criteria were mentioned without sufficient detail in the debrief.",
        ),
        evidenceQuality: "Partial",
      };
    }
    return {
      score: "Not assessed",
      evidence: "Insufficient evidence",
      evidenceQuality: "None",
    };
  }

  if (lower.includes("communication")) {
    if (hasCommunicationEvidence(transcript)) {
      const quote = extractVerbatimSnippet(
        transcript,
        /(communication was clear[^.—]*|clear and structured[^.—]*)/i,
      );
      return {
        score: "Mixed",
        evidence: formatEvidenceLine(
          quote,
          quote ? null : "Interviewer noted generally clear communication.",
        ),
        evidenceQuality: quote ? "Specific" : "Partial",
      };
    }
    return {
      score: "Not assessed",
      evidence: "Insufficient evidence",
      evidenceQuality: "None",
    };
  }

  if (lower.includes("stakeholder")) {
    if (/didn't go deep|not covered|not explored|missing/i.test(transcript) && hasStakeholderGap(transcript)) {
      const quote = extractVerbatimSnippet(
        transcript,
        /(didn't go deep on stakeholder[^.—]*|stakeholder conflict[^.—]*not[^.—]*)/i,
      );
      return {
        score: "Not assessed",
        evidence: formatEvidenceLine(
          quote,
          quote ? null : "Stakeholder management was referenced but not explored in depth.",
        ),
        evidenceQuality: "None",
      };
    }
    if (hasStakeholderGap(transcript) && hasBehavioralExamples(transcript)) {
      const quote = extractVerbatimSnippet(
        transcript,
        /(pushback[^.—]*|stakeholder[^.—]*alignment[^.—]*|executive alignment[^.—]*)/i,
      );
      return {
        score: "Mixed",
        evidence: formatEvidenceLine(
          quote,
          quote ? null : "Some stakeholder context was captured in the debrief.",
        ),
        evidenceQuality: quote ? "Specific" : "Partial",
      };
    }
    return {
      score: "Not assessed",
      evidence: "Insufficient evidence",
      evidenceQuality: "None",
    };
  }

  if (lower.includes("culture") || lower.includes("collaboration")) {
    if (hasSubjectiveRapportLanguage(transcript)) {
      const quote = extractVerbatimSnippet(
        transcript,
        /(good energy[^.—]*|smart questions[^.—]*)/i,
      );
      return {
        score: "Mixed",
        evidence: formatEvidenceLine(
          quote,
          quote ? null : "Interviewer noted positive rapport without behavioural examples.",
        ),
        evidenceQuality: "Vague",
      };
    }
    return {
      score: "Not assessed",
      evidence: "Insufficient evidence",
      evidenceQuality: "None",
    };
  }

  return {
    score: "Not assessed",
    evidence: "Insufficient evidence",
    evidenceQuality: "None",
  };
}

export function buildQualityFlags(
  transcript: string,
  missingTopics: string[],
  competencyScores: Array<{ competency: string; score: CompetencyRating; evidence: string }>,
): QualityFlag[] {
  const flags: QualityFlag[] = [];

  if (hasSubjectiveRapportLanguage(transcript) && !hasBehavioralExamples(transcript)) {
    flags.push({
      issue: "Subjective language such as “good energy”",
      whyItMatters:
        "Impression-based notes can introduce bias and are hard for a panel to calibrate.",
      recommendedCorrection:
        "Replace subjective labels with a specific behavioural example from the interview.",
      severity: "Info",
    });
  }

  const vagueCulture = competencyScores.find(
    (c) =>
      c.competency.toLowerCase().includes("culture") &&
      c.score === "Mixed" &&
      /good energy|smart questions/i.test(c.evidence),
  );
  if (vagueCulture) {
    flags.push({
      issue: "Missing behavioural evidence",
      whyItMatters:
        "Collaboration and culture-add ratings need concrete examples, not rapport alone.",
      recommendedCorrection:
        "Add one example of how the candidate worked with cross-functional partners.",
      severity: "Warning",
    });
  }

  const weakMetrics = competencyScores.find(
    (c) =>
      c.competency.toLowerCase().includes("metric") && c.score === "Weak",
  );
  if (weakMetrics) {
    flags.push({
      issue: "Conclusion stronger than available evidence",
      whyItMatters:
        "A weak competency signal should trigger follow-up before any next-step decision.",
      recommendedCorrection:
        "Schedule a focused follow-up on metrics or request a short case response.",
      severity: "Warning",
    });
  }

  for (const topic of missingTopics) {
    flags.push({
      issue: `Competency not assessed: ${topic}`,
      whyItMatters:
        "Missing coverage is not negative evidence, but the panel cannot score what was not discussed.",
      recommendedCorrection:
        "Assign a follow-up interviewer or add targeted questions in the next round.",
      severity: "Info",
    });
  }

  if (/didn't go deep|not covered|stayed vague/i.test(transcript)) {
    flags.push({
      issue: "Candidate quote not captured",
      whyItMatters:
        "Paraphrased notes are harder to review and may lose important nuance.",
      recommendedCorrection:
        "Capture a short verbatim quote or labelled paraphrase for each major competency.",
      severity: "Info",
    });
  }

  const unsupportedMixed = competencyScores.filter(
    (c) => c.score === "Mixed" && c.evidence === "Insufficient evidence",
  );
  if (unsupportedMixed.length > 0) {
    flags.push({
      issue: "Unsupported competency rating",
      whyItMatters:
        "Ratings without evidence make panel review slower and less fair.",
      recommendedCorrection:
        "Downgrade to Not assessed or add the supporting observation from the interview.",
      severity: "Warning",
    });
  }

  for (const flag of flags) {
    assertNoProtectedCharacteristicReference(flag.issue, "quality flag issue");
    assertNoProtectedCharacteristicReference(flag.whyItMatters, "quality flag whyItMatters");
    assertNoProtectedCharacteristicReference(
      flag.recommendedCorrection,
      "quality flag recommendedCorrection",
    );
  }

  return flags;
}

export {
  hasMetricsWeakness,
  hasPrioritizationStrength,
  hasStakeholderGap,
  hasSubjectiveRapportLanguage,
  hasBehavioralExamples,
  confidenceFromQuality,
};
