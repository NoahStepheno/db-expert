export enum Sender {
  USER = 'USER',
  AI = 'AI'
}

export enum ModelType {
  EXPERT = 'gemini-3-pro-preview',
  FAST = 'gemini-2.5-flash'
}

export interface Message {
  id: string;
  sender: Sender;
  content: string;
  timestamp: number;
  isThinking?: boolean;
  modelUsed?: ModelType;
  attachments?: Attachment[];
}

export interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

export interface ProjectDocument {
  id: string;
  title: string;
  content: string;
  lastUpdated: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  messages: Message[];
  documents: ProjectDocument[];
  schemaCode: string; // Stores Mermaid or DDL code
}

export enum DDDConcept {
  BOUNDED_CONTEXT = 'Bounded Context',
  AGGREGATE = 'Aggregate',
  ENTITY = 'Entity',
  VALUE_OBJECT = 'Value Object'
}

export type ViewMode = 'chat' | 'docs' | 'schema';
