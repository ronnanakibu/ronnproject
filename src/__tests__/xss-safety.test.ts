import { describe, it, expect } from 'vitest';
import { parseCommand } from '../terminal/parser.js';

/**
 * XSS safety tests.
 * The parser returns raw strings — safety comes from render.ts using
 * createElement + textContent (never innerHTML). These tests verify
 * that malicious input passes through as inert string data.
 */
describe('XSS Safety', () => {
  it('parser treats <img src=x onerror=alert(1)> as plain string data', () => {
    const result = parseCommand('<img src=x onerror=alert(1)>');
    expect(result).not.toBeNull();
    // The "command name" is just the first token — harmless string
    expect(result!.name).toBe('<img');
    expect(result!.args).toEqual(['src=x', 'onerror=alert(1)>']);
    // Raw input preserved exactly as typed — it's just data
    expect(result!.raw).toBe('<img src=x onerror=alert(1)>');
  });

  it('parser treats <script>alert(1)</script> as plain string data', () => {
    const result = parseCommand('<script>alert(1)</script>');
    expect(result).not.toBeNull();
    expect(result!.raw).toBe('<script>alert(1)</script>');
  });

  it('parser treats javascript:alert(1) as plain string data', () => {
    const result = parseCommand('javascript:alert(1)');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('javascript:alert(1)');
  });

  it('parser treats HTML entities as literal strings', () => {
    const result = parseCommand('&lt;script&gt;');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('&lt;script&gt;');
  });

  it('parser treats nested quotes and event handlers as plain text', () => {
    const result = parseCommand('" onmouseover="alert(1)" "');
    expect(result).not.toBeNull();
    expect(result!.raw).toBe('" onmouseover="alert(1)" "');
  });
});

