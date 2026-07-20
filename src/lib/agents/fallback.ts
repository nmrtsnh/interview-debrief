import {
  buildQualityFlags,
  confidenceFromQuality,
  hasMetricsWeakness,
  hasPrioritizationStrength,
  hasStakeholderGap,
  scoreCompetency,
} from "@/lib/competencyScoring";
import {
  buildDecisionSummary,
  deriveAssessmentConfidence,
  deriveRecommendation,
} from "@/lib/decisionSummary";
import { extractVerbatimSnippet } from "@/lib/evidenceFormat";
import { recommendationForSlack } from "@/lib/recommendations";
import { DEFAULT_RUBRIC } from "@/lib/constants";
import type {
  DebriefContext,
  DecisionPackOutput,
  EvidenceOutput,
  RubricOutput,
} from "@/types/debrief";

export function runFallbackEvidence(
  transcript: string,
  context: DebriefContext,
): EvidenceOutput {
  const candidateName = context.candidateName;
  const keyMoments = [];

  if (hasPrioritizationStrength(transcript)) {
    const quote =
      extractVerbatimSnippet(
        transcript,
        /(killing two features with usage data|killed two features with usage data)/i,
      ) ?? null;
    keyMoments.push({
      topic: "Roadmap prioritization",
      whatHappened: "Candidate described deprioritizing features using usage data.",
      candidateQuoteOrParaphrase: quote,
      interviewerObservation: "Structured thinking on trade-offs observed in the debrief.",
    });
  }

  if (hasMetricsWeakness(transcript)) {
    keyMoments.push({
      topic: "Metrics & success criteria",
      whatHappened: "Interviewer asked about success criteria; answers stayed high level.",
      candidateQuoteOrParaphrase: extractVerbatimSnippet(
        transcript,
        /(success criteria[^.—]*vague[^.—]*|weak on metrics[^.—]*)/i,
      ),
      interviewerObservation: "Needs deeper analytical rigor on north-star metrics.",
    });
  }

  if (/enterprise|smart questions/i.test(transcript)) {
    keyMoments.push({
      topic: "Role curiosity",
      whatHappened: "Candidate asked thoughtful questions about the business context.",
      candidateQuoteOrParaphrase: extractVerbatimSnippet(
        transcript,
        /(asked smart questions about[^.—]*)/i,
      ),
      interviewerObservation: "Shows genuine interest in the role context.",
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
  if (/didn't go deep|not covered|not explored/i.test(transcript) && hasStakeholderGap(transcript)) {
    concerns.push("Stakeholder conflict scenarios not explored");
    missing.push("Stakeholder management / conflict resolution");
  }

  return {
    candidateName,
    roleDiscussed: context.roleTitle,
    interviewFormat: `${context.stage} interview debrief`,
    keyMoments,
    demonstratedStrengths: strengths.length ? strengths : ["Relevant experience discussed"],
    demonstratedConcerns: concerns.length ? concerns : ["No major concerns captured in notes"],
    skillsMentioned: ["Product strategy", "Analytics", "Enterprise sales context"].filter((s) =>
      transcript.toLowerCase().includes(s.split(" ")[0]!.toLowerCase()),
    ),
    openQuestions: hasMetricsWeakness(transcript)
      ? ["Can they define and track north-star metrics for a product area?"]
      : [],
    missingTopicsNotCovered: missing,
    overallImpressionRaw: /lean yes|advance|strong/i.test(transcript)
      ? "Generally positive with areas to validate before a final decision."
      : /reject|no hire|\bpass\b on this|would pass/i.test(transcript)
        ? "Insufficient evidence captured to support advancing at this stage."
        : "Mixed impression — more signal needed on key competencies.",
  };
}

export function runFallbackRubric(
  transcript: string,
  evidence: EvidenceOutput,
  context: DebriefContext,
): RubricOutput {
  const rubric = context.rubric.length ? context.rubric : DEFAULT_RUBRIC;
  const competencyScores = rubric.map((competency) => {
    const scored = scoreCompetency(competency, transcript);
    return {
      competency,
      score: scored.score,
      evidence: scored.evidence,
      confidence: confidenceFromQuality(scored.evidenceQuality),
      evidenceQuality: scored.evidenceQuality,
    };
  });

  const flags = buildQualityFlags(
    transcript,
    evidence.missingTopicsNotCovered,
    competencyScores,
  );

  const criticalGaps = [...evidence.missingTopicsNotCovered];
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

  return {
    competencyScores,
    biasAndQualityFlags: flags,
    criticalGaps: [...new Set(criticalGaps)],
    recommendedFollowUpsBeforeDecision: followUps,
    confidenceInAssessment: deriveAssessmentConfidence(competencyScores),
  };
}

export function runFallbackPack(
  transcript: string,
  evidence: EvidenceOutput,
  rubric: RubricOutput,
  context: DebriefContext,
): DecisionPackOutput {
  const candidate = evidence.candidateName;
  const recommendation = deriveRecommendation(transcript, rubric);
  const hasWeakMetrics = rubric.competencyScores.some(
    (c) => c.competency.toLowerCase().includes("metric") && c.score === "Weak",
  );
  const hasStrongPrioritization = rubric.competencyScores.some(
    (c) =>
      c.competency.toLowerCase().includes("priorit") && c.score === "Strong",
  );

  const topStrengths = evidence.demonstratedStrengths.slice(0, 3);
  const topRisks = [
    ...evidence.demonstratedConcerns,
    ...rubric.criticalGaps.map((g) => `Gap: ${g}`),
  ].slice(0, 3);

  const competencyTable = rubric.competencyScores.map((c) => ({
    competency: c.competency,
    score: c.score,
    evidence: c.evidence,
    confidence: c.confidence,
  }));

  const draftResult = {
    evidence,
    rubric,
    pack: {
      recommendation,
      recommendationRationale: buildRationale(recommendation, candidate, context.roleTitle),
      decisionSummary: {
        strongestSignal: "",
        mainConcern: "",
        notAssessed: "",
        suggestedNextStep: "",
      },
      scorecardSummary: {
        headline: `${candidate} — ${context.roleTitle} (${context.stage})`,
        topStrengths,
        topRisks,
        competencyTable,
      },
      panelDebriefNotes: buildPanelNotes(
        candidate,
        context,
        recommendation,
        topStrengths,
        topRisks,
        rubric,
      ),
      slackMessageDraft: buildSlackDraft(
        candidate,
        context,
        recommendation,
        hasStrongPrioritization,
        hasWeakMetrics,
        rubric,
      ),
      candidateFollowUpDraft: buildCandidateFollowUp(
        candidate,
        context,
        recommendation,
        hasWeakMetrics,
        rubric,
      ),
      nextStepChecklist: buildChecklist(recommendation, hasWeakMetrics),
    },
  };

  draftResult.pack.decisionSummary = buildDecisionSummary(draftResult);

  return draftResult.pack;
}

function buildRationale(
  recommendation: DecisionPackOutput["recommendation"],
  candidate: string,
  roleTitle: string,
): string {
  switch (recommendation) {
    case "Focused follow-up required":
      return `${candidate} shows useful signal for ${roleTitle}, but one or more competencies need a focused follow-up before the panel decides on next steps.`;
    case "Proceed to next stage":
      return `${candidate} demonstrated sufficient evidence across key competencies for ${roleTitle} to proceed, pending human review.`;
    case "Panel review required":
      return `Coverage gaps remain for ${candidate}. The panel should review missing competencies before deciding on next steps.`;
    case "Insufficient evidence":
      return `The debrief does not contain enough structured evidence to support a next step for ${candidate} at this stage.`;
  }
}

function buildPanelNotes(
  candidate: string,
  context: DebriefContext,
  recommendation: DecisionPackOutput["recommendation"],
  topStrengths: string[],
  topRisks: string[],
  rubric: RubricOutput,
): string {
  return [
    `${candidate} — ${context.stage} debrief for ${context.roleTitle}`,
    "",
    "**Observed evidence**",
    ...topStrengths.map((s) => `- ${s}`),
    "",
    "**Risks / gaps**",
    ...topRisks.map((r) => `- ${r}`),
    "",
    "**Missing evidence**",
    ...(rubric.criticalGaps.length
      ? rubric.criticalGaps.map((g) => `- ${g}`)
      : ["- None noted"]),
    "",
    `- **Draft next step:** ${recommendation}`,
    ...(rubric.recommendedFollowUpsBeforeDecision.length
      ? [
          "",
          "**Suggested follow-ups**",
          ...rubric.recommendedFollowUpsBeforeDecision.map((f) => `- ${f}`),
        ]
      : []),
  ].join("\n");
}

function buildSlackDraft(
  candidate: string,
  context: DebriefContext,
  recommendation: DecisionPackOutput["recommendation"],
  hasStrongPrioritization: boolean,
  hasWeakMetrics: boolean,
  rubric: RubricOutput,
): string {
  const label = recommendationForSlack(recommendation);
  const signal = hasStrongPrioritization ? "strong prioritization story" : "mixed signal";
  const metricsNote = hasWeakMetrics ? ", metrics need a follow-up" : "";
  const followUp =
    rubric.recommendedFollowUpsBeforeDecision[0] ?? "Ready for panel discussion.";
  return `Debrief on ${candidate} (${context.roleTitle}, ${context.stage}): ${label} — ${signal}${metricsNote}. ${followUp}`;
}

function buildCandidateFollowUp(
  candidate: string,
  context: DebriefContext,
  recommendation: DecisionPackOutput["recommendation"],
  hasWeakMetrics: boolean,
  rubric: RubricOutput,
): string | null {
  if (recommendation === "Insufficient evidence") {
    return null;
  }

  if (hasWeakMetrics || recommendation === "Focused follow-up required") {
    return `Hi ${candidate},

Thank you again for speaking with us about the ${context.roleTitle} role. We'd like to schedule a short follow-up conversation focused on how you define and track product success metrics.

Looking forward to continuing the discussion.

Best,
Hiring Team`;
  }

  if (recommendation === "Proceed to next stage") {
    return `Hi ${candidate},

Thank you again for your time discussing the ${context.roleTitle} role. We'd like to invite you to the next stage of our process and will follow up shortly with scheduling details.

Best,
Hiring Team`;
  }

  if (rubric.recommendedFollowUpsBeforeDecision.length > 0) {
    return `Hi ${candidate},

Thank you again for speaking with us about the ${context.roleTitle} role. We'd like to schedule a brief follow-up conversation to explore a few areas we did not cover in depth.

Best,
Hiring Team`;
  }

  return null;
}

function buildChecklist(
  recommendation: DecisionPackOutput["recommendation"],
  hasWeakMetrics: boolean,
): string[] {
  const items = ["Share scorecard with interview panel"];

  if (recommendation === "Focused follow-up required") {
    items.push("Schedule focused follow-up or assign case study");
  } else if (recommendation === "Panel review required") {
    items.push("Collect remaining panel feedback on uncovered competencies");
  } else if (recommendation === "Insufficient evidence") {
    items.push("Determine whether additional interview evidence is needed");
  } else {
    items.push("Confirm next-stage logistics with recruiting");
  }

  items.push("Confirm next step in hiring committee");
  if (hasWeakMetrics && recommendation !== "Insufficient evidence") {
    items.push("Review and approve candidate follow-up before sending");
  }

  return items;
}
