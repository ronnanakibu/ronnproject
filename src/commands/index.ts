import type { Command } from '../terminal/types.js';
import { helpCommand } from './help.js';
import { aboutCommand } from './about.js';
import { projectsCommand } from './projects.js';
import { contactCommand } from './contact.js';
import { openCommand } from './open.js';
import { themeCommand } from './theme.js';
import { clearCommand } from './clear.js';
import { driveCommand } from './drive.js';
import { sudoCommand } from './sudo.js';
import { quoteCommand } from './quote.js';
import { coffeeCommand } from './coffee.js';
import { soundCommand } from './sound.js';

const allCommands: Command[] = [
  helpCommand,
  aboutCommand,
  projectsCommand,
  contactCommand,
  openCommand,
  themeCommand,
  driveCommand,
  quoteCommand,
  coffeeCommand,
  soundCommand,
  sudoCommand,
  clearCommand,
];

// Map from name/alias -> Command for O(1) lookup
const commandMap = new Map<string, Command>();
const commandNames: string[] = [];

for (const cmd of allCommands) {
  commandMap.set(cmd.name, cmd);
  commandNames.push(cmd.name);

  if (cmd.aliases) {
    for (const alias of cmd.aliases) {
      commandMap.set(alias, cmd);
    }
  }
}

export function getCommand(name: string): Command | undefined {
  return commandMap.get(name);
}

export function getAllCommands(): Command[] {
  return allCommands;
}

export function getCommandNames(): string[] {
  return commandNames;
}

export function getCommandMap(): Map<string, Command> {
  return commandMap;
}

