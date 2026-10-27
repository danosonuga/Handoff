import type { ReactNode } from 'react';

/**
 * A deliberately small TSX/CSS highlighter for the docs code blocks
 * (no dependency). It colours comments, strings, keywords, JSX tags,
 * attributes, custom properties and numbers; everything else is plain.
 */
const TOKEN = new RegExp(
  [
    /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/)/.source,
    /(?<string>'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)/.source,
    /(?<tag>(?<=<\/?)[A-Za-z][\w.]*)/.source,
    /(?<keyword>\b(?:import|from|export|default|function|return|const|let|type|as|true|false|undefined|null)\b)/.source,
    /(?<property>--[\w-]+)/.source,
    /(?<attribute>\b[A-Za-z_][\w-]*(?==[{"']))/.source,
    /(?<number>\b\d+(?:\.\d+)?(?:px|ms|deg|%)?\b)/.source,
  ].join('|'),
  'g',
);

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(TOKEN)) {
    const kind = Object.entries(match.groups!).find(([, text]) => text !== undefined)?.[0];
    if (match.index > last) out.push(code.slice(last, match.index));
    out.push(
      <span key={match.index} data-token={kind}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  out.push(code.slice(last));
  return out;
}
