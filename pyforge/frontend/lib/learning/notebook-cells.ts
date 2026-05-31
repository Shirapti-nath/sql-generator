export interface NotebookCell {
  index: number;
  source: string;
  isMarkdown: boolean;
}

const CELL_MARKER = /^\s*#\s*%%\s*(.*)$/;

export function splitNotebookCells(code: string): NotebookCell[] {
  const lines = code.split("\n");
  const cells: NotebookCell[] = [];
  let current: string[] = [];
  let cellIndex = 0;
  let isMarkdown = false;

  const flush = () => {
    if (current.length > 0 || cells.length === 0) {
      cells.push({
        index: cellIndex++,
        source: current.join("\n").trimEnd(),
        isMarkdown,
      });
    }
    current = [];
  };

  for (const line of lines) {
    const match = line.match(CELL_MARKER);
    if (match) {
      flush();
      const tag = (match[1] || "").trim().toLowerCase();
      isMarkdown = tag === "md" || tag === "markdown";
      continue;
    }
    current.push(line);
  }
  flush();

  return cells.filter((c) => c.source.length > 0 || cells.length === 1);
}

export function hasNotebookMarkers(code: string): boolean {
  return CELL_MARKER.test(code);
}
