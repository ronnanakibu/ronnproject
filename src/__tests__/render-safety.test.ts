// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderBlock } from '../terminal/render.js';
import type { OutputBlock } from '../terminal/types.js';

describe('Render safety (DOM)', () => {
  it('renders XSS payload as plain text, not executable HTML', () => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    const block: OutputBlock = {
      type: 'text',
      content: xssPayload,
    };

    const el = renderBlock(block);

    // textContent should preserve the raw string
    expect(el.textContent).toBe(xssPayload);
    // innerHTML should show the escaped version (entities)
    expect(el.innerHTML).not.toContain('<img');
    expect(el.innerHTML).toContain('&lt;img');
    // No child elements should exist (only text node)
    expect(el.children.length).toBe(0);
  });

  it('renders script tags in error messages as plain text', () => {
    const block: OutputBlock = {
      type: 'text',
      content: 'perintah "<script>alert(1)</script>" tidak ada.',
      class: 'error',
    };

    const el = renderBlock(block);
    expect(el.textContent).toBe('perintah "<script>alert(1)</script>" tidak ada.');
    expect(el.innerHTML).not.toContain('<script>');
    expect(el.children.length).toBe(0);
  });

  it('renders command-line with XSS input as plain text', () => {
    const block: OutputBlock = {
      type: 'command-line',
      input: '<img src=x onerror=alert(1)>',
    };

    const el = renderBlock(block);
    const cmdSpan = el.querySelector('.command-text');
    expect(cmdSpan).not.toBeNull();
    expect(cmdSpan!.textContent).toBe('<img src=x onerror=alert(1)>');
    expect(cmdSpan!.children.length).toBe(0);
  });

  it('renders key-value rows safely', () => {
    const block: OutputBlock = {
      type: 'key-value',
      rows: [
        { key: '<b>bold</b>', value: '<script>alert(1)</script>' },
      ],
    };

    const el = renderBlock(block);
    const keyEl = el.querySelector('.output-kv-key');
    const valEl = el.querySelector('.output-kv-value');
    expect(keyEl!.textContent).toBe('<b>bold</b>');
    expect(valEl!.textContent).toBe('<script>alert(1)</script>');
    expect(keyEl!.children.length).toBe(0);
    expect(valEl!.children.length).toBe(0);
  });

  it('renders project list with safe text', () => {
    const block: OutputBlock = {
      type: 'project-list',
      projects: [
        {
          slug: 'test',
          title: '<marquee>XSS</marquee>',
          description: '"><script>alert(1)</script>',
        },
      ],
      footer: 'footer text',
    };

    const el = renderBlock(block);
    const nameEl = el.querySelector('.project-name');
    const descEl = el.querySelector('.project-desc');
    expect(nameEl!.textContent).toBe('<marquee>XSS</marquee>');
    expect(descEl!.textContent).toBe('"><script>alert(1)</script>');
    expect(nameEl!.children.length).toBe(0);
    expect(descEl!.children.length).toBe(0);
  });

  it('renders link-list with textContent for labels', () => {
    const block: OutputBlock = {
      type: 'link-list',
      items: [
        { label: '<b>Click</b>', url: 'https://example.com', external: true },
      ],
    };

    const el = renderBlock(block);
    const a = el.querySelector('a');
    expect(a!.textContent).toBe('<b>Click</b>');
    expect(a!.children.length).toBe(0);
    expect(a!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a!.getAttribute('target')).toBe('_blank');
  });

  it('renders list items safely', () => {
    const block: OutputBlock = {
      type: 'list',
      items: ['<script>alert(1)</script>', 'normal item'],
    };

    const el = renderBlock(block);
    const items = el.querySelectorAll('li');
    expect(items[0]!.textContent).toBe('<script>alert(1)</script>');
    expect(items[0]!.children.length).toBe(0);
  });
});

