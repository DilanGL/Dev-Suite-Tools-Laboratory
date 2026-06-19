export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type EditorTheme = 'dark-slate' | 'light-studio' | 'github-dark' | 'monokai';

export interface EditorThemeConfig {
  name: string;
  editorBg: string;
  editorText: string;
  lineNumbersBg: string;
  lineNumbersText: string;
  cursorColor: string;
}
