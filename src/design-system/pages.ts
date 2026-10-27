import type { ComponentType } from 'react';
import { ButtonPage } from './pages/ButtonPage';
import { CardPage } from './pages/CardPage';
import { ColoursPage } from './pages/ColoursPage';
import { IconsPage } from './pages/IconsPage';
import { IntroductionPage } from './pages/IntroductionPage';
import { ProgressPage } from './pages/ProgressPage';
import { TokensPage } from './pages/TokensPage';
import { TypographyPage } from './pages/TypographyPage';

export type DocPage = {
  path: string;
  title: string;
  /** Sidebar heading the page sits under. */
  section: 'Guides' | 'Foundations' | 'UI';
  /** Optional collapsible group inside the section. */
  group?: string;
  /** Files the page documents, listed in the right-hand rail. */
  source: string[];
  /** Extra words the search box matches. */
  keywords: string;
  component: ComponentType;
};

/** Sidebar, search and prev/next order. */
export const pages: DocPage[] = [
  {
    path: '/',
    title: 'Introduction',
    section: 'Guides',
    source: ['src/design-system/'],
    keywords: 'overview getting started principles layers',
    component: IntroductionPage,
  },
  {
    path: '/foundations/colours',
    title: 'Colours',
    section: 'Foundations',
    source: ['src/styles/tokens.css'],
    keywords: 'colour color palette base hex contrast neutral blue purple orange',
    component: ColoursPage,
  },
  {
    path: '/foundations/tokens',
    title: 'Design Tokens',
    section: 'Foundations',
    source: ['src/styles/tokens.css'],
    keywords: 'tokens variables css custom properties spacing radius radii shadow elevation text background',
    component: TokensPage,
  },
  {
    path: '/foundations/typography',
    title: 'Typography',
    section: 'Foundations',
    source: ['src/styles/tokens.css', 'src/styles/global.css'],
    keywords: 'type font text sf pro scale caps micro small',
    component: TypographyPage,
  },
  {
    path: '/foundations/icons',
    title: 'Icons',
    section: 'Foundations',
    source: ['src/assets/icons/', 'src/components/Icon/', 'scripts/icons/'],
    keywords: 'icons iconography mingcute svg line fill glyph symbol arrow',
    component: IconsPage,
  },
  {
    path: '/components/button',
    title: 'Button',
    section: 'UI',
    group: 'Components',
    source: ['src/components/Button/', 'src/components/Icon/'],
    keywords: 'button cta primary disabled icon pressed',
    component: ButtonPage,
  },
  {
    path: '/components/card',
    title: 'Card',
    section: 'UI',
    group: 'Components',
    source: ['src/components/CauseCard/'],
    keywords: 'card cause card pill stat panel progress bar logo byline media',
    component: CardPage,
  },
  {
    path: '/components/progress',
    title: 'Progress',
    section: 'UI',
    group: 'Components',
    source: ['src/components/ProgressBar/'],
    keywords: 'progress bar progressbar loader goal volunteers fill track',
    component: ProgressPage,
  },
];
