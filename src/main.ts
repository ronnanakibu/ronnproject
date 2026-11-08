// Self-host Martian Mono & Press Start 2P
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-700.css';
import '@fontsource/martian-mono/latin-800.css';
import '@fontsource/press-start-2p/latin-400.css';

import './styles/tokens.css';
import './styles/terminal.css';

import { mountTerminal } from './terminal/terminal.js';

// Mount the terminal when the DOM is ready
const root = document.getElementById('terminal');
if (root) {
  mountTerminal(root);
}
