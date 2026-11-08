import { describe, it, expect } from 'vitest';

/**
 * WCAG 2.1 Contrast Ratio Verification
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 * where L is the relative luminance of the color.
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function channelLuminance(val: number): number {
  const s = val / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Theme Contrast Ratios (WCAG 2.1 AA >= 4.5:1 for body text)', () => {
  const paper = {
    bgPage: '#D9D8D2',
    bgWindow: '#F2F1EC',
    bgDock: '#D9D8D2',
    ink: '#000000',
    muted: '#4A4A46',
    accent: '#2430FF',
    frame: '#000000',
    line: '#000000',
    barBg: '#000000',
    barInk: '#F2F1EC',
    chipBg: '#F2F1EC',
    chipInk: '#000000',
    chipBorder: '#000000',
    chipActiveBg: '#000000',
    chipActiveInk: '#F2F1EC',
    placeholder: '#5A5A55',
  };

  const ember = {
    bgPage: '#120C08',
    bgWindow: '#1F150F',
    bgDock: '#150E09',
    ink: '#EFE3D3',
    muted: '#B9A794',
    accent: '#E07B39',
    frame: '#E07B39',
    line: '#8A6A50',
    barBg: '#E07B39',
    barInk: '#1F150F',
    chipBg: '#1F150F',
    chipInk: '#EFE3D3',
    chipBorder: '#EFE3D3',
    chipActiveBg: '#E07B39',
    chipActiveInk: '#1F150F',
    placeholder: '#A89580',
  };

  describe('Paper theme (Light)', () => {
    it('primary text (ink) on window background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.ink, paper.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text (muted) on window background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.muted, paper.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('accent link/prompt color on window background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.accent, paper.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('header bar text on header background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.barInk, paper.barBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('chip text on chip background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.chipInk, paper.chipBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('chip active text on active chip background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.chipActiveInk, paper.chipActiveBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('placeholder on window background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.placeholder, paper.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('muted text on dock background >= 4.5:1', () => {
      const ratio = contrastRatio(paper.muted, paper.bgDock);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Ember theme (Dark orange)', () => {
    it('primary text (ink) on window background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.ink, ember.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('secondary text (muted) on window background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.muted, ember.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('accent link/prompt color on window background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.accent, ember.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('header bar text on header background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.barInk, ember.barBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('chip text on chip background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.chipInk, ember.chipBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('chip active text on active chip background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.chipActiveInk, ember.chipActiveBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('placeholder on window background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.placeholder, ember.bgWindow);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('muted text on dock background >= 4.5:1', () => {
      const ratio = contrastRatio(ember.muted, ember.bgDock);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

