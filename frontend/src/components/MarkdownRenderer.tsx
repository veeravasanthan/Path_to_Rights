/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into blocks by double newlines or single newlines
  // Ensure we handle different line breaks gracefully
  const blocks = content.split(/\n\r?|\r/);

  // Helper function to render inline formatting inside a block (e.g., **bold**)
  const renderInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    // Reset regex index
    boldRegex.lastIndex = 0;

    while ((match = boldRegex.exec(text)) !== null) {
      // Push plaintext part before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Push structured strong element
      parts.push(
        <strong key={match.index} className="font-extrabold text-stone-900 dark:text-stone-50">
          {match[1]}
        </strong>
      );
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Convert each block line into standard styled DOM items
  const renderedElements = blocks.map((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return <div key={index} className="h-2" />;

    // 1. Headers Check (## or ###)
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const textContent = match[2];
        const headingClasses = "font-sans font-extrabold tracking-tight text-amber-950 dark:text-stone-100";
        
        if (level === 1) {
          return <h1 key={index} className={`${headingClasses} text-xl mt-4 mb-2`}>{renderInline(textContent)}</h1>;
        } else if (level === 2) {
          return <h2 key={index} className={`${headingClasses} text-lg mt-3.5 mb-2 border-b border-stone-200 dark:border-stone-800 pb-1`}>{renderInline(textContent)}</h2>;
        } else {
          return <h3 key={index} className={`${headingClasses} text-sm mt-3 mb-1.5`}>{renderInline(textContent)}</h3>;
        }
      }
    }

    // 2. Bullet List Check (- or *)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const textContent = line.replace(/^[-*]\s+/, '');
      return (
        <div key={index} className="flex items-start gap-2.5 my-1.5 pl-2">
          <span className="text-amber-500 font-bold leading-6 shrink-0">•</span>
          <span className="text-stone-800 dark:text-stone-200 leading-relaxed font-sans text-xs sm:text-sm">
            {renderInline(textContent)}
          </span>
        </div>
      );
    }

    // 3. Numbered List Check (e.g., 1. or 2.)
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const numCode = numberedMatch[1];
      const textContent = numberedMatch[2];
      return (
        <div key={index} className="flex items-start gap-2.5 my-2 pl-1 bg-stone-50/50 dark:bg-stone-900/10 p-2.5 rounded-xl border border-stone-100 dark:border-stone-850">
          <span className="size-5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-[10px] flex items-center justify-center font-mono shrink-0 mt-0.5">
            {numCode}
          </span>
          <span className="text-stone-800 dark:text-stone-200 leading-relaxed font-sans text-xs sm:text-sm">
            {renderInline(textContent)}
          </span>
        </div>
      );
    }

    // Default regular paragraph
    return (
      <p key={index} className="text-stone-800 dark:text-stone-200 leading-relaxed font-sans text-xs sm:text-sm my-1">
        {renderInline(line)}
      </p>
    );
  });

  return <div className="space-y-1.5">{renderedElements}</div>;
}
