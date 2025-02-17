import React from 'react';
import Editor from '@monaco-editor/react';
import { X } from 'lucide-react';
import type { TabData } from '../types';

interface CodeEditorProps {
  tabs: TabData[];
  activeTab: string | null;
  onTabClose: (id: string) => void;
  onTabSelect: (id: string) => void;
  onContentChange: (content: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  tabs,
  activeTab,
  onTabClose,
  onTabSelect,
  onContentChange,
}) => {
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex border-b border-gray-700 bg-gray-800">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-2 cursor-pointer ${
              activeTab === tab.id ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="text-sm">{tab.title}</span>
            <button
              className="p-1 hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex-1">
        {activeTabData ? (
          <Editor
            height="100%"
            defaultLanguage={activeTabData.language}
            value={activeTabData.content}
            theme="vs-dark"
            onChange={(value) => onContentChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              padding: { top: 20 },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a file to edit
          </div>
        )}
      </div>
    </div>
  );
};