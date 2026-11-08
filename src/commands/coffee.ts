import type { Command, OutputBlock } from '../terminal/types.js';

export const coffeeCommand: Command = {
  name: 'kopi',
  aliases: ['coffee', 'ngopi'],
  description: 'Bahan bakar utama creative engineering.',
  usage: 'kopi',
  run(_ctx, _args): OutputBlock[] {
    return [
      {
        type: 'text',
        content: `
      )  (
     (   ) )
      ) ( (
    .-------.
    |       |]
    | KAFFE |
    |_______|
     '====='

Caffeine Level: [██████████] 100%
Status        : Siap ngoding & debugging sampai subuh.
Rekomendasi   : Kopi hitam tubruk + mie instan kuah double telur.`,
      },
    ];
  },
};
