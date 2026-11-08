/**
 * Parse a raw command string into a command name and arguments.
 * Input is trimmed and lowercased. Arguments are split by whitespace.
 */
export interface ParsedCommand {
  name: string;
  args: string[];
  raw: string;
}

export function parseCommand(input: string): ParsedCommand | null {
  const raw = input.trim();
  if (raw === '') return null;

  const parts = raw.split(/\s+/);
  const name = parts[0]!.toLowerCase();
  const args = parts.slice(1);

  return { name, args, raw };
}

