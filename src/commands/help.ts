import type { Command, OutputBlock } from '../terminal/types.js';
import { getAllCommands } from './index.js';

export const helpCommand: Command = {
  name: 'help',
  aliases: ['h', '?'],
  description: 'Tampilkan daftar perintah yang tersedia.',
  run(_ctx, _args): OutputBlock[] {
    const commands = getAllCommands();
    const blocks: OutputBlock[] = [
      { type: 'text', content: 'perintah yang tersedia:' },
    ];

    const rows = commands.map((cmd) => ({
      key: cmd.usage ?? cmd.name,
      value: cmd.description,
    }));

    blocks.push({ type: 'key-value', rows });

    return blocks;
  },
};

