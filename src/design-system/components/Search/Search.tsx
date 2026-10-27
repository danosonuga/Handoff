import { useEffect, useId, useRef, useState } from 'react';
import type { DocPage } from '../../pages';
import { href } from '../../router';
import styles from './Search.module.css';

type SearchProps = { pages: DocPage[] };

/** "Search documentation…" with ⌘K / Ctrl K to focus. Matches page titles and keywords. */
export function Search({ pages }: SearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length
    ? pages.filter((page) => {
        const haystack = `${page.title} ${page.section} ${page.group ?? ''} ${page.keywords}`.toLowerCase();
        return terms.every((term) => haystack.includes(term));
      })
    : [];
  const showList = open && terms.length > 0;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (page: DocPage) => {
    window.location.hash = href(page.path);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={styles.search}>
      <input
        ref={inputRef}
        className={styles.input}
        type="search"
        placeholder="Search documentation…"
        role="combobox"
        aria-label="Search documentation"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && results[highlighted] ? `${listId}-${highlighted}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlighted((i) => Math.min(i + 1, results.length - 1));
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlighted((i) => Math.max(i - 1, 0));
          } else if (event.key === 'Enter' && results[highlighted]) {
            go(results[highlighted]);
          } else if (event.key === 'Escape') {
            setQuery('');
            inputRef.current?.blur();
          }
        }}
      />
      <kbd className={styles.shortcut} aria-hidden="true">
        ⌘ K
      </kbd>
      {showList && (
        <ul id={listId} role="listbox" className={styles.results}>
          {results.length === 0 && <li className={styles.empty}>No results for “{query}”</li>}
          {results.map((page, i) => (
            <li
              key={page.path}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              className={styles.result}
              // mousedown, not click: runs before the input's blur closes the list.
              onMouseDown={(event) => {
                event.preventDefault();
                go(page);
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className={styles.resultTitle}>{page.title}</span>
              <span className={styles.resultSection}>{page.group ?? page.section}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
