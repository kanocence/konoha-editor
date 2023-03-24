export interface EditorPanel {
  title: string;
  name?: string;
  content: string;
  language: string;
  options?: { [key: string]: any };
}[];

export type JsonConversionType = "2xml" | "2ts" | "2yaml" | "2url";
