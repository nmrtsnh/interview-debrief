"use client";

import { useId, useState, type ReactNode } from "react";
import { FormattedNotes, MessageBlock } from "@/components/FormattedNotes";
import {
  CopyButton,
  formatPanelDebriefText,
  formatScorecardText,
  formatSlackText,
  downloadMarkdown,
  formatFullDebriefText,
} from "@/components/CopyButton";
import { HUMAN_REVIEW_NOTICE, recommendationStyles } from "@/lib/recommendations";
import type { DebriefResult, InterviewStage } from "@/types/debrief";

interface DebriefResultsProps {
  result: DebriefResult;
  candidateName: string;
  roleTitle: string;
  stage: InterviewStage;
  transcript: string;
  copiedKey: string | null;
  onCopy: (key: string, text: string) => void;
  onStartAgain: () => void;
}

type TabId = "summary" | "scorecard" | "flags" | "messages";

const TABS: { id: TabId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "scorecard", label: "Scorecard" },
  { id: "flags", label: "Flags" },
  { id: "messages", label: "Messages" },
];

export function DebriefResults({
  result,
  candidateName,
  roleTitle,
  stage,
  transcript,
  copiedKey,
  onCopy,
  onStartAgain,
}: DebriefResultsProps) {
  const [tab, setTab] = useState<TabId>("summary");
  const tablistId = useId();
  const { evidence, rubric, pack } = result;
  const recStyle = recommendationStyles[pack.recommendation];
  const summary = pack.decisionSummary;

  return (
    <section aria-labelledby="results-heading" className="motion-safe:animate-fade-in-up space-y-5">
      <div className="text-center">
        <h2 id="results-heading" className="text-xl font-semibold text-stone-900">
          {candidateName}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          {roleTitle} · {stage} interview
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Strongest signal" value={summary.strongestSignal} />
        <SummaryCard label="Main concern" value={summary.mainConcern} />
        <SummaryCard label="Not assessed" value={summary.notAssessed} />
        <SummaryCard label="Suggested next step" value={summary.suggestedNextStep} />
      </div>

      <div className={`shadow-card rounded-2xl p-6 ring-1 ${recStyle.card}`}>
        <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
          Draft next step
        </p>
        <span
          className={`mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${recStyle.pill}`}
        >
          {pack.recommendation}
        </span>
        <p className="mt-4 text-[15px] leading-relaxed text-stone-600">
          {pack.recommendationRationale}
        </p>
        <p className="mt-4 border-t border-stone-200/60 pt-4 text-xs leading-relaxed text-stone-500">
          {HUMAN_REVIEW_NOTICE}
        </p>
      </div>

      <div
        role="tablist"
        id={tablistId}
        aria-label="Debrief sections"
        className="flex gap-1 rounded-xl bg-stone-200/40 p-1"
      >
        {TABS.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`relative flex-1 rounded-lg px-2 py-2.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50 sm:px-3 ${
                selected
                  ? "bg-surface text-stone-800 shadow-sm ring-1 ring-stone-200/60"
                  : "text-stone-500 hover:bg-stone-100/60 hover:text-stone-700"
              }`}
            >
              {selected && (
                <span
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
                  aria-hidden="true"
                />
              )}
              {t.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="shadow-card rounded-2xl bg-surface p-5 sm:p-6"
      >
        {tab === "summary" && (
          <div className="space-y-6">
            <dl className="grid gap-4 sm:grid-cols-2">
              <SummaryField label="Draft next step" value={pack.recommendation} />
              <SummaryField
                label="Assessment confidence"
                value={rubric.confidenceInAssessment}
              />
              <SummaryField
                label="Strongest evidence"
                value={evidence.demonstratedStrengths[0] ?? "None captured"}
              />
              <SummaryField
                label="Main risk"
                value={evidence.demonstratedConcerns[0] ?? "None noted"}
              />
              <SummaryField
                label="Coverage gaps"
                value={
                  evidence.missingTopicsNotCovered.length
                    ? evidence.missingTopicsNotCovered.join("; ")
                    : "None noted"
                }
              />
              <SummaryField
                label="Suggested follow-up"
                value={
                  rubric.recommendedFollowUpsBeforeDecision[0] ??
                  summary.suggestedNextStep
                }
              />
            </dl>

            <div className="space-y-4 border-t border-stone-100 pt-5 text-sm leading-relaxed text-stone-600">
              <SectionBlock title="Observed evidence">
                <ul className="mt-2 space-y-1.5">
                  {evidence.demonstratedStrengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-stone-400" aria-hidden="true">
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </SectionBlock>
              <SectionBlock title="Interviewer interpretation">
                <p>{pack.recommendationRationale}</p>
              </SectionBlock>
              <SectionBlock title="Missing evidence">
                {evidence.missingTopicsNotCovered.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {evidence.missingTopicsNotCovered.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-stone-400" aria-hidden="true">
                          •
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2">None noted in this debrief.</p>
                )}
              </SectionBlock>
              <SectionBlock title="Proposed next step">
                <p>{summary.suggestedNextStep}</p>
              </SectionBlock>
            </div>
          </div>
        )}

        {tab === "scorecard" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <CopyButton
                label="Copy scorecard"
                copyKey="scorecard"
                text={formatScorecardText(result, candidateName)}
                copiedKey={copiedKey}
                onCopy={onCopy}
              />
            </div>
            <div className="overflow-x-auto rounded-xl ring-1 ring-stone-100">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-stone-50/80">
                  <tr className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                    <th className="px-3 py-3 sm:px-4">Competency</th>
                    <th className="px-3 py-3 sm:px-4">Rating</th>
                    <th className="px-3 py-3 sm:px-4">Evidence</th>
                    <th className="px-3 py-3 sm:px-4">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {pack.scorecardSummary.competencyTable.map((row) => (
                    <tr key={row.competency} className="border-t border-stone-100 align-top">
                      <td className="px-3 py-3 font-medium text-stone-800 sm:px-4">
                        {row.competency}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <ScoreBadge score={row.score} />
                      </td>
                      <td className="px-3 py-3 text-stone-600 sm:px-4">{row.evidence}</td>
                      <td className="px-3 py-3 text-stone-600 sm:px-4">{row.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "flags" && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              Assessment confidence:{" "}
              <span className="font-medium text-stone-800">{rubric.confidenceInAssessment}</span>
            </p>
            {rubric.biasAndQualityFlags.length > 0 ? (
              <ul className="space-y-3">
                {rubric.biasAndQualityFlags.map((flag) => (
                  <li
                    key={flag.issue}
                    className={`rounded-xl px-4 py-3 ring-1 ${
                      flag.severity === "Warning"
                        ? "bg-amber-50/80 ring-amber-100"
                        : "bg-stone-50/80 ring-stone-100"
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-800">{flag.issue}</p>
                    <p className="mt-2 text-sm text-stone-600">
                      <span className="font-medium text-stone-700">Why it matters:</span>{" "}
                      {flag.whyItMatters}
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      <span className="font-medium text-stone-700">Recommended correction:</span>{" "}
                      {flag.recommendedCorrection}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">No quality flags identified.</p>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-4">
            <MessageBlock
              title="Slack message"
              copyButton={
                <CopyButton
                  label="Copy"
                  copyKey="slack"
                  text={formatSlackText(result)}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                />
              }
            >
              <p className="border-l-2 border-accent/40 pl-4 text-sm leading-relaxed text-stone-700">
                {pack.slackMessageDraft}
              </p>
            </MessageBlock>

            <MessageBlock
              title="Panel debrief"
              copyButton={
                <CopyButton
                  label="Copy"
                  copyKey="panel"
                  text={formatPanelDebriefText(result)}
                  copiedKey={copiedKey}
                  onCopy={onCopy}
                />
              }
            >
              <FormattedNotes content={pack.panelDebriefNotes} variant="debrief" />
            </MessageBlock>

            {pack.candidateFollowUpDraft && (
              <MessageBlock
                title="Candidate follow-up draft"
                copyButton={
                  <CopyButton
                    label="Copy"
                    copyKey="candidate"
                    text={pack.candidateFollowUpDraft}
                    copiedKey={copiedKey}
                    onCopy={onCopy}
                  />
                }
              >
                <p className="mb-3 text-xs font-medium text-amber-800/90">
                  Review and approve before sending.
                </p>
                <FormattedNotes content={pack.candidateFollowUpDraft} variant="letter" />
              </MessageBlock>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <CopyButton
          label="Copy full pack"
          copyKey="full"
          text={formatFullDebriefText(transcript, result, roleTitle, stage)}
          copiedKey={copiedKey}
          onCopy={onCopy}
          variant="primary"
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => downloadMarkdown(transcript, result, roleTitle, stage)}
          aria-label="Export markdown file"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-surface px-4 py-2.5 text-sm font-medium text-stone-700 shadow-card ring-1 ring-stone-200/80 transition-all hover:shadow-card-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40"
        >
          Export markdown
        </button>
        <button
          type="button"
          onClick={onStartAgain}
          aria-label="Start a new debrief"
          className="inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40"
        >
          Start again
        </button>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3 ring-1 ring-stone-200/70 sm:px-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-stone-800">{value}</p>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-stone-700">{value}</dd>
    </div>
  );
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</h3>
      {children}
    </div>
  );
}

function ScoreBadge({ score }: { score: string }) {
  const styles =
    score === "Strong"
      ? "bg-emerald-100 text-emerald-800 ring-emerald-200/60"
      : score === "Weak"
        ? "bg-rose-100 text-rose-800 ring-rose-200/60"
        : score === "Mixed"
          ? "bg-amber-100 text-amber-900 ring-amber-200/60"
          : "bg-stone-100 text-stone-600 ring-stone-200/60";

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles}`}>
      {score}
    </span>
  );
}
