import React, { useRef, useState } from 'react';
import {
  Upload,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  Irodov161Params,
  Irodov161Result,
  IrodovProblemData,
  PRESET_PROBLEMS,
} from '../utils/physicsEngine';

interface PhysicsControlDeckProps {
  activeProblem: IrodovProblemData;
  physicsParams: Irodov161Params;
  physicsResult: Irodov161Result;
  outroHookText: string;
  isAnalyzing: boolean;
  analysisError: string | null;
  onSelectPreset: (problem: IrodovProblemData) => void;
  onUpdatePhysics: (next: Partial<Irodov161Params>) => void;
  onUpdateHookText: (text: string) => void;
  onUploadAndAnalyze: (file: File, extraNotes: string) => Promise<void>;
  onAnalyzeCurrentScreenshot: (extraNotes: string) => Promise<void>;
}

export const PhysicsControlDeck: React.FC<PhysicsControlDeckProps> = ({
  activeProblem,
  physicsParams,
  physicsResult,
  outroHookText,
  isAnalyzing,
  analysisError,
  onSelectPreset,
  onUpdatePhysics,
  onUpdateHookText,
  onUploadAndAnalyze,
  onAnalyzeCurrentScreenshot,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [extraNotes, setExtraNotes] = useState<string>('');
  const [imgFallback, setImgFallback] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImgFallback(false);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerGenerate = async () => {
    if (selectedFile) {
      await onUploadAndAnalyze(selectedFile, extraNotes);
    } else {
      await onAnalyzeCurrentScreenshot(extraNotes);
    }
  };

  const displayedScreenshot = previewDataUrl || activeProblem.screenshotUrl;

  return (
    <div className="flex flex-col gap-5">
      {/* Section 1: Uploaded Irodov Screenshot & Zero-Prompt AI Scanner */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              01. Question Screenshot & AI Scanner
            </h2>
            <p className="text-xs text-slate-400">
              Drop any Irodov screenshot — AI auto-detects the question & writes 9:16 Colab code
            </p>
          </div>
          {/* Preset Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {PRESET_PROBLEMS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewDataUrl(null);
                  onSelectPreset(preset);
                }}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeProblem.id === preset.id && !selectedFile
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {preset.questionNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot Preview Box */}
        <div className="relative rounded-lg bg-slate-950 border border-slate-800/90 overflow-hidden mb-3">
          {!imgFallback ? (
            <img
              src={displayedScreenshot}
              alt={`Uploaded physics problem screenshot for ${activeProblem.questionNumber}`}
              referrerPolicy="no-referrer"
              onError={() => setImgFallback(true)}
              className="w-full max-h-48 object-contain bg-white/95 p-2"
            />
          ) : (
            <div className="w-full h-36 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-4 text-center">
              <span className="font-mono text-xs text-sky-400 font-semibold">
                {activeProblem.questionNumber} — Reference Diagram Loaded
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {activeProblem.statement.slice(0, 90)}...
              </span>
            </div>
          )}

          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/95 border-t border-slate-800 text-xs">
            <span className="text-slate-300 font-mono truncate">
              {selectedFile
                ? `Uploaded: ${selectedFile.name}`
                : `Active Reference: ${activeProblem.questionNumber} (Fig. 1.10)`}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium cursor-pointer whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload New Screenshot</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            id="screenshot-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Optional Custom Instructions + 1-Click AI Generate */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <label htmlFor="extra-ai-notes" className="sr-only">
            Optional instructions for AI animation generator
          </label>
          <input
            id="extra-ai-notes"
            type="text"
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Optional note (leave blank for automatic Master Prompt mode)..."
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={handleTriggerGenerate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating 9:16 Manim...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Manim from Screenshot</span>
              </>
            )}
          </button>
        </div>

        {analysisError && (
          <div
            role="alert"
            className="mt-2.5 flex items-center gap-2 text-xs text-red-300 bg-red-950/50 border border-red-800/70 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}
      </div>

      {/* Section 2: Interactive Physics Parameter Sandbox (Irodov 1.61 Live Math) */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              02. Interactive Physics Parameters (Live Simulation)
            </h2>
          </div>
          <span className="font-mono text-xs text-slate-400 tabular-nums">
            α_min = {physicsResult.alphaMinDeg}°
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Incline Angle Alpha */}
          <div className="sm:col-span-2 bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="slider-alpha" className="font-medium text-slate-200">
                Incline Angle (α)
              </label>
              <span className="font-mono text-sky-300 font-semibold tabular-nums">
                {physicsParams.alphaDeg}°{' '}
                {physicsResult.isSliding
                  ? `(> α_min ${physicsResult.alphaMinDeg}° · Sliding)`
                  : `(≤ α_min ${physicsResult.alphaMinDeg}° · Static)`}
              </span>
            </div>
            <input
              id="slider-alpha"
              type="range"
              min={5}
              max={50}
              step={1}
              value={physicsParams.alphaDeg}
              onChange={(e) => onUpdatePhysics({ alphaDeg: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Mass m1 */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="slider-m1" className="text-slate-300">
                Bar 1 Mass (m<sub>1</sub>)
              </label>
              <span className="font-mono text-sky-300 tabular-nums">{physicsParams.m1.toFixed(1)} kg</span>
            </div>
            <input
              id="slider-m1"
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={physicsParams.m1}
              onChange={(e) => onUpdatePhysics({ m1: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Mass m2 */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="slider-m2" className="text-slate-300">
                Bar 2 Mass (m<sub>2</sub>)
              </label>
              <span className="font-mono text-emerald-300 tabular-nums">{physicsParams.m2.toFixed(1)} kg</span>
            </div>
            <input
              id="slider-m2"
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={physicsParams.m2}
              onChange={(e) => onUpdatePhysics({ m2: Number(e.target.value) })}
              className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Friction k1 */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="slider-k1" className="text-slate-300">
                Bar 1 Friction (k<sub>1</sub>)
              </label>
              <span className="font-mono text-amber-300 tabular-nums">{physicsParams.k1.toFixed(2)}</span>
            </div>
            <input
              id="slider-k1"
              type="range"
              min={0.05}
              max={0.9}
              step={0.05}
              value={physicsParams.k1}
              onChange={(e) => onUpdatePhysics({ k1: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Friction k2 */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="slider-k2" className="text-slate-300">
                Bar 2 Friction (k<sub>2</sub>)
              </label>
              <span className="font-mono text-amber-300 tabular-nums">{physicsParams.k2.toFixed(2)}</span>
            </div>
            <input
              id="slider-k2"
              type="range"
              min={0.05}
              max={0.9}
              step={0.05}
              value={physicsParams.k2}
              onChange={(e) => onUpdatePhysics({ k2: Number(e.target.value) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Custom Outro Hook Input */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label htmlFor="outro-hook-input" className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Ending Hook Text:
          </label>
          <input
            id="outro-hook-input"
            type="text"
            value={outroHookText}
            onChange={(e) => onUpdateHookText(e.target.value)}
            className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-sky-300 font-medium focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Section 3: Step-by-Step Hinglish Concept & Formula Breakdown */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <h2 className="text-sm font-semibold text-slate-100 mb-1.5">
          03. Step-by-Step Conceptual Breakdown & Answers
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {activeProblem.conceptSummaryHinglish}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Answer (a): Force of Interaction</span>
            </div>
            <div className="text-slate-100">{activeProblem.answerSummaryA}</div>
            <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
              Live Value: F = {physicsResult.interactionForceMotion} N
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
            <div className="flex items-center gap-1.5 text-emerald-300 font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Answer (b): Minimum Angle α_min</span>
            </div>
            <div className="text-slate-100">{activeProblem.answerSummaryB}</div>
            <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
              Live Value: tan α_min = {physicsResult.tanAlphaMin} ({physicsResult.alphaMinDeg}°)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
