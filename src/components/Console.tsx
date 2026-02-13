import { Play, FlaskConical, Download, Terminal, SquareTerminal, CheckCircle2 } from 'lucide-react';

interface ConsoleProps {
  output: string;
  testResults: string;
  packageName: string;
  setPackageName: (name: string) => void;
  onRunCode: () => void;
  onRunTests: () => void;
  onInstallPackage: () => void;
  isLoadingTests: boolean;
  hasFunctionName: boolean;
}

export default function Console({
  output,
  testResults,
  packageName,
  setPackageName,
  onRunCode,
  onRunTests,
  onInstallPackage,
  isLoadingTests,
  hasFunctionName,
}: ConsoleProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Console Header / Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20 backdrop-blur-sm select-none">
         <div className="flex items-center gap-4">

             <div className="flex items-center gap-1.5 text-muted-foreground">
                <Terminal className="w-3.5 h-3.5" />
                <span className="text-xs font-mono font-medium">Console Output</span>
             </div>
         </div>
         
         <div className="flex items-center gap-2">
            <div className="flex bg-secondary/50 rounded-lg p-1 border border-border/50 items-center">
                <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    placeholder="pip install..."
                    className="bg-transparent text-xs text-foreground px-2 py-1 outline-none w-32 placeholder:text-muted-foreground/50 font-mono"
                />
                <button
                    onClick={onInstallPackage}
                    className="p-1 hover:bg-background rounded-md text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                    title="Install Package"
                >
                    <Download className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="h-4 w-[1px] bg-border mx-1" />

            <button
            onClick={onRunTests}
            disabled={isLoadingTests || !hasFunctionName}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all group cursor-pointer
                ${!hasFunctionName 
                    ? 'opacity-50 cursor-not-allowed bg-secondary text-muted-foreground' 
                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/50'
                }`}
            >
             {isLoadingTests ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
             ) : (
                 <>
                    <FlaskConical className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                    <span>Test</span>
                 </>
             )}
            </button>

            <button
            onClick={onRunCode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/50 transition-all group cursor-pointer"
            >
                <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
                <span>Run</span>
            </button>
         </div>
      </div>

      {/* Output Area */}
      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar font-mono text-sm space-y-4 bg-background/30">
        {!output && !testResults && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 select-none space-y-3">
                <SquareTerminal className="w-16 h-16 opacity-20" strokeWidth={1} />
                <p>Ready to execute code...</p>
            </div>
        )}
        
        {output && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground select-none">
                    <Terminal className="w-3 h-3" />
                    <span className="text-xs uppercase tracking-wider font-semibold">Standard Output</span>
                </div>
                <pre className="whitespace-pre-wrap text-foreground/90 leading-relaxed font-mono pl-5 border-l-2 border-border/50">{output}</pre>
            </div>
        )}

        {testResults && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-t border-border/30 pt-4 mt-4">
               <div className="flex items-center gap-2 mb-2 text-purple-400/80 select-none">
                   <CheckCircle2 className="w-3 h-3" />
                   <span className="text-xs uppercase tracking-wider font-semibold">Test Results</span>
               </div>
               <pre className="whitespace-pre-wrap text-sm text-yellow-200/90 bg-yellow-500/5 p-3 rounded-lg border border-yellow-500/10 font-mono">{testResults}</pre>
            </div>
        )}
      </div>
    </div>
  );
}
