import type { Context, OutputBlock } from './types.js';
import { parseCommand } from './parser.js';
import { History } from './history.js';
import { complete } from './complete.js';
import { renderBlock } from './render.js';
import { ScreensaverEngine } from './screensaver.js';
import { soundFx } from './audio.js';
import { getCommand, getCommandMap, getCommandNames } from '../commands/index.js';

const VALID_THEMES = ['paper', 'ember', 'matrix'] as const;
type ThemeName = (typeof VALID_THEMES)[number];

function isValidTheme(name: string): name is ThemeName {
  return (VALID_THEMES as readonly string[]).includes(name);
}

/**
 * Read the theme from localStorage, validated against allowed values.
 */
function readSavedTheme(): ThemeName | null {
  try {
    const saved = localStorage.getItem('theme');
    if (saved && isValidTheme(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be disabled or restricted
  }
  return null;
}

/**
 * Write the theme to localStorage safely.
 */
function saveTheme(theme: string): void {
  try {
    if (isValidTheme(theme)) {
      localStorage.setItem('theme', theme);
    }
  } catch {
    // ignore quota/security errors
  }
}

/**
 * Detect if device is touch-based.
 */
function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Mount and run the terminal UI.
 */
export function mountTerminal(root: HTMLElement): void {
  const history = new History();
  const commandMap = getCommandMap();
  const commandNames = getCommandNames().filter((name) => !getCommand(name)?.hidden);
  const screensaver = new ScreensaverEngine(15); // 15s idle timer

  // === Query DOM elements ===
  const terminalBody = root.querySelector<HTMLElement>('.terminal-body');
  const outputArea = root.querySelector<HTMLElement>('.output-area');
  const inputEl = root.querySelector<HTMLInputElement>('.terminal-input');
  const chipBar = root.querySelector<HTMLElement>('.chip-bar');
  const liveRegion = root.querySelector<HTMLElement>('.sr-live');

  if (!terminalBody || !outputArea || !inputEl) {
    throw new Error('Terminal DOM structure missing required elements');
  }

  // === Helper: scroll output into view ===
  function scrollToBottom(): void {
    terminalBody!.scrollTop = terminalBody!.scrollHeight;
  }

  // === Context for commands ===
  const ctx: Context = {
    getTheme(): string {
      return document.documentElement.dataset['theme'] ?? 'paper';
    },

    setTheme(name: string): void {
      if (isValidTheme(name)) {
        document.documentElement.dataset['theme'] = name;
        saveTheme(name);
      }
    },

    clearOutput(): void {
      while (outputArea.firstChild) {
        outputArea.removeChild(outputArea.firstChild);
      }
      scrollToBottom();
    },

    print(blocks: OutputBlock | OutputBlock[]): void {
      const arr = Array.isArray(blocks) ? blocks : [blocks];
      const fragment = document.createDocumentFragment();

      for (const block of arr) {
        const el = renderBlock(block);
        fragment.appendChild(el);

        // Announce text to screen readers
        if (liveRegion && block.type === 'text') {
          const announcement = document.createElement('p');
          announcement.textContent = block.content;
          liveRegion.appendChild(announcement);
        }
      }

      outputArea.appendChild(fragment);
      scrollToBottom();
    },

    startScreensaver(): void {
      screensaver.start();
    },
  };

  // === Execute a command string ===
  function executeCommand(input: string): void {
    screensaver.resetIdleTimer();
    const parsed = parseCommand(input);
    if (!parsed) return;

    // Add the command line to output
    ctx.print({ type: 'command-line', input: parsed.raw });

    // Add to history
    history.push(parsed.raw);

    // Look up the command
    const cmd = getCommand(parsed.name);
    if (!cmd) {
      soundFx.playError();
      ctx.print({
        type: 'text',
        content: `perintah "${parsed.name}" tidak ada. Ketik help untuk daftar perintah.`,
        class: 'error',
      });
      return;
    }

    soundFx.playEnter();

    // Run the command
    const result = cmd.run(ctx, parsed.args);
    if (result) {
      ctx.print(result);
    }
  }

  // === Wire up interactive elements in output area (project rows, theme options) ===
  outputArea.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-command]');
    if (target) {
      e.preventDefault();
      const command = target.dataset['command'];
      if (command) {
        executeCommand(command);
        if (!isTouchDevice()) {
          inputEl.focus();
        }
      }
    }
  });

  outputArea.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = (e.target as HTMLElement).closest<HTMLElement>('[data-command]');
      if (target && target.tagName !== 'INPUT') {
        e.preventDefault();
        const command = target.dataset['command'];
        if (command) {
          executeCommand(command);
          if (!isTouchDevice()) {
            inputEl.focus();
          }
        }
      }
    }
  });

  // === Input handling ===
  inputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    // Play retro typing click for standard characters
    if (e.key.length === 1 || e.key === 'Backspace') {
      soundFx.playKeypress();
    }

    switch (e.key) {
      case 'Enter': {
        const value = inputEl.value;
        inputEl.value = '';
        executeCommand(value);
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prev = history.up(inputEl.value);
        if (prev !== null) {
          inputEl.value = prev;
        }
        break;
      }

      case 'ArrowDown': {
        e.preventDefault();
        const next = history.down();
        if (next !== null) {
          inputEl.value = next;
        }
        break;
      }

      case 'Tab': {
        e.preventDefault();
        const currentInput = inputEl.value;
        const matches = complete(currentInput, commandMap, commandNames);

        if (matches.length === 1) {
          // Single match: complete it
          const spaceIndex = currentInput.indexOf(' ');
          if (spaceIndex !== -1) {
            // Completing an argument
            const prefix = currentInput.slice(0, spaceIndex + 1);
            inputEl.value = prefix + matches[0]!;
          } else {
            inputEl.value = matches[0]! + ' ';
          }
        } else if (matches.length > 1) {
          // Multiple matches: show them
          ctx.print({
            type: 'text',
            content: matches.join('  '),
            class: 'completion-list',
          });
        }
        break;
      }

      case 'Escape': {
        inputEl.value = '';
        history.reset();
        break;
      }
    }
  });

  // === Chip handling ===
  chipBar?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>('.chip');
    if (target) {
      const command = target.dataset['command'];
      if (command) {
        executeCommand(command);
        // Do not auto-focus on touch devices (avoids virtual keyboard popping up)
        if (!isTouchDevice()) {
          inputEl.focus();
        }
      }
    }
  });

  // === Keep focus on input on desktop click ===
  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // Don't steal focus if clicking on a link, button, or input
    if (
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.closest('a, button, [tabindex="0"]')
    ) {
      return;
    }
    if (!isTouchDevice()) {
      inputEl.focus();
    }
  });

  // === Konami Code Easter Egg (↑ ↑ ↓ ↓ ← → ← → B A) ===
  const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const key = e.key.toLowerCase() === 'b' ? 'b' : e.key.toLowerCase() === 'a' ? 'a' : e.key;
    if (key === konamiSequence[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        soundFx.playPowerUp();
        ctx.setTheme('matrix');

        ctx.print([
          {
            type: 'text',
            content: '🎮 [KONAMI CODE ACCEPTED!]',
            class: 'prompt-text',
          },
          {
            type: 'text',
            content: '⚡ 99 LIVES & GOD MODE ACTIVATED!\n🔓 Secret Theme "matrix" Berhasil Dibuka!',
            class: 'prompt-text',
          },
        ]);
      }
    } else {
      // If mismatch, reset unless it happens to be the start of sequence
      konamiIndex = (key === konamiSequence[0]) ? 1 : 0;
    }
  });

  // === Restore saved theme if present ===
  const saved = readSavedTheme();
  if (saved) {
    document.documentElement.dataset['theme'] = saved;
  }

  // Initial focus on desktop
  if (!isTouchDevice()) {
    inputEl.focus();
  }
}
