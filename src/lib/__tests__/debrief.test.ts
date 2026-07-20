import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { scoreCompetency, buildQualityFlags } from "@/lib/competencyScoring";
import { buildDecisionSummary, deriveRecommendation } from "@/lib/decisionSummary";
import { buildExportFilename, isValidCandidateName, normalizeCandidateName } from "@/lib/filename";
import { buildMarkdownExport } from "@/lib/export";
import { containsProtectedCharacteristicReference } from "@/lib/protectedCharacteristics";
import {
  runFallbackEvidence,
  runFallbackRubric,
  runFallbackPack,
} from "@/lib/agents/fallback";
import { SAMPLE_INPUT } from "@/lib/constants";
import type { DebriefContext } from "@/types/debrief";

const sampleContext: DebriefContext = {
  candidateName: "Alex",
  roleTitle: "Senior Product Manager",
  stage: "Final",
  rubric: [
    "Product strategy & prioritization",
    "Metrics & analytical thinking",
    "Communication & clarity",
    "Stakeholder management",
    "Culture add & collaboration",
  ],
};

describe("candidate name handling", () => {
  it("normalizes and validates candidate names", () => {
    assert.equal(normalizeCandidateName("  Alex  "), "Alex");
    assert.equal(isValidCandidateName("   "), false);
    assert.equal(isValidCandidateName("Alex"), true);
  });

  it("uses entered candidate name instead of transcript extraction", () => {
    const evidence = runFallbackEvidence(SAMPLE_INPUT, {
      ...sampleContext,
      candidateName: "Jordan",
    });
    assert.equal(evidence.candidateName, "Jordan");
  });

  it("builds a safe export filename", () => {
    assert.equal(
      buildExportFilename("Alex", "Senior Product Manager"),
      "interview-debrief-alex-senior-product-manager.md",
    );
    assert.equal(buildExportFilename("  ", "Role"), "interview-debrief-candidate-role.md");
  });
});

describe("evidence-backed ratings", () => {
  it("marks missing metrics coverage as Not assessed", () => {
    const result = scoreCompetency(
      "Metrics & analytical thinking",
      "Strong communicator with clear examples throughout.",
    );
    assert.equal(result.score, "Not assessed");
    assert.equal(result.evidence, "Insufficient evidence");
  });

  it("does not invent quotes", () => {
    const result = scoreCompetency(
      "Product strategy & prioritization",
      "Strong on roadmap prioritization — she walked through killing two features with usage data.",
    );
    assert.match(result.evidence, /Quote:|Paraphrase/);
    assert.doesNotMatch(result.evidence, /"She said exactly this invented quote"/);
  });
});

describe("Alex sample pipeline", () => {
  it("produces focused follow-up for Alex sample", () => {
    const evidence = runFallbackEvidence(SAMPLE_INPUT, sampleContext);
    const rubric = runFallbackRubric(SAMPLE_INPUT, evidence, sampleContext);
    const pack = runFallbackPack(SAMPLE_INPUT, evidence, rubric, sampleContext);
    const result = { evidence, rubric, pack };

    assert.equal(pack.recommendation, "Focused follow-up required");
    assert.equal(evidence.candidateName, "Alex");

    const summary = buildDecisionSummary(result);
    assert.equal(summary.strongestSignal, "Roadmap prioritisation");
    assert.equal(summary.mainConcern, "Metrics depth");
    assert.equal(summary.notAssessed, "Stakeholder conflict, Communication clarity");
  });
});

describe("protected characteristic exclusion", () => {
  it("detects protected characteristic references", () => {
    assert.equal(containsProtectedCharacteristicReference("Concerns about age"), true);
    assert.equal(containsProtectedCharacteristicReference("Roadmap prioritisation"), false);
  });

  it("does not generate protected-characteristic flags", () => {
    const flags = buildQualityFlags(
      "Good energy but weak on metrics and vague success criteria.",
      [],
      [],
    );
    for (const flag of flags) {
      assert.equal(containsProtectedCharacteristicReference(flag.issue), false);
      assert.equal(containsProtectedCharacteristicReference(flag.whyItMatters), false);
    }
  });
});

describe("markdown export", () => {
  it("includes required sections", () => {
    const evidence = runFallbackEvidence(SAMPLE_INPUT, sampleContext);
    const rubric = runFallbackRubric(SAMPLE_INPUT, evidence, sampleContext);
    const pack = runFallbackPack(SAMPLE_INPUT, evidence, rubric, sampleContext);
    const md = buildMarkdownExport(SAMPLE_INPUT, { evidence, rubric, pack }, "Senior Product Manager", "Final");

    assert.match(md, /# Interview Debrief — Alex/);
    assert.match(md, /Draft next step/);
    assert.match(md, /Competency scorecard/);
    assert.match(md, /For human review only/);
    assert.match(md, /Original debrief/);
    assert.match(md, /Candidate follow-up draft/);
  });
});

describe("recommendation derivation", () => {
  it("returns insufficient evidence for explicit pass language", () => {
    const evidence = runFallbackEvidence("I'd pass on this one.", sampleContext);
    const rubric = runFallbackRubric("I'd pass on this one.", evidence, sampleContext);
    assert.equal(deriveRecommendation("I'd pass on this one.", rubric), "Insufficient evidence");
  });
});
