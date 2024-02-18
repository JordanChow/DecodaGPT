export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export type ThreadType = {
  id: string;
  name: string;
  created_at: number;
  messages: any[];
};

export type MessageType = {
  role: string;
  content: string;
  thread_id?: string;
};
