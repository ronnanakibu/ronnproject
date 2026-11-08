import type { Command, OutputBlock } from '../terminal/types.js';
import { soundFx } from '../terminal/audio.js';

export const sudoCommand: Command = {
  name: 'sudo',
  aliases: ['rm', 'delete', 'del', 'format'],
  description: 'Jalankan perintah dengan hak akses root.',
  usage: 'sudo <perintah>',
  run(_ctx, args): OutputBlock[] {
    const rawArgs = args.join(' ').toLowerCase();

    // Dangerous command prank: rm -rf, delete system32, format c:
    const isDestructive =
      rawArgs.includes('rm -rf') ||
      rawArgs.includes('system32') ||
      rawArgs.includes('format') ||
      rawArgs.includes('destroy') ||
      rawArgs.includes('hack');

    if (isDestructive) {
      soundFx.playGlitch();

      const terminalEl = document.getElementById('terminal');
      if (terminalEl) {
        terminalEl.classList.remove('screen-shake');
        void terminalEl.offsetWidth; // trigger reflow
        terminalEl.classList.add('screen-shake');
      }

      return [
        {
          type: 'text',
          content: '⚠️ [CRITICAL ALERT] PERINTAH DESTRUKTIF DIDETEKSI!',
          class: 'error',
        },
        {
          type: 'text',
          content: 'DELETING: C:\\Windows\\System32\\ntoskrnl.exe...\nKERNEL_SECURITY_CHECK_FAILURE (0x00000139)\nSELF-DESTRUCT IN 3... 2... 1...',
          class: 'error',
        },
        {
          type: 'text',
          content: '...cuma bercanda cuy, santai jangan panik wkwkwk! 😆 Windows lu aman sentosa.',
          class: 'prompt-text',
        },
      ];
    }

    soundFx.playError();
    return [
      {
        type: 'text',
        content: `ronn is not in the sudoers file. Insiden "${args.join(' ')}" ini akan dilaporkan ke Dosen Polmed.`,
        class: 'error',
      },
    ];
  },
};
