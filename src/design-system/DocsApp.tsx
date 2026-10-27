import { DocsLayout } from './components/DocsLayout/DocsLayout';
import { pages } from './pages';
import { useHashPath } from './router';

/** Handoff Design System docs, laid out after Poseidon (poseidon.hydrogenpay.com). */
export function DocsApp() {
  const path = useHashPath();
  const page = pages.find((p) => p.path === path) ?? pages[0];
  const Page = page.component;

  return (
    <DocsLayout pages={pages} current={page}>
      <Page />
    </DocsLayout>
  );
}
