import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface RevealProps {
  children: ReactNode;
  /** Opóźnienie wejścia w ms — trzymane krótko (UI-SPEC 1.7). */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/** Wejście treści po przewinięciu do widoku; bez IntersectionObserver pokazuje ją od razu. */
export function Reveal({ children, delay = 0, className, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn('reveal', shown && 'reveal-in', className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
