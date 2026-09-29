import { Gesture } from '../shared/Gesture'
import type { GuideGesture } from '../gestures/registry'

/**
 * Search-facing copy for every gesture page. One page per gesture, each with
 * its own search intent ("how to do the peace sign", "heart hands gesture",
 * …), so pages never compete with each other or with the home page.
 */
export interface GestureSeo {
  slug: string
  /** The name people search for. */
  name: string
  /** Other names for the same hand sign. */
  aka: string[]
  /** <title>, ≤ 60 characters before the brand suffix. */
  title: string
  /** Meta description, ≤ 155 characters. */
  description: string
  h1: string
  intro: string
  /** What the sign means / where it comes from. */
  meaning: string
  /** How the recognizer tells it apart, in plain words. */
  recognition: string
  /** What the effect looks like on camera. */
  effect: string
  tips: string[]
  related: GuideGesture[]
}

export const GESTURE_SEO: Record<GuideGesture, GestureSeo> = {
  [Gesture.OPEN_PALM]: {
    slug: 'open-palm',
    name: 'Open Palm',
    aka: ['open hand', 'high five', 'number five'],
    title: 'Open Palm Hand Gesture: How to Do It',
    description: 'How to show an open palm so a camera recognizes it, what the open hand sign means, and the glowing Neon Skeleton effect it triggers.',
    h1: 'Open Palm Hand Gesture',
    intro: 'The open palm is the simplest hand sign: all five fingers straight and spread, palm facing the camera. It is also the number five when counting on your fingers.',
    meaning: 'An open palm reads as a greeting, a "stop", or a high five, and shows the hand holds nothing. In finger counting it means five.',
    recognition: 'All four fingers are extended and the thumb points clearly away from the index knuckle. With the thumb folded in, the same hand reads as Four instead.',
    effect: 'Neon Skeleton traces every bone of your hand as a glowing aqua line with a bright core, marks each joint, and pulses a soft aura around the palm.',
    tips: ['Spread the fingers a little so they do not overlap.', 'Keep the whole hand, wrist included, inside the frame.', 'Let the thumb point out to the side, not forward.'],
    related: [Gesture.FOUR, Gesture.WAVE, Gesture.DOUBLE_PALM],
  },
  [Gesture.FIST]: {
    slug: 'fist',
    name: 'Fist',
    aka: ['closed fist', 'closed hand'],
    title: 'Fist Hand Gesture: How a Camera Detects a Closed Fist',
    description: 'Make a closed fist the camera can read: finger and thumb position, common mistakes, and the amber Shockwave effect it fires.',
    h1: 'Fist Hand Gesture',
    intro: 'A fist is every finger curled into the palm with the thumb wrapped across. It is the starting point for most other gestures and for counting on your fingers.',
    meaning: 'A raised fist signals strength, solidarity or determination; a fist bump is a friendly greeting between two people.',
    recognition: 'No finger is extended and the thumb stays close to the index knuckle. A thumb sticking out turns it into Thumbs Up or Thumbs Down.',
    effect: 'Shockwave charges a glowing core inside the fist and fires expanding amber rings that keep growing after you open your hand.',
    tips: ['Tuck the thumb over the fingers, not beside them.', 'Face the knuckles toward the camera.', 'Try both hands at once for a double shockwave.'],
    related: [Gesture.THUMBS_UP, Gesture.PINCH, Gesture.POINTING],
  },
  [Gesture.PEACE]: {
    slug: 'peace-sign',
    name: 'Peace Sign',
    aka: ['V sign', 'victory sign', 'number two'],
    title: 'Peace Sign (V Sign) Hand Gesture: How to Do It',
    description: 'How to make the peace sign (V sign) for a camera, what it means, how it differs from Three, and the Rainbow Trail effect it paints.',
    h1: 'Peace Sign (V Sign) Hand Gesture',
    intro: 'The peace sign raises the index and middle fingers in a V while the ring finger, pinky and thumb stay folded. It also means two when counting.',
    meaning: 'The V sign stands for peace or victory and is one of the most popular poses in photos.',
    recognition: 'Exactly the index and middle fingers are extended. Adding the ring finger makes Three; a pinky instead of the middle finger makes Rock.',
    effect: 'Rainbow Trail follows both raised fingertips and leaves glowing rainbow ribbons behind them. Move your hand to paint with it.',
    tips: ['Hold the ring finger down with your thumb.', 'Keep a small gap between the two raised fingers.', 'Use both hands for a double peace sign and two trails.'],
    related: [Gesture.THREE, Gesture.POINTING, Gesture.ROCK],
  },
  [Gesture.THUMBS_UP]: {
    slug: 'thumbs-up',
    name: 'Thumbs Up',
    aka: ['like', 'approval sign'],
    title: 'Thumbs Up Hand Gesture: How a Camera Recognizes It',
    description: 'How to hold a thumbs up the camera can read, what the gesture means, and the golden Star Burst effect it releases.',
    h1: 'Thumbs Up Hand Gesture',
    intro: 'A thumbs up is a fist with the thumb pointing straight up. It is one of the most widely understood hand signs.',
    meaning: 'A thumbs up means approval, "good job" or "all fine" in most places.',
    recognition: 'All four fingers are curled and the thumb is extended with its tip above the wrist. With the tip below the wrist it becomes Thumbs Down.',
    effect: 'Star Burst sends golden stars from the thumb tip that float upward and fade.',
    tips: ['Curl the fingers fully so none of them count as raised.', 'Point the thumb up, not sideways.', 'Show it with both hands for twice the stars.'],
    related: [Gesture.THUMBS_DOWN, Gesture.FIST, Gesture.CALL_ME],
  },
  [Gesture.THUMBS_DOWN]: {
    slug: 'thumbs-down',
    name: 'Thumbs Down',
    aka: ['dislike', 'disapproval sign'],
    title: 'Thumbs Down Hand Gesture: How to Do It on Camera',
    description: 'Make a thumbs down a camera can recognize, see how it differs from thumbs up, and watch the Rain Cloud effect it brings.',
    h1: 'Thumbs Down Hand Gesture',
    intro: 'Thumbs down is a fist with the thumb pointing toward the floor, the opposite of a thumbs up.',
    meaning: 'A thumbs down shows disapproval, dislike or that something did not work.',
    recognition: 'All four fingers are curled and the thumb is extended with its tip below the wrist.',
    effect: 'Rain Cloud puts a gloomy cloud above your hand that pours rain for as long as you hold the sign.',
    tips: ['Turn the whole hand over, with the knuckles facing up.', 'Keep the thumb straight and pointing down.', 'Hold it steady for a moment so the rain can start.'],
    related: [Gesture.THUMBS_UP, Gesture.FIST, Gesture.PINCH],
  },
  [Gesture.POINTING]: {
    slug: 'pointing',
    name: 'Pointing',
    aka: ['index finger point', 'number one'],
    title: 'Pointing Hand Gesture: Index Finger Sign on Camera',
    description: 'Point with your index finger so a camera recognizes it, and aim the red Laser effect anywhere on screen.',
    h1: 'Pointing Hand Gesture',
    intro: 'Pointing means only the index finger is extended while the other fingers curl in. It is also how you show the number one.',
    meaning: 'Pointing directs attention to something, and a single raised index finger means one or "wait a moment".',
    recognition: 'Only the index finger is extended. If the thumb and index tips touch, it reads as Pinch instead.',
    effect: 'Laser fires a red beam from your fingertip in the direction it points, all the way to the edge of the screen, with a burst where it hits.',
    tips: ['Keep the thumb resting on the middle finger.', 'Rotate your hand to sweep the laser around.', 'Point with both hands to cross two beams.'],
    related: [Gesture.PEACE, Gesture.PINCH, Gesture.FIST],
  },
  [Gesture.OK]: {
    slug: 'ok-sign',
    name: 'OK Sign',
    aka: ['okay hand sign', 'ring gesture'],
    title: 'OK Hand Sign: How to Make It for a Camera',
    description: 'Make the OK hand sign so a camera can read it: thumb and index ring, three fingers up. Plus the violet Halo effect it creates.',
    h1: 'OK Hand Sign',
    intro: 'The OK sign joins the thumb and index fingertips in a ring while the middle, ring and pinky fingers stay straight.',
    meaning: 'In many countries the OK sign means "all good" or "perfect". Its meaning varies by culture, so it is worth knowing your audience.',
    recognition: 'The thumb and index tips are close together and the other three fingers are extended. With those three curled, it reads as Pinch.',
    effect: 'Halo forms a glowing violet ring around the thumb-index circle, with a pulsing outer ring and orbiting points of light.',
    tips: ['Make a clear round ring, not a flat pinch.', 'Keep the three other fingers straight and apart.', 'Face the ring toward the camera.'],
    related: [Gesture.PINCH, Gesture.OPEN_PALM, Gesture.THREE],
  },
  [Gesture.ROCK]: {
    slug: 'rock-on',
    name: 'Rock On',
    aka: ['sign of the horns', 'metal horns', 'rock hand sign'],
    title: 'Rock On Hand Sign (Horns): How to Do It',
    description: 'How to make the rock on hand sign (sign of the horns) for a camera, how it differs from I Love You, and its Lightning effect.',
    h1: 'Rock On Hand Sign (Sign of the Horns)',
    intro: 'Rock on raises the index finger and pinky like horns while the middle and ring fingers fold down and the thumb holds them in place.',
    meaning: 'The sign of the horns is a salute at rock and metal concerts, meaning "rock on".',
    recognition: 'The index and pinky are extended, the middle and ring fingers are curled, and the thumb is tucked. With the thumb out, the same shape is I Love You.',
    effect: 'Lightning crackles electric arcs between the two raised fingertips and throws sparks upward from both horns.',
    tips: ['Press the thumb over the middle and ring fingers.', 'Spread the index and pinky wide apart.', 'Move your hand: the bolts follow your fingertips.'],
    related: [Gesture.ILY, Gesture.PEACE, Gesture.CALL_ME],
  },
  [Gesture.PINCH]: {
    slug: 'pinch',
    name: 'Pinch',
    aka: ['pinch gesture', 'finger pinch'],
    title: 'Pinch Hand Gesture: How a Camera Detects It',
    description: 'Pinch your thumb and index fingertips together so a camera recognizes it, avoid confusing it with a fist, and spray Particle Sparks.',
    h1: 'Pinch Hand Gesture',
    intro: 'A pinch brings the thumb and index fingertips together while the index finger stays pointing forward and the other fingers curl.',
    meaning: 'Pinching is the everyday "small amount" sign and the familiar zoom and grab gesture from touch screens and AR headsets.',
    recognition: 'The thumb and index tips are close together and the index finger is still extended. A fully curled index reads as Fist, so a fist never triggers sparks by accident.',
    effect: 'Particle Spark showers yellow sparks from the pinch point that drift, fall and fade out.',
    tips: ['Keep the index finger straight, touching only at the tip.', 'Open and close the pinch to release bursts.', 'Try it with both hands.'],
    related: [Gesture.OK, Gesture.POINTING, Gesture.FIST],
  },
  [Gesture.CALL_ME]: {
    slug: 'call-me',
    name: 'Call Me',
    aka: ['shaka', 'hang loose', 'phone hand sign'],
    title: 'Call Me Hand Sign (Shaka): How to Do It',
    description: 'How to make the call me hand sign, also known as shaka or hang loose, so a camera reads it, plus the Sound Waves effect.',
    h1: 'Call Me Hand Sign (Shaka)',
    intro: 'Call me stretches the thumb and pinky out while the three middle fingers curl, like holding a phone to your ear.',
    meaning: 'Held to the face it means "call me"; shaken loosely it is the shaka or "hang loose" greeting from surf culture.',
    recognition: 'The index, middle and ring fingers are curled while both the thumb and pinky are extended.',
    effect: 'Sound Waves sends green arcs outward from the thumb and pinky, like sound coming out of a phone.',
    tips: ['Stretch the thumb and pinky as far as they go.', 'Keep the three middle fingers tightly curled.', 'Shake the hand gently for the shaka look.'],
    related: [Gesture.ROCK, Gesture.ILY, Gesture.THUMBS_UP],
  },
  [Gesture.THREE]: {
    slug: 'three-fingers',
    name: 'Three Fingers',
    aka: ['number three', 'three finger salute'],
    title: 'Three Fingers Hand Sign: Counting to Three',
    description: 'Show three fingers so a camera counts them: index, middle and ring up. Plus the red, green and blue Tri-Beam effect.',
    h1: 'Three Fingers Hand Sign',
    intro: 'Three raises the index, middle and ring fingers while the thumb holds the pinky down. It is how many people count to three.',
    meaning: 'Three raised fingers mean the number three. Counting habits differ by country: some count three with the thumb instead.',
    recognition: 'The index, middle and ring fingers are extended and the pinky is curled.',
    effect: 'Tri-Beam fires a red, a green and a blue beam from the three fingertips; where they overlap the colors mix toward white.',
    tips: ['Fold the pinky under the thumb.', 'Keep the three raised fingers slightly apart.', 'Use both hands to count to six.'],
    related: [Gesture.PEACE, Gesture.FOUR, Gesture.OK],
  },
  [Gesture.FOUR]: {
    slug: 'four-fingers',
    name: 'Four Fingers',
    aka: ['number four'],
    title: 'Four Fingers Hand Sign: How a Camera Counts It',
    description: 'Show four fingers with the thumb tucked so a camera counts four, how it differs from an open palm, and the Code Rain effect.',
    h1: 'Four Fingers Hand Sign',
    intro: 'Four raises all four fingers while the thumb folds across the palm. It is the number four when counting on one hand.',
    meaning: 'Four raised fingers mean the number four.',
    recognition: 'All four fingers are extended and the thumb is folded in. Let the thumb out and it becomes an Open Palm.',
    effect: 'Code Rain streams green code characters down from your four fingertips, like digital rain in a terminal.',
    tips: ['Fold the thumb flat across the palm.', 'Keep the fingers straight and together.', 'Pair it with a Five on the other hand to show nine.'],
    related: [Gesture.OPEN_PALM, Gesture.THREE, Gesture.PEACE],
  },
  [Gesture.ILY]: {
    slug: 'i-love-you-sign',
    name: 'I Love You Sign',
    aka: ['ILY sign', 'ASL I love you'],
    title: 'I Love You Hand Sign (ASL): How to Do It',
    description: 'How to make the I love you hand sign from American Sign Language, how it differs from rock on, and its Floating Hearts effect.',
    h1: 'I Love You Hand Sign (ASL)',
    intro: 'The I love you sign extends the thumb, index finger and pinky while the middle and ring fingers fold down.',
    meaning: 'It comes from American Sign Language and combines the letters I, L and Y into one sign for "I love you".',
    recognition: 'The index and pinky are extended with the thumb out to the side. Tucking the thumb in turns it into Rock On.',
    effect: 'Floating Hearts sends pink hearts up from your hand that sway and grow as they fade.',
    tips: ['Stretch the thumb clearly away from the hand.', 'Keep the middle and ring fingers fully curled.', 'Show it with both hands for a stream of hearts.'],
    related: [Gesture.ROCK, Gesture.CALL_ME, Gesture.HEART],
  },
  [Gesture.WAVE]: {
    slug: 'wave',
    name: 'Wave',
    aka: ['hand wave', 'waving hello'],
    title: 'Wave Hand Gesture: Motion Detection on Camera',
    description: 'How the camera detects a hand wave from motion: swing an open palm side to side to create water Ripples. Tips for a reliable wave.',
    h1: 'Wave Hand Gesture',
    intro: 'Wave is a motion gesture: an open palm swinging left and right. Unlike the other signs, it is recognized from how your hand moves, not just its shape.',
    meaning: 'Waving says hello or goodbye in almost every culture.',
    recognition: 'The hand must be an Open Palm and change direction at least twice within about a second and a half, each swing wider than a set fraction of your hand size, so small jitter never counts.',
    effect: 'Ripple leaves water ripples and a flowing trail behind your waving palm.',
    tips: ['Swing from the elbow, not just the wrist.', 'Keep all five fingers open while waving.', 'Wave with both hands to make two trails.'],
    related: [Gesture.OPEN_PALM, Gesture.DOUBLE_PALM, Gesture.FOUR],
  },
  [Gesture.HEART]: {
    slug: 'heart-hands',
    name: 'Heart Hands',
    aka: ['finger heart with two hands', 'hand heart', 'heart sign'],
    title: 'Heart Hands Gesture: Make a Heart With Two Hands',
    description: 'Make a heart with your hands so a camera recognizes it: index tips together on top, thumbs below. Triggers a pulsing Big Heart effect.',
    h1: 'Heart Hands Gesture',
    intro: 'Heart hands is a two-hand gesture: curve both hands, touch the index fingertips on top and the thumb tips below, and the space between them forms a heart.',
    meaning: 'Heart hands show love, thanks or support, and are a favorite at concerts and in photos.',
    recognition: 'Two hands are tracked; the two index tips are close together, the two thumb tips are close together below them, and the wrists stay apart.',
    effect: 'Big Heart fills the shape between your hands with a glowing, beating heart that bursts into small hearts.',
    tips: ['Keep both hands at the same height.', 'Point the thumbs down to form the tip of the heart.', 'Hold still for a moment so the heart can form.'],
    related: [Gesture.DOUBLE_PALM, Gesture.ILY, Gesture.OK],
  },
  [Gesture.DOUBLE_PALM]: {
    slug: 'double-palm',
    name: 'Double Palm',
    aka: ['two open palms', 'both hands open'],
    title: 'Double Palm Gesture: Two Open Hands on Camera',
    description: 'Hold up both open palms so a camera recognizes a two-hand gesture and connects them with a crackling Energy Beam.',
    h1: 'Double Palm Gesture',
    intro: 'Double palm is a two-hand gesture: both hands open, palms toward the camera, held apart.',
    meaning: 'Two raised open palms can mean "stop", "I surrender" or simply the number ten.',
    recognition: 'Two hands are tracked and each one is recognized as an Open Palm at the same time.',
    effect: 'Energy Beam links your palms with a crackling beam, glowing orbs in each hand, and sparks flowing between them.',
    tips: ['Keep both hands fully in the frame.', 'Move the hands apart and together to stretch the beam.', 'Spread all ten fingers.'],
    related: [Gesture.OPEN_PALM, Gesture.HEART, Gesture.WAVE],
  },
}

export interface Faq {
  q: string
  a: string
}

export const HOME_FAQ: Faq[] = [
  {
    q: 'What is Hand Sign Camera?',
    a: 'Hand Sign Camera is a free web app by Vanillate Studio that recognizes 16 hand gestures through your camera in real time and turns each one into its own visual effect.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. It runs in a modern browser on desktop and mobile. You can add it to your home screen as an app, and after the first visit it also works offline.',
  },
  {
    q: 'Is my camera video uploaded anywhere?',
    a: 'No. Hand tracking and gesture recognition run on your device. The video is never sent to a server, and recordings are saved straight to your device.',
  },
  {
    q: 'Which hand gestures can it recognize?',
    a: 'Open Palm, Fist, Peace Sign, Pointing, Thumbs Up, Thumbs Down, OK Sign, Rock On, Pinch, Call Me, Three, Four, I Love You, Wave, and two-hand Heart Hands and Double Palm.',
  },
  {
    q: 'Can it track two hands at once?',
    a: 'Yes. Each hand gets its own gesture and effect, and two gestures need both hands together: Heart Hands and Double Palm.',
  },
  {
    q: 'Can I record a video of the effects?',
    a: 'Yes. Press the record button to save a WebM clip of the camera view with the effects.',
  },
]
