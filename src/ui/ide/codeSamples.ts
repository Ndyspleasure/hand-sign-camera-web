import recognizer from '../../shared/GeometricGestureRecognizer.ts?raw'
import engine from '../../shared/EffectEngine.ts?raw'
import wave from '../../shared/WaveDetector.ts?raw'
import shockwave from '../../shared/effects/ShockwaveEffect.ts?raw'
import energy from '../../shared/effects/EnergyBeamEffect.ts?raw'
import tracker from '../../camera/HandTracker.ts?raw'
import { stripComments } from './highlight'

export interface CodeFile {
  name: string
  path: string
  code: string
}

const FILES: CodeFile[] = [
  { name: 'GeometricGestureRecognizer.ts', path: 'src/shared/GeometricGestureRecognizer.ts', code: recognizer },
  { name: 'HandTracker.ts', path: 'src/camera/HandTracker.ts', code: tracker },
  { name: 'EffectEngine.ts', path: 'src/shared/EffectEngine.ts', code: engine },
  { name: 'ShockwaveEffect.ts', path: 'src/shared/effects/ShockwaveEffect.ts', code: shockwave },
  { name: 'WaveDetector.ts', path: 'src/shared/WaveDetector.ts', code: wave },
  { name: 'EnergyBeamEffect.ts', path: 'src/shared/effects/EnergyBeamEffect.ts', code: energy },
]

/** Shown without comments or blank lines: only lines of code. */
export const CODE_FILES: CodeFile[] = FILES.map((f) => ({ ...f, code: stripComments(f.code) }))
