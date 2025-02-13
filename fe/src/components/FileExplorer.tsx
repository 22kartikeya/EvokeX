import React from 'react';
import { File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import type { File as FileType } from '../types';

interface FileExplorerProps {
  files: FileType[];
  onFileSelect: (file: FileType) => void;
  onToggleFolder: (path: string[]) => void;
}

const FileExplorerItem: React.FC<{
  file: FileType;
  depth?: number;
  path: string[];
  onFileSelect: (file: FileType) => void;
  onToggleFolder: (path: string[]) => void;
}> = ({ file, depth = 0, path, onFileSelect, onToggleFolder }) => {
  const currentPath = [...path, file.name];
  
  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 cursor-pointer group"
        style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        onClick={() => file.type === 'folder' ? onToggleFolder(currentPath) : onFileSelect(file)}
      >
        {file.type === 'folder' && (
          <span className="text-gray-400">
            {file.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
        {file.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-400" />
        ) : (
          <File className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm text-gray-300 group-hover:text-white">{file.name}</span>
      </div>
      {file.type === 'folder' && file.isOpen && file.children?.map((child, index) => (
        <FileExplorerItem
          key={index}
          file={child}
          depth={depth + 1}
          path={currentPath}
          onFileSelect={onFileSelect}
          onToggleFolder={onToggleFolder}
        />
      ))}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({ files, onFileSelect, onToggleFolder }) => {
  return (
    <div className="h-full bg-gray-800 border-l border-gray-700">
      <div className="p-4 border-b border-gray-700 bg-gray-800">
        <h2 className="font-semibold text-gray-200">Files</h2>
      </div>
      <div className="overflow-y-auto">
        {files.map((file, index) => (
          <FileExplorerItem
            key={index}
            file={file}
            path={[]}
            onFileSelect={onFileSelect}
            onToggleFolder={onToggleFolder}
          />
        ))}
      </div>
    </div>
  );
};