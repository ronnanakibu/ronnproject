import { describe, it, expect } from 'vitest';
import { getCommand, getAllCommands, getCommandNames } from '../commands/index.js';

describe('Command Registry', () => {
  it('registers all MVP commands', () => {
    const names = getCommandNames();
    expect(names).toContain('help');
    expect(names).toContain('about');
    expect(names).toContain('projects');
    expect(names).toContain('contact');
    expect(names).toContain('open');
    expect(names).toContain('theme');
    expect(names).toContain('clear');
  });

  it('looks up commands by name', () => {
    const cmd = getCommand('help');
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe('help');
  });

  it('looks up commands by alias', () => {
    const cmd = getCommand('h');
    expect(cmd).toBeDefined();
    expect(cmd!.name).toBe('help');
  });

  it('returns undefined for unknown commands', () => {
    expect(getCommand('nonexistent')).toBeUndefined();
  });

  it('every command has a name and description', () => {
    for (const cmd of getAllCommands()) {
      expect(cmd.name).toBeTruthy();
      expect(cmd.description).toBeTruthy();
    }
  });
});

