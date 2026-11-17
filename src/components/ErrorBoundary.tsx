import { Component, type ErrorInfo, type ReactNode } from 'react';
import { strings } from '@/data/strings';
import { AlertIcon } from './Icons';
import { Button } from './ui';

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Wyłapuje błąd renderowania zamiast białej strony (UI-SPEC 5). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[wybor-telefonu] błąd renderowania', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <div className="surface flex flex-col gap-3 border-l-4 border-l-[var(--color-warn)] p-[var(--pad-card)]">
          <span className="flex items-center gap-2 text-[var(--color-warn)]">
            <AlertIcon className="h-5 w-5" />
            <span className="label-mono">error</span>
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">{strings.errorTitle}</h1>
          <p className="text-sm text-[var(--color-muted)]">{strings.errorNote}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => window.location.reload()}>
              {strings.reload}
            </Button>
            <Button
              variant="secondary"
              href="#/"
            >
              {strings.backHome}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
