export { HandTracker } from './HandTracker'

/** Request the front-facing camera stream. Requires a secure (HTTPS) context. */
export async function requestCamera(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera API not available. Use a modern browser over HTTPS.')
  }
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  })
}

/** Attach a stream to a video element and resolve once metadata is loaded. */
export async function attachStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream,
): Promise<void> {
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  await new Promise<void>((resolve) => {
    if (video.readyState >= 1) {
      resolve()
      return
    }
    video.onloadedmetadata = () => resolve()
  })
  await video.play()
}

/** Stop all tracks on a stream. */
export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}
