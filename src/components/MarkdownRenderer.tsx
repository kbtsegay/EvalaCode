import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  markdown: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ ...props }) => <h1 className="text-3xl font-bold text-white mb-4" {...props} />,
        h2: ({ ...props }) => <h2 className="text-2xl font-bold text-white mt-4 mb-3" {...props} />,
        h3: ({ ...props }) => <h3 className="text-xl font-bold text-white mb-4" {...props} />,
        p: ({ ...props }) => {
          const processedChildren = React.Children.map(props.children, child => {
            if (typeof child === 'string') {
              return child.replace(/\\"/g, '"');
            }
            return child;
          });
          return <p className="text-base text-zinc-200 mb-6" {...props}>{processedChildren}</p>;
        },
        code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              language={match[1]}
              PreTag="div"
              {...props}
              className="bg-zinc-800 p-4 rounded"
            >
              {String(children).replace(/\\"/g, '"').replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-zinc-700 text-white px-1 rounded" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
