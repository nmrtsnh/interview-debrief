#!/usr/bin/env node

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

const SAMPLE_INPUT =
  "Just finished with Priya for the senior PM role. Strong on roadmap prioritization — she walked through killing two features with usage data. Weak on metrics — when I asked about success criteria she stayed vague. Good energy, asked smart questions about our enterprise motion. Didn't go deep on stakeholder conflict. I'd lean yes but want one more conversation on analytics.";

const context = {
  candidateName: "Priya",
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

function loadEnvLocal() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function postStep(step, prior) {
  const res = await fetch(`${baseUrl}/api/debrief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcript: SAMPLE_INPUT,
      step,
      context,
      prior,
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${step} failed (${res.status}): ${body.error ?? JSON.stringify(body)}`);
  }
  return body;
}

loadEnvLocal();

const agentMode = process.env.AGENT_MODE?.trim().toLowerCase() ?? "(not set)";
const demoMode = agentMode === "demo" || agentMode === "fallback";

console.log(`\nInterviewDebrief API test → ${baseUrl}`);
console.log(`AGENT_MODE: ${agentMode}`);
console.log(`Mode: ${demoMode ? "demo (local agents, no API cost)" : "live SDK"}\n`);

const start = Date.now();

const evidenceRes = await postStep("evidence");
console.log(`✓ evidence  [${evidenceRes.source}]  candidate: ${evidenceRes.data.candidateName}`);

const rubricRes = await postStep("rubric", { evidence: evidenceRes.data });
console.log(
  `✓ rubric    [${rubricRes.source}]  confidence: ${rubricRes.data.confidenceInAssessment}, flags: ${rubricRes.data.biasAndQualityFlags.length}`,
);

const packRes = await postStep("pack", {
  evidence: evidenceRes.data,
  rubric: rubricRes.data,
});
console.log(
  `✓ pack      [${packRes.source}]  draft next step: ${packRes.data.recommendation}`,
);

const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const allFallback = [evidenceRes, rubricRes, packRes].every((r) => r.source === "fallback");

console.log(`\nDone in ${elapsed}s`);
if (allFallback && demoMode) {
  console.log("SUCCESS: Demo mode pipeline works (local agents, zero API cost).");
  if (packRes.data.recommendation !== "Focused follow-up required") {
    console.warn(`Expected "Focused follow-up required", got "${packRes.data.recommendation}"`);
  }
  if (evidenceRes.data.candidateName !== "Priya") {
    process.exitCode = 1;
  }
} else if (allFallback) {
  console.log("SUCCESS: Pipeline works via local fallback agents.");
} else {
  console.log("MIXED or SDK: review agent sources.");
}
