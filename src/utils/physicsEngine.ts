export interface Irodov161Params {
  m1: number; // kg
  m2: number; // kg
  k1: number; // coefficient of friction for bar 1
  k2: number; // coefficient of friction for bar 2
  alphaDeg: number; // incline angle in degrees
  g?: number; // m/s^2, default 9.81
}

export interface Irodov161Result {
  alphaRad: number;
  tanAlphaMin: number;
  alphaMinDeg: number;
  isSliding: boolean;
  interactionForceMotion: number; // N, formula value during motion
  currentInteractionForce: number; // N, actual force at current angle alpha
  acceleration: number; // m/s^2
  normalForce1: number; // N
  normalForce2: number; // N
  maxFriction1: number; // N
  maxFriction2: number; // N
  gravityParallel1: number; // N
  gravityParallel2: number; // N
}

export type AnimationActId =
  | 'question_reveal'
  | 'force_decomposition'
  | 'motion_simulation'
  | 'outro_challenge';

export interface StoryboardStep {
  id: AnimationActId;
  stepNumber: string;
  title: string;
  timeRange: string;
  startSec: number;
  endSec: number;
  narrationHinglish: string;
  visualFocus: string;
  keyFormula: string;
}

export interface IrodovProblemData {
  id: string;
  questionNumber: string;
  chapterTitle: string;
  statement: string;
  subQuestions: string[];
  givenBadges: string[];
  answerSummaryA: string;
  answerSummaryB: string;
  conceptSummaryHinglish: string;
  screenshotUrl: string;
  steps: StoryboardStep[];
  customManimBody?: string;
}

export interface ColabCodeOptions {
  singleCellColabMode: boolean;
  includeSafeAudio: boolean;
  fps: 30 | 60;
  outroHookText: string;
  showAnswerHintInOutro: boolean;
}

export function calculateIrodov161Physics(params: Irodov161Params): Irodov161Result {
  const g = params.g ?? 9.81;
  const m1 = Math.max(0.1, params.m1);
  const m2 = Math.max(0.1, params.m2);
  const k1 = Math.max(0, params.k1);
  const k2 = Math.max(0, params.k2);
  const alphaRad = (params.alphaDeg * Math.PI) / 180;

  const cosA = Math.cos(alphaRad);
  const sinA = Math.sin(alphaRad);

  const tanAlphaMin = (k1 * m1 + k2 * m2) / (m1 + m2);
  const alphaMinRad = Math.atan(tanAlphaMin);
  const alphaMinDeg = (alphaMinRad * 180) / Math.PI;

  const normalForce1 = m1 * g * cosA;
  const normalForce2 = m2 * g * cosA;

  const maxFriction1 = k1 * normalForce1;
  const maxFriction2 = k2 * normalForce2;

  const gravityParallel1 = m1 * g * sinA;
  const gravityParallel2 = m2 * g * sinA;

  // Formula for part (a): Force of interaction in the process of motion
  // When k1 > k2, bar 2 pushes bar 1 with F = m1*m2*(k1 - k2)*g*cos(alpha)/(m1 + m2)
  const interactionForceMotion =
    k1 > k2 ? (m1 * m2 * (k1 - k2) * g * cosA) / (m1 + m2) : 0;

  const isSliding = params.alphaDeg >= alphaMinDeg - 1e-6;

  let acceleration = 0;
  let currentInteractionForce = 0;

  if (isSliding) {
    if (k1 > k2) {
      acceleration = Math.max(0, g * (sinA - tanAlphaMin * cosA));
      currentInteractionForce = interactionForceMotion;
    } else {
      // Bar 1 slides faster or equal to Bar 2 -> no contact push
      acceleration = Math.max(0, g * (sinA - k1 * cosA));
      currentInteractionForce = 0;
    }
  } else {
    acceleration = 0;
    // Before full system sliding, if tan(alpha) > k2, bar 2 leans on bar 1
    if (gravityParallel2 > maxFriction2) {
      currentInteractionForce = gravityParallel2 - maxFriction2;
    } else {
      currentInteractionForce = 0;
    }
  }

  return {
    alphaRad,
    tanAlphaMin: Number(tanAlphaMin.toFixed(4)),
    alphaMinDeg: Number(alphaMinDeg.toFixed(2)),
    isSliding,
    interactionForceMotion: Number(interactionForceMotion.toFixed(2)),
    currentInteractionForce: Number(currentInteractionForce.toFixed(2)),
    acceleration: Number(acceleration.toFixed(2)),
    normalForce1: Number(normalForce1.toFixed(2)),
    normalForce2: Number(normalForce2.toFixed(2)),
    maxFriction1: Number(maxFriction1.toFixed(2)),
    maxFriction2: Number(maxFriction2.toFixed(2)),
    gravityParallel1: Number(gravityParallel1.toFixed(2)),
    gravityParallel2: Number(gravityParallel2.toFixed(2)),
  };
}

export function getActFromTime(timeSec: number): AnimationActId {
  if (timeSec < 3.5) return 'question_reveal';
  if (timeSec < 8.5) return 'force_decomposition';
  if (timeSec < 13.0) return 'motion_simulation';
  return 'outro_challenge';
}

export const DEFAULT_IRODOV_161_PROBLEM: IrodovProblemData = {
  id: 'irodov-1-61',
  questionNumber: 'IRODOV 1.61',
  chapterTitle: 'Physical Fundamentals of Mechanics · Kinematics & Dynamics',
  statement:
    'Two touching bars 1 and 2 are placed on an inclined plane forming an angle α with the horizontal (Fig. 1.10). The masses of the bars are equal to m1 and m2, and the coefficients of friction between the inclined plane and these bars are equal to k1 and k2 respectively, with k1 > k2.',
  subQuestions: [
    '(a) Find the force of interaction of the bars in the process of motion;',
    '(b) Find the minimum value of the angle α at which the bars start sliding down.',
  ],
  givenBadges: ['Masses: m1, m2', 'Friction: k1 > k2', 'Incline Angle: α', 'Touching Bars 1 & 2'],
  answerSummaryA: 'F = m1·m2(k1 - k2)g cos α / (m1 + m2)',
  answerSummaryB: 'tan α_min = (k1·m1 + k2·m2) / (m1 + m2)',
  conceptSummaryHinglish:
    'Kyunki k1 > k2 hai, neeche wala Bar 1 zyada friction feel karta hai aur upar wala Bar 2 tezi se fisalna chahta hai! Isliye Bar 2 piche se Bar 1 ko Normal Contact Force (F) se push karta hai, aur dono ek coupled system ki tarah saath slide karte hain.',
  screenshotUrl: '/assets/aistudio/image_96b338b0.png',
  steps: [
    {
      id: 'question_reveal',
      stepNumber: '01',
      title: 'Question & Given Parameters Reveal',
      timeRange: '0.0s – 3.5s',
      startSec: 0,
      endSec: 3.5,
      narrationHinglish:
        'Screen par IRODOV 1.61 bold typography me appear hota hai. Do touching blocks m1 aur m2 inclined plane (angle α) par rakhe hain jahan k1 > k2 hai.',
      visualFocus: 'Cinematic title card, problem statement highlight, and glowing parameter callouts.',
      keyFormula: 'Given: m1, m2, α, and k1 > k2',
    },
    {
      id: 'force_decomposition',
      stepNumber: '02',
      title: 'Free-Body Diagram & Contact Force F',
      timeRange: '3.5s – 8.5s',
      startSec: 3.5,
      endSec: 8.5,
      narrationHinglish:
        'Gravity ke components m1·g sinα aur m2·g sinα neeche kheechte hain, jabki friction f1 = k1·N1 aur f2 = k2·N2 rokte hain. Kyunki k1 > k2, Bar 2 Bar 1 ko force F se dabata hai!',
      visualFocus: 'Step-by-step animated force vectors: Gravity, Normal N1/N2, Friction f1/f2, and glowing action-reaction pair F.',
      keyFormula: 'm1·a = m1·g sinα + F - k1·m1·g cosα',
    },
    {
      id: 'motion_simulation',
      stepNumber: '03',
      title: 'Critical Angle α_min & Coupled Sliding',
      timeRange: '8.5s – 13.0s',
      startSec: 8.5,
      endSec: 13.0,
      narrationHinglish:
        'Jaise hi angle α critical value α_min ko cross karta hai, net downward pull total limiting friction ko beat kar deta hai aur dono bars ek saath accelerate karte hain!',
      visualFocus: 'Dynamic ValueTracker incline tilt and smooth coupled acceleration down the ramp with live velocity trail.',
      keyFormula: 'tan α_min = (k1·m1 + k2·m2) / (m1 + m2)',
    },
    {
      id: 'outro_challenge',
      stepNumber: '04',
      title: 'Physics Lovers, Answer Batao?',
      timeRange: '13.0s – 16.0s',
      startSec: 13.0,
      endSec: 16.0,
      narrationHinglish:
        'Ab baari aapki! Agar k1 < k2 hota toh interaction force F kitna hota? Aur (a), (b) ka final expression comment me batao!',
      visualFocus: 'High-retention EdTech challenge card with pulsing call-to-action for Reels/Shorts comments.',
      keyFormula: 'Physics Lovers, Answer Batao?',
    },
  ],
};

export const PRESET_PROBLEMS: IrodovProblemData[] = [
  DEFAULT_IRODOV_161_PROBLEM,
  {
    id: 'irodov-1-59',
    questionNumber: 'IRODOV 1.59',
    chapterTitle: 'Physical Fundamentals of Mechanics · Dynamics of Connected Bodies',
    statement:
      'A system consists of two blocks of masses m1 and m2 connected by a weightless spring on a rough horizontal table (Fig. 1.9), pulled via a light thread over a smooth pulley by a hanging mass m0.',
    subQuestions: [
      '(a) Find the minimum hanging mass m0 required to shift both blocks;',
      '(b) Find the tension and spring extension during steady acceleration.',
    ],
    givenBadges: ['Hanging Mass: m0', 'Table Masses: m1, m2', 'Friction: k', 'Pulley & Thread'],
    answerSummaryA: 'm0_min = k(m1 + m2/2)',
    answerSummaryB: 'a = [m0 - k(m1 + m2)]g / (m0 + m1 + m2)',
    conceptSummaryHinglish:
      'Fig. 1.9 (jo aapke screenshot ke left side me bhi dikh raha hai) me hanging mass m0 pehle m1 ko kheechta hai, jisse spring stretch hota hai aur energy store karke m2 ko just move kar deta hai!',
    screenshotUrl: '/assets/aistudio/image_96b338b0.png',
    steps: [
      {
        id: 'question_reveal',
        stepNumber: '01',
        title: 'Question & Pulley System Reveal',
        timeRange: '0.0s – 3.5s',
        startSec: 0,
        endSec: 3.5,
        narrationHinglish: 'IRODOV 1.59 (Fig. 1.9) screen par aata hai: m1 aur m2 table par hain aur m0 pulley se latak raha hai.',
        visualFocus: '9:16 vertical framing of horizontal table, pulley wheel, and hanging mass m0.',
        keyFormula: 'Given: m0, m1, m2, friction k',
      },
      {
        id: 'force_decomposition',
        stepNumber: '02',
        title: 'Tension T & Spring Restoring Force kx',
        timeRange: '3.5s – 8.5s',
        startSec: 3.5,
        endSec: 8.5,
        narrationHinglish: 'String tension T block m1 ko pull karta hai aur beech ka cord/spring force m2 tak transfer hota hai.',
        visualFocus: 'Animated tension vectors T, friction arrows k·m1·g and k·m2·g.',
        keyFormula: 'Work-Energy: m0·gx - k·m1·gx = 0.5·kx²',
      },
      {
        id: 'motion_simulation',
        stepNumber: '03',
        title: 'Breakaway Threshold & Acceleration',
        timeRange: '8.5s – 13.0s',
        startSec: 8.5,
        endSec: 13.0,
        narrationHinglish: 'Jab kx = k·m2·g ko touch karta hai, block m2 bhi fisalna shuru kar deta hai!',
        visualFocus: 'Synchronized downward drop of m0 and horizontal glide of m1, m2.',
        keyFormula: 'm0_min = k(m1 + m2 / 2)',
      },
      {
        id: 'outro_challenge',
        stepNumber: '04',
        title: 'Physics Lovers, Answer Batao?',
        timeRange: '13.0s – 16.0s',
        startSec: 13.0,
        endSec: 16.0,
        narrationHinglish: 'Physics Lovers, comment karke batao ki work-energy theorem se factor 1/2 kyun aata hai?',
        visualFocus: 'Interactive EdTech challenge outro card.',
        keyFormula: 'Physics Lovers, Answer Batao?',
      },
    ],
  },
];

export function generateColabManimCode(
  problem: IrodovProblemData,
  options: ColabCodeOptions
): string {
  const safeHook = (options.outroHookText || 'Physics Lovers, Answer Batao?').replace(/"/g, '\\"');
  const fps = options.fps || 60;
  const qNum = problem.questionNumber.replace(/"/g, '\\"');

  const defaultPythonScriptBody = `# ==============================================================================
# ${qNum} — 9:16 HYPER-REALISTIC EDTECH MANIM ANIMATION
# Resolution: 1080x1920 (Vertical 9:16 Shorts / Reels) | ${fps} FPS
# Safe Auto-BGM Synthesizer Included (Zero external asset dependencies)
# ==============================================================================

import os
import math
import wave
import struct
import numpy as np
from manim import *

# 1. Configure 9:16 Vertical Aspect Ratio (1080x1920)
config.pixel_width = 1080
config.pixel_height = 1920
config.frame_width = 9.0
config.frame_height = 16.0
config.frame_rate = ${fps}
config.background_color = "#070B14"


def generate_safe_edtech_bgm(filename="edtech_bgm.wav", duration=16.0, sample_rate=44100):
    """
    Synthesizes a clean, royalty-free ambient futuristic physics soundtrack
    with subtle harmonic chimes at scene transitions.
    Wrapped in try/except so it NEVER fails or crashes Manim rendering.
    """
    try:
        num_samples = int(duration * sample_rate)
        t = np.linspace(0, duration, num_samples, endpoint=False)

        # Warm deep sub-bass drone + fifth harmonic (A2 = 110Hz, E3 = 165Hz, A3 = 220Hz)
        pad = (
            0.35 * np.sin(2 * np.pi * 110.0 * t)
            + 0.22 * np.sin(2 * np.pi * 165.0 * t + 0.3 * np.sin(2 * np.pi * 0.5 * t))
            + 0.15 * np.sin(2 * np.pi * 220.0 * t)
            + 0.08 * np.sin(2 * np.pi * 277.18 * t)  # C#4 major third shimmer
        )

        # Subtle rhythmic pulse for high-production EdTech feel
        pulse_env = 0.65 + 0.35 * np.sin(2 * np.pi * 1.5 * t)
        audio = pad * pulse_env

        # Add crystalline transition chimes at t = 0.2s, 3.5s, 8.5s, 13.0s
        for cue_time, freq in [(0.2, 554.37), (3.5, 659.25), (8.5, 880.0), (13.0, 1108.73)]:
            mask = t >= cue_time
            rel_t = np.zeros_like(t)
            rel_t[mask] = t[mask] - cue_time
            chime = np.zeros_like(t)
            chime[mask] = 0.28 * np.exp(-2.8 * rel_t[mask]) * np.sin(2 * np.pi * freq * rel_t[mask])
            audio += chime

        # Smooth fade-in and fade-out
        fade_len = int(0.8 * sample_rate)
        audio[:fade_len] *= np.linspace(0, 1, fade_len)
        audio[-fade_len:] *= np.linspace(1, 0, fade_len)

        # Normalize to soft background level (-14 dB)
        max_val = np.max(np.abs(audio))
        if max_val > 0:
            audio = (audio / max_val) * 0.22

        pcm_data = (audio * 32767).astype(np.int16)
        with wave.open(filename, "w") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_data.tobytes())
        return filename if os.path.exists(filename) else None
    except Exception as e:
        print(f"[Audio Notice] Proceeding without audio track: {e}")
        return None


class IrodovVerticalMasterpiece(Scene):
    def construct(self):
        # 0. Attach Free Procedural Background Sound Safely (Never errors if unavailable)
        if ${options.includeSafeAudio ? 'True' : 'False'}:
            try:
                bgm_path = generate_safe_edtech_bgm("edtech_bgm.wav", duration=16.5)
                if bgm_path and os.path.exists(bgm_path):
                    self.add_sound(bgm_path)
            except Exception as err:
                print(f"[Safe Audio Fallback] Skipping sound: {err}")

        # Subtle Engineering Blueprint Grid Background
        grid = NumberPlane(
            x_range=[-5, 5, 1],
            y_range=[-9, 9, 1],
            background_line_style={
                "stroke_color": "#1E293B",
                "stroke_width": 1.2,
                "stroke_opacity": 0.35,
            },
            axis_config={"stroke_opacity": 0},
        )
        self.add(grid)

        # Ambient Top & Bottom Framing Accents
        top_glow = Rectangle(
            width=9.0, height=0.12, fill_color="#38BDF8", fill_opacity=0.85, stroke_width=0
        ).to_edge(UP, buff=0)
        self.add(top_glow)

        # ======================================================================
        # ACT 1 (0.0s - 3.5s): QUESTION HEADER & STATEMENT REVEAL
        # ======================================================================
        badge_bg = RoundedRectangle(
            corner_radius=0.18,
            width=3.6,
            height=0.68,
            fill_color="#0284C7",
            fill_opacity=0.22,
            stroke_color="#38BDF8",
            stroke_width=2.5,
        )
        badge_txt = Text("${qNum}", font="Sans", weight=BOLD, font_size=34, color="#38BDF8")
        badge_group = VGroup(badge_bg, badge_txt).to_edge(UP, buff=0.65)

        chapter_txt = Text(
            "MECHANICS · INCLINED DYNAMICS",
            font="Sans",
            font_size=18,
            color="#94A3B8",
        ).next_to(badge_group, DOWN, buff=0.2)

        # Problem Card at Top Zone of 9:16 Screen
        q_card = RoundedRectangle(
            corner_radius=0.25,
            width=8.1,
            height=3.45,
            fill_color="#0F172A",
            fill_opacity=0.92,
            stroke_color="#334155",
            stroke_width=2,
        ).next_to(chapter_txt, DOWN, buff=0.28)

        q_lines = VGroup(
            Text("Two touching bars 1 and 2 are placed on an", font="Sans", font_size=22, color="#F8FAFC"),
            Text("inclined plane at angle α. Masses: m₁ and m₂.", font="Sans", font_size=22, color="#F8FAFC"),
            Text("Friction coefficients: k₁ and k₂ with k₁ > k₂.", font="Sans", font_size=22, color="#38BDF8"),
            Text("(a) Find interaction force F during motion;", font="Sans", font_size=21, color="#FBBF24"),
            Text("(b) Find minimum angle α_min to start sliding.", font="Sans", font_size=21, color="#34D399"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.16).move_to(q_card.get_center())

        self.play(
            FadeIn(badge_group, shift=DOWN * 0.3),
            FadeIn(chapter_txt),
            run_time=0.8,
        )
        self.play(
            Create(q_card),
            LaggedStart(*[FadeIn(line, shift=RIGHT * 0.2) for line in q_lines], lag_ratio=0.18),
            run_time=1.8,
        )
        self.wait(0.9)

        # ======================================================================
        # ACT 2 (3.5s - 8.5s): HYPER-REALISTIC INCLINED PLANE & FORCE VECTORS
        # ======================================================================
        stage_origin = np.array([-3.2, -2.5, 0])
        alpha_deg = 28.0
        alpha_rad = alpha_deg * DEGREES
        ramp_len = 6.8

        ramp_top = stage_origin + np.array([ramp_len * np.cos(alpha_rad), ramp_len * np.sin(alpha_rad), 0])
        ramp_base_right = stage_origin + np.array([ramp_len * np.cos(alpha_rad), 0, 0])

        # Dashed horizontal reference & Incline surface
        horiz_line = DashedLine(stage_origin, stage_origin + RIGHT * 4.5, color="#64748B", stroke_width=3)
        incline_line = Line(stage_origin, ramp_top, color="#E2E8F0", stroke_width=6)

        # Hatching ticks along the inclined plane (Exactly like Irodov Fig. 1.10)
        unit_along = np.array([np.cos(alpha_rad), np.sin(alpha_rad), 0])
        unit_normal = np.array([-np.sin(alpha_rad), np.cos(alpha_rad), 0])
        hatch_marks = VGroup()
        for idx in range(22):
            pt = stage_origin + unit_along * (0.25 + idx * 0.3)
            tick = Line(
                pt,
                pt - unit_normal * 0.28 - unit_along * 0.14,
                color="#475569",
                stroke_width=2.5,
            )
            hatch_marks.add(tick)

        # Angle Arc α
        angle_arc = Arc(
            radius=1.35,
            start_angle=0,
            angle=alpha_rad,
            arc_center=stage_origin,
            color="#38BDF8",
            stroke_width=4,
        )
        alpha_label = MathTex(r"\\alpha", font_size=42, color="#38BDF8").move_to(
            stage_origin + np.array([1.75 * np.cos(alpha_rad / 2), 1.75 * np.sin(alpha_rad / 2), 0])
        )

        # Touching Bars 1 (lower, high friction k1) and 2 (upper, low friction k2)
        slide_tracker = ValueTracker(0.0)
        bar_w, bar_h = 1.65, 0.88

        def get_bars_group():
            s = slide_tracker.get_value()
            # Base center position along ramp
            base_dist_1 = 3.15 - s
            base_dist_2 = base_dist_1 + bar_w

            c1 = stage_origin + unit_along * base_dist_1 + unit_normal * (bar_h / 2 + 0.03)
            c2 = stage_origin + unit_along * base_dist_2 + unit_normal * (bar_h / 2 + 0.03)

            b1_rect = RoundedRectangle(
                corner_radius=0.08,
                width=bar_w,
                height=bar_h,
                fill_color="#0284C7",
                fill_opacity=0.88,
                stroke_color="#7DD3FC",
                stroke_width=3.5,
            ).rotate(alpha_rad).move_to(c1)
            b1_lbl = Text("1 (m₁, k₁)", font="Sans", weight=BOLD, font_size=20, color=WHITE).rotate(alpha_rad).move_to(c1)

            b2_rect = RoundedRectangle(
                corner_radius=0.08,
                width=bar_w,
                height=bar_h,
                fill_color="#059669",
                fill_opacity=0.88,
                stroke_color="#6EE7B7",
                stroke_width=3.5,
            ).rotate(alpha_rad).move_to(c2)
            b2_lbl = Text("2 (m₂, k₂)", font="Sans", weight=BOLD, font_size=20, color=WHITE).rotate(alpha_rad).move_to(c2)

            # Glowing contact boundary between Bar 1 and Bar 2
            contact_center = (c1 + c2) / 2
            contact_glow = Line(
                contact_center - unit_normal * (bar_h / 2),
                contact_center + unit_normal * (bar_h / 2),
                color="#FBBF24",
                stroke_width=7,
            )

            return VGroup(b1_rect, b1_lbl, b2_rect, b2_lbl, contact_glow)

        bars_dynamic = always_redraw(get_bars_group)

        self.play(
            Create(horiz_line),
            Create(incline_line),
            Create(hatch_marks),
            Create(angle_arc),
            Write(alpha_label),
            run_time=1.3,
        )
        self.play(FadeIn(bars_dynamic, scale=0.95), run_time=0.9)

        # Step-by-Step Force Decomposition Arrows
        c1_init = stage_origin + unit_along * 3.15 + unit_normal * (bar_h / 2 + 0.03)
        c2_init = stage_origin + unit_along * (3.15 + bar_w) + unit_normal * (bar_h / 2 + 0.03)
        contact_pt = (c1_init + c2_init) / 2

        # Down-incline gravity pull vs Up-incline friction
        grav_arrow = Arrow(
            c1_init,
            c1_init - unit_along * 1.6,
            buff=0,
            color="#EF4444",
            stroke_width=5,
            max_tip_length_to_length_ratio=0.22,
        )
        grav_lbl = MathTex(r"(m_1+m_2)g\\sin\\alpha", font_size=30, color="#F87171").next_to(
            grav_arrow.get_end(), DOWN + LEFT, buff=0.12
        )

        fric1_arrow = Arrow(
            c1_init - unit_normal * 0.35,
            c1_init - unit_normal * 0.35 + unit_along * 1.45,
            buff=0,
            color="#A855F7",
            stroke_width=5,
            max_tip_length_to_length_ratio=0.22,
        )
        fric1_lbl = MathTex(r"f_1 = k_1 N_1 \\text{ (High)}", font_size=26, color="#C084FC").next_to(
            c1_init + unit_normal * 0.75, UP, buff=0.1
        )

        # Internal Contact Force Pair F (Bar 2 pushes Bar 1 down, Bar 1 pushes Bar 2 up)
        f_push_1 = Arrow(
            contact_pt + unit_normal * 0.55,
            contact_pt + unit_normal * 0.55 - unit_along * 1.15,
            buff=0,
            color="#FBBF24",
            stroke_width=6,
        )
        f_push_2 = Arrow(
            contact_pt + unit_normal * 0.55,
            contact_pt + unit_normal * 0.55 + unit_along * 1.15,
            buff=0,
            color="#FBBF24",
            stroke_width=6,
        )
        f_contact_lbl = MathTex(r"F_{\\text{int}} \\text{ (Because } k_1 > k_2\\text{)}", font_size=30, color="#FBBF24").move_to(
            contact_pt + unit_normal * 1.35
        )

        insight_banner = RoundedRectangle(
            corner_radius=0.2,
            width=8.1,
            height=1.55,
            fill_color="#1E293B",
            fill_opacity=0.95,
            stroke_color="#FBBF24",
            stroke_width=2.5,
        ).to_edge(DOWN, buff=2.45)

        insight_txt = VGroup(
            Text("WHY DO THEY PUSH EACH OTHER?", font="Sans", weight=BOLD, font_size=21, color="#FBBF24"),
            Text("k₁ > k₂ means Bar 2 wants to slide faster than Bar 1,", font="Sans", font_size=19, color="#F8FAFC"),
            Text("compressing the boundary with Normal Force F!", font="Sans", font_size=19, color="#38BDF8"),
        ).arrange(DOWN, buff=0.1).move_to(insight_banner.get_center())

        self.play(
            GrowArrow(grav_arrow),
            Write(grav_lbl),
            GrowArrow(fric1_arrow),
            Write(fric1_lbl),
            run_time=1.4,
        )
        self.play(
            GrowArrow(f_push_1),
            GrowArrow(f_push_2),
            Write(f_contact_lbl),
            FadeIn(insight_banner, shift=UP * 0.2),
            FadeIn(insight_txt),
            run_time=1.5,
        )
        self.wait(0.8)

        # ======================================================================
        # ACT 3 (8.5s - 13.0s): COUPLED SLIDING MOTION DOWN THE INCLINE
        # ======================================================================
        self.play(
            FadeOut(grav_arrow),
            FadeOut(grav_lbl),
            FadeOut(fric1_arrow),
            FadeOut(fric1_lbl),
            FadeOut(f_push_1),
            FadeOut(f_push_2),
            FadeOut(f_contact_lbl),
            run_time=0.6,
        )

        motion_tag = Text(
            "Coupled Acceleration: a = g sinα - [(k₁m₁ + k₂m₂)/(m₁+m₂)] g cosα",
            font="Sans",
            weight=BOLD,
            font_size=19,
            color="#34D399",
        ).move_to( stage_origin + UP * 3.9 + RIGHT * 3.2 )

        self.play(FadeIn(motion_tag), run_time=0.5)
        # Smoothly accelerate both touching bars down the inclined plane
        self.play(
            slide_tracker.animate.set_value(2.15),
            rate_func=rate_functions.ease_in_quad,
            run_time=2.6,
        )
        self.wait(0.6)

        # ======================================================================
        # ACT 4 (13.0s - 16.0s): "PHYSICS LOVERS, ANSWER BATAO?" OUTRO HOOK
        # ======================================================================
        cta_box = RoundedRectangle(
            corner_radius=0.28,
            width=8.2,
            height=2.35,
            fill_color="#090D16",
            fill_opacity=0.98,
            stroke_color="#38BDF8",
            stroke_width=3.5,
        ).to_edge(DOWN, buff=0.45)

        cta_heading = Text(
            "${safeHook}",
            font="Sans",
            weight=BOLD,
            font_size=32,
            color="#38BDF8",
        )
        cta_sub1 = Text(
            "Comment (a) F_interaction & (b) tan(α_min) below!",
            font="Sans",
            font_size=21,
            color="#F8FAFC",
        )
        cta_sub2 = Text(
            "${options.showAnswerHintInOutro ? 'Hint: What happens to F if k₁ < k₂? Drop your answer!' : 'Bonus Question: What happens if k₁ < k₂? Comment Fast!'}",
            font="Sans",
            weight=BOLD,
            font_size=20,
            color="#FBBF24",
        )
        cta_content = VGroup(cta_heading, cta_sub1, cta_sub2).arrange(DOWN, buff=0.16).move_to(cta_box.get_center())

        self.play(
            FadeOut(insight_banner),
            FadeOut(insight_txt),
            FadeIn(cta_box, shift=UP * 0.3),
            Write(cta_heading),
            FadeIn(cta_sub1),
            FadeIn(cta_sub2),
            run_time=1.3,
        )
        self.play(Indicate(cta_heading, color="#FBBF24", scale_factor=1.06), run_time=1.0)
        self.wait(1.2)
`;

  const pythonScriptBody = problem.customManimBody?.trim()
    ? problem.customManimBody.trim()
    : defaultPythonScriptBody;

  if (!options.singleCellColabMode) {
    return pythonScriptBody;
  }

  return `# ==============================================================================
# 🚀 ONE-CLICK GOOGLE COLAB RUNNER FOR ${qNum} (9:16 REELS / SHORTS)
# Copy-paste this ENTIRE block into a SINGLE Google Colab cell and press Shift+Enter!
# ==============================================================================

import os, subprocess, sys

# Step 1: Auto-install Manim & LaTeX dependencies only if not already installed
try:
    import manim
    print("✅ Manim is already installed!")
except ImportError:
    print("⏳ Installing Manim & LaTeX in Google Colab (takes ~60 seconds on first run)...")
    subprocess.run("sudo apt-get update -qq && sudo apt-get install -y -qq libcairo2-dev libpango1.0-dev ffmpeg texlive texlive-latex-extra", shell=True, check=False)
    subprocess.run([sys.executable, "-m", "pip", "install", "-q", "manim", "numpy"], check=False)
    print("✅ Installation complete!")

# Step 2: Write the Manim scene script to disk
scene_code = r'''${pythonScriptBody}'''

with open("irodov_scene.py", "w", encoding="utf-8") as f:
    f.write(scene_code)

# Step 3: Render the 9:16 Vertical Animation (1080x1920 @ ${fps}fps)
print("🎬 Rendering 9:16 Hyper-Realistic Physics Animation...")
render_cmd = "manim -qh --fps ${fps} -r 1080,1920 irodov_scene.py IrodovVerticalMasterpiece -o Irodov_9_16_Reel.mp4"
res = subprocess.run(render_cmd, shell=True)

# Step 4: Preview & Auto-Download MP4 in Google Colab
import glob
from IPython.display import Video, display

mp4_files = glob.glob("media/**/Irodov_9_16_Reel.mp4", recursive=True)
if mp4_files:
    output_video = mp4_files[0]
    print(f"🎉 Render Complete! Video saved at: {output_video}")
    display(Video(output_video, embed=True, width=360))
    try:
        from google.colab import files
        files.download(output_video)
    except Exception:
        pass
else:
    print("⚠️ Render finished—check the 'media/videos/' folder in the Colab sidebar.")
`;
}

export function generateUniversalMasterPrompt(customHookText = 'Physics Lovers, Answer Batao?'): string {
  return `You are a Principal Physics Animator and Manim Community (v0.18+) Engineer at a $1000B EdTech studio creating viral 9:16 vertical physics shorts (1080x1920, 60 FPS, 14–18 seconds duration) for I.E. Irodov problems.

Whenever I upload a screenshot of a physics problem (with or without extra instructions), automatically perform the following:

1. OCR & PHYSICS DECONSTRUCTION:
   - Identify the exact Irodov Question Number (e.g., "IRODOV 1.61") and extract the complete problem statement and diagram geometry.
   - Break down the physical phenomenon step-by-step: what forces act, why motion starts or stops, and how variables interact.

2. 4-ACT 9:16 VERTICAL STORYBOARD (1080x1920):
   - ACT 1 (0.0s–3.5s) [Attractive Header & Question]: Display a glowing badge with the Irodov Question Number, clean modern typography summarizing the question at the top of the 9:16 frame, and highlight given variables (e.g. m₁, m₂, k₁ > k₂, α).
   - ACT 2 (3.5s–8.5s) [Hyper-Realistic Setup & Force Vectors]: Build an accurate geometric visualization of the physical setup (inclined planes with hatching, pulleys, springs, blocks, particles) in the center canvas. Animate Free-Body Diagram force vectors step-by-step with color-coded arrows and MathTex labels.
   - ACT 3 (8.5s–13.0s) [Dynamic Physics Simulation]: Use Manim ValueTracker + always_redraw to animate the real physical motion (sliding, rotation, oscillation, collision) governed by the true differential/kinematic equations.
   - ACT 4 (13.0s–16.0s) [Interactive Engagement Hook]: Conclude with a sleek bottom callout card reading "${customHookText}" asking viewers to comment the answers to parts (a) and (b) + one thought-provoking conceptual twist.

3. ZERO-FRICTION GOOGLE COLAB CODE RULES:
   - Output a SINGLE self-contained Google Colab Python block that:
     a) Auto-installs Manim + LaTeX if missing.
     b) Synthesizes a procedural ambient background sound WAV file using Python's built-in \`wave\` and \`numpy\` inside a \`try...except\` block and attaches it via \`self.add_sound()\`, ensuring that if audio generation or playback fails for any reason, it NEVER raises an error and the video still compiles 100% cleanly.
     c) Configures \`config.pixel_width = 1080\`, \`config.pixel_height = 1920\`, \`config.frame_width = 9.0\`, \`config.frame_height = 16.0\`, and \`config.frame_rate = 60\`.
     d) Renders the scene and automatically previews + triggers \`files.download()\` in Google Colab.`;
}
