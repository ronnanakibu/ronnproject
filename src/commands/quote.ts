import type { Command, OutputBlock } from '../terminal/types.js';

export const quoteCommand: Command = {
  name: 'katakata',
  aliases: ['quote', 'quotes'],
  description: 'Kutipan filosofi hidup Ronn.',
  usage: 'katakata',
  run(_ctx, _args): OutputBlock[] {
    return [
      {
        type: 'text',
        content: `
┌──────────────────────────────────────────────────────────────┐
│  "Serang jantungmu sebelum jantungmu menyerangmu."           │
│                                                              │
│                         — Ronn, Teknik Komputer Polmed 2026  │
└──────────────────────────────────────────────────────────────┘`,
      },
    ];
  },
};
