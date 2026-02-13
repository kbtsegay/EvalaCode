import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import { Sparkles, ChevronDown, Loader2, BookOpen } from 'lucide-react';

interface ProblemDescriptionProps {
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
  generatedQuestion: string;
  isLoadingQuestion: boolean;
  onGenerateQuestion: () => void;
}

export default function ProblemDescription({
  difficulty,
  setDifficulty,
  generatedQuestion,
  isLoadingQuestion,
  onGenerateQuestion,
}: ProblemDescriptionProps) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Drills
            </h2>
        </div>
        <div className="relative">
             <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="appearance-none bg-secondary text-secondary-foreground pl-4 pr-10 py-1.5 rounded-full text-sm font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-secondary/80 transition-colors"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
              <ChevronDown className="w-4 h-4" />
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
         <div className="absolute inset-0 bg-card/40 backdrop-blur-sm border border-border rounded-xl shadow-inner overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {isLoadingQuestion && generatedQuestion === 'Retrieving question...' ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                    <p className="animate-pulse">Consulting the oracle...</p>
                </div>
                ) : !generatedQuestion ? (
                 <div className="flex flex-col items-center justify-center h-full text-center space-y-6 text-muted-foreground p-8">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity" />
                        <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-2xl shadow-lg ring-1 ring-white/5">
                            <BookOpen className="w-10 h-10 text-primary/80" />
                        </div>
                    </div>
                    <div className="space-y-2 max-w-xs">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Ready for a Challenge?</h3>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                            Select a difficulty level above and generate a unique coding problem to sharpen your skills.
                        </p>
                    </div>
                 </div>
                ) : (
                <div className="markdown-content">
                    <MarkdownRenderer markdown={generatedQuestion} />
                </div>
                )}
            </div>
         </div>
      </div>

      <button
        onClick={onGenerateQuestion}
        className="group relative w-full overflow-hidden rounded-lg bg-primary p-[1px] focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        disabled={isLoadingQuestion}
      >
        <div className={`relative flex items-center justify-center rounded-lg bg-zinc-900 px-8 py-3 transition-all duration-200 group-hover:bg-zinc-800 ${isLoadingQuestion ? 'opacity-80 cursor-not-allowed' : ''}`}>
           {isLoadingQuestion ? (
              <span className="flex items-center gap-2 text-primary-foreground font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
              </span>
           ) : (
             <span className="flex items-center gap-2 font-bold text-white group-hover:text-primary transition-colors">
               <Sparkles className="w-5 h-5" />
               <span>Reveal New Problem</span>
             </span>
           )}
        </div>
      </button>
    </div>
  );
}
