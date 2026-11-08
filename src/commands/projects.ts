import type { Command, OutputBlock } from '../terminal/types.js';
import { projects } from '../data/projects.js';

export const projectsCommand: Command = {
  name: 'projects',
  aliases: ['ls', 'list'],
  description: 'Tampilkan daftar project.',
  run(_ctx, _args): OutputBlock {
    return {
      type: 'project-list',
      projects: projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
      })),
      footer: `${projects.length} project. Ketik open nama-project untuk membukanya.`,
    };
  },
};

