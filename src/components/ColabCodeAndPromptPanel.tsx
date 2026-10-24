import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode2,
  Wand2,
  ListVideo,
} from 'lucide-react';
import {
  ColabCodeOptions,
  IrodovProblemData,
  generateColabManimCode,
  generateUniversalMasterPrompt,
} from '../utils/physicsEngine';

interface ColabCodeAndPromptPanelProps {
  problem: IrodovProblemData;
  options: ColabCodeOptions;
  onUpdateOptions: (next: Partial<ColabCodeOptions>) => void;
  onJumpToActTime: (sec: number) => void;
}

export const ColabCodeAndPromptPanel: React.FC<ColabCodeAndPromptPanelProps> = ({
  problem,
  options,
  onUpdateOptions,
  onJumpToActTime,
}) => {
  const [activeTab, setActiveTab] = useState<'colab_code' | 'master_prompt' | 'storyboard'>('colab_code');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const generatedCode = generateColabManimCode(problem, options);
  const masterPrompt = generateUniversalMasterPrompt(options.outroHookText);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(masterPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadPy = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = problem.questionNumber.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    a.download = `${slug}_9_16_colab.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadIpynb = () => {
    const notebookJson = {
      nbformat: 4,
      nbformat_minor: 0,
      metadata: {
        colab: {
          provenance: [],
          name: `${problem.questionNumber}_9_16_Manim_Studio.ipynb`,
        },
        kernelspec: {
          name: 'python3',
          display_name: 'Python 3',
        },
        language_info: {
          name: 'python',
        },
      },
      cells: [
        {
          cell_type: 'markdown',
          metadata: {},
          source: [
            `# 🎬 ${problem.questionNumber} — 9:16 EdTech Manim Animation\n`,
            `Run the single cell below (\`Shift + Enter\`) to install Manim, synthesize the ambient physics soundtrack safely, render the 1080x1920 vertical video, and auto-download the MP4.`,
          ],
        },
        {
          cell_type: 'code',
          execution_count: null,
          metadata: {},
          outputs: [],
          source: generatedCode.split('\n').map((line) => line + '\n'),
        },
      ],
    };

    const blob = new Blob([JSON.stringify(notebookJson, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = problem.questionNumber.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    a.download = `${slug}_colab_notebook.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Segmented Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950/60">
        <div
          role="tablist"
          aria-label="Output Modes"
          className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800"
        >
          <button
            role="tab"
            aria-selected={activeTab === 'colab_code'}
            type="button"
            onClick={() => setActiveTab('colab_code')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'colab_code'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Colab Code</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'master_prompt'}
            type="button"
            onClick={() => setActiveTab('master_prompt')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'master_prompt'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Master Prompt</span>
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'storyboard'}
            type="button"
            onClick={() => setActiveTab('storyboard')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'storyboard'
                ? 'bg-sky-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListVideo className="w-3.5 h-3.5" />
            <span>Storyboard</span>
          </button>
        </div>

        {/* Action Buttons for Active Tab */}
        {activeTab === 'colab_code' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied for Colab!' : 'Copy Colab Code'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadIpynb}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>.ipynb</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>.py</span>
            </button>
          </div>
        )}

        {activeTab === 'master_prompt' && (
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedPrompt ? 'Master Prompt Copied!' : 'Copy Master Prompt'}</span>
          </button>
        )}
      </div>

      {/* TAB 1 CONTENT: GOOGLE COLAB MANIM CODE */}
      {activeTab === 'colab_code' && (
        <div className="flex flex-col flex-1">
          {/* Code Configuration Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.singleCellColabMode}
                  onChange={(e) =>
                    onUpdateOptions({ singleCellColabMode: e.target.checked })
                  }
                  className="rounded accent-sky-400"
                />
                <span>1-Cell Auto-Install & Auto-Download Colab Wrapper</span>
              </label>

              <label className="inline-flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.includeSafeAudio}
                  onChange={(e) =>
                    onUpdateOptions({ includeSafeAudio: e.target.checked })
                  }
                  className="rounded accent-sky-400"
                />
                <span>Auto-BGM Sound (Safe try/except Fallback)</span>
              </label>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span>FPS:</span>
              <button
                type="button"
                onClick={() => onUpdateOptions({ fps: 60 })}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  options.fps === 60
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                60
              </button>
              <button
                type="button"
                onClick={() => onUpdateOptions({ fps: 30 })}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  options.fps === 30
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                30
              </button>
            </div>
          </div>

          {/* Quick Colab Usage Banner */}
          <div className="px-4 py-2 bg-sky-950/30 border-b border-slate-800/80 text-xs text-slate-300 flex items-center justify-between gap-2">
            <span>
              <strong className="text-sky-300">Zero-Effort Colab Steps:</strong> Open Google Colab → Paste into 1 cell → Press <code className="text-amber-300">Shift + Enter</code>. Video renders in 9:16 (1080×1920) & downloads automatically!
            </span>
          </div>

          {/* Code Viewer */}
          <div className="relative flex-1 bg-[#070A12] overflow-auto max-h-[580px] p-4">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2 CONTENT: UNIVERSAL ZERO-EFFORT MASTER PROMPT */}
      {activeTab === 'master_prompt' && (
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-auto max-h-[640px]">
          <div className="rounded-lg bg-slate-950 border border-slate-800 p-3.5">
            <h3 className="text-sm font-semibold text-sky-300 mb-1">
              Screenshot-Only Universal AI System Prompt
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jab bhi aap kisi bhi AI tool me sirf Irodov question ka screenshot upload karein aur har baar lamba prompt na likhna chahein, toh bas niche diya gaya <strong>Master Prompt</strong> ek baar paste kar dein (ya is studio ke AI Scanner ko direct use karein):
            </p>
          </div>

          <div className="relative flex-1 rounded-lg bg-[#070A12] border border-slate-800 p-4 overflow-auto">
            <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
              {masterPrompt}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3 CONTENT: 4-ACT STORYBOARD & VOICEOVER SCRIPT */}
      {activeTab === 'storyboard' && (
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-auto max-h-[640px]">
          <div className="text-xs text-slate-400 mb-1">
            Click any scene act below to jump the 9:16 preview player to that exact timestamp:
          </div>
          {problem.steps.map((step) => (
            <div
              key={step.id}
              className="rounded-lg bg-slate-950/90 border border-slate-800 p-3.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-sky-400">
                    ACT {step.stepNumber}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">{step.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onJumpToActTime(step.startSec + 0.3)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-sky-300 cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
                >
                  Preview {step.timeRange}
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed mb-2">
                <span className="text-slate-400 font-medium">Hinglish Voiceover / Story: </span>
                {step.narrationHinglish}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
                <span className="text-slate-400">{step.visualFocus}</span>
                <span className="text-amber-300 shrink-0">{step.keyFormula}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
