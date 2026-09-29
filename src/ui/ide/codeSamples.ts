// The editor "types" the app's own real source code (bundled as raw text), so
// the moving code on screen is exactly what's running.
import recognizer from '../../shared/GeometricGestureRecognizer.ts?raw'
import engine from '../../shared/EffectEngine.ts?raw'
import wave from '../../shared/WaveDetector.ts?raw'
import shockwave from '../../shared/effects/ShockwaveEffect.ts?raw'
import energy from '../../shared/effects/EnergyBeamEffect.ts?raw'
import tracker from '../../camera/HandTracker.ts?raw'

export interface CodeFile {
  name: string
  path: string
  code: string
}

export const CODE_FILES: CodeFile[] = [
  { name: 'GeometricGestureRecognizer.ts', path: 'src/shared/GeometricGestureRecognizer.ts', code: recognizer },
  { name: 'HandTracker.ts', path: 'src/camera/HandTracker.ts', code: tracker },
  { name: 'EffectEngine.ts', path: 'src/shared/EffectEngine.ts', code: engine },
  { name: 'ShockwaveEffect.ts', path: 'src/shared/effects/ShockwaveEffect.ts', code: shockwave },
  { name: 'WaveDetector.ts', path: 'src/shared/WaveDetector.ts', code: wave },
  { name: 'EnergyBeamEffect.ts', path: 'src/shared/effects/EnergyBeamEffect.ts', code: energy },
]
