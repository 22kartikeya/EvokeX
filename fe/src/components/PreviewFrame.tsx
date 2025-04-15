import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bootingRef = useRef(false); // 🔒 prevent duplicate boots

  async function bootAndRunDevServer(retry = false) {
    
    if (bootingRef.current) return;
    bootingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // Optional: Check if server is already running
      const installProcess = await webContainer.spawn('npm', ['install']);
      await installProcess.exit;

      const devServer = await webContainer.spawn('npm', ['run', 'dev']);
      devServer.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log(data);
          }
        })
      );

      // 🕐 Fallback if "server-ready" not triggered
      const timeout = setTimeout(() => {
        if (!url && !retry) {
          console.warn('Timeout. Retrying dev server...');
          bootingRef.current = false;
          bootAndRunDevServer(true); // Retry once
        }
      }, 15000); // 15s timeout

      webContainer.on('server-ready', (port, serverUrl) => {
        console.log('Dev server running at:', serverUrl);
        clearTimeout(timeout);
        setUrl(serverUrl);
        setLoading(false);
        bootingRef.current = false;
      });
    } catch (err: any) {
      console.error('Boot error:', err);
      setError('Failed to start dev server');
      setLoading(false);
      bootingRef.current = false;
    }
  }

  useEffect(() => {
    bootAndRunDevServer();
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
        <h2 className="font-semibold text-gray-200">Preview</h2>
        <button
          onClick={() => !loading && bootAndRunDevServer()}
          disabled={loading}
          className={`p-2 rounded-lg ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'
          } text-gray-400 hover:text-white`}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white relative">
        {loading || !url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white text-gray-500">
            {error ? (
              <div>
                <p>{error}</p>
                <button
                  onClick={() => bootAndRunDevServer()}
                  className="mt-2 text-blue-600 underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <p>Starting preview...</p>
            )}
          </div>
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}