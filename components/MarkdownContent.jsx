/**
 * MarkdownContent
 *
 * Renders a markdown string (or array of strings, joined as paragraphs)
 * with a shared visual style — Tailwind classes driven by the design
 * system's tokens (gray text scale, brand link color via text-action).
 *
 * This is the "pure render" half of markdown handling. It deliberately does
 * NOT fetch files, extract sections, or interpolate template variables —
 * both CHP and RVP have their own content-loading conventions (CHP reads
 * from /content/flyouts/*.md; RVP fetches + does `## Section` extraction
 * via resolveContentPath/interpolateTokens). Keep that loading logic in
 * each app and pass the resolved markdown string in as `content`.
 *
 * Both CHP and RVP are Next.js apps, so this uses `next/dynamic` (matching
 * CHP's original implementation) to code-split react-markdown out of the
 * initial bundle — it's only needed inside flyouts/info cards, not on
 * first paint.
 *
 * Sourced from community-health-profiles' MarkdownRenderer.jsx.
 *
 * @param {string|string[]} content   — markdown source
 * @param {string}          className — wrapper class, default "text-sm"
 */
'use client';

import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
  loading: () => null,
});

const defaultComponents = {
  h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mt-2 mb-3">{children}</h1>,
  h2: ({ children }) => <h2 className="text-base font-semibold text-gray-900 mt-5 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-1">{children}</h3>,
  p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="text-action underline hover:opacity-70" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  hr: () => <hr className="my-4 border-gray-200" />,
};

export default function MarkdownContent({ content, className = "text-sm", components }) {
  if (!content) return null;

  // Normalize arrays to a markdown string (each item becomes a paragraph)
  const contentString = Array.isArray(content) ? content.join("\n\n") : String(content);
  const mergedComponents = { ...defaultComponents, ...components };

  return (
    <div className={className}>
      <ReactMarkdown components={mergedComponents}>{contentString}</ReactMarkdown>
    </div>
  );
}
