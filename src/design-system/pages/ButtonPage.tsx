import { useState } from 'react';
import { Callout, Code, DoDont, PageTitle, Prose, PropsTable, Section, Table } from '../components/Doc/Doc';
import { Example } from '../components/Example/Example';
import { contrastRatio, hexToRgb } from '../lib/colour';
import { getToken, resolveValue } from '../lib/tokens';
import DisabledButton from '../examples/button/DisabledButton';
import disabledCode from '../examples/button/DisabledButton.tsx?raw';
import IconButtons from '../examples/button/IconButtons';
import iconCode from '../examples/button/IconButtons.tsx?raw';
import JoinButton from '../examples/button/JoinButton';
import joinCode from '../examples/button/JoinButton.tsx?raw';
import PrimaryButton from '../examples/button/PrimaryButton';
import primaryCode from '../examples/button/PrimaryButton.tsx?raw';
import RecolouredButton from '../examples/button/RecolouredButton';
import recolouredCss from '../examples/button/RecolouredButton.module.css?raw';
import recolouredCode from '../examples/button/RecolouredButton.tsx?raw';
import styles from './Components.module.css';

/** White-label contrast on a fill token, e.g. "2.75". */
function labelContrast(fill: string) {
  const label = hexToRgb(resolveValue(getToken('--color-text-on-solid-bg')?.value ?? ''));
  const background = hexToRgb(resolveValue(getToken(fill)?.value ?? ''));
  return label && background ? contrastRatio(label, background).toFixed(2) : '?';
}

export function ButtonPage() {
  // Remounts the join example so it can be replayed.
  const [joinRun, setJoinRun] = useState(0);

  return (
    <>
      <PageTitle title="Button">
        The primary action. One filled style (Figma <Code>Button</Code>, node 29:447) with three states, optional
        16px icon slots, and custom properties for recolouring.
      </PageTitle>

      <Section title="Primary Button">
        <Prose>
          <p>Use for the main action in a view. Keep labels short, in sentence case, and start with a verb.</p>
        </Prose>
        <Example files={[{ name: 'PrimaryButton.tsx', code: primaryCode }]}>
          <PrimaryButton />
        </Example>
      </Section>

      <Section title="Icon Button">
        <Prose>
          <p>
            <Code>trailingIcon</Code> points forward (the arrow nudges right on hover). <Code>leadingIcon</Code> confirms
            a state, like the check after joining. Icons are single-colour SVGs that take the label’s colour.
          </p>
        </Prose>
        <Example files={[{ name: 'IconButtons.tsx', code: iconCode }]}>
          <IconButtons />
        </Example>
      </Section>

      <Section title="Disabled Button">
        <Prose>
          <p>
            Uses the native <Code>disabled</Code> attribute: Buttons/disabled fill, Text/disabled label, no shadow, no
            hover. Disabled styling wins over any recolour.
          </p>
        </Prose>
        <Example files={[{ name: 'DisabledButton.tsx', code: disabledCode }]}>
          <DisabledButton />
        </Example>
      </Section>

      <Section title="Recoloured Button">
        <Prose>
          <p>
            Recolour a button by setting its custom properties from a class, rather than overriding its internals.
            This is how the cause card gets its purple CTA (Figma V2).
          </p>
        </Prose>
        <Example
          files={[
            { name: 'RecolouredButton.tsx', code: recolouredCode },
            { name: 'RecolouredButton.module.css', code: recolouredCss },
          ]}
        >
          <RecolouredButton />
        </Example>
        <Table head={['Custom property', 'Default', 'Controls']}>
          <tr>
            <td>
              <Code>--button-bg</Code>
            </td>
            <td>
              <Code>--color-button-primary</Code>
            </td>
            <td>Fill</td>
          </tr>
          <tr>
            <td>
              <Code>--button-bg-pressed</Code>
            </td>
            <td>
              <Code>--color-button-primary-clicked</Code>
            </td>
            <td>Fill while pressed, and the focus ring</td>
          </tr>
          <tr>
            <td>
              <Code>--button-shadow</Code>
            </td>
            <td>
              <Code>--shadow-button-inset</Code>
            </td>
            <td>Inset bottom edge (removed while pressed)</td>
          </tr>
        </Table>
      </Section>

      <Section title="Join Interaction">
        <Prose>
          <p>
            Click to see the card’s join motion: the label morphs, the arrow swaps out, a check swaps in, and the
            button eases into disabled. The state is local and visual only.
          </p>
        </Prose>
        <Example files={[{ name: 'JoinButton.tsx', code: joinCode }]}>
          <JoinButton key={joinRun} />
          <button type="button" className={styles.replay} onClick={() => setJoinRun((n) => n + 1)}>
            Replay
          </button>
        </Example>
      </Section>

      <Section title="States">
        <Table head={['State', 'Trigger', 'Fill', 'Label', 'Shadow']}>
          <tr>
            <td>Default</td>
            <td>–</td>
            <td>
              <Code>--color-button-primary</Code>
            </td>
            <td>
              <Code>--color-text-on-solid-bg</Code>
            </td>
            <td>
              <Code>--shadow-button-inset</Code>
            </td>
          </tr>
          <tr>
            <td>Clicked</td>
            <td>
              <Code>:active</Code> (press and hold)
            </td>
            <td>
              <Code>--color-button-primary-clicked</Code>
            </td>
            <td>
              <Code>--color-text-on-solid-bg</Code>
            </td>
            <td>none</td>
          </tr>
          <tr>
            <td>Disabled</td>
            <td>
              <Code>disabled</Code>
            </td>
            <td>
              <Code>--color-button-disabled</Code>
            </td>
            <td>
              <Code>--color-text-disabled</Code>
            </td>
            <td>none</td>
          </tr>
          <tr>
            <td>Focus</td>
            <td>
              <Code>:focus-visible</Code>
            </td>
            <td>unchanged</td>
            <td>unchanged</td>
            <td>2px outline in the pressed colour, 2px offset</td>
          </tr>
        </Table>
      </Section>

      <Section title="Anatomy">
        <Table head={['Part', 'Spec', 'Token']}>
          <tr>
            <td>Height</td>
            <td>40px</td>
            <td>–</td>
          </tr>
          <tr>
            <td>Padding</td>
            <td>12px × 14px</td>
            <td>
              <Code>--space-12</Code> <Code>--space-14</Code>
            </td>
          </tr>
          <tr>
            <td>Icon gap</td>
            <td>8px</td>
            <td>
              <Code>--space-8</Code>
            </td>
          </tr>
          <tr>
            <td>Radius</td>
            <td>12px</td>
            <td>
              <Code>--radius-md</Code>
            </td>
          </tr>
          <tr>
            <td>Label</td>
            <td>Button/Large, 590 14/22, trimmed to cap height</td>
            <td>
              <Code>--type-button-large</Code>
            </td>
          </tr>
          <tr>
            <td>Icons</td>
            <td>16px slots, before and after the label</td>
            <td>–</td>
          </tr>
        </Table>
      </Section>

      <Section title="Button Props">
        <Prose>
          <p>
            Accepts every native <Code>{'<button>'}</Code> attribute, plus the icon slots.
          </p>
        </Prose>
        <PropsTable
          rows={[
            { name: 'children', type: 'React.ReactNode', description: 'The label. A string label morphs when it changes.' },
            { name: 'leadingIcon', type: 'string', description: 'URL of a single-colour SVG shown before the label.' },
            {
              name: 'trailingIcon',
              type: 'string',
              description: 'URL of a single-colour SVG shown after the label. Enables the hover nudge.',
            },
            { name: 'type', type: "'button' | 'submit' | 'reset'", description: 'Native button type.', defaultValue: "'button'" },
            { name: 'disabled', type: 'boolean', description: 'Disables the button and applies the disabled style.', defaultValue: 'false' },
            { name: 'className', type: 'string', description: 'Class on the root, e.g. to set the custom properties.' },
            {
              name: '...props',
              type: 'React.ButtonHTMLAttributes<HTMLButtonElement>',
              description: 'Any other native button attribute, such as onClick or aria-label.',
            },
          ]}
        />
      </Section>

      <Section title="Accessibility">
        <Prose>
          <ul>
            <li>
              Renders a native <Code>{'<button>'}</Code>, so it’s keyboard and screen-reader ready. Icons are{' '}
              <Code>aria-hidden</Code>; the label names the button.
            </li>
            <li>The tap target is 40px tall: above WCAG 2.2 AA (24px), below Apple’s 44pt guideline.</li>
            <li>All motion is removed under reduced-motion settings.</li>
          </ul>
        </Prose>
        <Callout tone="warning" icon="⚠️">
          <p>
            White on the blue <Code>--color-button-primary</Code> is {labelContrast('--color-button-primary')}:1, below AA for a
            14px label. The purple volunteer CTA passes at {labelContrast('--color-cta-volunteer')}:1. See <a href="#/foundations/colours">Colours → Contrast</a>.
          </p>
        </Callout>
        <DoDont
          dos={[<>Use one primary button per view.</>, <>Write labels that say what happens: “Join as a volunteer”, not “OK”.</>]}
          donts={[
            <>Style the button’s inner spans from outside; use the custom properties.</>,
            <>Use multi-colour SVGs as icons; they render in one colour.</>,
          ]}
        />
      </Section>
    </>
  );
}
