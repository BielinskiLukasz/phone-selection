// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * E8-01/E8-02/E8-03 i test akceptacyjny 6: tokeny obu motywów, kontrast ≥ 4,5:1,
 * brak stałych kolorów w komponentach i ustawienie motywu przed pierwszym renderem.
 */

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function declarations(block: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const match of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    result[match[1]!] = match[2]!.trim();
  }
  return result;
}

const themeBlock = css.slice(css.indexOf('@theme {'), css.indexOf('}', css.indexOf('@theme {')));
const light = declarations(themeBlock);

const dark: Record<string, string> = {};
for (const match of css.matchAll(/\[data-theme="dark"\][^{]*\{([^}]*)\}/g)) {
  Object.assign(dark, declarations(match[1]!));
}
Object.assign(light, declarations(css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')))));

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => `${c}${c}`).join('') : clean;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

const TEXT_PAIRS: [string, string, string][] = [
  ['tekst na tle', '--color-text', '--color-bg'],
  ['tekst na powierzchni', '--color-text', '--color-surface'],
  ['tekst drugorzędny na tle', '--color-muted', '--color-bg'],
  ['tekst drugorzędny na powierzchni', '--color-muted', '--color-surface'],
  ['akcent na miękkim tle', '--color-accent-ink', '--color-accent-soft'],
  ['ostrzeżenie na miękkim tle', '--color-warn', '--color-warn-soft'],
  ['treść na akcencie', '--color-on-accent', '--color-accent'],
];

describe('E8-01 · tokeny motywów (UI-SPEC 6)', () => {
  it('oba motywy mają komplet tokenów kolorów', () => {
    const required = [
      '--color-bg',
      '--color-surface',
      '--color-text',
      '--color-muted',
      '--color-border',
      '--color-accent',
      '--color-accent-ink',
      '--color-accent-soft',
      '--color-on-accent',
      '--color-warn',
    ];
    for (const token of required) {
      expect(light[token], `jasny: ${token}`).toMatch(/^#[0-9a-f]{6}$/i);
      expect(dark[token], `ciemny: ${token}`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('jasny = ciepła biel i błękit, ciemny = grafit i zieleń (UI-SPEC 6)', () => {
    expect(light['--color-bg']).toBe('#faf8f5');
    expect(light['--color-accent']).toBe('#2f6fed');
    expect(dark['--color-bg']).toBe('#0b0f14');
    expect(dark['--color-accent']).toBe('#4ade80');
  });

  it('ciemny motyw jest gęstszy i ostrzejszy: mniejsze promienie i odstępy', () => {
    expect(light['--radius-card']).toBe('16px');
    expect(dark['--radius-card']).toBe('2px');
    expect(Number.parseInt(light['--pad-card']!, 10)).toBe(24);
    expect(Number.parseInt(dark['--pad-card']!, 10)).toBe(12);
    expect(light['--shadow-card']).not.toBe('none');
    expect(dark['--shadow-card']).toBe('none');
  });

  it('wariant dark Tailwinda jest przepięty na atrybut, a liczby mają font numeryczny', () => {
    expect(css).toContain('@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))');
    expect(light['--font-num']).toContain('ui-monospace');
    expect(light['--font-sans']).toContain('system-ui');
  });

  it('tło ciemne ma siatkę techniczną, jasne — miękką poświatę i kropki', () => {
    expect(css).toContain('[data-theme="dark"] body::after');
    expect(css).toMatch(/linear-gradient\(to right, rgba\(154, 167, 180/);
    expect(css).toContain('radial-gradient');
  });
});

describe('test akceptacyjny 6 · kontrast ≥ 4,5:1 w obu motywach', () => {
  it.each(TEXT_PAIRS)('%s — motyw jasny', (_label, foreground, background) => {
    expect(contrast(light[foreground]!, light[background]!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(TEXT_PAIRS)('%s — motyw ciemny', (_label, foreground, background) => {
    expect(contrast(dark[foreground]!, dark[background]!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('E8-02 · brak mignięcia motywem i dostępność CSS', () => {
  it('atrybut motywu ustawia skrypt w <head> przed modułem aplikacji', () => {
    const bootstrap = html.indexOf("localStorage.getItem('wybor-telefonu:theme')");
    const moduleScript = html.indexOf('<script type="module" src="/src/main.tsx">');
    expect(bootstrap).toBeGreaterThan(-1);
    expect(moduleScript).toBeGreaterThan(-1);
    expect(bootstrap).toBeLessThan(moduleScript);
    expect(html).toContain('<html lang="pl" data-theme="light">');
  });

  it('focus-visible ma widoczny obrys akcentem, a ruch da się wyłączyć', () => {
    expect(css).toMatch(/:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--color-accent\)/);
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toMatch(/animation-duration: 0\.01ms !important/);
    expect(css).toMatch(/transition-duration: 0\.01ms !important/);
  });

  it('E8-08: brak JavaScript daje komunikat, a strona nie przewija się w poziomie', () => {
    expect(html).toContain('<noscript>JavaScript jest wymagany');
    expect(css).toMatch(/body\s*\{[^}]*overflow-x: hidden/);
  });
});

describe('E8-03 · zero stałych kolorów w komponentach', () => {
  function sourceFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) out.push(...sourceFiles(path));
      else if (entry.endsWith('.tsx')) out.push(path);
    }
    return out;
  }

  it('żaden komponent nie hardkoduje koloru (hex, rgb, nazwy Tailwinda)', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles('src')) {
      const content = readFileSync(file, 'utf8');
      const hex = content.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
      const rgb = content.match(/rgba?\(\s*\d/g) ?? [];
      const named = content.match(/\b(?:text|bg|border)-(?:white|black)\b/g) ?? [];
      if (hex.length + rgb.length + named.length > 0) {
        offenders.push(`${file}: ${[...hex, ...rgb, ...named].join(', ')}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('ikony cech są inline SVG, bez zewnętrznych zależności i bez <img>', () => {
    const icons = readFileSync(new URL('../src/components/Icons.tsx', import.meta.url), 'utf8');
    for (const name of [
      'BatteryIcon',
      'CameraIcon',
      'StorageIcon',
      'UpdateIcon',
      'ShieldIcon',
      'ScreenIcon',
    ]) {
      expect(icons).toContain(`export function ${name}`);
    }
    expect(icons).toContain('<svg');
    expect(icons).not.toContain('<img');

    for (const file of sourceFiles('src')) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('<img');
    }
  });
});
