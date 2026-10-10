/**
 * Tiny Web Audio synth for UI cues. No audio files — everything is generated.
 *
 * The AudioContext is created lazily on the first sound, which always happens
 * inside a user gesture (click/keypress), so browsers' autoplay rules are met.
 * Any app can import `sfx` or build its own cues from `tone` / `noise`.
 */

type Wave = OscillatorType

export interface ToneOptions {
  freq: number
  /** Glide to this frequency over the tone's duration. */
  toFreq?: number
  type?: Wave
  /** Seconds. */
  duration?: number
  attack?: number
  gain?: number
  /** Seconds from now. */
  delay?: number
}

export interface NoiseOptions {
  duration?: number
  gain?: number
  /** Band-pass center in Hz; shapes the noise into a swish or a thud. */
  filterFreq?: number
  q?: number
  delay?: number
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
let enabled = true

function getContext(): { ctx: AudioContext; out: GainNode } | null {
  if (!enabled || typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (!on && ctx?.state === 'running') void ctx.suspend()
}

export function setMasterVolume(volume: number) {
  if (master) master.gain.value = Math.max(0, Math.min(1, volume))
}

export function tone({ freq, toFreq, type = 'square', duration = 0.08, attack = 0.005, gain = 0.2, delay = 0 }: ToneOptions) {
  const audio = getContext()
  if (!audio) return
  const { ctx: c, out } = audio
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const env = c.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (toFreq) osc.frequency.exponentialRampToValueAtTime(toFreq, t0 + duration)

  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(gain, t0 + attack)
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  osc.connect(env).connect(out)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

export function noise({ duration = 0.12, gain = 0.15, filterFreq = 2000, q = 1, delay = 0 }: NoiseOptions = {}) {
  const audio = getContext()
  if (!audio) return
  const { ctx: c, out } = audio
  const t0 = c.currentTime + delay
  const src = c.createBufferSource()
  const filter = c.createBiquadFilter()
  const env = c.createGain()

  src.buffer = getNoiseBuffer(c)
  filter.type = 'bandpass'
  filter.frequency.value = filterFreq
  filter.Q.value = q
  env.gain.setValueAtTime(gain, t0)
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)

  src.connect(filter).connect(env).connect(out)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

/** Ready-made cues. */
export const sfx = {
  click: () => tone({ freq: 520, toFreq: 380, duration: 0.06, gain: 0.12 }),
  hover: () => tone({ freq: 880, type: 'triangle', duration: 0.03, gain: 0.05 }),
  open: () => {
    tone({ freq: 330, type: 'triangle', duration: 0.09, gain: 0.15 })
    tone({ freq: 495, type: 'triangle', duration: 0.12, gain: 0.15, delay: 0.06 })
  },
  close: () => {
    tone({ freq: 495, type: 'triangle', duration: 0.08, gain: 0.13 })
    tone({ freq: 330, type: 'triangle', duration: 0.1, gain: 0.13, delay: 0.05 })
  },
  pageTurn: () => noise({ duration: 0.18, gain: 0.18, filterFreq: 3200, q: 0.7 }),
  thud: () => {
    tone({ freq: 140, toFreq: 60, type: 'sine', duration: 0.15, gain: 0.3 })
    noise({ duration: 0.06, gain: 0.1, filterFreq: 400 })
  },
  success: () =>
    [523.25, 659.25, 783.99].forEach((f, i) =>
      tone({ freq: f, type: 'square', duration: 0.1, gain: 0.08, delay: i * 0.07 }),
    ),
} as const

export type SfxName = keyof typeof sfx
