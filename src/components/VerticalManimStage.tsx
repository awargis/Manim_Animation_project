import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AnimationActId,
  Irodov161Params,
  Irodov161Result,
  IrodovProblemData,
  getActFromTime,
} from '../utils/physicsEngine';

interface VerticalManimStageProps {
  problem: IrodovProblemData;
  physicsParams: Irodov161Params;
  physicsResult: Irodov161Result;
  currentTime: number;
  isPlaying: boolean;
  isMuted: boolean;
  outroHookText: string;
  showAnswerInStage: boolean;
  onTogglePlay: () => void;
  onResetTime: () => void;
  onSeekTime: (newTime: number) => void;
  onToggleMute: () => void;
  onToggleShowAnswer: () => void;
}

export const VerticalManimStage: React.FC<VerticalManimStageProps> = ({
  problem,
  physicsParams,
  physicsResult,
  currentTime,
  isPlaying,
  isMuted,
  outroHookText,
  showAnswerInStage,
  onTogglePlay,
  onResetTime,
  onSeekTime,
  onToggleMute,
  onToggleShowAnswer,
}) => {
  const currentAct: AnimationActId = getActFromTime(currentTime);

  // Calculate normalized progress within Act 3 (8.5s -> 13.0s) for sliding displacement
  const motionProgress =
    currentTime <= 8.5
      ? 0
      : currentTime >= 12.5
      ? 1
      : Math.pow((currentTime - 8.5) / 4.0, 1.65);

  const slideOffsetPx =
    currentAct === 'motion_simulation' || currentAct === 'outro_challenge'
      ? motionProgress * 60
      : 0;

  // Compact geometry for SVG inclined plane (viewBox 0 0 360 218) so all 3 zones fit comfortably inside 9:16
  const originX = 40;
  const originY = 198;
  const rampLength = 266;
  const alphaRad = (physicsParams.alphaDeg * Math.PI) / 180;

  const cosA = Math.cos(alphaRad);
  const sinA = Math.sin(alphaRad);

  const topX = originX + rampLength * cosA;
  const topY = originY - rampLength * sinA;

  // Generate hatch lines under the incline (matching Irodov Fig. 1.10)
  const hatchLines = [];
  const numHatches = 19;
  for (let i = 0; i < numHatches; i++) {
    const dist = 12 + i * 13.2;
    if (dist > rampLength - 6) break;
    const px = originX + dist * cosA;
    const py = originY - dist * sinA;
    const hx = px - 5 * cosA + 7.5 * sinA;
    const hy = py + 5 * sinA + 7.5 * cosA;
    hatchLines.push({ x1: px, y1: py, x2: hx, y2: hy, key: i });
  }

  // Arc for angle alpha
  const arcRadius = 44;
  const arcEndX = originX + arcRadius * cosA;
  const arcEndY = originY - arcRadius * sinA;

  // Base distance along the ramp for Bar 1 and Bar 2 (touching)
  const barWidth = 54;
  const barHeight = 28;
  const baseDist = 138 - slideOffsetPx;

  const activeStepObj =
    problem.steps.find((s) => s.id === currentAct) || problem.steps[0];

  return (
    <div className="flex flex-col items-center w-full">
      {/* 9:16 Vertical Smartphone / EdTech Studio Viewport */}
      <div
        data-testid="manim-vertical-viewport"
        data-act={currentAct}
        className="relative w-full max-w-[356px] aspect-[9/16] rounded-2xl bg-[#070B14] border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between select-none"
      >
        {/* Top Glowing Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 shrink-0" />

        {/* Subtle Engineering Blueprint Grid Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* ZONE 1 (TOP): QUESTION NUMBER & ATTRACTIVE STATEMENT CARD */}
        <div className="relative z-10 px-3.5 pt-2.5 pb-1 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-base tracking-wide text-sky-300">
              {problem.questionNumber}
            </span>
            <span className="font-mono text-[10.5px] text-slate-400 tabular-nums">
              9:16 · 1080×1920 · 60FPS
            </span>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-2.5 backdrop-blur-sm">
            <p className="text-[11px] leading-snug text-slate-200 font-medium line-clamp-3">
              {problem.statement}
            </p>
            <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex flex-col gap-0.5">
              {problem.subQuestions.map((sq, idx) => (
                <p
                  key={idx}
                  className={`text-[10.5px] font-medium leading-tight ${
                    idx === 0 ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {sq}
                </p>
              ))}
            </div>
          </div>

          {/* Given Variables Unboxed Metadata Strip */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-mono text-slate-400 px-0.5">
            {problem.givenBadges.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-300">{item}</span>
                {idx < problem.givenBadges.length - 1 && (
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ZONE 2 (MIDDLE): HYPER-REALISTIC VECTOR ANIMATION CANVAS */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-2 min-h-0">
          <svg
            viewBox="0 0 360 212"
            className="w-full max-h-[205px] overflow-visible"
            aria-label="Interactive Physics Free-Body Diagram for Irodov 1.61"
          >
            <defs>
              <marker
                id="arrow-red"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#F87171" />
              </marker>
              <marker
                id="arrow-purple"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#C084FC" />
              </marker>
              <marker
                id="arrow-amber"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#FBBF24" />
              </marker>
              <marker
                id="arrow-emerald"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#34D399" />
              </marker>
            </defs>

            {/* Horizontal Dashed Base Line */}
            <line
              x1={originX}
              y1={originY}
              x2={originX + 175}
              y2={originY}
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Hatching Under Incline (Fig. 1.10 style) */}
            {hatchLines.map((h) => (
              <line
                key={h.key}
                x1={h.x1}
                y1={h.y1}
                x2={h.x2}
                y2={h.y2}
                stroke="#475569"
                strokeWidth="1.5"
              />
            ))}

            {/* Inclined Plane Surface Line */}
            <line
              x1={originX}
              y1={originY}
              x2={topX}
              y2={topY}
              stroke="#F1F5F9"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Angle Arc α */}
            <path
              d={`M ${originX + arcRadius} ${originY} A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}`}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.2"
            />
            <text
              x={originX + 55 * Math.cos(alphaRad / 2)}
              y={originY - 55 * Math.sin(alphaRad / 2) + 4}
              fill="#38BDF8"
              fontSize="12"
              fontWeight="700"
              fontFamily="JetBrains Mono, monospace"
            >
              α={physicsParams.alphaDeg}°
            </text>

            {/* Rotated Coordinate Group Aligned with Inclined Plane */}
            <g
              transform={`translate(${originX}, ${originY}) rotate(${-physicsParams.alphaDeg})`}
            >
              {/* Motion Trail when sliding in Act 3 */}
              {slideOffsetPx > 2 && (
                <line
                  x1={baseDist + barWidth * 2 + 6}
                  y1={-barHeight / 2}
                  x2={baseDist + barWidth * 2 + slideOffsetPx}
                  y2={-barHeight / 2}
                  stroke="#34D399"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                  opacity="0.75"
                />
              )}

              {/* BAR 1 (Lower Bar: mass m1, higher friction k1) */}
              <rect
                x={baseDist}
                y={-barHeight - 1.5}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="#0284C7"
                fillOpacity="0.88"
                stroke="#7DD3FC"
                strokeWidth="2"
              />
              <text
                x={baseDist + barWidth / 2}
                y={-barHeight / 2 + 3}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="Outfit, sans-serif"
              >
                1 (m1)
              </text>

              {/* BAR 2 (Upper Bar: mass m2, lower friction k2) */}
              <rect
                x={baseDist + barWidth}
                y={-barHeight - 1.5}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill="#059669"
                fillOpacity="0.88"
                stroke="#6EE7B7"
                strokeWidth="2"
              />
              <text
                x={baseDist + barWidth * 1.5}
                y={-barHeight / 2 + 3}
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="11.5"
                fontWeight="700"
                fontFamily="Outfit, sans-serif"
              >
                2 (m2)
              </text>

              {/* Glowing Contact Interface Between Bar 1 and Bar 2 */}
              <line
                x1={baseDist + barWidth}
                y1={-barHeight - 3}
                x2={baseDist + barWidth}
                y2={0}
                stroke="#FBBF24"
                strokeWidth="3.5"
              />

              {/* FORCE VECTORS (Visible in Act 2, Act 3, Act 4) */}
              {currentAct !== 'question_reveal' && (
                <g>
                  {/* Downward Gravity Component along incline */}
                  <line
                    x1={baseDist + 10}
                    y1={-barHeight / 2}
                    x2={baseDist - 36}
                    y2={-barHeight / 2}
                    stroke="#F87171"
                    strokeWidth="2.2"
                    markerEnd="url(#arrow-red)"
                  />
                  <text
                    x={baseDist - 40}
                    y={-barHeight / 2 - 5}
                    textAnchor="end"
                    fill="#FCA5A5"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    (m1+m2)g sinα
                  </text>

                  {/* Upward Friction f1 & f2 along surface */}
                  <line
                    x1={baseDist + barWidth * 1.6}
                    y1={-5}
                    x2={baseDist + barWidth * 2 + 32}
                    y2={-5}
                    stroke="#C084FC"
                    strokeWidth="2.2"
                    markerEnd="url(#arrow-purple)"
                  />
                  <text
                    x={baseDist + barWidth * 2 + 5}
                    y={-13}
                    fill="#D8B4FE"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    f1+f2
                  </text>

                  {/* Internal Interaction Force F pair at boundary */}
                  {physicsResult.interactionForceMotion > 0 && (
                    <g>
                      <line
                        x1={baseDist + barWidth}
                        y1={-barHeight - 12}
                        x2={baseDist + barWidth - 30}
                        y2={-barHeight - 12}
                        stroke="#FBBF24"
                        strokeWidth="2.4"
                        markerEnd="url(#arrow-amber)"
                      />
                      <line
                        x1={baseDist + barWidth}
                        y1={-barHeight - 12}
                        x2={baseDist + barWidth + 30}
                        y2={-barHeight - 12}
                        stroke="#FBBF24"
                        strokeWidth="2.4"
                        markerEnd="url(#arrow-amber)"
                      />
                      <text
                        x={baseDist + barWidth}
                        y={-barHeight - 20}
                        textAnchor="middle"
                        fill="#FBBF24"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        F_int = {physicsResult.interactionForceMotion} N
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* Coupled Acceleration Vector in Act 3 */}
              {(currentAct === 'motion_simulation' || physicsResult.isSliding) && (
                <g>
                  <line
                    x1={baseDist + barWidth}
                    y1={-barHeight - 34}
                    x2={baseDist + barWidth - 42}
                    y2={-barHeight - 34}
                    stroke="#34D399"
                    strokeWidth="2.2"
                    markerEnd="url(#arrow-emerald)"
                  />
                  <text
                    x={baseDist + barWidth - 21}
                    y={-barHeight - 40}
                    textAnchor="middle"
                    fill="#6EE7B7"
                    fontSize="9.5"
                    fontWeight="700"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    a = {physicsResult.acceleration} m/s²
                  </text>
                </g>
              )}
            </g>
          </svg>

          {/* Live Telemetry Readout Strip Inside Stage */}
          <div className="mx-1.5 mt-0.5 grid grid-cols-3 gap-1 rounded-lg bg-slate-900/90 border border-slate-800 px-2 py-1 text-center font-mono shrink-0">
            <div>
              <div className="text-[9px] text-slate-400">F_interaction</div>
              <div className="text-[11px] font-semibold text-amber-300 tabular-nums">
                {physicsResult.interactionForceMotion} N
              </div>
            </div>
            <div className="border-x border-slate-800">
              <div className="text-[9px] text-slate-400">α_min (Slide)</div>
              <div className="text-[11px] font-semibold text-sky-300 tabular-nums">
                {physicsResult.alphaMinDeg}°
              </div>
            </div>
            <div>
              <div className="text-[9px] text-slate-400">State</div>
              <div
                className={`text-[11px] font-semibold tabular-nums ${
                  physicsResult.isSliding ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {physicsResult.isSliding ? '▲ SLIDING' : '■ STATIC'}
              </div>
            </div>
          </div>
        </div>

        {/* ZONE 3 (BOTTOM): STEP EXPLANATION OR "PHYSICS LOVERS, ANSWER BATAO?" OUTRO */}
        <div className="relative z-10 px-3.5 pb-3 pt-1 shrink-0">
          {currentAct === 'outro_challenge' ? (
            <div className="rounded-xl bg-gradient-to-b from-slate-900 via-[#0B1325] to-slate-950 border-2 border-sky-400/80 p-2.5 shadow-lg">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9.5px] font-mono text-amber-300">
                  FINAL CHALLENGE · COMMENT BELOW
                </span>
                <button
                  type="button"
                  onClick={onToggleShowAnswer}
                  className="text-[10px] font-medium text-sky-300 hover:text-sky-200 underline cursor-pointer"
                >
                  {showAnswerInStage ? 'Hide Key' : 'Peek Answer'}
                </button>
              </div>
              <p className="font-display font-bold text-sm text-sky-300 leading-snug">
                {outroHookText}
              </p>
              {showAnswerInStage ? (
                <div className="mt-1 space-y-0.5 font-mono text-[10px] text-emerald-300 bg-slate-950/80 rounded p-1.5 border border-slate-800">
                  <div>(a) {problem.answerSummaryA}</div>
                  <div>(b) {problem.answerSummaryB}</div>
                </div>
              ) : (
                <p className="mt-0.5 text-[10.5px] text-slate-300 leading-snug">
                  Comment <span className="text-amber-300 font-semibold">(a) F_interaction</span> &{' '}
                  <span className="text-emerald-300 font-semibold">(b) tan α_min</span>! Bonus: What happens to F if k1 &lt; k2?
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-slate-900/95 border border-slate-800 p-2.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 mb-0.5">
                <span className="truncate">
                  STEP {activeStepObj.stepNumber} · {activeStepObj.title}
                </span>
                <span className="tabular-nums text-slate-400 shrink-0 ml-1">
                  {activeStepObj.timeRange}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-200 leading-snug line-clamp-2">
                {activeStepObj.narrationHinglish}
              </p>
              <div className="mt-1 font-mono text-[10px] text-amber-300 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800/80 truncate">
                {activeStepObj.keyFormula}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transport & Timeline Controls Under the 9:16 Stage */}
      <div className="w-full max-w-[356px] mt-3 rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause 9:16 animation' : 'Play 9:16 animation'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Reel'}</span>
            </button>
            <button
              type="button"
              onClick={onResetTime}
              aria-label="Reset animation to start"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute preview sound' : 'Mute preview sound'}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          </div>

          <span className="font-mono text-xs text-slate-300 tabular-nums">
            {currentTime.toFixed(1)}s / 16.0s
          </span>
        </div>

        {/* Scrubber Slider */}
        <div className="flex items-center gap-2">
          <label htmlFor="reel-timeline-slider" className="sr-only">
            Animation Timeline Scrubber
          </label>
          <input
            id="reel-timeline-slider"
            type="range"
            min={0}
            max={16}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeekTime(parseFloat(e.target.value))}
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* 4-Act Scene Jump Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[
            { label: '01. Ques', sec: 0.5, id: 'question_reveal' },
            { label: '02. Forces', sec: 4.5, id: 'force_decomposition' },
            { label: '03. Slide', sec: 9.0, id: 'motion_simulation' },
            { label: '04. Outro', sec: 13.5, id: 'outro_challenge' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => onSeekTime(btn.sec)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                currentAct === btn.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
