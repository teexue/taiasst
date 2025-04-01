export interface LocalTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  type: "local";
  category: string;
  tags: string[];
  version: string;
  author: string;
  enabled: boolean;
}

export interface LocalToolConfig {
  tools: LocalTool[];
}
