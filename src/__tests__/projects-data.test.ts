import { describe, it, expect } from 'vitest';
import { projects } from '../data/projects.js';

describe('Project data', () => {
  it('has at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('every project has required fields', () => {
    for (const p of projects) {
      expect(p.slug).toBeTruthy();
      expect(p.title).toBeTruthy();
      expect(p.description).toBeTruthy();
      expect(p.url).toBeTruthy();
    }
  });

  it('no production URL contains a placeholder bracket', () => {
    for (const p of projects) {
      expect(p.url).not.toContain('[');
      expect(p.url).not.toContain(']');
    }
  });

  it('every slug is unique', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every URL is a valid URL', () => {
    for (const p of projects) {
      expect(() => new URL(p.url)).not.toThrow();
    }
  });
});

