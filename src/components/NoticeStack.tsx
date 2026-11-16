import { strings } from '@/data/strings';
import type { NoticeCode } from '@/types/state';
import { useAppState } from '@/features/state/StateProvider';
import { clearAll } from '@/lib/storage';
import { AlertIcon } from './Icons';

const TEXTS: Record<NoticeCode, string> = {
  'storage-unavailable': strings.storageWarning,
  'corrupted-data': strings.noticeCorrupted,
  'quota-exceeded': strings.noticeQuota,
  'sessions-trimmed': strings.noticeTrimmed,
};

/** Komunikaty stanów krańcowych zapisu (UI-SPEC 9 i 10). */
export function NoticeStack() {
  const { notices, dismissNotice, dispatch, storage } = useAppState();

  if (notices.length === 0) return null;

  return (
    <div className="grid gap-2">
      {notices.map((code) => (
        <div
          key={code}
          role={code === 'storage-unavailable' ? 'status' : 'alert'}
          className="screen-in flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-warn)] bg-[var(--color-warn-soft)] px-4 py-3"
        >
          <span className="mt-0.5 shrink-0 text-[var(--color-warn)]">
            <AlertIcon className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--color-warn)]">
            {TEXTS[code]}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {code === 'corrupted-data' ? (
              <button
                type="button"
                onClick={() => {
                  clearAll(storage);
                  dispatch({ type: 'state/reset' });
                  dismissNotice(code);
                }}
                className="num rounded-[var(--radius-pill)] border border-[var(--color-warn)] px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase transition-colors duration-200 hover:bg-[var(--color-warn)] hover:text-[var(--color-bg)]"
              >
                {strings.noticeStartOver}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => dismissNotice(code)}
              aria-label={strings.noticeDismiss}
              className="num flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-warn)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-warn)_18%,transparent)]"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
