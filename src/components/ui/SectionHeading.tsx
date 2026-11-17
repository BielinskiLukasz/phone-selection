import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * UIP1-02 · nagłówek sekcji (FIX-UI §4): `eyebrow` jako etykieta z tokenów, tytuł w skali `--text-h2/h3`,
 * opcjonalny opis i akcja po prawej. Zastępuje ręcznie składane nagłówki na Start/Cards/History/Ranking.
 */
interface SectionHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  level?: 2 | 3;
  id?: string;
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, action, level = 2, id, className }: SectionHeadingProps) {
  const Tag = level === 2 ? 'h2' : 'h3';
  return (
    <header className={cn('flex flex-wrap items-end justify-between gap-x-4 gap-y-2', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="label mb-1">{eyebrow}</p> : null}
        <Tag id={id} className={cn('text-balance text-[var(--color-text)]', level === 2 ? 'text-h2' : 'text-h3')}>
          {title}
        </Tag>
        {description ? <p className="mt-1 max-w-prose text-small text-[var(--color-muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
