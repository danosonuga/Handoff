import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import type { DocPage } from '../../pages';
import { href } from '../../router';
import { useClipIndicator } from '../../lib/useClipIndicator';
import { Search } from '../Search/Search';
import styles from './DocsLayout.module.css';

type DocsLayoutProps = {
  pages: DocPage[];
  current: DocPage;
  children: ReactNode;
};

type Heading = { id: string; text: string };

const SECTIONS: DocPage['section'][] = ['Guides', 'Foundations', 'UI'];

function Chevron({ direction }: { direction: 'right' | 'down' | 'left' }) {
  const rotate = { right: 0, down: 90, left: 180 }[direction];
  return (
    <svg className={styles.chevron} style={{ rotate: `${rotate}deg` }} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type NavTreeProps = {
  pages: DocPage[];
  current: DocPage;
  closedGroups: Set<string>;
  onToggleGroup?: (group: string) => void;
  /** The selected-style copy laid over the real list (see useClipIndicator). */
  overlay?: boolean;
};

/**
 * The sidebar list. It renders twice: the real, interactive list, and an
 * inert copy in the selected style that's clipped to the current page, so the
 * highlight and the text colour glide together (useClipIndicator).
 */
function NavTree({ pages, current, closedGroups, onToggleGroup, overlay = false }: NavTreeProps) {
  const link = (page: DocPage) =>
    overlay ? (
      <span className={`${styles.navLink} ${styles.navLinkSelected}`}>{page.title}</span>
    ) : (
      <a className={styles.navLink} href={href(page.path)} aria-current={page === current ? 'page' : undefined}>
        {page.title}
      </a>
    );

  return (
    <ul className={styles.navList}>
      {SECTIONS.map((section) => {
        const inSection = pages.filter((p) => p.section === section);
        const groups = [...new Set(inSection.map((p) => p.group).filter(Boolean))] as string[];
        return (
          <li key={section} className={styles.navSection}>
            <span className={styles.navHeading}>{section}</span>
            <ul className={styles.navList}>
              {inSection
                .filter((p) => !p.group)
                .map((page) => (
                  <li key={page.path}>{link(page)}</li>
                ))}
              {groups.map((group) => {
                const open = !closedGroups.has(group);
                const label = (
                  <>
                    {group}
                    <Chevron direction={open ? 'down' : 'right'} />
                  </>
                );
                return (
                  <li key={group}>
                    {overlay ? (
                      <span className={styles.navGroup}>{label}</span>
                    ) : (
                      <button type="button" className={styles.navGroup} aria-expanded={open} onClick={() => onToggleGroup?.(group)}>
                        {label}
                      </button>
                    )}
                    {open && (
                      <ul className={styles.navNested}>
                        {inSection
                          .filter((p) => p.group === group)
                          .map((page) => (
                            <li key={page.path}>{link(page)}</li>
                          ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}

/** Collects the page's h2s for "On This Page" and tracks which one is in view. */
function useHeadings(contentRef: RefObject<HTMLElement | null>, pageKey: string) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>();

  useEffect(() => {
    const elements = [...(contentRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id]') ?? [])];
    setHeadings(elements.map((el) => ({ id: el.id, text: el.dataset.title ?? el.textContent ?? '' })));
    setActiveId(elements[0]?.id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -65% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [contentRef, pageKey]);

  return { headings, activeId };
}

export function DocsLayout({ pages, current, children }: DocsLayoutProps) {
  const contentRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navOverlayRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [closedGroups, setClosedGroups] = useState<Set<string>>(() => new Set());
  useClipIndicator(navRef, navOverlayRef, () => navRef.current?.querySelector<HTMLElement>('a[aria-current="page"]'), current.path);

  const toggleGroup = (group: string) =>
    setClosedGroups((closed) => {
      const next = new Set(closed);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });

  // A group opens itself when it holds the current page.
  useEffect(() => {
    if (current.group && closedGroups.has(current.group)) toggleGroup(current.group);
  }, [current]);
  const { headings, activeId } = useHeadings(contentRef, current.path);

  // New page: back to the top, close the mobile menu, retitle the tab.
  useEffect(() => {
    window.scrollTo(0, 0);
    setNavOpen(false);
    document.title = `${current.title} – Handoff Design System`;
  }, [current]);

  const index = pages.indexOf(current);
  const previous = pages[index - 1];
  const next = pages[index + 1];
  const crumbs = current.section === 'Guides' ? [] : [current.group ?? current.section];

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={navOpen}
          aria-controls="docs-sidebar"
          onClick={() => setNavOpen(!navOpen)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d={navOpen ? 'M5 5l10 10M15 5 5 15' : 'M3 6h14M3 10h14M3 14h14'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <a className={styles.brand} href={href('/')}>
          Handoff Design System
        </a>
        <div className={styles.topbarEnd}>
          <a className={styles.externalLink} href="/">
            Cause card <span aria-hidden="true">↗</span>
          </a>
          <Search pages={pages} />
        </div>
      </header>

      <div className={styles.body}>
        <aside id="docs-sidebar" className={styles.sidebar} data-open={navOpen}>
          <nav ref={navRef} aria-label="Design system" className={styles.nav}>
            <NavTree pages={pages} current={current} closedGroups={closedGroups} onToggleGroup={toggleGroup} />
            <div ref={navOverlayRef} className={styles.navOverlay} aria-hidden="true" inert>
              <NavTree pages={pages} current={current} closedGroups={closedGroups} overlay />
            </div>
          </nav>
        </aside>

        <article className={styles.article}>
          <main ref={contentRef} className={styles.content} data-doc-content>
            <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
              {crumbs.map((crumb) => (
                <span key={crumb} className={styles.crumb}>
                  {crumb}
                  <Chevron direction="right" />
                </span>
              ))}
              <span aria-current="page">{current.title}</span>
            </nav>
            {children}
          </main>

          <nav aria-label="Previous and next page" className={styles.pager}>
            {previous ? (
              <a className={styles.pagerLink} href={href(previous.path)}>
                <Chevron direction="left" />
                {previous.title}
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={href(next.path)}>
                {next.title}
                <Chevron direction="right" />
              </a>
            )}
          </nav>
        </article>

        <nav aria-label="On this page" className={styles.toc}>
          {headings.length > 0 && (
            <>
              <p className={styles.tocHeading}>On This Page</p>
              <ul className={styles.tocList}>
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      className={styles.tocLink}
                      href={href(current.path)}
                      aria-current={heading.id === activeId ? 'location' : undefined}
                      onClick={(event) => {
                        // Keep the route in the hash; just scroll to the section.
                        event.preventDefault();
                        document.getElementById(heading.id)?.scrollIntoView();
                      }}
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className={styles.tocMeta}>
            <p className={styles.tocMetaHeading}>Source</p>
            {current.source.map((file) => (
              <code key={file} className={styles.tocSource}>
                {file}
              </code>
            ))}
            <button type="button" className={styles.scrollTop} onClick={() => window.scrollTo(0, 0)}>
              Scroll to top <span aria-hidden="true">↑</span>
            </button>
          </div>
        </nav>
      </div>

      <footer className={styles.footer}>
        Handoff Design System · built from <code>src/styles/tokens.css</code> and <code>src/components</code>
      </footer>

      <div className={styles.scrim} data-open={navOpen} onClick={() => setNavOpen(false)} aria-hidden="true" />
    </div>
  );
}
