import type {
  CompetencyRating,
  DebriefContext,
  DecisionPackOutput,
  EvidenceOutput,
  EvidenceQuality,
  RubricOutput,
} from "@/types/debrief";
import { DEFAULT_RUBRIC } from "@/lib/constants";

function extractName(transcript: string): string {
  const withMatch = transcript.match(/\b(?:with|finished with|met)\s+([A-Z][a-z]+)\b/);
  return withMatch?.[1] ?? "Candidate";
}

function hasMetricsWeakness(transcript: string): boolean {
  return /weak on metrics|metrics.*vague|success criteria.*vague|analytics/i.test(
    transcript,
  );
}

function hasPrioritizationStrength(transcript: string): boolean {
  return /prioritization|roadmap|killing.*features|usage data/i.test(transcript);
}

function hasStakeholderGap(transcript: string): boolean {
  return /stakeholder|conflict|pushback/i.test(transcript);
}

function scoreCompetency(
  competency: string,
  transcript: string,
): { score: CompetencyRating; evidenceSummary: string; evidenceQuality: EvidenceQuality } {
  const lower = competency.toLowerCase();

  if (lower.includes("priorit") || lower.includes("strategy")) {
    if (hasPrioritizationStrength(transcript)) {
      return {
        score: "Strong",
        evidenceSummary: "Gave a concrete example of deprioritizing features using usage data.",
        evidenceQuality: "Specific",
      };
    }
    return {
      score: "Mixed",
      evidenceSummary: "Some product thinking mentioned but limited detail.",
      evidenceQuality: "Partial",
    };
  }

  if (lower.includes("metric") || lower.includes("analytical")) {
    if (hasMetricsWeakness(transcript)) {
      return {
        score: "Weak",
        evidenceSummary: "Struggled to articulate success criteria or metrics when probed.",
        evidenceQuality: "Specific",
      };
    }
    return { score: "Not assessed", evidenceSummary: "Metrics not discussed.", evidenceQuality: "None" };
  }

  if (lower.includes("communication")) {
    return {
      score: "Mixed",
      evidenceSummary: "Generally clear, though some answers lacked depth.",
      evidenceQuality: "Partial",
    };
  }

  if (lower.includes("stakeholder")) {
    if (/didn't go deep|not covered|missing/i.test(transcript) && hasStakeholderGap(transcript)) {
      return {
        score: "Not assessed",
        evidenceSummary: "Stakeholder management was not explored in depth.",
        evidenceQuality: "None",
      };
    }
    if (hasStakeholderGap(transcript)) {
      return { score: "Mixed", evidenceSummary: "Some stakeholder context mentioned.", evidenceQuality: "Partial" };
    }
    return { score: "Not assessed", evidenceSummary: "Not covered in this interview.", evidenceQuality: "None" };
  }

  if (lower.includes("culture") || lower.includes("collaboration")) {
    if (/good energy|smart questions|culture fit/i.test(transcript)) {
      return {
        score: "Mixed",
        evidenceSummary: "Positive rapport noted but mostly impression-based.",
        evidenceQuality: "Vague",
      };
    }
    return { score: "Not assessed", evidenceSummary: "Collaboration not assessed with examples.", evidenceQuality: "None" };
  }

  return { score: "Not assessed", evidenceSummary: "Not enough evidence in debrief.", evidenceQuality: "None" };
}

export function runFallbackEvidence(
  transcript: string,
  context: DebriefContext,
): EvidenceOutput {
  const candidateName = extractName(transcript);
  const keyMoments = [];

  if (hasPrioritizationStrength(transcript)) {
    keyMoments.push({
      topic: "Roadmap prioritization",
      whatHappened: "Candidate described deprioritizing features using usage data.",
      candidateQuoteOrParaphrase: "Killed two features with usage data",
      interviewerObservation: "Strong structured thinking on trade-offs.",
    });
  }

  if (hasMetricsWeakness(transcript)) {
    keyMoments.push({
      topic: "Metrics & success criteria",
      whatHappened: "Interviewer asked about success criteria; answers stayed high level.",
      candidateQuoteOrParaphrase: null,
      interviewerObservation: "Needs deeper analytical rigor on north-star metrics.",
    });
  }

  if (/enterprise|smart questions/i.test(transcript)) {
    keyMoments.push({
      topic: "Role curiosity",
      whatHappened: "Candidate asked thoughtful questions about enterprise motion.",
      candidateQuoteOrParaphrase: null,
      interviewerObservation: "Shows genuine interest in the business context.",
    });
  }

  const strengths: string[] = [];
  const concerns: string[] = [];
  const missing: string[] = [];

  if (hasPrioritizationStrength(transcript)) {
    strengths.push("Structured prioritization with data-backed examples");
  }
  if (/smart questions|good energy/i.test(transcript)) {
    strengths.push("Engaged and curious about the role");
  }
  if (hasMetricsWeakness(transcript)) {
    concerns.push("Metrics and success criteria answers lacked specificity");
  }
  if (/didn't go deep|not covered/i.test(transcript) && hasStakeholderGap(transcript)) {
    concerns.push("Stakeholder conflict scenarios not explored");
    missing.push("Stakeholder management / conflict resolution");
  }

  return {
    candidateName,
    roleDiscussed: context.roleTitle,
    interviewFormat: `${context.stage} interview debrief`,
    keyMoments,
    demonstratedStrengths: strengths.length ? strengths : ["Relevant experience discussed"],
    demonstratedConcerns: concerns.length ? concerns : ["No major red flags noted"],
    skillsMentioned: ["Product strategy", "Analytics", "Enterprise sales context"].filter((s) =>
      transcript.toLowerCase().includes(s.split(" ")[0]!.toLowerCase()),
    ),
    openQuestions: hasMetricsWeakness(transcript)
      ? ["Can they define and track north-star metrics for a product area?"]
      : [],
    missingTopicsNotCovered: missing,
    overallImpressionRaw: /lean yes|advance|strong/i.test(transcript)
      ? "Generally positive with areas to validate before final decision."
      : "Mixed impression — more signal needed on key competencies.",
  };
}

export function runFallbackRubric(
  transcript: string,
  evidence: EvidenceOutput,
  context: DebriefContext,
): RubricOutput {
  const rubric = context.rubric.length ? context.rubric : DEFAULT_RUBRIC;
  const competencyScores = rubric.map((competency) => ({
    competency,
    ...scoreCompetency(competency, transcript),
  }));

  const flags = [];
  if (/good energy|culture fit|great vibe/i.test(transcript) && !/example|specifically|when/i.test(transcript)) {
    flags.push({
      flag: "Positive rapport mentioned without behavioral examples",
      severity: "Info" as const,
      suggestion: "Ask for a specific collaboration or conflict example before finalizing.",
    });
  }
  if (hasMetricsWeakness(transcript)) {
    flags.push({
      flag: "Metrics competency flagged as weak",
      severity: "Warning" as const,
      suggestion: "Schedule a follow-up focused on analytical thinking or review a case study.",
    });
  }
  if (evidence.missingTopicsNotCovered.length > 0) {
    flags.push({
      flag: `Topics not covered: ${evidence.missingTopicsNotCovered.join(", ")}`,
      severity: "Info" as const,
      suggestion: "Assign another interviewer to probe gaps or add a focused follow-up round.",
    });
  }

  const criticalGaps = evidence.missingTopicsNotCovered.slice();
  if (hasMetricsWeakness(transcript)) {
    criticalGaps.push("Analytical depth on product metrics");
  }

  const followUps = [];
  if (hasMetricsWeakness(transcript)) {
    followUps.push("45-min analytics deep-dive: define north-star metrics for a sample feature");
  }
  if (evidence.missingTopicsNotCovered.includes("Stakeholder management / conflict resolution")) {
    followUps.push("Behavioral question on navigating executive pushback");
  }

  const weakCount = competencyScores.filter((c) => c.score === "Weak").length;
  const notAssessed = competencyScores.filter((c) => c.score === "Not assessed").length;
  const confidence: RubricOutput["confidenceInAssessment"] =
    weakCount > 0 || notAssessed >= 2 ? "Medium" : "High";

  return {
    competencyScores,
    biasAndQualityFlags: flags,
    criticalGaps: [...new Set(criticalGaps)],
    recommendedFollowUpsBeforeDecision: followUps,
    confidenceInAssessment: confidence,
  };
}

export function runFallbackPack(
  transcript: string,
  evidence: EvidenceOutput,
  rubric: RubricOutput,
  context: DebriefContext,
): DecisionPackOutput {
  const candidate = evidence.candidateName ?? "Candidate";
  const hasWeakMetrics = rubric.competencyScores.some(
    (c) => c.competency.toLowerCase().includes("metric") && c.score === "Weak",
  );
  const hasStrongPrioritization = rubric.competencyScores.some(
    (c) =>
      c.competency.toLowerCase().includes("priorit") && c.score === "Strong",
  );

  const recommendation: DecisionPackOutput["recommendation"] =
    /reject|no hire|pass/i.test(transcript)
      ? "Reject"
      : hasWeakMetrics || rubric.recommendedFollowUpsBeforeDecision.length > 0
        ? "Hold"
        : "Advance";

  const topStrengths = evidence.demonstratedStrengths.slice(0, 3);
  const topRisks = [
    ...evidence.demonstratedConcerns,
    ...rubric.criticalGaps.map((g) => `Gap: ${g}`),
  ].slice(0, 3);

  const competencyTable = rubric.competencyScores.map((c) => ({
    competency: c.competency,
    score: c.score,
    note: c.evidenceSummary,
  }));

  return {
    recommendation,
    recommendationRationale:
      recommendation === "Hold"
        ? `${candidate} shows promise on product judgment but metrics depth needs validation before a final decision.`
        : recommendation === "Advance"
          ? `${candidate} demonstrated strong signal across key competencies for ${context.roleTitle}.`
          : `Insufficient evidence to advance ${candidate} at this stage.`,
    scorecardSummary: {
      headline: `${candidate} — ${context.roleTitle} (${context.stage})`,
      topStrengths,
      topRisks,
      competencyTable,
    },
    panelDebriefNotes: [
      `${candidate} — ${context.stage} debrief for ${context.roleTitle}`,
      "",
      "Strengths",
      ...topStrengths.map((s) => `- ${s}`),
      "",
      "Risks / gaps",
      ...topRisks.map((r) => `- ${r}`),
      "",
      `- **Recommendation (draft):** ${recommendation}`,
      ...(rubric.recommendedFollowUpsBeforeDecision.length
        ? [
            "",
            "Suggested follow-ups",
            ...rubric.recommendedFollowUpsBeforeDecision.map((f) => `- ${f}`),
          ]
        : []),
    ].join("\n"),
    slackMessageDraft: `Debrief on ${candidate} (${context.roleTitle}, ${context.stage}): ${recommendation} — ${hasStrongPrioritization ? "strong prioritization story" : "mixed signal"}${hasWeakMetrics ? ", but metrics need a follow-up" : ""}. ${rubric.recommendedFollowUpsBeforeDecision[0] ?? "Ready for panel discussion."}`,
    candidateFollowUpDraft:
      recommendation !== "Reject" && hasWeakMetrics
        ? `Hi ${candidate},\n\nThank you again for speaking with us about the ${context.roleTitle} role. We'd like to schedule a short follow-up conversation focused on how you define and track product success metrics. Looking forward to continuing the discussion.\n\nBest,\nHiring Team`
        : null,
    nextStepChecklist: [
      "Share scorecard with interview panel",
      recommendation === "Hold"
        ? "Schedule metrics follow-up or assign case study"
        : "Collect remaining panel feedback",
      "Confirm decision in hiring committee",
      ...(recommendation !== "Reject" && hasWeakMetrics
        ? ["Send candidate follow-up to schedule analytics conversation"]
        : []),
    ],
  };
}
