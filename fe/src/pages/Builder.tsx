import { useEffect, useState, useRef } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import { Loader, Download, ChevronRight, MessageSquare, X, Minimize, Maximize } from 'lucide-react';
import { Step, File, TabData, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '@/steps';
import { useWebContainer } from '@/hooks/useWebContainer';
import { GradientOrbs } from '@/components/GradientOrbs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Resizable } from 're-resizable';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
type ChatMessage = {
  role: "user" | "system";
  content: string;
  timestamp: Date;
};

export const Builder: React.FC = () => {
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "system", content: string;}[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
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
  const [showChat, setShowChat] = useState(true);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState('25%');
  const [rightPanelWidth, setRightPanelWidth] = useState('75%');
  const [editorWidth, setEditorWidth] = useState('50%');
  const webcontainer = useWebContainer();

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // File structure handling
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
    });

    if (updateHappened) {
      setFiles(originalFiles);
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
      }));
    }
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
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    try {
      setLoading(true);
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
      });

      setSteps((s) => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
        ...x,
        status: "pending" as const
      }))]);

      setLlmMessages([...prompts, prompt].map(content => ({
        role: "user",
        content
      })));

      setLlmMessages(x => [...x, {role: "system", content: stepsResponse.data.response}]);
      
      // Add to chat messages
      setChatMessages([
        {
          role: "user",
          content: prompt,
          timestamp: new Date()
        },
        {
          role: "system",
          content: "I'm processing your request to create the project you described. You'll see the files and structures being created in real-time.",
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Error initializing:", err);
      setError(err instanceof Error ? err.message : "An error occurred during initialization");
    } finally {
      setLoading(false);
    }
  }

  // due to this backend call is done many times
  // this should have a dependency array to control the effect
  useEffect(() => {
    if (prompt) {
      init();
    }
  }, []);

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
      
      // Also update the file content
      const tabToUpdate = tabs.find(tab => tab.id === activeTab);
      if (tabToUpdate) {
        updateFileContent(tabToUpdate.title, content);
      }
    }
  };
  
  const updateFileContent = (fileName: string, content: string) => {
    const updateFileInStructure = (files: File[]): File[] => {
      return files.map(file => {
        if (file.type === 'file' && file.name === fileName) {
          return { ...file, content };
        } else if (file.type === 'folder' && file.children) {
          return { ...file, children: updateFileInStructure(file.children) };
        }
        return file;
      });
    };
    
    setFiles(updateFileInStructure(files));
  };

  const handleViewChange = async (view: 'code' | 'preview') => {
    if (view === activeView) return;
    
    setIsViewTransitioning(true);
    setActiveView(view);
    
    // Wait for the transition to complete
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsViewTransitioning(false);
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setHasSubmittedPrompt(true);
    const newMessage = {
      role: "user" as const,
      content: prompt
    };

    // Add to chat UI immediately
    setChatMessages(prev => [
      ...prev, 
      {
        role: "user",
        content: prompt,
        timestamp: new Date()
      }
    ]);

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

      // Add AI response to chat UI
      setChatMessages(prev => [
        ...prev,
        {
          role: "system",
          content: stepsResponse.data.response,
          timestamp: new Date()
        }
      ]);

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
      
      // Add error message to chat
      setChatMessages(prev => [
        ...prev,
        {
          role: "system",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };
  const downloadProject = async () => {
    const zip = new JSZip();
    
    const addFilesToZip = (files: File[], currentPath: string = '') => {
      files.forEach(file => {
        if (file.type === 'file') {
          // Remove leading slash if present
          const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
          zip.file(filePath, file.content || '');
        } else if (file.type === 'folder' && file.children) {
          const folderPath = currentPath ? `${currentPath}/${file.name}` : file.name;
          addFilesToZip(file.children, folderPath);
        }
      });
    };
    
    addFilesToZip(files);
    
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'project.zip');
      
      // Add download confirmation to chat
      setChatMessages(prev => [
        ...prev,
        {
          role: "system",
          content: "Project downloaded successfully as project.zip!",
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error("Error creating zip:", err);
      setError("Failed to create download. Please try again.");
    }
  };

  const toggleChatPanel = () => {
    setShowChat(!showChat);
  };

  const toggleChatMinimize = () => {
    setChatMinimized(!chatMinimized);
  };

  if (!prompt && !hasSubmittedPrompt) {
    return <Navigate to="/" replace />;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background via-background/95 to-background mt-11">
      {/* Top Bar with fixed height */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700 bg-gray-800 z-10">
        <h1 className="text-xl font-semibold text-white">Project Builder</h1>
        <div className="flex gap-2">
          <Button 
            onClick={downloadProject}
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download ZIP
          </Button>
          <Button
            onClick={toggleChatPanel}
            variant={showChat ? "default" : "outline"}
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            {showChat ? "Hide Chat" : "Show Chat"}
          </Button>
        </div>
      </div>

      {/* Main content area - fills remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <Resizable
          size={{ width: leftPanelWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            const newWidth = `calc(${leftPanelWidth} + ${d.width}px)`;
            setLeftPanelWidth(newWidth);
            setRightPanelWidth(`calc(100% - ${newWidth})`);
          }}
          enable={{ right: true }}
          minWidth="15%"
          maxWidth="40%"
          className="flex h-full border-r border-gray-700"
        >
          <div className="w-1/2 border-r border-gray-700 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-gray-800">
              <h3 className="font-medium text-white text-sm">Steps</h3>
            </div>
            <div className="overflow-auto flex-1">
              <StepsList steps={steps} currentStep="structure" />
            </div>
          </div>
          <div className="w-1/2 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-700 bg-gray-800">
              <h3 className="font-medium text-white text-sm">Files</h3>
            </div>
            <div className="overflow-auto flex-1">
              <FileExplorer
                files={files}
                onFileSelect={handleFileSelect}
                onToggleFolder={toggleFolder}
              />
            </div>
          </div>
        </Resizable>

        {/* Right panel */}
        <div className={`${rightPanelWidth} flex flex-col overflow-hidden`}>
          <div className="flex flex-1 overflow-hidden">
            {/* Code/Preview panel */}
            <Resizable
              size={{ width: editorWidth, height: '100%' }}
              onResizeStop={(e, direction, ref, d) => {
                setEditorWidth(`calc(${editorWidth} + ${d.width}px)`);
              }}
              enable={{ right: true }}
              minWidth="30%"
              maxWidth="95%"
              className="flex flex-col overflow-hidden"
            >
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
              <div className="flex-1 relative overflow-hidden">
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
            </Resizable>
            
            {/* Chat Panel */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: chatMinimized ? '48px' : '50%', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-l border-gray-700 bg-gray-900 flex flex-col overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800">
                    {!chatMinimized && <h3 className="font-medium text-white text-sm">Assistant Chat</h3>}
                    <div className="flex gap-2">
                      <button 
                        onClick={toggleChatMinimize} 
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        {chatMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
                      </button>
                      {!chatMinimized && (
                        <button 
                          onClick={toggleChatPanel} 
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {!chatMinimized && (
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.map((msg, index) => (
                          <div key={index} className={cn(
                            "flex gap-3 max-w-full",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}>
                            {msg.role === "system" && (
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">AI</span>
                              </div>
                            )}
                            <div className={cn(
                              "rounded-lg p-3 max-w-[80%]",
                              msg.role === "user" 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-800 text-gray-100"
                            )}>
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              <p className="text-xs mt-1 opacity-70 text-right">{formatTime(msg.timestamp)}</p>
                            </div>
                            {msg.role === "user" && (
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">You</span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      
                      <div className="p-3 border-t border-gray-700 bg-gray-800">
                        <form onSubmit={handlePromptSubmit} className="flex gap-2">
                          <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask me anything about the project..."
                            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                            disabled={isGenerating}
                          />
                          <Button
                            type="submit"
                            className="p-2"
                            disabled={isGenerating || !prompt.trim()}
                          >
                            {isGenerating ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Gradient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <GradientOrbs />
      </div>
      
      {/* Loading overlay */}
      {(loading || !templateSet) && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <h3 className="text-xl font-bold mb-2">Setting up your project</h3>
            <p className="text-gray-300">We're processing your request and setting up the project structure...</p>
          </div>
        </div>
      )}
    </div>
  );
};