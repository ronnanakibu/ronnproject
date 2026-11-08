import { describe, it, expect } from 'vitest';
import type { Command } from '../terminal/types.js';
import { complete } from '../terminal/complete.js';

// Mock commands for testing
const mockCommands: Command[] = [
  {
    name: 'help',
    description: 'Show help',
    run: () => undefined,
  },
  {
    name: 'about',
    description: 'About',
    run: () => undefined,
  },
  {
    name: 'open',
    description: 'Open project',
    usage: 'open <project>',
    complete: (partial: string) => {
      const slugs = ['kelas-f', 'ronn-ai', 'ronnbot', 'squad-x'];
      return slugs.filter((s) => s.startsWith(partial.toLowerCase()));
    },
    run: () => undefined,
  },
  {
    name: 'projects',
    description: 'List projects',
    run: () => undefined,
  },
  {
    name: 'theme',
    description: 'Switch theme',
    complete: (partial: string) => {
      return ['paper', 'ember'].filter((t) => t.startsWith(partial.toLowerCase()));
    },
    run: () => undefined,
  },
];

const commandMap = new Map<string, Command>();
const allNames: string[] = [];
for (const cmd of mockCommands) {
  commandMap.set(cmd.name, cmd);
  allNames.push(cmd.name);
}

describe('complete', () => {
  it('completes command names from empty input', () => {
    const result = complete('', commandMap, allNames);
    expect(result).toEqual(allNames);
  });

  it('completes command names from partial input', () => {
    const result = complete('he', commandMap, allNames);
    expect(result).toEqual(['help']);
  });

  it('completes multiple matches', () => {
    const result = complete('p', commandMap, allNames);
    expect(result).toEqual(['projects']);
  });

  it('returns empty for no matches', () => {
    const result = complete('xyz', commandMap, allNames);
    expect(result).toEqual([]);
  });

  it('completes project slugs after "open "', () => {
    const result = complete('open r', commandMap, allNames);
    expect(result).toEqual(['ronn-ai', 'ronnbot']);
  });

  it('completes all project slugs after "open "', () => {
    const result = complete('open ', commandMap, allNames);
    expect(result).toEqual(['kelas-f', 'ronn-ai', 'ronnbot', 'squad-x']);
  });

  it('completes theme names after "theme "', () => {
    const result = complete('theme e', commandMap, allNames);
    expect(result).toEqual(['ember']);
  });

  it('returns empty for unknown command arguments', () => {
    const result = complete('help foo', commandMap, allNames);
    expect(result).toEqual([]);
  });
});

