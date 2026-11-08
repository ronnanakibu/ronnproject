import type { Command, OutputBlock } from '../terminal/types.js';
import { soundFx } from '../terminal/audio.js';

export const soundCommand: Command = {
  name: 'sound',
  aliases: ['audio', 'sfx', 'mute'],
  description: 'Nyalakan atau matikan efek suara retro 8-bit.',
  usage: 'sound [on|off]',
  hidden: true,
  complete(partial: string): string[] {
    return ['on', 'off'].filter((s) => s.startsWith(partial.toLowerCase()));
  },
  run(_ctx, args): OutputBlock {
    const arg = args[0]?.toLowerCase();

    if (arg === 'on') {
      soundFx.setEnabled(true);
      soundFx.playPowerUp();
      return {
        type: 'text',
        content: '🔊 Efek suara 8-bit DIAKTIFKAN.',
      };
    }

    if (arg === 'off') {
      soundFx.setEnabled(false);
      return {
        type: 'text',
        content: '🔇 Efek suara 8-bit DIMATIKAN (Mute).',
      };
    }

    const state = soundFx.toggle();
    return {
      type: 'text',
      content: state ? '🔊 Efek suara 8-bit DIAKTIFKAN.' : '🔇 Efek suara 8-bit DIMATIKAN (Mute).',
    };
  },
};

