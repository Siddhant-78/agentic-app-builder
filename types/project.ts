export interface ProjectSummary {
  id: string;
  title: string | null;
  firstPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}
