import { describe, it, expect } from 'vitest';
import { parseCommand } from '../terminal/parser.js';

describe('parseCommand', () => {
  it('returns null for empty input', () => {
    expect(parseCommand('')).toBeNull();
    expect(parseCommand('   ')).toBeNull();
  });

  it('parses a simple command', () => {
    const result = parseCommand('help');
    expect(result).toEqual({
      name: 'help',
      args: [],
      raw: 'help',
    });
  });

  it('parses command with arguments', () => {
    const result = parseCommand('open kelas-f');
    expect(result).toEqual({
      name: 'open',
      args: ['kelas-f'],
      raw: 'open kelas-f',
    });
  });

  it('is case-insensitive for the command name', () => {
    const result = parseCommand('HELP');
    expect(result?.name).toBe('help');
  });

  it('trims whitespace', () => {
    const result = parseCommand('  help  ');
    expect(result).toEqual({
      name: 'help',
      args: [],
      raw: 'help',
    });
  });

  it('handles multiple spaces between arguments', () => {
    const result = parseCommand('open   kelas-f');
    expect(result).toEqual({
      name: 'open',
      args: ['kelas-f'],
      raw: 'open   kelas-f',
    });
  });

  it('preserves the raw input (trimmed)', () => {
    const result = parseCommand('  Open Kelas-F  ');
    expect(result?.raw).toBe('Open Kelas-F');
    expect(result?.name).toBe('open');
    expect(result?.args).toEqual(['Kelas-F']);
  });

  it('handles XSS attempt as plain text', () => {
    const result = parseCommand('<img src=x onerror=alert(1)>');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('<img');
    // The important thing is it's just string data, not executed
    expect(result!.raw).toBe('<img src=x onerror=alert(1)>');
  });
});

