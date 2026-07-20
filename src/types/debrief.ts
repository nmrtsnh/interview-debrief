export type AgentStatus = "waiting" | "working" | "complete" | "error";

export type AgentStep = "evidence" | "rubric" | "pack";

export type InterviewStage = "Screen" | "Technical" | "Panel" | "Final";

export type CompetencyRating = "Strong" | "Mixed" | "Weak" | "Not assessed";

export type EvidenceQuality = "Specific" | "Partial" | "Vague" | "None";

export type FlagSeverity = "Info" | "Warning";

export type Recommendation = "Advance" | "Hold" | "Reject";

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface DebriefContext {
  roleTitle: string;
  stage: InterviewStage;
  rubric: string[];
}

export interface KeyMoment {
  topic: string;
  whatHappened: string;
  candidateQuoteOrParaphrase: string | null;
  interviewerObservation: string;
}

export interface EvidenceOutput {
  candidateName: string | null;
  roleDiscussed: string | null;
  interviewFormat: string;
  keyMoments: KeyMoment[];
  demonstratedStrengths: string[];
  demonstratedConcerns: string[];
  skillsMentioned: string[];
  openQuestions: string[];
  missingTopicsNotCovered: string[];
  overallImpressionRaw: string;
}

export interface CompetencyScoreEntry {
  competency: string;
  score: CompetencyRating;
  evidenceSummary: string;
  evidenceQuality: EvidenceQuality;
}

export interface BiasFlag {
  flag: string;
  severity: FlagSeverity;
  suggestion: string;
}

export interface RubricOutput {
  competencyScores: CompetencyScoreEntry[];
  biasAndQualityFlags: BiasFlag[];
  criticalGaps: string[];
  recommendedFollowUpsBeforeDecision: string[];
  confidenceInAssessment: ConfidenceLevel;
}

export interface ScorecardSummary {
  headline: string;
  topStrengths: string[];
  topRisks: string[];
  competencyTable: Array<{
    competency: string;
    score: string;
    note: string;
  }>;
}

export interface DecisionPackOutput {
  recommendation: Recommendation;
  recommendationRationale: string;
  scorecardSummary: ScorecardSummary;
  panelDebriefNotes: string;
  slackMessageDraft: string;
  candidateFollowUpDraft: string | null;
  nextStepChecklist: string[];
}

export interface DebriefResult {
  evidence: EvidenceOutput;
  rubric: RubricOutput;
  pack: DecisionPackOutput;
}

export interface DebriefStepResponse {
  step: AgentStep;
  data: EvidenceOutput | RubricOutput | DecisionPackOutput;
  source: "cursor-sdk" | "fallback";
}
