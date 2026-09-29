import type { ReactNode, SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

function base(children: ReactNode) {
  return function Icon({ size = 18, ...rest }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...rest}
      >
        {children}
      </svg>
    )
  }
}

/** Brand mark: an open hand made of landmark dots and bones. */
export const IconLogo = base(
  <>
    <path d="M12 21V11M12 11 8 4M12 11l1-8M12 11l4-6M12 11l6-3" />
    <circle cx="8" cy="4" r="1.3" fill="currentColor" />
    <circle cx="13" cy="3" r="1.3" fill="currentColor" />
    <circle cx="16" cy="5" r="1.3" fill="currentColor" />
    <circle cx="18" cy="8" r="1.3" fill="currentColor" />
    <path d="M12 21 6 14" />
    <circle cx="6" cy="14" r="1.3" fill="currentColor" />
  </>,
)
export const IconHand = base(
  <>
    <path d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M10 10V4.5a1.5 1.5 0 0 1 3 0V10" />
    <path d="M13 10V5.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M16 11V8.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.9-2.6L4 14.5a1.5 1.5 0 0 1 2.4-1.8L7 13.5V11" />
  </>,
)
export const IconBook = base(
  <>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19V5M8 7h7M8 11h5" />
  </>,
)
export const IconGraduation = base(
  <>
    <path d="m2 9 10-5 10 5-10 5z" />
    <path d="M6 11v5c3 2 9 2 12 0v-5M22 9v5" />
  </>,
)
export const IconPlay = base(<path d="M7 5v14l12-7z" fill="currentColor" />)
export const IconPause = base(
  <>
    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
  </>,
)
export const IconClose = base(<path d="M6 6l12 12M18 6 6 18" />)
export const IconCheck = base(<path d="m5 12 5 5 9-10" />)
export const IconArrowRight = base(<path d="M5 12h14M13 6l6 6-6 6" />)
export const IconExpand = base(<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />)
export const IconCollapse = base(<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />)
export const IconFiles = base(
  <>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </>,
)
export const IconTerminal = base(
  <>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </>,
)
export const IconSettings = base(
  <>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </>,
)
export const IconSparkle = base(
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
)
export const IconTrash = base(
  <>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </>,
)
export const IconRefresh = base(
  <>
    <path d="M20 11a8 8 0 1 0-2.3 5.7" />
    <path d="M20 4v7h-7" />
  </>,
)
export const IconExternal = base(
  <>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </>,
)
export const IconGrid = base(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
)
export const IconRecord = base(<circle cx="12" cy="12" r="6" fill="currentColor" stroke="none" />)
export const IconStop = base(<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" stroke="none" />)
export const IconAlert = base(
  <>
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4M12 17v.01" />
  </>,
)
export const IconInfo = base(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v6M12 7.5v.01" />
  </>,
)
