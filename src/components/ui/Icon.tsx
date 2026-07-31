/**
 * Icon set — small, single-stroke, 1.5px. Deliberately minimal: the brief asks
 * for "small contextual icons rather than giant text boxes" (Section 9) and
 * warns against decoration for its own sake.
 *
 * Every icon is `aria-hidden` by default. Meaning is always carried by adjacent
 * text, never by the icon alone (Section 25: correct/incorrect states must not
 * depend on colour or glyph alone).
 */

export interface IconProps {
  className?: string;
  /** Set only when the icon is genuinely the sole carrier of meaning. */
  title?: string;
}

function Svg({
  className = "h-4 w-4",
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const CheckIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const PlayIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" strokeWidth={1} />
  </Svg>
);

export const ArrowRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </Svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 12H5m0 0 6-6m-6 6 6 6" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m9 5 7 7-7 7" />
  </Svg>
);

export const ClockIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const ChecklistIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="m3.5 7 2 2 3-3.5M3.5 17l2 2 3-3.5M12 7h8.5M12 17h8.5" />
  </Svg>
);

export const InfoIcon = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11.5V16" />
    <circle cx="12" cy="8.4" r="0.6" fill="currentColor" />
  </Svg>
);

export const AlertIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.6" r="0.6" fill="currentColor" />
  </Svg>
);

export const FlagIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M5.5 21V4m0 0h11l-2 3.5 2 3.5h-11" />
  </Svg>
);

export const LockIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Svg>
);

export const PauseIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M7 5v14M17 5v14" />
  </Svg>
);

export const VolumeHighIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 8H4.5v8H9.5l6 5V3L9.5 8Z" fill="currentColor" strokeWidth={0} />
    <path d="M16 8.5a5.5 5.5 0 0 1 0 7" />
    <path d="M18.5 6a9 9 0 0 1 0 12" />
  </Svg>
);

export const VolumeMuteIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M9.5 8H4.5v8H9.5l6 5V3L9.5 8Z" fill="currentColor" strokeWidth={0} />
    <path d="M16.5 9.5 20 13m0-3.5-3.5 3.5" />
  </Svg>
);

export const ReplayIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4.5 12a7.5 7.5 0 1 0 1.75-4.77" />
    <path d="M4.5 4v4h4" />
  </Svg>
);

export const FullscreenEnterIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 8V3h5M3 16v5h5M21 8V3h-5M21 16v5h-5" />
  </Svg>
);

export const FullscreenExitIcon = (props: IconProps) => (
  <Svg {...props}>
    <path d="M8 3v5H3M8 21v-5H3M16 3v5h5M16 21v-5h5" />
  </Svg>
);

export const CaptionsIcon = (props: IconProps) => (
  <Svg {...props}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
    <path d="M7 10.5h3.5M7 13.5h5.5M13 10.5h3.5M13 13.5h3.5" />
  </Svg>
);

/** Deliberately not a stethoscope. Two ticks on a scale — the measurement
 *  motif that runs through the whole product. */
export const BrandMark = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
    <g fill="currentColor">
      <rect x="2" y="8" width="2" height="8" rx="1" opacity="0.35" />
      <rect x="7" y="4" width="2" height="16" rx="1" opacity="0.6" />
      <rect x="12" y="8" width="2" height="8" rx="1" opacity="0.35" />
      <rect x="17" y="2" width="2" height="20" rx="1" />
    </g>
  </svg>
);
