"use client";

import { STAGE_OPTIONS, ROLE_OPTIONS } from "@/lib/constants";
import { isValidCandidateName } from "@/lib/filename";
import type { InterviewStage } from "@/types/debrief";

interface VoiceInputProps {
  candidateName: string;
  transcript: string;
  roleTitle: string;
  stage: InterviewStage;
  onCandidateNameChange: (value: string) => void;
  onTranscriptChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onStageChange: (value: InterviewStage) => void;
  isListening: boolean;
  isProcessing?: boolean;
  isSupported: boolean;
  speechError: string | null;
  onStartListening: () => void;
  onStopListening: () => void;
  onGenerate: () => void;
  onTrySample: () => void;
  canGenerate: boolean;
  disabled?: boolean;
  compact?: boolean;
  isRegenerate?: boolean;
}

export function VoiceInput({
  candidateName,
  transcript,
  roleTitle,
  stage,
  onCandidateNameChange,
  onTranscriptChange,
  onRoleChange,
  onStageChange,
  isListening,
  isProcessing = false,
  isSupported,
  speechError,
  onStartListening,
  onStopListening,
  onGenerate,
  onTrySample,
  canGenerate,
  disabled = false,
  compact = false,
  isRegenerate = false,
}: VoiceInputProps) {
  const micDisabled = disabled || !isSupported || isProcessing;
  const nameInvalid = candidateName.length > 0 && !isValidCandidateName(candidateName);

  if (compact) {
    return (
      <section className="shadow-card rounded-2xl bg-surface px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-stone-800">
              {candidateName || "Candidate"} · {roleTitle}
            </p>
            <p className="text-xs text-stone-500">
              {stage} interview · {transcript.length} characters
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="text-sm font-medium text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40"
          >
            Edit debrief
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="input-heading"
      className="shadow-card rounded-2xl bg-surface p-6 sm:p-8"
    >
      <h2 id="input-heading" className="sr-only">
        Interview debrief input
      </h2>

      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          {isListening && (
            <span
              className="pointer-events-none absolute h-[88px] w-[88px] rounded-full bg-accent/10 motion-safe:animate-pulse-soft"
              aria-hidden="true"
            />
          )}
          {isListening ? (
            <button
              type="button"
              onClick={onStopListening}
              disabled={disabled}
              aria-label="Stop listening"
              className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent text-white shadow-card transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/50"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartListening}
              disabled={micDisabled}
              aria-label="Record your debrief"
              aria-busy={isProcessing}
              className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-surface text-stone-700 shadow-card ring-1 ring-stone-200/80 transition-all hover:shadow-card-hover hover:ring-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? <SpinnerIcon /> : <MicIcon />}
            </button>
          )}
        </div>
        <p className="mt-5 text-base font-medium text-stone-800">
          {isProcessing ? "Processing…" : isListening ? "Listening…" : "Tap to debrief"}
        </p>
        <p className="mt-1 text-sm text-stone-500">Speak your post-interview notes</p>
      </div>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-medium text-stone-400">or type below</span>
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <textarea
        id="transcript"
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        disabled={disabled}
        rows={4}
        placeholder="What stood out? Any concerns? What didn't get covered?"
        aria-required="true"
        className="w-full resize-y rounded-xl bg-stone-50/80 px-4 py-3.5 text-[15px] leading-relaxed text-stone-800 placeholder:text-stone-400 ring-1 ring-stone-200/80 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
      />

      {speechError && (
        <p role="status" className="mt-2 text-xs text-stone-500">
          {speechError} You can still type your debrief below.
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="candidate-name" className="mb-1.5 block text-xs font-medium text-stone-500">
            Candidate name <span className="text-accent">*</span>
          </label>
          <input
            id="candidate-name"
            type="text"
            value={candidateName}
            onChange={(e) => onCandidateNameChange(e.target.value)}
            disabled={disabled}
            required
            autoComplete="name"
            placeholder="e.g. Alex"
            aria-required="true"
            aria-invalid={nameInvalid}
            className="w-full rounded-xl bg-stone-50/80 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 ring-1 ring-stone-200/80 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1.5 block text-xs font-medium text-stone-500">
            Role
          </label>
          <select
            id="role"
            value={roleTitle}
            onChange={(e) => onRoleChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl bg-stone-50/80 px-3 py-2.5 text-sm text-stone-800 ring-1 ring-stone-200/80 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="stage" className="mb-1.5 block text-xs font-medium text-stone-500">
            Stage
          </label>
          <select
            id="stage"
            value={stage}
            onChange={(e) => onStageChange(e.target.value as InterviewStage)}
            disabled={disabled}
            className="w-full rounded-xl bg-stone-50/80 px-3 py-2.5 text-sm text-stone-800 ring-1 ring-stone-200/80 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-50"
          >
            {STAGE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onTrySample}
            disabled={disabled}
            className="text-sm text-accent hover:text-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40 disabled:opacity-40"
          >
            Try sample
          </button>
          <button
            type="button"
            onClick={() => {
              onTranscriptChange("");
              onCandidateNameChange("");
            }}
            disabled={disabled || (!transcript && !candidateName)}
            className="text-sm text-stone-500 hover:text-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
        <span className="text-xs text-stone-400">{transcript.length} chars</span>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        aria-busy={isProcessing}
        className={`mt-8 w-full rounded-xl px-5 py-3.5 text-[15px] font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/40 ${
          canGenerate
            ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
            : "cursor-not-allowed bg-stone-200 text-stone-400"
        }`}
      >
        {isProcessing
          ? "Generating…"
          : isRegenerate
            ? "Regenerate decision pack"
            : "Generate debrief"}
      </button>
    </section>
  );
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-accent" aria-hidden="true">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1a1 1 0 1 0-2 0v1a9 9 0 0 0 8 7.93V21H7a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2h-4v-2.07A9 9 0 0 0 21 11v-1a1 1 0 1 0-2 0Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-6 w-6 motion-safe:animate-spin-slow text-accent" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
