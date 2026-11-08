// Self-host Martian Mono — Latin subset, specific weights
import '@fontsource/martian-mono/latin-400.css';
import '@fontsource/martian-mono/latin-500.css';
import '@fontsource/martian-mono/latin-700.css';
import '@fontsource/martian-mono/latin-800.css';

import './styles/tokens.css';
import './styles/terminal.css';

import { mountTerminal } from './terminal/terminal.js';

// Mount the terminal when the DOM is ready
const root = document.getElementById('terminal');
if (root) {
  mountTerminal(root);
}

