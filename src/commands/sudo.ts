import type { Command, Context, OutputBlock } from '../terminal/types.js';
import { soundFx } from '../terminal/audio.js';

function triggerAwSnapCrashPrank(ctx: Context, commandStr: string): void {
  // 1. Play glitch / critical audio
  soundFx.playGlitch();

  // 2. Shake terminal element
  const terminalEl = document.getElementById('terminal');
  if (terminalEl) {
    terminalEl.classList.remove('screen-shake');
    void terminalEl.offsetWidth; // force reflow
    terminalEl.classList.add('screen-shake');
  }

  // 3. Mount Aw, Snap! tab crash overlay after brief shake delay
  window.setTimeout(() => {
    let existing = document.getElementById('crash-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'crash-overlay';
    overlay.className = 'crash-overlay';
    overlay.setAttribute('role', 'alertdialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Aw, Snap! Tab Crashed');

    const sanitizedCommand = commandStr.replace(/[^\w\s\-./\\:]/g, '').trim() || 'delete system32';

    overlay.innerHTML = `
      <div class="snap-box">
        <div class="snap-icon-wrap" aria-hidden="true">
          <svg class="snap-icon" width="68" height="68" viewBox="0 0 68 68" fill="none">
            <path d="M16 10 H44 L54 20 V58 H16 Z" fill="#2d3139" stroke="#9aa0a6" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M44 10 V20 H54" fill="#3c4043" stroke="#9aa0a6" stroke-width="2.5" stroke-linejoin="round"/>
            <line x1="26" y1="30" x2="32" y2="36" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="32" y1="30" x2="26" y2="36" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="38" y1="30" x2="44" y2="36" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="44" y1="30" x2="38" y2="36" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M26 46 C32 40 38 40 44 46" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round" fill="none"/>
          </svg>
        </div>
        <h1 class="snap-title">Aw, Snap!</h1>
        <p class="snap-subtitle">Something went wrong while displaying this webpage.</p>
        
        <div class="snap-details">
          <div class="snap-row"><span class="snap-muted">Error code:</span> <span class="snap-code">STATUS_SYSTEM_PROCESS_TERMINATED</span></div>
          <div class="snap-row"><span class="snap-muted">Triggered by:</span> <span class="snap-code" id="snap-cmd"></span></div>
          <div class="snap-row"><span class="snap-muted">Faulting module:</span> <span class="snap-muted">C:\\Windows\\System32\\ntoskrnl.exe</span></div>
        </div>

        <div class="snap-timer-bar">
          <p class="snap-timer-text">Memulihkan sistem secara otomatis dalam <strong id="snap-count">5</strong> detik...</p>
          <div class="snap-meter"><div class="snap-meter-fill"></div></div>
        </div>

        <div class="snap-actions">
          <button type="button" class="snap-reload-btn" id="btn-snap-reload">Muat Ulang (Reload)</button>
        </div>
      </div>
    `;

    const cmdSpan = overlay.querySelector('#snap-cmd');
    if (cmdSpan) {
      cmdSpan.textContent = sanitizedCommand;
    }

    document.body.appendChild(overlay);

    const reloadBtn = overlay.querySelector<HTMLButtonElement>('#btn-snap-reload');
    reloadBtn?.addEventListener('click', () => {
      if (reloadBtn) {
        reloadBtn.textContent = 'Memulihkan sistem... Harap tunggu';
        reloadBtn.disabled = true;
      }
    });

    // 5-second countdown ticker
    let remaining = 5;
    const countEl = overlay.querySelector('#snap-count');
    const intervalId = window.setInterval(() => {
      remaining--;
      if (countEl) {
        countEl.textContent = String(Math.max(0, remaining));
      }
      if (remaining <= 0) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    // Exactly 5 seconds duration
    window.setTimeout(() => {
      window.clearInterval(intervalId);
      overlay.classList.add('crash-overlay-fadeout');

      window.setTimeout(() => {
        overlay.remove();
        soundFx.playPowerUp();

        // Refocus terminal input
        const inputEl = document.querySelector<HTMLInputElement>('.terminal-input');
        inputEl?.focus();

        // Print final prank relief message
        ctx.print([
          {
            type: 'text',
            content: '✅ [SYSTEM REBOOT COMPLETED] Status: Kernel & Memory Normal (0x00000000)',
            class: 'prompt-text',
          },
          {
            type: 'text',
            content: '😆 AW, SNAP! KENA PRANK WKWKWK! ✌️\nSantai cuy, jangan panik! Windows & folder System32 lu 100% aman sentosa.',
            class: 'prompt-text',
          },
        ]);
      }, 350);
    }, 5000);
  }, 450);
}

export const sudoCommand: Command = {
  name: 'sudo',
  aliases: ['rm', 'delete', 'del', 'format', 'system32'],
  description: 'Jalankan perintah dengan hak akses root.',
  usage: 'sudo <perintah>',
  hidden: true,
  run(ctx, args): OutputBlock[] {
    const rawArgs = args.join(' ').toLowerCase();

    // Dangerous command prank: rm -rf, delete system32, format c:, del system32
    const isDestructive =
      rawArgs.includes('rm -rf') ||
      rawArgs.includes('-rf') ||
      rawArgs.includes('system32') ||
      rawArgs.includes('format') ||
      rawArgs.includes('destroy') ||
      rawArgs.includes('hack') ||
      rawArgs.includes('c:');

    if (isDestructive) {
      const fullCmd = args.length > 0 ? `delete ${args.join(' ')}` : 'delete system32';
      triggerAwSnapCrashPrank(ctx, fullCmd);

      return [
        {
          type: 'text',
          content: '⚠️ [CRITICAL ALERT] PERINTAH DESTRUKTIF DIDETEKSI!',
          class: 'error',
        },
        {
          type: 'text',
          content: 'PURGING: C:\\Windows\\System32\\ntoskrnl.exe...\nKERNEL_SECURITY_CHECK_FAILURE (0x00000139)\nCRITICAL_PROCESS_DIED... CRASHING BROWSER TAB...',
          class: 'error',
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
