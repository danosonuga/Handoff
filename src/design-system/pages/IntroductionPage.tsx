import { CauseCard } from '@/components/CauseCard/CauseCard';
import { makokoTeachingCause } from '@/data/cause';
import { Code, PageTitle, Prose, Section } from '../components/Doc/Doc';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { href } from '../router';
import styles from './IntroductionPage.module.css';

const CONTENTS = [
  { path: '/foundations/colours', title: 'Colours', text: 'The base palette, grouped by hue, with contrast checks.' },
  { path: '/foundations/tokens', title: 'Design Tokens', text: 'Semantic colour, spacing, radius and elevation tokens.' },
  { path: '/foundations/typography', title: 'Typography', text: 'SF Pro and the six text styles from Figma.' },
  { path: '/foundations/icons', title: 'Icons', text: '1,214 Line and Fill icons from Figma, searchable and copyable.' },
  { path: '/components/button', title: 'Button', text: 'The primary action, its states, icons and recolouring.' },
  { path: '/components/card', title: 'Card', text: 'The cause card and the parts it’s built from.' },
  { path: '/components/progress', title: 'Progress', text: 'The goal bar: empty, in progress, complete and live.' },
];

const layers = ` tokens.css ──────────┐   design values: colour, type, spacing, radii, shadows
 transitions.css ─────┤   global t-* animation classes
                      ▼
 components/*  ───────┐   presentational pieces, each with its own .module.css
                      ▼
 CauseCard ◄────────── data/cause.ts`;

export function IntroductionPage() {
  return (
    <>
      <PageTitle title="Introduction">Welcome to the Handoff Design System docs!</PageTitle>

      <Section title="What is Handoff Design System?">
        <Prose>
          <p>
            The colours, tokens, type and components behind the cause card, documented from the code that ships. It
            uses the same stack and names as the product: React, TypeScript and CSS Modules, with token names that
            mirror the Figma variables.
          </p>
        </Prose>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.heroTitle}>
              Handoff <span>UI Kit</span> and Design System
            </p>
            <ul className={styles.heroFacts}>
              <li>
                <span>Source</span> Figma V2
              </li>
              <li>
                <span>Stack</span> React · CSS Modules
              </li>
              <li>
                <span>Font</span> SF Pro
              </li>
            </ul>
          </div>
          <div className={styles.heroCard} aria-hidden="true" inert>
            <CauseCard cause={makokoTeachingCause} />
          </div>
        </div>
      </Section>

      <Section title="What’s inside">
        <div className={styles.contents}>
          {CONTENTS.map((item) => (
            <a key={item.path} className={styles.contentCard} href={href(item.path)}>
              <span className={styles.contentTitle}>
                {item.title} <span aria-hidden="true">→</span>
              </span>
              <span className={styles.contentText}>{item.text}</span>
            </a>
          ))}
        </div>
      </Section>

      <Section title="Principles">
        <Prose>
          <ul>
            <li>
              <strong>Figma is the source of truth.</strong> Every token names the Figma variable it mirrors, and
              anything not in Figma is marked as derived.
            </li>
            <li>
              <strong>Tokens, then components.</strong> Components read values from <Code>tokens.css</Code> and never
              hard-code them or style each other’s internals.
            </li>
            <li>
              <strong>The docs are the code.</strong> These pages read <Code>tokens.css</Code> and render the real
              components, and every example’s Code tab is its source file.
            </li>
          </ul>
        </Prose>
        <CodeBlock code={layers} label="How it fits together" />
      </Section>

      <Section title="Running the docs">
        <CodeBlock
          code={`npm install
npm run dev     # cause card: http://localhost:5173/
                # design system: http://localhost:5173/design-system/
npm run build   # type-checks and builds both pages into dist/`}
          label="Terminal"
        />
      </Section>
    </>
  );
}
