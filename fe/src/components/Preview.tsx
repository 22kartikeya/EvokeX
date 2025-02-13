import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PreviewProps {
  html: string;
  onRefresh: () => void;
}

export const Preview: React.FC<PreviewProps> = ({ html, onRefresh }) => {
  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
        <h2 className="font-semibold text-gray-200">Preview</h2>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 bg-white">
        <iframe
          srcDoc={html}
          className="w-full h-full border-none"
          title="Preview"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};