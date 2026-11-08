const MAX_HISTORY = 50;

export class History {
  private entries: string[] = [];
  private cursor = -1;
  private draft = '';

  push(entry: string): void {
    // Don't add duplicates of the most recent entry
    if (this.entries.length > 0 && this.entries[this.entries.length - 1] === entry) {
      this.reset();
      return;
    }

    this.entries.push(entry);

    // Cap at MAX_HISTORY
    if (this.entries.length > MAX_HISTORY) {
      this.entries.shift();
    }

    this.reset();
  }

  /**
   * Navigate up (older). Returns the entry to display, or null if at the end.
   */
  up(currentInput: string): string | null {
    if (this.entries.length === 0) return null;

    // Save draft on first up press
    if (this.cursor === -1) {
      this.draft = currentInput;
    }

    if (this.cursor < this.entries.length - 1) {
      this.cursor++;
    }

    return this.entries[this.entries.length - 1 - this.cursor] ?? null;
  }

  /**
   * Navigate down (newer). Returns the entry to display, or the draft if back to bottom.
   */
  down(): string | null {
    if (this.cursor <= 0) {
      this.cursor = -1;
      return this.draft;
    }

    this.cursor--;
    return this.entries[this.entries.length - 1 - this.cursor] ?? null;
  }

  reset(): void {
    this.cursor = -1;
    this.draft = '';
  }

  getEntries(): readonly string[] {
    return this.entries;
  }

  get size(): number {
    return this.entries.length;
  }
}

