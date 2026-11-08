import type { Command, OutputBlock } from '../terminal/types.js';

export const aboutCommand: Command = {
  name: 'about',
  description: 'Tentang Ronn.',
  run(_ctx, _args): OutputBlock[] {
    return [
      {
        type: 'text',
        content:
          'Mahasiswa Teknik Komputer di Politeknik Negeri Medan.',
      },
      {
        type: 'text',
        content:
          'Membangun sistem dan merancang tampilannya.',
      },
      {
        type: 'text',
        content:
          'Mengoordinasi tim kreatif untuk proyek web dan otomasi.',
      },
    ];
  },
};

