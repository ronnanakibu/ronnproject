import type { Command, OutputBlock } from '../terminal/types.js';

const VALID_THEMES = ['paper', 'ember', 'matrix'] as const;
type ThemeName = (typeof VALID_THEMES)[number];

function isValidTheme(name: string): name is ThemeName {
  return (VALID_THEMES as readonly string[]).includes(name);
}

export const themeCommand: Command = {
  name: 'theme',
  description: 'Ganti atau lihat tema (paper / ember / matrix).',
  usage: 'theme [paper|ember|matrix]',
  complete(partial: string): string[] {
    return VALID_THEMES.filter((t) => t.startsWith(partial.toLowerCase()));
  },
  run(ctx, args): OutputBlock {
    const themeName = args[0]?.toLowerCase();

    if (!themeName) {
      return {
        type: 'theme-switch',
        current: ctx.getTheme(),
        options: VALID_THEMES.map((t) => ({
          name: t,
          command: `theme ${t}`,
        })),
      };
    }

    if (!isValidTheme(themeName)) {
      return {
        type: 'text',
        content: `tema "${themeName}" tidak ada. Pilih: paper, ember, atau matrix.`,
        class: 'error',
      };
    }

    ctx.setTheme(themeName);

    return {
      type: 'text',
      content: `tema diganti ke ${themeName}.`,
    };
  },
};

