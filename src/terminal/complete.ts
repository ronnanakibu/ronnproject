import type { Command } from './types.js';

/**
 * Tab completion for command names and contextual arguments.
 */
export function complete(
  input: string,
  commands: Map<string, Command>,
  allNames: string[]
): string[] {
  const trimmed = input.trimStart();

  // If the input contains a space, try to complete arguments
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex !== -1) {
    const cmdName = trimmed.slice(0, spaceIndex).toLowerCase();
    const partial = trimmed.slice(spaceIndex + 1).trimStart();

    // Find the command (by name or alias)
    const cmd = commands.get(cmdName);
    if (cmd?.complete) {
      return cmd.complete(partial);
    }
    return [];
  }

  // Complete command names
  const partial = trimmed.toLowerCase();
  if (partial === '') return allNames;

  return allNames.filter((name) => name.startsWith(partial));
}

