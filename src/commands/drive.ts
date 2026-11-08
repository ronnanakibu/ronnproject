import type { Command, OutputBlock } from '../terminal/types.js';

export const driveCommand: Command = {
  name: 'drive',
  aliases: ['attract', 'forza', 'screensaver'],
  description: 'Masuk ke 3D cinematic retro-arcade attract mode.',
  usage: 'drive',
  run(ctx, _args): OutputBlock {
    if (ctx.startScreensaver) {
      setTimeout(() => {
        ctx.startScreensaver?.();
      }, 250);
    }
    return {
      type: 'text',
      content: 'Memulai 3D cinematic attract mode...',
    };
  },
};

