import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface RouteChipProps {
  hash: string;
  label?: string;
  tone?: 'default' | 'error' | 'active';
  className?: string;
  /** Klik kopiuje adres do schowka (feedback „skopiowano”). */
  copyable?: boolean;
}

/** Techniczna plakietka z adresem hashowym — motyw ciemny traktuje ją jak odczyt. */
export function RouteChip({ hash, label, tone = 'default', className, copyable = true }: RouteChipProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const url = `${window.location.origin}${window.location.pathname}${hash}`;

  async function copy() {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copyable ? 'Kopiuj adres' : undefined}
      className={cn(
        'num inline-flex max-w-full items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1.5 text-[11px] tracking-[0.08em] transition-colors duration-200',
        tone === 'active' &&
          'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)]',
        tone === 'error' && 'border-[var(--color-warn)] bg-[var(--color-warn-soft)] text-[var(--color-warn)]',
        tone === 'default' &&
          'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]',
        className,
      )}
    >
      <span className="truncate">{label ? `${label} ` : ''}{hash}</span>
      <span className={cn('shrink-0 text-[10px] uppercase', copied ? 'opacity-100' : 'opacity-45')}>
        {copied ? 'ok' : 'copy'}
      </span>
    </button>
  );
}
