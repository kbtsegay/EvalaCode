// A fully functional Python editor with Pyodide in-browser execution.
// Built with Next.js, TailwindCSS v4 (no init), TypeScript, and Monaco editor.
// Ensure Tailwind v4 is installed and configured in your app.
'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { getPyodide, PyodideInterface } from '../utils/pyodideLoader';
import MarkdownRenderer from '../components/MarkdownRenderer';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function HomePage() {
  const [showEditor, setShowEditor] = useState(false);

  if (!showEditor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-zinc-900 to-zinc-700 text-white p-4">
        <h1 className="text-5xl font-extrabold mb-6 text-center leading-tight">
          Welcome to <span className="text-blue-400">EvalaCode</span>
        </h1>
        <p className="text-xl text-center mb-10 max-w-2xl opacity-90">
          Write, run, and experiment with Python code directly in your browser. No setup required, just pure coding.
        </p>
        <button
          onClick={() => setShowEditor(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Start Coding
        </button>
      </div>
    );
  }

  return <PythonEditorContent />;
}

function PythonEditorContent() {
  const [output, setOutput] = useState<string>('');
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [packageName, setPackageName] = useState<string>('');
  const editorRef = useRef<any>(null);
  const [consoleHeight, setConsoleHeight] = useState<number>(350); // Initial height for the console
  const [isResizing, setIsResizing] = useState<boolean>(false); // For vertical resizing
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const initialConsoleHeight = useRef<number>(200);
  const initialMouseY = useRef<number>(0);

  const [leftWidth, setLeftWidth] = useState(40); // Initial width for the left section (in percentage)
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false); // For horizontal resizing
  const initialMouseX = useRef(0);
  const initialLeftWidth = useRef(0);

  const [difficulty, setDifficulty] = useState('Easy'); // State for selected difficulty
  const [generatedQuestion, setGeneratedQuestion] = useState('Choose a difficulty and click "Reveal Problem" when you’re ready.');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false); // New state for loading animation
  // Initialize Pyodide
  useEffect(() => {
    const loadAndSetPyodide = async () => {
      try {
        const pyodideModule = await getPyodide();
        setPyodide(pyodideModule);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setOutput("Failed to load Pyodide. Please check your network connection.");
      }
    };
    loadAndSetPyodide();
  }, []);

  // Handle resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing || !editorContainerRef.current || !consoleRef.current) return;

      const deltaY = initialMouseY.current - e.clientY;
      const newConsoleHeight = initialConsoleHeight.current + deltaY;

      // Ensure console height doesn't go below a minimum or above a maximum
      const minHeight = 50;
      const totalHeight = editorContainerRef.current.parentElement?.clientHeight || window.innerHeight;
      const maxHeight = totalHeight - 50; // Leave some space for the editor

      setConsoleHeight(Math.min(Math.max(newConsoleHeight, minHeight), maxHeight));
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    if (isResizing) {
      document.body.style.cursor = 'ns-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing]);

  // Handle horizontal resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isHorizontalResizing) return;

      const containerWidth = document.documentElement.clientWidth;
      const deltaX = e.clientX - initialMouseX.current;
      const newLeftWidthPx = (initialLeftWidth.current / 100) * containerWidth + deltaX;
      const newLeftWidth = (newLeftWidthPx / containerWidth) * 100;

      // Calculate the minimum width for the right panel in pixels
      // This is an estimate; actual value might need fine-tuning based on content
      const minRightPanelWidthPx = 500; // Example: 500px minimum for the right panel

      // Convert minRightPanelWidthPx to a percentage of the container width
      const minRightPanelWidthPercent = (minRightPanelWidthPx / containerWidth) * 100;

      // The left panel's maximum width is 100% minus the minimum width of the right panel
      const maxLeftWidth = 100 - minRightPanelWidthPercent;

      // Ensure leftWidth stays within reasonable bounds (e.g., 10% to maxLeftWidth)
      setLeftWidth(Math.min(Math.max(newLeftWidth, 10), maxLeftWidth));
    };

    const onMouseUp = () => {
      setIsHorizontalResizing(false);
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    if (isHorizontalResizing) {
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isHorizontalResizing]);

  const onMouseDownResizer = (e: React.MouseEvent) => {
    setIsResizing(true);
    initialMouseY.current = e.clientY;
    initialConsoleHeight.current = consoleHeight;
    e.preventDefault(); // Prevent text selection during drag
  };

  const onMouseDownHorizontalResizer = (e: React.MouseEvent) => {
    setIsHorizontalResizing(true);
    initialMouseX.current = e.clientX;
    initialLeftWidth.current = leftWidth;
    e.preventDefault(); // Prevent text selection during drag
  };

  const runCode = async () => {
    if (!pyodide) return;
    const code = editorRef.current?.getValue();
    try {
      let stdout = '';
      pyodide.setStdout({ batched: (s: string) => {
        stdout += s;
        if (!s.endsWith('\n')) {
          stdout += '\n';
        }
      }});
      // Set PYTHONUNBUFFERED to 1 to force stdout flushing
      pyodide.runPython('import os; os.environ["PYTHONUNBUFFERED"] = "1"');
      await pyodide.runPythonAsync(code);
      setOutput(stdout);
    } catch (e: unknown) {
      setOutput(e instanceof Error ? e.toString() : String(e));
    }
  };

  const installPackage = async () => {
    if (!pyodide || !packageName.trim()) return;
    try {
      setOutput(`Installing package: ${packageName}...`);
      await pyodide.runPythonAsync(`import micropip\nawait micropip.install('${packageName}')`);
      setOutput(`Package '${packageName}' installed successfully.`);
      setPackageName('');
    } catch (e: unknown) {
      setOutput(`Error installing '${packageName}':\n` + (e instanceof Error ? e.toString() : String(e)));
    }
  };

  return (
    <div className="flex h-screen bg-zinc-900 text-white relative">
      {/* Left Section: Text-based content */}
      <div className="p-6 flex flex-col overflow-y-auto border-r border-zinc-700" style={{ width: `${leftWidth}%` }}>
        <h2 className="text-3xl font-bold mb-4 text-blue-400">EvalaCode Drills</h2>
        <div className="mb-6">
          <label htmlFor="difficulty-select" className="block text-zinc-300 text-lg font-semibold mb-2">Select Difficulty:</label>
          <div className="relative">
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-zinc-700 text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <button
            onClick={async () => {
              setIsLoadingQuestion(true); // Start loading
              setGeneratedQuestion('Retrieving question...'); // Optional: show a message
              const timeoutMs = 30000; // 30 seconds timeout
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

              try {
                const response = await fetch('/api/generate-question', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ difficulty }),
                  signal: controller.signal // Attach the signal to the fetch request
                });

                clearTimeout(timeoutId); // Clear the timeout if the fetch completes in time

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || 'Failed to generate question.');
                }

                const data = await response.json();
                setGeneratedQuestion(data.question);
              } catch (error: unknown) {
                clearTimeout(timeoutId); // Ensure timeout is cleared even on error
                if (error instanceof Error && error.name === 'AbortError') {
                  setGeneratedQuestion('Error: Request timed out. Please try again.');
                } else {
                  console.error('Error generating question:', error);
                  setGeneratedQuestion(`Error: ${error instanceof Error ? error.message : 'Failed to generate question. Please try again.'}`);
                }
              } finally {
                setIsLoadingQuestion(false); // End loading
              }
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 w-full"
            disabled={isLoadingQuestion} // Disable button while loading
          >
            {isLoadingQuestion ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : (
              'Reveal Problem'
            )}
          </button>
        </div>
        <div className="bg-zinc-800 p-4 rounded-lg text-zinc-200 text-sm flex-grow overflow-y-auto">
          {isLoadingQuestion && generatedQuestion === 'Retrieving question...' ? (
            <div className="flex items-center justify-center h-full">
              <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="ml-3 text-blue-400">Loading problem...</p>
            </div>
          ) : (
            <MarkdownRenderer markdown={generatedQuestion} />
          )}
        </div>
      </div>

      {/* Horizontal Resizer */}
      <div
        className="w-2 h-full bg-zinc-700 cursor-ew-resize flex items-center justify-center group"
        onMouseDown={onMouseDownHorizontalResizer}
      >
        <div className="h-16 w-1 bg-zinc-500 rounded-sm group-hover:bg-zinc-400 transition-colors duration-200"></div>
      </div>

      {/* Right Section: Code Editor and Output Console */}
      <div className="flex flex-col min-w-[500px]" style={{ width: `${100 - leftWidth}%` }}>
        <div ref={editorContainerRef} className="flex-1 flex flex-col overflow-hidden" style={{ height: `calc(100% - ${consoleHeight}px)` }}>
          <MonacoEditor
            height="100%"
            defaultLanguage="python"
            defaultValue={`# Welcome to EvalaCode!
# Edit the code below and press "Run" to see the output.

def greeting(name="Coder"):
    print(f"👋 Hello, {name}!")
    print("✨ You're now coding in your browser with EvalaCode.")
    print("💡 Try changing the function or adding your own!")

# Call the function with a custom name
greeting("EvalaCoder")`}
            onMount={(editor) => (editorRef.current = editor)}
            theme="vs-dark"
          />
        </div>
        <div
          className="w-full h-2 bg-zinc-700 cursor-ns-resize flex items-center justify-center group"
          onMouseDown={onMouseDownResizer}
        >
          <div className="w-16 h-1 bg-zinc-500 rounded-sm group-hover:bg-zinc-400 transition-colors duration-200"></div>
        </div>
        <div
          ref={consoleRef}
          className="bg-zinc-800 p-4 space-y-4 overflow-y-auto"
          style={{ height: `${consoleHeight}px` }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={runCode}
              className="run-code-button bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-white font-bold flex-shrink-0 cursor-pointer transform transition duration-300 ease-in-out hover:scale-105"
            >
              Run Code
            </button>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Package name (e.g., numpy)"
              className="package-input-field bg-zinc-700 text-white px-3 py-2 rounded flex-grow"
            />
            <button
              onClick={installPackage}
              className="install-package-button bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-white font-bold min-w-max flex-shrink-0 cursor-pointer transform transition duration-300 ease-in-out hover:scale-105"
            >
              Install Packages
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-green-300">{output}</pre>
        </div>
      </div>
    </div>
  );
}
