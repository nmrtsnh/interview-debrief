"use client";

import { useCallback, useRef, useState } from "react";
import {
  AGENT_LABELS,
  INITIAL_AGENT_STATUSES,
  type AgentId,
} from "@/components/AgentWorkflow";
import { DebriefResults } from "@/components/DebriefResults";
import { Header } from "@/components/Header";
import { ProcessingPanel } from "@/components/ProcessingPanel";
import { VoiceInput } from "@/components/VoiceInput";
import { useCopyFeedback } from "@/hooks/useCopyFeedback";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { runDebriefStep } from "@/lib/api";
import { AGENT_DELAY_MS, DEFAULT_RUBRIC, ROLE_OPTIONS, delay } from "@/lib/constants";
import type {
  AgentStatus,
  DecisionPackOutput,
  DebriefResult,
  EvidenceOutput,
  InterviewStage,
  RubricOutput,
} from "@/types/debrief";

export function DebriefApp() {
  const [transcript, setTranscript] = useState("");
  const [roleTitle, setRoleTitle] = useState<string>(ROLE_OPTIONS[0]);
  const [stage, setStage] = useState<InterviewStage>("Final");
  const [agentStatuses, setAgentStatuses] = useState(INITIAL_AGENT_STATUSES);
  const [activeAgentLabel, setActiveAgentLabel] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DebriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputExpanded, setInputExpanded] = useState(true);
  const processingRef = useRef(false);

  const { copiedKey, copy } = useCopyFeedback();

  const handleSpeechTranscript = useCallback((text: string, isFinal: boolean) => {
    if (!isFinal) return;
    setTranscript((prev) => {
      const trimmed = text.trim();
      if (!trimmed) return prev;
      return prev ? `${prev} ${trimmed}` : trimmed;
    });
  }, []);

  const {
    isListening,
    isSupported,
    errorMessage: speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({ onTranscript: handleSpeechTranscript });

  const setAgentStatus = (id: AgentId, status: AgentStatus) => {
    setAgentStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const context = {
    roleTitle,
    stage,
    rubric: [...DEFAULT_RUBRIC],
  };

  const handleGenerate = async () => {
    const trimmed = transcript.trim();
    if (!trimmed || isProcessing || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setInputExpanded(false);
    setAgentStatuses(INITIAL_AGENT_STATUSES);

    if (isListening) stopListening();

    try {
      setActiveAgentLabel(AGENT_LABELS.evidence);
      setAgentStatus("evidence", "working");
      await delay(AGENT_DELAY_MS);
      const evidenceRes = await runDebriefStep(trimmed, "evidence", context);
      const evidence = evidenceRes.data as EvidenceOutput;
      setAgentStatus("evidence", "complete");

      setActiveAgentLabel(AGENT_LABELS.rubric);
      setAgentStatus("rubric", "working");
      await delay(AGENT_DELAY_MS);
      const rubricRes = await runDebriefStep(trimmed, "rubric", context, { evidence });
      const rubric = rubricRes.data as RubricOutput;
      setAgentStatus("rubric", "complete");

      setActiveAgentLabel(AGENT_LABELS.pack);
      setAgentStatus("pack", "working");
      await delay(AGENT_DELAY_MS);
      const packRes = await runDebriefStep(trimmed, "pack", context, { evidence, rubric });
      const pack = packRes.data as DecisionPackOutput;
      setAgentStatus("pack", "complete");
      setActiveAgentLabel("");

      setResult({ evidence, rubric, pack });
    } catch {
      setError("Something went wrong. Please try again.");
      setAgentStatuses({
        evidence: "error",
        rubric: "error",
        pack: "error",
      });
      setInputExpanded(true);
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleStartAgain = () => {
    setTranscript("");
    setAgentStatuses(INITIAL_AGENT_STATUSES);
    setActiveAgentLabel("");
    setResult(null);
    setError(null);
    setInputExpanded(true);
    if (isListening) stopListening();
  };

  const handleEditDebrief = () => {
    setInputExpanded(true);
    setResult(null);
  };

  const canGenerate = transcript.trim().length > 0 && !isProcessing;
  const showFullInput = inputExpanded && !isProcessing;

  return (
    <div className="min-h-full bg-background">
      <Header />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        {!result && !isProcessing && (
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.75rem] sm:leading-snug">
              Finish the debrief before
              <br className="hidden sm:block" /> the next meeting
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone-500">
              Speak for 30 seconds. Get a scorecard, rubric check, and decision pack ready to share.
            </p>
          </div>
        )}

        {showFullInput && (
          <VoiceInput
            transcript={transcript}
            roleTitle={roleTitle}
            stage={stage}
            onTranscriptChange={setTranscript}
            onRoleChange={setRoleTitle}
            onStageChange={setStage}
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSupported}
            speechError={speechError}
            onStartListening={startListening}
            onStopListening={stopListening}
            onGenerate={handleGenerate}
            canGenerate={canGenerate}
            disabled={isProcessing}
          />
        )}

        {!showFullInput && !isProcessing && result && (
          <VoiceInput
            transcript={transcript}
            roleTitle={roleTitle}
            stage={stage}
            onTranscriptChange={setTranscript}
            onRoleChange={setRoleTitle}
            onStageChange={setStage}
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSupported}
            speechError={speechError}
            onStartListening={startListening}
            onStopListening={stopListening}
            onGenerate={handleEditDebrief}
            canGenerate
            compact
          />
        )}

        {isProcessing && (
          <ProcessingPanel statuses={agentStatuses} activeLabel={activeAgentLabel} />
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100"
          >
            {error}
          </div>
        )}

        {result && !isProcessing && (
          <div className="mt-5">
            <DebriefResults
              result={result}
              roleTitle={roleTitle}
              stage={stage}
              transcript={transcript}
              copiedKey={copiedKey}
              onCopy={copy}
              onStartAgain={handleStartAgain}
            />
          </div>
        )}
      </main>
    </div>
  );
}
