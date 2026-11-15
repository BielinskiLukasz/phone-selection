interface IconProps {
  className?: string;
}

const base = 'shrink-0';

function svgProps(className?: string) {
  return {
    className: `${base} ${className ?? 'h-5 w-5'}`,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
  };
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M20 12H5m6 6-6-6 6-6" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 2.6v2.1m0 14.6v2.1M4.2 4.2l1.5 1.5m12.6 12.6 1.5 1.5M2.6 12h2.1m14.6 0h2.1M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" />
      <circle cx="12" cy="12" r="4.2" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M20.2 15.3A8.4 8.4 0 0 1 8.7 3.8a8.4 8.4 0 1 0 11.5 11.5Z" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

export function BatteryIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="2.5" y="7.5" width="16" height="9" rx="2.2" />
      <path d="M21.5 10.8v2.4" />
      <path d="M5.5 10.5v3M8.5 10.5v3M11.5 10.5v3" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M3.5 8.5h3l1.4-2.2h6.2L15.5 8.5h5v10h-17z" />
      <circle cx="12" cy="13.4" r="3.3" />
    </svg>
  );
}

export function StorageIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="4" y="3.5" width="16" height="17" rx="2.4" />
      <path d="M8.5 3.5v4M12 3.5v4M15.5 3.5v4" />
      <path d="M8.5 16.5h7" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 3 5 5.8v5.4c0 4 2.9 7.6 7 9.3 4.1-1.7 7-5.3 7-9.3V5.8z" />
      <path d="m9.2 12.1 2 2 3.6-3.9" />
    </svg>
  );
}

export function ScreenIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.4" />
      <path d="M10.5 18.6h3" />
    </svg>
  );
}

export function UpdateIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.4 4.2v4h-4" />
    </svg>
  );
}

export function HistoryIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M3.6 12a8.4 8.4 0 1 0 2.7-6.2" />
      <path d="M3.4 4.4v4h4" />
      <path d="M12 8v4.4l3 1.8" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="m5 12.8 4.4 4.2L19 6.8" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M12 4.2 2.9 19.4h18.2z" />
      <path d="M12 10v4" />
      <path d="M12 16.8h.01" />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M4 8h9M17 8h3M4 16h3M11 16h9" />
      <circle cx="15" cy="8" r="2.1" />
      <circle cx="9" cy="16" r="2.1" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <path d="M8.5 6.5h12M8.5 12h12M8.5 17.5h12" />
      <path d="M3.8 6.5h.01M3.8 12h.01M3.8 17.5h.01" />
    </svg>
  );
}

export function TerminalIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="2.8" y="4.2" width="18.4" height="15.6" rx="2.4" />
      <path d="m7 10 2.6 2.4L7 14.8M12.6 15.2H17" />
    </svg>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...svgProps(className)}>
      <rect x="6" y="2.4" width="12" height="19.2" rx="2.6" />
      <path d="M10.6 5.6h2.8" />
      <path d="M9 18.4h6" />
    </svg>
  );
}
