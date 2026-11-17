import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-01 · jeden przycisk dla całej aplikacji (FIX-UI §4).
 * Wygląd wyłącznie z tokenów motywu; promień `--radius-control` (12 px jasny / 2 px ciemny).
 * Bez `hover:-translate-y` — sygnałem hover jest kolor (`--color-accent-hover`) i obramowanie.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-on-accent)] border border-transparent hover:bg-[var(--color-accent-hover)] active:scale-[0.99]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent-ink)]',
  ghost:
    'bg-transparent text-[var(--color-muted)] border border-transparent hover:text-[var(--color-accent-ink)] hover:bg-[var(--color-surface-2)]',
  danger:
    'bg-transparent text-[var(--color-danger)] border border-transparent hover:bg-[var(--color-danger-soft)]',
};

const SIZE: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-small gap-2',
  lg: 'min-h-13 px-6 text-body gap-2.5',
};

export function buttonClasses({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className,
}: Pick<CommonProps, 'variant' | 'size' | 'fullWidth' | 'className'>): string {
  return cn(
    'inline-flex items-center justify-center rounded-[var(--radius-control)] font-semibold leading-none',
    'transition-[background-color,border-color,color,transform] duration-[var(--motion-fast)]',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
    VARIANT[variant],
    SIZE[size],
    fullWidth && 'w-full',
    className,
  );
}

export function Button(props: ButtonProps) {
  const { variant = 'secondary', size = 'md', icon, iconRight, fullWidth, loading, className, children, ...rest } = props;
  const classes = buttonClasses({ variant, size, fullWidth, className });
  const content = (
    <>
      {icon ? <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{icon}</span> : null}
      {children ? <span className="min-w-0">{children}</span> : null}
      {iconRight ? <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4" aria-hidden="true">{iconRight}</span> : null}
    </>
  );

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchor } = rest as ButtonAsLink;
    return (
      <a href={href} className={classes} {...anchor}>
        {content}
      </a>
    );
  }
  const button = rest as ButtonAsButton;
  return (
    <button type={button.type ?? 'button'} aria-busy={loading || undefined} {...button} className={classes}>
      {content}
    </button>
  );
}
