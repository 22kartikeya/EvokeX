export enum StepType{
  CreateFile,
  CreateFolder,
  EditFile,
  DeleteFile,
  RunScript
}


// Todo change path available types
export interface Step {
  id: number;
  title: string;
  description: string;
  type: StepType;
  status: 'pending' | 'in-progress' | 'completed';
  code?: string;
  path?: string; // path is not needed when StepType is of type RunScript
}

export interface File {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: File[];
  path: string;
  isOpen?: boolean;
}

export interface TabData {
  id: string;
  title: string;
  content: string;
  language: string;
}