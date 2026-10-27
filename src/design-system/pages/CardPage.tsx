import { Code, DoDont, PageTitle, Prose, PropsTable, Section, Table } from '../components/Doc/Doc';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { Example } from '../components/Example/Example';
import CardParts from '../examples/card/CardParts';
import cardPartsCss from '../examples/card/CardParts.module.css?raw';
import cardPartsCode from '../examples/card/CardParts.tsx?raw';
import DefaultCard from '../examples/card/DefaultCard';
import defaultCode from '../examples/card/DefaultCard.tsx?raw';
import DisabledCard from '../examples/card/DisabledCard';
import disabledCode from '../examples/card/DisabledCard.tsx?raw';
import PlaceholderCard from '../examples/card/PlaceholderCard';
import placeholderCode from '../examples/card/PlaceholderCard.tsx?raw';

const causeType = `type Cause = {
  title: string;
  imageSrc?: string; // omit to show the placeholder
  imageAlt: string;
  org: {
    name: string;
    logoSrc: string;
    logoAlt: string;
    verified?: boolean;
  };
  volunteersJoined: number; // pill count + progress value
  volunteerGoal: number; // "Volunteers needed" + progress max
};`;

export function CardPage() {
  return (
    <>
      <PageTitle title="Card">
        The cause card (<Code>CauseCard</Code>, Figma frame V2 24:247) presents one volunteering cause: photo,
        organisation, title, progress towards a volunteer goal, and a call to action.
      </PageTitle>

      <Section title="Cause Card">
        <Prose>
          <p>
            Pass a <Code>Cause</Code> object. The card fills its container up to 368px wide and keeps the photo’s
            proportions as it shrinks.
          </p>
        </Prose>
        <Example files={[{ name: 'DefaultCard.tsx', code: defaultCode }]} stage="on-canvas">
          <DefaultCard />
        </Example>
      </Section>

      <Section title="Without Image">
        <Prose>
          <p>
            Leave out <Code>imageSrc</Code> (or let it fail to load) and the media slot shows a placeholder. Long
            titles clamp to two lines; the byline truncates to one.
          </p>
        </Prose>
        <Example files={[{ name: 'PlaceholderCard.tsx', code: placeholderCode }]} stage="on-canvas">
          <PlaceholderCard />
        </Example>
      </Section>

      <Section title="Disabled Action">
        <Prose>
          <p>
            Set <Code>ctaDisabled</Code> when the cause can’t take more volunteers, and change the label to say why.
          </p>
        </Prose>
        <Example files={[{ name: 'DisabledCard.tsx', code: disabledCode }]} stage="on-canvas">
          <DisabledCard />
        </Example>
      </Section>

      <Section title="Anatomy">
        <Table head={['#', 'Part', 'Component', 'Spec']}>
          <tr>
            <td>1</td>
            <td>Container</td>
            <td>
              <Code>CauseCard</Code>
            </td>
            <td>
              Max 368px, 8px padding, <Code>--radius-xl</Code> (24px), <Code>--shadow-card</Code>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>Photo</td>
            <td>
              <Code>CauseCardMedia</Code>
            </td>
            <td>
              Aspect ratio 352 / 195, <Code>--radius-lg</Code> (16px), fades in on load
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td>Volunteer count</td>
            <td>
              <Code>Pill</Code>
            </td>
            <td>28px, ink at 60%, Micro/Medium, 16px from the photo’s top-left</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Logo</td>
            <td>
              <Code>OrgLogo</Code>
            </td>
            <td>64px tile overlapping the photo by 22px, <Code>--shadow-logo</Code></td>
          </tr>
          <tr>
            <td>5</td>
            <td>Byline</td>
            <td>
              <Code>OrgByline</Code>
            </td>
            <td>Micro/Regular, Text/neutral, optional 12px verified badge</td>
          </tr>
          <tr>
            <td>6</td>
            <td>Title</td>
            <td>
              <Code>{'<h3>'}</Code>
            </td>
            <td>Small/Bold, Text/default, max 2 lines</td>
          </tr>
          <tr>
            <td>7</td>
            <td>Stats</td>
            <td>
              <Code>StatPanel</Code> + <Code>ProgressBar</Code>
            </td>
            <td>
              Background/on-canvas panel with a CAPS label and Micro/Bold value; see{' '}
              <a href="#/components/progress">Progress</a>
            </td>
          </tr>
          <tr>
            <td>8</td>
            <td>Action</td>
            <td>
              <Code>Button</Code>
            </td>
            <td>
              Recoloured to <Code>--color-cta-volunteer</Code>; see <a href="#/components/button">Button</a>
            </td>
          </tr>
        </Table>
      </Section>

      <Section title="Building Blocks">
        <Prose>
          <p>The card’s parts are components too, and can be reused on their own.</p>
        </Prose>
        <Example
          files={[
            { name: 'CardParts.tsx', code: cardPartsCode },
            { name: 'CardParts.module.css', code: cardPartsCss },
          ]}
          stage="on-canvas"
        >
          <CardParts />
        </Example>
        <Table head={['Component', 'Props', 'Purpose']}>
          <tr>
            <td>
              <Code>CauseCardMedia</Code>
            </td>
            <td>
              <Code>src?</Code> <Code>alt</Code> <Code>overlay?</Code> <Code>className?</Code>
            </td>
            <td>Photo with load reveal, placeholder fallback and a top-left overlay slot</td>
          </tr>
          <tr>
            <td>
              <Code>Pill</Code>
            </td>
            <td>
              <Code>children</Code> <Code>className?</Code>
            </td>
            <td>Translucent dark chip for short status text over imagery</td>
          </tr>
          <tr>
            <td>
              <Code>OrgLogo</Code>
            </td>
            <td>
              <Code>src</Code> <Code>alt</Code>
            </td>
            <td>Organisation mark on an elevated white tile</td>
          </tr>
          <tr>
            <td>
              <Code>OrgByline</Code>
            </td>
            <td>
              <Code>name</Code> <Code>verified?</Code>
            </td>
            <td>Organisation name with optional verified badge</td>
          </tr>
          <tr>
            <td>
              <Code>StatPanel</Code>
            </td>
            <td>
              <Code>label</Code> <Code>value</Code> <Code>children?</Code>
            </td>
            <td>Soft panel with a CAPS label, a value and supporting content</td>
          </tr>
          <tr>
            <td>
              <Code>ProgressBar</Code>
            </td>
            <td>
              <Code>value</Code> <Code>max</Code> <Code>label</Code>
            </td>
            <td>
              Continuous fill of value / max, clamped 0–100%, animates in. See{' '}
              <a href="#/components/progress">Progress</a>
            </td>
          </tr>
        </Table>
      </Section>

      <Section title="Card Props">
        <PropsTable
          rows={[
            { name: 'cause', type: 'Cause', description: 'The content to show (see below).' },
            { name: 'ctaLabel', type: 'string', description: 'Button label.', defaultValue: "'Join as a volunteer'" },
            {
              name: 'ctaJoinedLabel',
              type: 'string',
              description: 'Label after clicking; the button then disables.',
              defaultValue: "'Joined'",
            },
            { name: 'ctaDisabled', type: 'boolean', description: 'Disables the button.', defaultValue: 'false' },
            { name: 'onCtaClick', type: '() => void', description: 'Called when the button is clicked.' },
          ]}
        />
        <CodeBlock code={causeType} label="Cause" />
      </Section>

      <Section title="Accessibility">
        <Prose>
          <ul>
            <li>
              The card is an <Code>{'<article>'}</Code> with a <Code>{'<header>'}</Code> and an <Code>{'<h3>'}</Code>{' '}
              title. Place it under an <Code>{'<h2>'}</Code> in the page outline.
            </li>
            <li>
              The stat is a <Code>{'<dl>'}</Code> read as “Volunteers needed: 20”; it’s reversed visually with CSS
              only.
            </li>
            <li>
              The progress bar has <Code>role="progressbar"</Code> with its value, max and “4 of 20” text.
            </li>
            <li>Numbers are announced whole (“20”, not “2 0”), even while their digits animate.</li>
          </ul>
        </Prose>
        <DoDont
          dos={[
            <>Write alt text that describes the photo, not “cause image”.</>,
            <>Keep the card at its natural height; let the title clamp.</>,
          ]}
          donts={[
            <>
              Add <Code>z-index</Code> to the photo or body: it breaks the logo overlap.
            </>,
            <>Put more than one action in the card.</>,
          ]}
        />
      </Section>
    </>
  );
}
