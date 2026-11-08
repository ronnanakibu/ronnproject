import type { Command } from '../terminal/types.js';

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['cls'],
  description: 'Bersihkan layar terminal.',
  run(ctx, _args): void {
    ctx.clearOutput();
  },
};

