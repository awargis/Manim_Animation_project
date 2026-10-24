import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateIrodov161Physics,
  getActFromTime,
  generateColabManimCode,
  generateUniversalMasterPrompt,
  DEFAULT_IRODOV_161_PROBLEM,
} from './physicsEngine';

test('calculateIrodov161Physics computes exact critical angle and interaction force for k1 > k2', () => {
  // Let m1 = 2 kg, m2 = 3 kg, k1 = 0.5, k2 = 0.2, alpha = 30 deg, g = 10 m/s^2
  // tan(alpha_min) = (0.5*2 + 0.2*3)/(2 + 3) = (1.0 + 0.6)/5 = 0.32
  // alpha_min = atan(0.32) = 17.74 deg
  // Since 30 deg > 17.74 deg, system is sliding!
  // F_int = m1*m2*(k1 - k2)*g*cos(30) / (m1 + m2) = 6 * 0.3 * 10 * 0.866025 / 5 = 3.1177 -> 3.12 N
  const res = calculateIrodov161Physics({
    m1: 2,
    m2: 3,
    k1: 0.5,
    k2: 0.2,
    alphaDeg: 30,
    g: 10,
  });

  assert.equal(res.tanAlphaMin, 0.32);
  assert.equal(res.alphaMinDeg, 17.74);
  assert.equal(res.isSliding, true);
  assert.equal(res.interactionForceMotion, 3.12);
  assert.equal(res.currentInteractionForce, 3.12);
  assert.ok(res.acceleration > 0);
});

test('calculateIrodov161Physics returns zero motion interaction force when k1 <= k2', () => {
  const res = calculateIrodov161Physics({
    m1: 2,
    m2: 2,
    k1: 0.2,
    k2: 0.5,
    alphaDeg: 35,
    g: 10,
  });

  assert.equal(res.interactionForceMotion, 0);
  assert.equal(res.currentInteractionForce, 0);
});

test('getActFromTime maps 16s timeline into 4 sequential animation acts', () => {
  assert.equal(getActFromTime(1.0), 'question_reveal');
  assert.equal(getActFromTime(5.0), 'force_decomposition');
  assert.equal(getActFromTime(10.0), 'motion_simulation');
  assert.equal(getActFromTime(14.5), 'outro_challenge');
});

test('generateColabManimCode includes 9:16 vertical config, safe try/except audio, and outro hook', () => {
  const code = generateColabManimCode(DEFAULT_IRODOV_161_PROBLEM, {
    singleCellColabMode: true,
    includeSafeAudio: true,
    fps: 60,
    outroHookText: 'Physics Lovers, Answer Batao?',
    showAnswerHintInOutro: true,
  });

  assert.ok(code.includes('config.pixel_width = 1080'));
  assert.ok(code.includes('config.pixel_height = 1920'));
  assert.ok(code.includes('config.frame_width = 9.0'));
  assert.ok(code.includes('config.frame_height = 16.0'));
  assert.ok(code.includes('generate_safe_edtech_bgm'));
  assert.ok(code.includes('Physics Lovers, Answer Batao?'));
  assert.ok(code.includes('IRODOV 1.61'));
});

test('generateUniversalMasterPrompt embeds the custom hook and 9:16 Colab rules', () => {
  const prompt = generateUniversalMasterPrompt('Physics Lovers, Answer Batao?');
  assert.ok(prompt.includes('1080x1920'));
  assert.ok(prompt.includes('Physics Lovers, Answer Batao?'));
  assert.ok(prompt.includes('try...except'));
});
