import {useEffect, useState }from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Loader } from 'lucide-react';
import { Step, File, TabData, StepType} from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '@/steps';
import { useWebContainer } from '@/hooks/useWebContainer';

const getFileLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
};

export const Builder: React.FC = () => {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "system", content: string;}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [hasSubmittedPrompt, setHasSubmittedPrompt] = useState(!!location.state?.prompt);
  const webcontainer = useWebContainer()


  // structure for steps:
  /* {
      id: 'analyze',
      title: 'Analyzing Requirements',
      description: 'Processing your request and planning the website structure',
      status: 'completed'
    },
    {
      id: 'structure',
      title: 'Creating Structure',
      description: 'Setting up project files and dependencies',
      status: 'in-progress'
    },
    {
      id: 'components',
      title: 'Building Components',
      description: 'Generating React components and styles',
      status: 'pending'
    },
    {
      id: 'assets',
      title: 'Adding Assets',
      description: 'Including images, icons, and other resources',
      status: 'pending'
    },
    {
      id: 'final',
      title: 'Final Setup',
      description: 'Finalizing configurations and optimizations',
      status: 'pending'
    }
    */


    /*
    {
      name: 'src',
      type: 'folder',
      path: '/src',
      isOpen: true,
      children: [
        {
          name: 'components',
          type: 'folder',
          path: '/src/components',
          isOpen: false,
          children: [
            {
              name: 'Header.tsx',
              type: 'file',
              path: '/src/components/Header.tsx',
              content: 'export const Header = () => {\n  return <div>Header</div>;\n};'
            },
            {
              name: 'Footer.tsx',
              type: 'file',
              path: '/src/components/Footer.tsx',
              content: 'export const Footer = () => {\n  return <div>Footer</div>;\n};'
            }
          ]
        },
        {
          name: 'App.tsx',
          type: 'file',
          path: '/src/App.tsx',
          content: 'function App() {\n  return <div>Hello World</div>;\n}\n\nexport default App;'
        },
        {
          name: 'index.tsx',
          type: 'file',
          path: '/src/index.tsx',
          content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));'
        }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      path: '/public',
      isOpen: false,
      children: [
        {
          name: 'index.html',
          type: 'file',
          path: '/public/index.html',
          content: '<!DOCTYPE html>\n<html>\n  <head>\n    <title>My App</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>'
        }
      ]
    },
    {
      name: 'package.json',
      type: 'file',
      path: '/package.json',
      content: '{\n  "name": "my-app",\n  "version": "1.0.0"\n}'
    }
    */

  // ugly file structure need to be improved and also optimised
  // everytime steps or files changes it will run
  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? []; // ["src", "components", "App.tsx"]
        let currentFileStructure = [...originalFiles]; // {}
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
        
      }))
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: File[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: File, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init(){
    const response = await axios.post(`${BACKEND_URL}/mistral/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    const { prompts, uiPrompts } = response.data as any;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    const stepsResponse = await axios.post(`${BACKEND_URL}/mistral/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setSteps((s) => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as const
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "system", content: stepsResponse.data.response}]);
  }

  useEffect(() => {
    init();
  },[])

  const toggleFolder = (path: string[]) => {
    const updateFiles = (files: File[], currentPath: string[]): File[] => {
      return files.map(file => {
        if (file.name === currentPath[0]) {
          if (currentPath.length === 1) {
            return { ...file, isOpen: !file.isOpen };
          }
          return {
            ...file,
            children: file.children ? updateFiles(file.children, currentPath.slice(1)) : undefined
          };
        }
        return file;
      });
    };
    setFiles(updateFiles(files, path));
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'file') {
      const existingTab = tabs.find(tab => tab.title === file.name);
      const tabId = existingTab?.id || `${file.name}-${Date.now()}`;
      
      if (!existingTab) {
        setTabs(prev => [
          ...prev,
          {
            id: tabId,
            title: file.name,
            content: file.content || '',
            language: getFileLanguage(file.name)
          }
        ]);
      }
      
      setActiveTab(tabId);
      setActiveView('code');
    }
  };

  const handleTabClose = (id: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== id);
      if (activeTab === id) {
        setActiveTab(newTabs[0]?.id || null);
      }
      return newTabs;
    });
  };

  const handleContentChange = (content: string) => {
    if (activeTab) {
      setTabs(prev => 
        prev.map(tab =>
          tab.id === activeTab ? { ...tab, content } : tab
        )
      );
    }
  };

  const handleViewChange = async (view: 'code' | 'preview') => {
    if (view === activeView) return;
    
    setIsViewTransitioning(true);
    setActiveView(view);
    
    // Wait for the transition to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsViewTransitioning(false);
  };

  // const handlePromptSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!prompt.trim() || isGenerating) return;

  //   try {
  //     setIsGenerating(true);
  //     setError(null);
      
  //     // TODO: Implement the actual generation logic here
  //     await new Promise(resolve => setTimeout(resolve, 2000));
      
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An error occurred');
  //   } finally {
  //     setIsGenerating(false);
  //   }
  // };

  const handlePromptSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setHasSubmittedPrompt(true);
  const newMessage = {
    role: "user" as const,
    content: prompt
  };

  try {
    setIsGenerating(true);
    setError(null);

    // Send request to backend with existing messages and project context
    const stepsResponse = await axios.post(`${BACKEND_URL}/mistral/chat`, {
      messages: [...llmMessages, newMessage],
    });

    // Update messages list
    setLlmMessages(prev => [...prev, newMessage, {
      role: "system",
      content: stepsResponse.data.response
    }]);

    // Parse and update steps
    setSteps(prev => [
      ...prev,
      ...parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as const
      }))
    ]);

    // Clear prompt box
    setPrompt("");

  } catch (err) {
    console.error("Error sending prompt:", err);
    setError(err instanceof Error ? err.message : "An error occurred");
  } finally {
    setIsGenerating(false);
  }
};

  if (!prompt && !hasSubmittedPrompt) {
  return <Navigate to="/" replace />;
}

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="flex-1 flex">
        <div className="w-1/4 border-r border-gray-700">
          <StepsList steps={steps} currentStep="structure" />
        </div>
        <div className="w-1/4 border-r border-gray-700">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onToggleFolder={toggleFolder}
          />
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="flex border-b border-gray-700 bg-gray-800">
            <button
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeView === 'code'
                  ? 'text-white bg-gray-900 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => handleViewChange('code')}
              disabled={isViewTransitioning}
            >
              Code
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeView === 'preview'
                  ? 'text-white bg-gray-900 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => handleViewChange('preview')}
              disabled={isViewTransitioning}
            >
              Preview
            </button>
          </div>
          <div className="flex-1 relative">
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                activeView === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <CodeEditor
                tabs={tabs}
                activeTab={activeTab}
                onTabClose={handleTabClose}
                onTabSelect={setActiveTab}
                onContentChange={handleContentChange}
              />
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                activeView === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <PreviewFrame
                webContainer={webcontainer} files={files}
              />
            </div>
          </div>
        </div>
      </div>
      {(loading || !templateSet)}
      {!(loading || !templateSet) &&
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handlePromptSubmit} className="flex gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={isGenerating}
          />
          <button
  type="submit"
  className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2
    ${isGenerating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}`}
  disabled={isGenerating}
>
  {isGenerating && <Loader className="w-4 h-4 animate-spin" />}
  {isGenerating ? 'Generating...' : 'Generate'}
</button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-red-400">{error}</p>
        )}
      </div>
}
    </div>
  );
};