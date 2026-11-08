// === Types ===

export interface OutputText {
  type: 'text';
  content: string;
  class?: string;
}

export interface OutputList {
  type: 'list';
  items: string[];
}

export interface OutputLinkList {
  type: 'link-list';
  items: Array<{ label: string; url: string; external?: boolean }>;
}

export interface OutputKeyValue {
  type: 'key-value';
  rows: Array<{ key: string; value: string }>;
}

export interface OutputProjectList {
  type: 'project-list';
  projects: Array<{
    slug: string;
    title: string;
    description: string;
  }>;
  footer: string;
}

export interface OutputCommandLine {
  type: 'command-line';
  input: string;
}

export interface OutputThemeSwitch {
  type: 'theme-switch';
  current: string;
  options: Array<{ name: string; command: string }>;
}

export type OutputBlock =
  | OutputText
  | OutputList
  | OutputLinkList
  | OutputKeyValue
  | OutputProjectList
  | OutputCommandLine
  | OutputThemeSwitch;

export interface Context {
  getTheme(): string;
  setTheme(name: string): void;
  clearOutput(): void;
  print(blocks: OutputBlock | OutputBlock[]): void;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  complete?: (partial: string) => string[];
  run(ctx: Context, args: string[]): OutputBlock | OutputBlock[] | void;
}

