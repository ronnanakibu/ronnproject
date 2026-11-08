import type { Command, OutputBlock } from '../terminal/types.js';
import { projects } from '../data/projects.js';

const slugMap = new Map(projects.map((p) => [p.slug, p]));

export const openCommand: Command = {
  name: 'open',
  description: 'Buka project di tab baru.',
  usage: 'open <project>',
  complete(partial: string): string[] {
    const lower = partial.toLowerCase();
    return projects
      .map((p) => p.slug)
      .filter((slug) => slug.startsWith(lower));
  },
  run(_ctx, args): OutputBlock {
    const slug = args[0]?.toLowerCase();

    if (!slug) {
      return {
        type: 'text',
        content: 'gunakan: open <nama-project>. Ketik projects untuk daftar.',
        class: 'error',
      };
    }

    const project = slugMap.get(slug);
    if (!project) {
      return {
        type: 'text',
        content: `project "${slug}" tidak ada. Ketik projects untuk daftar.`,
        class: 'error',
      };
    }

    // Open in new tab safely
    const win = window.open(project.url, '_blank', 'noopener,noreferrer');
    if (!win) {
      return {
        type: 'text',
        content: `membuka ${project.url}...`,
      };
    }

    return {
      type: 'text',
      content: `membuka ${project.title}...`,
    };
  },
};

