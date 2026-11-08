import { describe, it, expect } from 'vitest';
import { History } from '../terminal/history.js';

describe('History', () => {
  it('starts empty', () => {
    const h = new History();
    expect(h.size).toBe(0);
    expect(h.getEntries()).toEqual([]);
  });

  it('pushes entries', () => {
    const h = new History();
    h.push('help');
    h.push('about');
    expect(h.size).toBe(2);
    expect(h.getEntries()).toEqual(['help', 'about']);
  });

  it('navigates up through history', () => {
    const h = new History();
    h.push('help');
    h.push('about');
    h.push('projects');

    expect(h.up('')).toBe('projects');
    expect(h.up('')).toBe('about');
    expect(h.up('')).toBe('help');
    // Should stay at the oldest entry
    expect(h.up('')).toBe('help');
  });

  it('navigates down through history', () => {
    const h = new History();
    h.push('help');
    h.push('about');

    h.up('');  // about
    h.up('');  // help
    expect(h.down()).toBe('about');
    expect(h.down()).toBe(''); // back to draft
  });

  it('saves the draft on first up press', () => {
    const h = new History();
    h.push('help');
    h.push('about');

    h.up('my draft');  // about
    h.up('my draft');  // help
    // Going back down should restore draft
    expect(h.down()).toBe('about');
    expect(h.down()).toBe('my draft');
  });

  it('does not duplicate consecutive identical entries', () => {
    const h = new History();
    h.push('help');
    h.push('help');
    expect(h.size).toBe(1);
  });

  it('caps at 50 entries', () => {
    const h = new History();
    for (let i = 0; i < 60; i++) {
      h.push(`cmd-${i}`);
    }
    expect(h.size).toBe(50);
    // First entries should be gone
    expect(h.getEntries()[0]).toBe('cmd-10');
  });

  it('resets cursor after push', () => {
    const h = new History();
    h.push('help');
    h.push('about');
    h.up(''); // about
    h.push('projects');
    // Cursor should be reset, so up gives the latest
    expect(h.up('')).toBe('projects');
  });

  it('returns null for up on empty history', () => {
    const h = new History();
    expect(h.up('')).toBeNull();
  });
});

