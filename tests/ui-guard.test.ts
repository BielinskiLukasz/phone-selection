// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * UIP0-03 · test strażniczy systemu projektowego (FIX-UI §3.4): literały px poza tokenami,
 * `tracking-[…]` poza `ui/`, ręcznie składane przyciski w ekranach.
 * Tryb: **raport** (nie `fail`) do czasu UIP3-04 — wypisuje naruszenia i pilnuje, żeby liczba nie rosła.
 */

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
    else if (entry.endsWith('.tsx')) out.push(path);
  }
  return out;
}

/* Makiety deweloperskie i panele poza produktem — poza zakresem strażnika. */
const IGNORED = ['src/screens/mocks.tsx', 'src/components/RouterConsole.tsx', 'src/components/SkeletonPanel.tsx', 'src/components/ScreenShell.tsx', 'src/components/SessionPanel.tsx', 'src/components/AnonCardPreview.tsx'];
const files = sourceFiles('src').filter((file) => !IGNORED.includes(file.replace(/\\/g, '/')));

function count(pattern: RegExp): { total: number; byFile: string[] } {
  const byFile: string[] = [];
  let total = 0;
  for (const file of files) {
    const hits = readFileSync(file, 'utf8').match(pattern) ?? [];
    if (hits.length > 0) {
      total += hits.length;
      byFile.push(`${file}: ${hits.length}`);
    }
  }
  return { total, byFile };
}

/* Budżety naruszeń: stan po UIP2 pierwszej tury (16.11.2026). Każda kolejna tura może je tylko obniżać. */
const BUDGET = {
  pxText: 150, // text-[Npx] — cel 0 (FIX-UI §9)
  pxRadius: 6, // rounded-[Npx]
  tracking: 110, // tracking-[…] poza ui/
  manualButtons: 2, // bg-[var(--color-accent)] px / border border-[var(--color-border)] px poza ui/
  headingClamp: 10, // text-[clamp(…)] — cel: tylko tokeny
};

describe('UIP0-03 · strażnik systemu projektowego (tryb raportu)', () => {
  it('literały px w tekście nie przybywają', () => {
    const { total, byFile } = count(/text-\[[0-9.]+px\]/g);
    console.info(`[ui-guard] text-[Npx]: ${total}\n  ${byFile.join('\n  ')}`);
    expect(total).toBeLessThanOrEqual(BUDGET.pxText);
  });

  it('literały px w promieniach nie przybywają', () => {
    const { total, byFile } = count(/rounded-(?:[tb]-)?\[[0-9]+px\]/g);
    console.info(`[ui-guard] rounded-[Npx]: ${total}\n  ${byFile.join('\n  ')}`);
    expect(total).toBeLessThanOrEqual(BUDGET.pxRadius);
  });

  it('tracking-[…] poza komponentami ui/ nie przybywa', () => {
    const outsideUi = files.filter((file) => !file.includes('components/ui/'));
    let total = 0;
    for (const file of outsideUi) total += (readFileSync(file, 'utf8').match(/tracking-\[[^\]]+\]/g) ?? []).length;
    console.info(`[ui-guard] tracking-[…] poza ui/: ${total}`);
    expect(total).toBeLessThanOrEqual(BUDGET.tracking);
  });

  it('ręcznie składane przyciski w ekranach i komponentach: tylko Button', () => {
    const outsideUi = files.filter((file) => !file.includes('components/ui/'));
    const offenders: string[] = [];
    for (const file of outsideUi) {
      const content = readFileSync(file, 'utf8');
      const hits = content.match(/<(?:button|a)\b[^>]*className="[^"]*(?:bg-\[var\(--color-accent\)\] px|bg-\[var\(--color-text\)\] px)[^"]*"/g) ?? [];
      if (hits.length > 0) offenders.push(`${file}: ${hits.length}`);
    }
    console.info(`[ui-guard] ręczne przyciski główne: ${offenders.length}\n  ${offenders.join('\n  ')}`);
    expect(offenders.length).toBeLessThanOrEqual(BUDGET.manualButtons);
  });

  it('nagłówki z clamp() poza tokenami nie przybywają', () => {
    const { total, byFile } = count(/text-\[clamp\([^\]]+\)\]/g);
    console.info(`[ui-guard] text-[clamp(…)]: ${total}\n  ${byFile.join('\n  ')}`);
    expect(total).toBeLessThanOrEqual(BUDGET.headingClamp);
  });

  it('komponenty ui/ nie importują features/ ani lib/ (FIX-UI §4)', () => {
    for (const file of files.filter((item) => item.includes('components/ui/'))) {
      const content = readFileSync(file, 'utf8');
      expect(content, file).not.toMatch(/from '@\/(features|lib|data)\//);
    }
  });
});
