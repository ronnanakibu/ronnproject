import type { OutputBlock } from './types.js';

/**
 * Render an OutputBlock into a safe DOM element.
 * Never uses innerHTML with dynamic content.
 */
export function renderBlock(block: OutputBlock): HTMLElement {
  switch (block.type) {
    case 'text':
      return renderText(block.content, block.class);
    case 'list':
      return renderList(block.items);
    case 'link-list':
      return renderLinkList(block.items);
    case 'key-value':
      return renderKeyValue(block.rows);
    case 'project-list':
      return renderProjectList(block.projects, block.footer);
    case 'command-line':
      return renderCommandLine(block.input);
    case 'theme-switch':
      return renderThemeSwitch(block.current, block.options);
  }
}

function renderText(content: string, cls?: string): HTMLElement {
  const p = document.createElement('p');
  p.textContent = content;
  p.className = `output-text${cls ? ` ${cls}` : ''}`;
  return p;
}

function renderList(items: string[]): HTMLElement {
  const ul = document.createElement('ul');
  ul.className = 'output-list';
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  }
  return ul;
}

function renderLinkList(
  items: Array<{ label: string; url: string; external?: boolean }>
): HTMLElement {
  const ul = document.createElement('ul');
  ul.className = 'output-link-list';
  for (const item of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = item.label;
    a.href = item.url;
    if (item.external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    li.appendChild(a);
    ul.appendChild(li);
  }
  return ul;
}

function renderKeyValue(rows: Array<{ key: string; value: string }>): HTMLElement {
  const div = document.createElement('div');
  div.className = 'output-kv';
  for (const row of rows) {
    const rowEl = document.createElement('div');
    rowEl.className = 'output-kv-row';

    const key = document.createElement('span');
    key.className = 'output-kv-key';
    key.textContent = row.key;

    const val = document.createElement('span');
    val.className = 'output-kv-value';
    val.textContent = row.value;

    rowEl.appendChild(key);
    rowEl.appendChild(val);
    div.appendChild(rowEl);
  }
  return div;
}

function renderProjectList(
  projects: Array<{ slug: string; title: string; description: string }>,
  footer: string
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'output-projects';

  for (const project of projects) {
    const row = document.createElement('div');
    row.className = 'project-row';
    row.dataset['command'] = `open ${project.slug}`;
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `Buka project ${project.title}`);

    const nameEl = document.createElement('span');
    nameEl.className = 'project-name';
    nameEl.textContent = project.title;

    const descEl = document.createElement('span');
    descEl.className = 'project-desc';
    descEl.textContent = project.description;

    const openLink = document.createElement('button');
    openLink.className = 'project-open';
    openLink.textContent = `open ${project.slug}`;
    openLink.dataset['command'] = `open ${project.slug}`;
    openLink.type = 'button';
    openLink.tabIndex = -1; // Row is already focusable via tabIndex 0

    row.appendChild(nameEl);
    row.appendChild(descEl);
    row.appendChild(openLink);
    container.appendChild(row);
  }

  const footerEl = document.createElement('p');
  footerEl.className = 'output-text muted';
  footerEl.textContent = footer;
  container.appendChild(footerEl);

  return container;
}

function renderCommandLine(input: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'output-command-line';

  const prompt = document.createElement('span');
  prompt.className = 'prompt-text';
  prompt.textContent = 'ronn@project:~$ ';

  const cmd = document.createElement('span');
  cmd.className = 'command-text';
  cmd.textContent = input;

  div.appendChild(prompt);
  div.appendChild(cmd);
  return div;
}

function renderThemeSwitch(
  current: string,
  options: Array<{ name: string; command: string }>
): HTMLElement {
  const div = document.createElement('div');
  div.className = 'output-theme';

  const status = document.createElement('p');
  status.className = 'output-text';
  status.textContent = `tema saat ini: ${current}`;
  div.appendChild(status);

  const list = document.createElement('div');
  list.className = 'theme-options';
  for (const opt of options) {
    const btn = document.createElement('button');
    btn.className = 'theme-option';
    btn.textContent = opt.name;
    btn.dataset['command'] = opt.command;
    btn.type = 'button';
    list.appendChild(btn);
  }
  div.appendChild(list);

  return div;
}
