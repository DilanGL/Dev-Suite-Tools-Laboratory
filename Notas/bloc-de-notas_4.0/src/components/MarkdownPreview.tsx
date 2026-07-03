/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownPreviewProps {
  content: string;
  images?: Record<string, string>;
}

// Recursive parser to render text segments with bold, italics, underline, strikethrough, text coloring, sizing, alignment, links, and images
function parseInlineMarkdown(text: string, images?: Record<string, string>): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // - Images: !\[(.*?)\]\((.*?)\)
  // - Links/Colors/Alignments/Sizes: \[(.*?)\]\((.*?)\)
  // - Bold: \*\*(.*?)\*\*
  // - Underline: __(.*?)__
  // - Italic: \*(.*?)\*
  // - Strikethrough: ~~(.*?)~~
  const regex = /(!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|__.*?__|\*\*.*?\*\*|\*.*?\*|~~.*?~~)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('![') && part.endsWith(')')) {
      const match = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, alt, src] = match;
        let finalSrc = src;
        if (src.startsWith('ref:') && images) {
          const imageKey = src.substring(4);
          if (images[imageKey]) {
            finalSrc = images[imageKey];
          }
        }
        return (
          <img
            key={index}
            src={finalSrc}
            alt={alt || 'imagen'}
            className="max-w-full max-h-[380px] rounded-lg my-3 border border-zinc-800/60 shadow-lg object-contain inline-block font-sans"
            referrerPolicy="no-referrer"
          />
        );
      }
    }
    if (part.startsWith('[') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        const [, content, target] = match;

        // Color formatting
        if (target.startsWith('color:')) {
          const color = target.substring(6);
          return (
            <span key={index} style={{ color }} className="inline-block">
              {parseInlineMarkdown(content, images)}
            </span>
          );
        }

        // Alignment formatting
        if (target.startsWith('align:')) {
          const align = target.substring(6);
          let alignClass = 'text-left';
          if (align === 'center') alignClass = 'text-center block w-full';
          else if (align === 'right') alignClass = 'text-right block w-full';
          else if (align === 'justify') alignClass = 'text-justify block w-full';
          return (
            <span key={index} className={`${alignClass} my-1 inline-block w-full font-sans`}>
              {parseInlineMarkdown(content, images)}
            </span>
          );
        }

        // Font size formatting
        if (target.startsWith('size:')) {
          const size = target.substring(5);
          const finalSize = size.match(/^[0-9]+$/) ? `${size}px` : size;
          return (
            <span key={index} style={{ fontSize: finalSize }} className="inline-block leading-relaxed">
              {parseInlineMarkdown(content, images)}
            </span>
          );
        }

        // Standard markdown links (Ctrl + Click required)
        return (
          <a
            key={index}
            href={target}
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                alert('Información: Mantén pulsado Ctrl + Click (o Cmd en Mac) para abrir este enlace.');
              }
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-semibold transition-colors duration-150 cursor-pointer inline-block font-sans hover:scale-[1.01]"
            title="Ctrl + Click para abrir enlace"
          >
            {parseInlineMarkdown(content, images)}
          </a>
        );
      }
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-white">
          {parseInlineMarkdown(part.slice(2, -2), images)}
        </strong>
      );
    }
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <span key={index} className="underline decoration-current">
          {parseInlineMarkdown(part.slice(2, -2), images)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic">
          {parseInlineMarkdown(part.slice(1, -1), images)}
        </em>
      );
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return (
        <span key={index} className="line-through opacity-75">
          {parseInlineMarkdown(part.slice(2, -2), images)}
        </span>
      );
    }
    return part;
  });
}

export default function MarkdownPreview({ content, images }: MarkdownPreviewProps) {
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
            <code>
              {codeLines.map((lineItem, lIdx) => (
                <div key={lIdx} className="min-h-[1.2rem] whitespace-pre select-text font-mono">
                  {parseInlineMarkdown(lineItem, images)}
                </div>
              ))}
            </code>
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
          <span className="w-1.5 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full inline-block animate-pulse"></span>
          {parseInlineMarkdown(trimmed.slice(2), images)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      parsedElements.push(
        <h2 key={index} className="text-lg font-semibold text-purple-300 mt-4 mb-2">
          {parseInlineMarkdown(trimmed.slice(3), images)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      parsedElements.push(
        <h3 key={index} className="text-md font-medium text-blue-300 mt-3 mb-1">
          {parseInlineMarkdown(trimmed.slice(4), images)}
        </h3>
      );
    }
    // Headers dividers or standard dividers
    else if (trimmed === '---' || trimmed === '===' || trimmed === '=====================================') {
      parsedElements.push(
        <hr key={index} className="my-4 border-t border-zinc-800" />
      );
    }
    // Empty line
    else if (trimmed === '') {
      parsedElements.push(<div key={index} className="h-2"></div>);
    }
    // Check regex matches for lists, checkboxes (whether indented or nested under bullet points)
    else {
      // 1. Check for Chekbox (standalone or inside list item)
      // Example matching: '  - [ ] My Task', '  [v] My done task', '- [x] task', ' * [✓] task'
      const checkboxMatch = line.match(/^(\s*)(?:-\s+|\*\s+|\+\s+|\d+\.\s+)?\[([\s✓xvVxXoO*_\-•])\]\s*(.*)$/);
      if (checkboxMatch) {
         const spaces = checkboxMatch[1].length;
         const checked = checkboxMatch[2] !== ' ' && checkboxMatch[2].toLowerCase() !== '';
         const label = checkboxMatch[3];
         parsedElements.push(
           <div 
             key={index} 
             className="flex items-start gap-2 py-1 ml-1" 
             style={{ marginLeft: `${Math.max(8, spaces * 6)}px` }}
           >
             <span className={`inline-flex items-center justify-center w-4 h-4 rounded mt-0.5 border text-[9px] select-none font-extrabold shrink-0 transition-colors duration-150
               ${checked 
                 ? 'bg-purple-600 border-purple-500 text-white' 
                 : 'border-zinc-750 bg-zinc-900/60 text-transparent hover:border-purple-500/50'
               }`}
             >
               {checked ? '✓' : ''}
             </span>
             <span className={`text-sm ${checked ? 'line-through text-zinc-500' : 'text-[#d1d5db]'}`}>
               {parseInlineMarkdown(label, images)}
             </span>
           </div>
         );
         return;
      }

      // 2. Check for bullet list item
      const bulletMatch = line.match(/^(\s*)(?:-\s+|\*\s+|\+\s+)(.*)$/);
      if (bulletMatch) {
         const spaces = bulletMatch[1].length;
         const content = bulletMatch[2];
         parsedElements.push(
           <div 
             key={index} 
             className="flex items-start gap-2 py-0.5" 
             style={{ marginLeft: `${Math.max(8, spaces * 6)}px` }}
           >
             <span className="w-1.5 h-1.5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
             <span className="text-sm text-zinc-300">{parseInlineMarkdown(content, images)}</span>
           </div>
         );
         return;
      }

      // 3. Check for ordered list item
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);
      if (orderedMatch) {
         const spaces = orderedMatch[1].length;
         const num = orderedMatch[2];
         const content = orderedMatch[3];
         parsedElements.push(
           <div 
             key={index} 
             className="flex items-start gap-2 py-0.5" 
             style={{ marginLeft: `${Math.max(8, spaces * 6)}px` }}
           >
             <span className="text-xs text-purple-400 font-mono mt-1 font-bold shrink-0">{num}.</span>
             <span className="text-sm text-zinc-300">{parseInlineMarkdown(content, images)}</span>
           </div>
         );
         return;
      }

      // 4. Default paragraph text
      parsedElements.push(
        <p key={index} className="text-zinc-300 text-sm leading-relaxed my-1 font-sans">
          {parseInlineMarkdown(line, images)}
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
        <code>
          {codeLines.map((lineItem, lIdx) => (
            <div key={lIdx} className="min-h-[1.2rem] whitespace-pre select-text font-mono">
              {parseInlineMarkdown(lineItem, images)}
            </div>
          ))}
        </code>
      </pre>
    );
  }

  return (
    <div className="space-y-1 h-full overflow-y-auto pr-2 custom-scrollbar">
      {parsedElements}
    </div>
  );
}
