export interface Position {
  lineNumber: number;
  column: number;
}

export interface EditorInterface {
  getLineContent(lineNum: number): string;
  getPosition(): Position;
  getLineCount(): number;
  getSection(caretLineNumber: number): string[];
}
