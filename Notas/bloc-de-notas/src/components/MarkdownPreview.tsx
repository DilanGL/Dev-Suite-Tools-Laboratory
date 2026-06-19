/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
        <p className="text-sm font-mono">El documento está vacío</p>
      </div>
    );
  }

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const parsedElements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        parsedElements.push(
          <pre
            key={`code-${index}`}
            className="my-3 p-4 bg-[#0b0d19] border border-violet-500/10 rounded-lg font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed shadow-inner"
            style={{ tabSize: 2 }}
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
      } else {
        // Start of code block
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('# ')) {
      parsedElements.push(
        <h1 key={index} className="text-xl font-semibold text-white mt-5 mb-2 pb-1 border-b border-zinc-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full inline-block"></span>
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      parsedElements.push(
        <h2 key={index} className="text-lg font-semibold text-purple-300 mt-4 mb-2">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      parsedElements.push(
        <h3 key={index} className="text-md font-medium text-blue-300 mt-3 mb-1">
          {trimmed.slice(4)}
        </h3>
      );
    }
    // Checkboxes (tasks)
    else if (trimmed.startsWith('[ ]') || trimmed.startsWith('[✓]') || trimmed.startsWith('[x]') || trimmed.startsWith('[v]')) {
      const checked = trimmed.startsWith('[✓]') || trimmed.startsWith('[x]') || trimmed.startsWith('[v]');
      const label = trimmed.slice(3).trim();
      parsedElements.push(
        <div key={index} className="flex items-start gap-2 py-0.5 ml-1">
          <span className={`inline-flex items-center justify-center w-4 h-4 rounded mt-1 border text-[10px] select-none font-bold
            ${checked 
              ? 'bg-purple-600 border-purple-500 text-white' 
              : 'border-zinc-700 bg-zinc-900/40 text-transparent'
            }`}
          >
            {checked ? '✓' : ''}
          </span>
          <span className={`text-sm ${checked ? 'line-through text-zinc-500' : 'text-zinc-300'}`}>
            {label}
          </span>
        </div>
      );
    }
    // Bullet items
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      parsedElements.push(
        <div key={index} className="flex items-start gap-2 py-0.5 ml-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
          <span className="text-sm text-zinc-300">{trimmed.slice(2)}</span>
        </div>
      );
    }
    // Dividers
    else if (trimmed === '---' || trimmed === '===' || trimmed === '=====================================') {
      parsedElements.push(
        <hr key={index} className="my-4 border-t border-zinc-800" />
      );
    }
    // Empty line
    else if (trimmed === '') {
      parsedElements.push(<div key={index} className="h-2"></div>);
    }
    // Paragraph
    else {
      parsedElements.push(
        <p key={index} className="text-zinc-300 text-sm leading-relaxed my-1 font-sans">
          {line}
        </p>
      );
    }
  });

  // Handle case where block was left open
  if (inCodeBlock && codeLines.length > 0) {
    parsedElements.push(
      <pre
        key="code-open-ended"
        className="my-3 p-4 bg-[#0b0d19] border border-violet-500/10 rounded-lg font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed shadow-inner"
      >
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return (
    <div className="space-y-1 h-full overflow-y-auto pr-2 custom-scrollbar">
      {parsedElements}
    </div>
  );
}
