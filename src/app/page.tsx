
// A fully functional Python editor with Pyodide in-browser execution.
// Built with Next.js, TailwindCSS v4 (no init), TypeScript, and Monaco editor.
// Ensure Tailwind v4 is installed and configured in your app.
'use client';

import { useRef, useState, useEffect } from 'react';
import { ArrowRight, FileCode, GripVertical, GripHorizontal } from 'lucide-react';
import { usePyodideWorker } from '../hooks/usePyodideWorker';
import { generateTestRunnerScript, TestCase } from '../utils/pythonUtils';
import * as monaco from 'monaco-editor';
import Console from '../components/Console';
import ProblemDescription from '../components/ProblemDescription';
import CodeEditor from '../components/CodeEditor';

export default function HomePage() {
  const [showEditor, setShowEditor] = useState(false);

  if (!showEditor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground p-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        
        <div className="relative z-10 text-center space-y-8 max-w-2xl px-6 py-12 bg-card/30 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent pb-2">
              EvalaCode
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              The premium in-browser Python coding environment. <br/>
              <span className="text-primary font-medium">No setup. Just code.</span>
            </p>
          </div>
          
          <button
            onClick={() => setShowEditor(true)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
            <span className="relative flex items-center gap-2 text-lg">
              Start Coding 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return <PythonEditorContent />;
}

function PythonEditorContent() {
  const { 
    isRunning, 
    output, 
    runCode: runPythonCode, 
    runTests: runPythonTests, 
    installPackage: installPythonPackage,
    testResults
  } = usePyodideWorker();
  
  const [packageName, setPackageName] = useState<string>('');
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState<string | undefined>(`# Welcome to EvalaCode!
# Edit the code below and press "Run" to see the output.

def greeting(name="Coder"):
    print(f"👋 Hello, {name}!")
    print("✨ You're now coding in your browser with EvalaCode.")
    print("💡 Try changing the function or adding your own!")

# Call the function with a custom name
greeting("EvalaCoder")`);

  const [consoleHeight, setConsoleHeight] = useState<number>(350); 
  const [isResizing, setIsResizing] = useState<boolean>(false); 
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const initialConsoleHeight = useRef<number>(200);
  const initialMouseY = useRef<number>(0);

  const [leftWidth, setLeftWidth] = useState(40); 
  const [isHorizontalResizing, setIsHorizontalResizing] = useState(false); 
  const initialMouseX = useRef(0);
  const initialLeftWidth = useRef(0);

  const [difficulty, setDifficulty] = useState('Easy'); 
  const [generatedQuestion, setGeneratedQuestion] = useState('Choose a difficulty and click "Reveal Problem" when you’re ready.');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false); 
  const [functionName, setFunctionName] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Handle resizing (Vertical)
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing || !editorContainerRef.current) return;

      const deltaY = initialMouseY.current - e.clientY;
      const newConsoleHeight = initialConsoleHeight.current + deltaY;

      const minHeight = 50;
      const totalHeight = editorContainerRef.current.parentElement?.clientHeight || window.innerHeight;
      const maxHeight = totalHeight - 50; 

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

      const minRightPanelWidthPx = 500; 
      const minRightPanelWidthPercent = (minRightPanelWidthPx / containerWidth) * 100;
      const maxLeftWidth = 100 - minRightPanelWidthPercent;

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
    };

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isHorizontalResizing]);

  const onMouseDownResizer = (e: React.MouseEvent) => {
    setIsResizing(true);
    initialMouseY.current = e.clientY;
    initialConsoleHeight.current = consoleHeight;
    e.preventDefault(); 
  };

  const onMouseDownHorizontalResizer = (e: React.MouseEvent) => {
    setIsHorizontalResizing(true);
    initialMouseX.current = e.clientX;
    initialLeftWidth.current = leftWidth;
    e.preventDefault(); 
  };

  const runCode = () => {
    const currentCode = editorRef.current?.getValue();
    if (currentCode) {
      runPythonCode(currentCode);
    }
  };

  const runTests = () => {
    if (!functionName || testCases.length === 0) return;
    const currentCode = editorRef.current?.getValue();
    if (currentCode) {
      const testScript = generateTestRunnerScript(functionName, testCases);
      runPythonTests(currentCode, testScript);
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoadingQuestion(true); 
    setGeneratedQuestion('Retrieving question...'); 
    const timeoutMs = 30000; 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ difficulty }),
        signal: controller.signal 
      });

      clearTimeout(timeoutId); 

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate question.');
      }

      const data = await response.json();
      setGeneratedQuestion(data.question);
      setFunctionName(data.functionName);
      setTestCases(data.testCases);
    } catch (error: unknown) {
      clearTimeout(timeoutId); 
      if (error instanceof Error && error.name === 'AbortError') {
        setGeneratedQuestion('Error: Request timed out. Please try again.');
      } else {
        console.error('Error generating question:', error);
        setGeneratedQuestion(`Error: ${error instanceof Error ? error.message : 'Failed to generate question. Please try again.'}`);
      }
    } finally {
      setIsLoadingQuestion(false); 
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-background to-background pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 flex w-full h-full">
        
        {/* Left Section: Problem Description */}
        <div 
          className="flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm" 
          style={{ width: `${leftWidth}%` }}
        >
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <ProblemDescription
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              generatedQuestion={generatedQuestion}
              isLoadingQuestion={isLoadingQuestion}
              onGenerateQuestion={handleGenerateQuestion}
            />
          </div>
        </div>

        {/* Horizontal Resizer */}
        <div
          className="resizer-v group cursor-col-resize w-1 hover:w-1 bg-border/50 hover:bg-primary/50 transition-colors z-50 flex flex-col justify-center items-center"
          onMouseDown={onMouseDownHorizontalResizer}
        >
           <GripVertical className="hidden group-hover:block w-3 h-3 text-muted-foreground/50" />
        </div>

        {/* Right Section: Code Editor and Console */}
        <div className="flex flex-col min-w-[500px] bg-background/50" style={{ width: `${100 - leftWidth}%` }}>
          
          {/* Editor Container */}
          <div ref={editorContainerRef} className="flex-1 flex flex-col overflow-hidden relative" style={{ height: `calc(100% - ${consoleHeight}px)` }}>
            <div className="absolute top-0 w-full h-9 bg-muted/40 border-b border-border/40 flex items-center px-4 space-x-2 select-none z-20">
               <span className="text-xs font-mono text-muted-foreground flex items-center gap-2 bg-muted/30 px-2 py-1 rounded border border-white/5">
                 <FileCode className="w-3.5 h-3.5 text-blue-400" />
                 main.py
               </span>
            </div>
            <div className="flex-1 pt-9">
              <CodeEditor
                code={code || ''}
                setCode={setCode}
                editorRef={editorRef}
              />
            </div>
          </div>

          {/* Vertical Resizer (confusing naming from before, this resizes height) */}
          <div
            className="resizer-h group cursor-row-resize h-1 hover:h-1 bg-border/50 hover:bg-primary/50 transition-colors z-50 flex justify-center items-center"
            onMouseDown={onMouseDownResizer}
          >
             <GripHorizontal className="hidden group-hover:block w-3 h-3 text-muted-foreground/50" />
          </div>

          {/* Console Section */}
          <div
              style={{ height: `${consoleHeight}px` }}
              className="bg-card/50 backdrop-blur-md border-t border-border/40 flex flex-col"
          >
              <Console
                  output={output}
                  testResults={testResults}
                  packageName={packageName}
                  setPackageName={setPackageName}
                  onRunCode={runCode}
                  onRunTests={runTests}
                  onInstallPackage={() => installPythonPackage(packageName)}
                  isLoadingTests={isRunning && testResults === ''} 
                  hasFunctionName={!!functionName}
              />
          </div>
        </div>
      </div>
    </div>
  );
}


