export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface File {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: File[];
  isOpen?: boolean;
}

export interface TabData {
  id: string;
  title: string;
  content: string;
  language: string;
}