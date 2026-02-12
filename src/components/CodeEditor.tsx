import React from 'react';
import dynamic from 'next/dynamic';
import * as monaco from 'monaco-editor';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  code: string;
  setCode: (code: string | undefined) => void;
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
}

export default function CodeEditor({
  code,
  setCode,
  editorRef,
}: Omit<CodeEditorProps, 'consoleHeight'>) {
  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100%"
        defaultLanguage="python"
        value={code}
        onMount={(editor: monaco.editor.IStandaloneCodeEditor) => (editorRef.current = editor)}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
        }}
      />
    </div>
  );
}
