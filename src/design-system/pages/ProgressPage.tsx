import { useState } from 'react';
import { Callout, Code, DoDont, PageTitle, Prose, PropsTable, Section, Table } from '../components/Doc/Doc';
import { Example } from '../components/Example/Example';
import CompleteProgress from '../examples/progress/CompleteProgress';
import completeCode from '../examples/progress/CompleteProgress.tsx?raw';
import DefaultProgress from '../examples/progress/DefaultProgress';
import defaultCode from '../examples/progress/DefaultProgress.tsx?raw';
import EmptyProgress from '../examples/progress/EmptyProgress';
import emptyCode from '../examples/progress/EmptyProgress.tsx?raw';
import LiveProgress from '../examples/progress/LiveProgress';
import liveCss from '../examples/progress/LiveProgress.module.css?raw';
import liveCode from '../examples/progress/LiveProgress.tsx?raw';
import OverGoalProgress from '../examples/progress/OverGoalProgress';
import overGoalCode from '../examples/progress/OverGoalProgress.tsx?raw';
import ProgressInStatPanel from '../examples/progress/ProgressInStatPanel';
import statPanelCode from '../examples/progress/ProgressInStatPanel.tsx?raw';
import { getToken } from '../lib/tokens';
import styles from './Components.module.css';

/** The card's content width: 368px card − 2 × 8px padding − 2 × 16px body padding. */
const CARD_CONTENT_WIDTH = 336;

const tokenValue = (name: string) => getToken(name)?.value ?? '';

export function ProgressPage() {
  // Remounts the default example so the load-in can be replayed.
  const [loadRun, setLoadRun] = useState(0);

  return (
    <>
      <PageTitle title="Progress">
        A continuous bar showing how far a value is towards a goal (<Code>ProgressBar</Code>, Figma{' '}
        <Code>Loader</Code> 24:266). The cause card uses it for volunteers joined against volunteers needed.
      </PageTitle>

      <Section title="Default Progress">
        <Prose>
          <p>
            The fill is <Code>value / max</Code> of the track. On first render it starts at 0 and grows to its value.
          </p>
        </Prose>
        <Example files={[{ name: 'DefaultProgress.tsx', code: defaultCode }]} width={CARD_CONTENT_WIDTH}>
          <DefaultProgress key={loadRun} />
        </Example>
        <button type="button" className={styles.replay} onClick={() => setLoadRun((n) => n + 1)}>
          Replay load-in
        </button>
      </Section>

      <Section title="Empty Progress">
        <Prose>
          <p>
            At <Code>value={'{0}'}</Code> only the track shows. Keep the bar visible: an empty track still tells people
            there’s a goal to fill.
          </p>
        </Prose>
        <Example files={[{ name: 'EmptyProgress.tsx', code: emptyCode }]} width={CARD_CONTENT_WIDTH}>
          <EmptyProgress />
        </Example>
      </Section>

      <Section title="Complete Progress">
        <Prose>
          <p>When the value reaches the max, the fill spans the whole track.</p>
        </Prose>
        <Example files={[{ name: 'CompleteProgress.tsx', code: completeCode }]} width={CARD_CONTENT_WIDTH}>
          <CompleteProgress />
        </Example>
      </Section>

      <Section title="Over Goal">
        <Prose>
          <p>
            Values above <Code>max</Code> (or below 0) are clamped, so the fill never overflows. The accessible value
            stays exact.
          </p>
        </Prose>
        <Example files={[{ name: 'OverGoalProgress.tsx', code: overGoalCode }]} width={CARD_CONTENT_WIDTH}>
          <OverGoalProgress />
        </Example>
      </Section>

      <Section title="Live Update">
        <Prose>
          <p>
            Change <Code>value</Code> and the fill tweens to the new width (transitions.dev “Card resize”). Try the
            buttons.
          </p>
        </Prose>
        <Example
          files={[
            { name: 'LiveProgress.tsx', code: liveCode },
            { name: 'LiveProgress.module.css', code: liveCss },
          ]}
          width={CARD_CONTENT_WIDTH}
        >
          <LiveProgress />
        </Example>
      </Section>

      <Section title="In a Stat Panel">
        <Prose>
          <p>
            In the card, the bar sits in a <Code>StatPanel</Code> under the goal. The stat says what the goal is, and
            the bar shows how close it is.
          </p>
        </Prose>
        <Example files={[{ name: 'ProgressInStatPanel.tsx', code: statPanelCode }]} width={CARD_CONTENT_WIDTH}>
          <ProgressInStatPanel />
        </Example>
      </Section>

      <Section title="States">
        <Table head={['State', 'When', 'Fill width', 'Read as']}>
          <tr>
            <td>Loading in</td>
            <td>First frame after mount</td>
            <td>0%, then grows to the value</td>
            <td>The real value, from the first render</td>
          </tr>
          <tr>
            <td>Empty</td>
            <td>
              <Code>value ≤ 0</Code>
            </td>
            <td>0%</td>
            <td>“0 of 20”</td>
          </tr>
          <tr>
            <td>In progress</td>
            <td>
              <Code>0 &lt; value &lt; max</Code>
            </td>
            <td>
              <Code>value / max</Code>
            </td>
            <td>“4 of 20”</td>
          </tr>
          <tr>
            <td>Complete</td>
            <td>
              <Code>value ≥ max</Code>
            </td>
            <td>100%</td>
            <td>“20 of 20” (or the real value if over)</td>
          </tr>
          <tr>
            <td>Updating</td>
            <td>
              <Code>value</Code> changes
            </td>
            <td>
              Tweens over <Code>--resize-dur</Code> ({tokenValue('--resize-dur')})
            </td>
            <td>The new value</td>
          </tr>
        </Table>
      </Section>

      <Section title="Anatomy">
        <Table head={['Part', 'Spec', 'Token']}>
          <tr>
            <td>Root</td>
            <td>Full width, 22px tall, track centred vertically</td>
            <td>–</td>
          </tr>
          <tr>
            <td>Track</td>
            <td>10px tall, fully rounded</td>
            <td>
              <Code>--color-bg-default</Code> <Code>--radius-track</Code>
            </td>
          </tr>
          <tr>
            <td>Fill</td>
            <td>Solid, clipped by the track’s rounding</td>
            <td>
              <Code>--color-bg-secondary</Code>
            </td>
          </tr>
          <tr>
            <td>Motion</td>
            <td>
              Width tween, {tokenValue('--resize-dur')} <Code>{tokenValue('--resize-ease')}</Code>
            </td>
            <td>
              <Code>--resize-dur</Code> <Code>--resize-ease</Code>
            </td>
          </tr>
        </Table>
        <Callout>
          <p>
            Figma draws the bar as six segments. It’s built as one continuous bar, by agreement, so any value shows
            exactly. To recolour the fill, set <Code>--progress-fill</Code> on <Code>.fill</Code> in{' '}
            <Code>ProgressBar.module.css</Code>.
          </p>
        </Callout>
      </Section>

      <Section title="Progress Props">
        <PropsTable
          rows={[
            { name: 'value', type: 'number', description: 'Current amount, e.g. volunteers joined. Clamped for display.' },
            { name: 'max', type: 'number', description: 'The goal. A max of 0 or less shows an empty bar.' },
            {
              name: 'label',
              type: 'string',
              description: 'Accessible name, e.g. “Volunteers joined”. Not shown on screen.',
            },
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <Prose>
          <ul>
            <li>
              Renders <Code>role="progressbar"</Code> with <Code>aria-valuemin</Code>, <Code>aria-valuemax</Code>,{' '}
              <Code>aria-valuenow</Code> and <Code>aria-valuetext</Code> (“4 of 20”).
            </li>
            <li>
              <Code>label</Code> is required: the bar has no visible text of its own, so its name must come from here.
            </li>
            <li>The load-in and update tweens are turned off under reduced-motion settings.</li>
          </ul>
        </Prose>
        <DoDont
          dos={[
            <>Pair the bar with the numbers it represents, as the stat panel does.</>,
            <>Give it a label that names what’s being counted.</>,
          ]}
          donts={[
            <>Use it for indeterminate loading. It always shows a known value.</>,
            <>Rely on the bar alone to communicate the count.</>,
          ]}
        />
      </Section>
    </>
  );
}
