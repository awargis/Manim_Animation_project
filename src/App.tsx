/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_IRODOV_161_PROBLEM,
  Irodov161Params,
  IrodovProblemData,
  ColabCodeOptions,
  calculateIrodov161Physics,
  getActFromTime,
  AnimationActId,
} from './utils/physicsEngine';
import { soundController } from './utils/soundEngine';
import { VerticalManimStage } from './components/VerticalManimStage';
import { PhysicsControlDeck } from './components/PhysicsControlDeck';
import { ColabCodeAndPromptPanel } from './components/ColabCodeAndPromptPanel';

export default function App() {
  const [activeProblem, setActiveProblem] = useState<IrodovProblemData>(
    DEFAULT_IRODOV_161_PROBLEM
  );

  // Default physics parameters for Irodov 1.61 (k1 > k2 so bars push each other)
  const [physicsParams, setPhysicsParams] = useState<Irodov161Params>({
    m1: 2.0,
    m2: 3.0,
    k1: 0.45,
    k2: 0.2,
    alphaDeg: 28,
    g: 9.81,
  });

  const [codeOptions, setCodeOptions] = useState<ColabCodeOptions>({
    singleCellColabMode: true,
    includeSafeAudio: true,
    fps: 60,
    outroHookText: 'Physics Lovers, Answer Batao?',
    showAnswerHintInOutro: true,
  });

  // 9:16 Animation Preview Timeline State (0.0s to 16.0s)
  const [currentTime, setCurrentTime] = useState<number>(4.5); // Start on Act 2 (Forces & Setup) for immediate visual clarity
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showAnswerInStage, setShowAnswerInStage] = useState<boolean>(false);

  // AI Screenshot Analyzer State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const lastActRef = useRef<AnimationActId>(getActFromTime(4.5));

  const physicsResult = calculateIrodov161Physics(physicsParams);

  // Playback timer loop (updates at 10Hz to keep DOM/CPU lightweight while smooth)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= 16.0) {
          setIsPlaying(false);
          return 16.0;
        }
        const nextAct = getActFromTime(next);
        if (nextAct !== lastActRef.current) {
          lastActRef.current = nextAct;
          const actOrder: AnimationActId[] = [
            'question_reveal',
            'force_decomposition',
            'motion_simulation',
            'outro_challenge',
          ];
          soundController.playTransitionChime(actOrder.indexOf(nextAct));
        }
        return Number(next.toFixed(1));
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (!isPlaying && currentTime >= 15.9) {
      setCurrentTime(0);
      lastActRef.current = 'question_reveal';
    }
    if (!isPlaying) {
      soundController.playTransitionChime(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const handleResetTime = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    lastActRef.current = 'question_reveal';
  };

  const handleSeekTime = (newTime: number) => {
    const clamped = Math.max(0, Math.min(16, newTime));
    setCurrentTime(clamped);
    lastActRef.current = getActFromTime(clamped);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundController.setMuted(nextMuted);
  };

  const handleUpdatePhysics = (partial: Partial<Irodov161Params>) => {
    setPhysicsParams((prev) => ({ ...prev, ...partial }));
  };

  const handleUpdateCodeOptions = (partial: Partial<ColabCodeOptions>) => {
    setCodeOptions((prev) => ({ ...prev, ...partial }));
  };

  const runGeminiScreenshotAnalysis = async (
    base64Data: string,
    mimeType: string,
    screenshotPreviewUrl: string,
    extraNotes: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          outroHookText: codeOptions.outroHookText,
          extraNotes,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate Manim code from screenshot.');
      }

      const actIds: AnimationActId[] = [
        'question_reveal',
        'force_decomposition',
        'motion_simulation',
        'outro_challenge',
      ];
      const startSecs = [0, 3.5, 8.5, 13.0];
      const endSecs = [3.5, 8.5, 13.0, 16.0];

      const mappedSteps = Array.isArray(data.steps)
        ? data.steps.slice(0, 4).map((st: Record<string, string>, idx: number) => ({
            id: actIds[idx] || 'question_reveal',
            stepNumber: st.stepNumber || `0${idx + 1}`,
            title: st.title || `Scene Step ${idx + 1}`,
            timeRange: st.timeRange || `${startSecs[idx]}s – ${endSecs[idx]}s`,
            startSec: startSecs[idx] ?? 0,
            endSec: endSecs[idx] ?? 16,
            narrationHinglish: st.narrationHinglish || '',
            visualFocus: st.visualFocus || '',
            keyFormula: st.keyFormula || '',
          }))
        : DEFAULT_IRODOV_161_PROBLEM.steps;

      const updatedProblem: IrodovProblemData = {
        id: `custom-${Date.now()}`,
        questionNumber: data.questionNumber || 'IRODOV CUSTOM',
        chapterTitle: data.chapterTitle || 'Physics Animation Studio',
        statement: data.statement || DEFAULT_IRODOV_161_PROBLEM.statement,
        subQuestions:
          Array.isArray(data.subQuestions) && data.subQuestions.length > 0
            ? data.subQuestions
            : DEFAULT_IRODOV_161_PROBLEM.subQuestions,
        givenBadges:
          Array.isArray(data.givenBadges) && data.givenBadges.length > 0
            ? data.givenBadges
            : DEFAULT_IRODOV_161_PROBLEM.givenBadges,
        answerSummaryA: data.answerSummaryA || DEFAULT_IRODOV_161_PROBLEM.answerSummaryA,
        answerSummaryB: data.answerSummaryB || DEFAULT_IRODOV_161_PROBLEM.answerSummaryB,
        conceptSummaryHinglish:
          data.conceptSummaryHinglish || DEFAULT_IRODOV_161_PROBLEM.conceptSummaryHinglish,
        screenshotUrl: screenshotPreviewUrl,
        steps: mappedSteps,
        customManimBody: data.customManimBody || undefined,
      };

      setActiveProblem(updatedProblem);
      setCurrentTime(0);
      setIsPlaying(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to analyze screenshot right now.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadAndAnalyze = async (file: File, extraNotes: string) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const base64Data = reader.result.split(',')[1] || '';
      await runGeminiScreenshotAnalysis(
        base64Data,
        file.type || 'image/png',
        reader.result,
        extraNotes
      );
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeCurrentScreenshot = async (extraNotes: string) => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      const res = await fetch(activeProblem.screenshotUrl);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result !== 'string') return;
        const base64Data = reader.result.split(',')[1] || '';
        await runGeminiScreenshotAnalysis(
          base64Data,
          blob.type || 'image/png',
          activeProblem.screenshotUrl,
          extraNotes
        );
      };
      reader.readAsDataURL(blob);
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setAnalysisError(
        err instanceof Error ? err.message : 'Could not load current screenshot.'
      );
    }
  };

  const handleCopyQuickColab = async () => {
    const codeSection = document.getElementById('colab-export-section');
    codeSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/90 bg-[#0B0F19]/95 sticky top-0 z-30 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
        >
          Irodov Manim Studio
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#preview-stage"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            9:16 Simulator
          </a>
          <a
            href="#physics-controls"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Physics Sandbox
          </a>
          <a
            href="#colab-export-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Colab Code
          </a>
          <a
            href="#colab-export-section"
            className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Master Prompt
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={handleCopyQuickColab}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Get Google Colab Code
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTENT */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Compact Studio Hero Intro */}
        <div className="mb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div>
            <div className="text-xs font-mono text-sky-400 mb-1">
              VERTICAL 9:16 EDTECH SHORTS ENGINE · MANIM COMMUNITY v0.18+ · GOOGLE COLAB READY
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight text-balance">
              Irodov Question-by-Question 9:16 Manim Studio
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
            <span>1080×1920 Vertical</span>
            <span aria-hidden="true">·</span>
            <span>16.0s 4-Act Storyboard</span>
            <span aria-hidden="true">·</span>
            <span>Safe Auto-BGM WAV Synth</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">&ldquo;Physics Lovers, Answer Batao?&rdquo; Outro</span>
          </div>
        </div>

        {/* 12-COLUMN RESPONSIVE STUDIO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (4 cols): 9:16 VERTICAL VIDEO PREVIEW PLAYER */}
          <section
            id="preview-stage"
            aria-label="9:16 Vertical Animation Preview"
            className="lg:col-span-4 flex flex-col items-center"
          >
            <VerticalManimStage
              problem={activeProblem}
              physicsParams={physicsParams}
              physicsResult={physicsResult}
              currentTime={currentTime}
              isPlaying={isPlaying}
              isMuted={isMuted}
              outroHookText={codeOptions.outroHookText}
              showAnswerInStage={showAnswerInStage}
              onTogglePlay={handleTogglePlay}
              onResetTime={handleResetTime}
              onSeekTime={handleSeekTime}
              onToggleMute={handleToggleMute}
              onToggleShowAnswer={() => setShowAnswerInStage((prev) => !prev)}
            />
          </section>

          {/* MIDDLE COLUMN (4 cols): SCREENSHOT UPLOADER & INTERACTIVE PHYSICS CONTROLS */}
          <section
            id="physics-controls"
            aria-label="Screenshot Scanner and Physics Controls"
            className="lg:col-span-4"
          >
            <PhysicsControlDeck
              activeProblem={activeProblem}
              physicsParams={physicsParams}
              physicsResult={physicsResult}
              outroHookText={codeOptions.outroHookText}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
              onSelectPreset={(preset) => {
                setActiveProblem(preset);
                setCurrentTime(4.5);
                setIsPlaying(false);
              }}
              onUpdatePhysics={handleUpdatePhysics}
              onUpdateHookText={(txt) => handleUpdateCodeOptions({ outroHookText: txt })}
              onUploadAndAnalyze={handleUploadAndAnalyze}
              onAnalyzeCurrentScreenshot={handleAnalyzeCurrentScreenshot}
            />
          </section>

          {/* RIGHT COLUMN (4 cols): GOOGLE COLAB CODE & UNIVERSAL MASTER PROMPT */}
          <section
            id="colab-export-section"
            aria-label="Google Colab Code and Universal Prompt"
            className="lg:col-span-4 h-full"
          >
            <ColabCodeAndPromptPanel
              problem={activeProblem}
              options={codeOptions}
              onUpdateOptions={handleUpdateCodeOptions}
              onJumpToActTime={(sec) => {
                setIsPlaying(false);
                handleSeekTime(sec);
              }}
            />
          </section>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="mt-10 border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        Irodov Manim Studio · Configured for 9:16 Vertical Reels/Shorts (1080×1920) & One-Cell Google Colab Execution
      </footer>
    </div>
  );
}
