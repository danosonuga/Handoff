import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { MorphText } from '../MorphText/MorphText';
import styles from './Button.module.css';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  /** Optional icon before the label (Figma slot: system/add_circle_fill, hidden in V1). */
  leadingIcon?: string;
  /** Optional icon after the label (Figma slot: arrow/arrow_right_line). */
  trailingIcon?: string;
};

type IconSlotProps = {
  src?: string;
  side: 'leading' | 'trailing';
  iconClassName?: string;
};

/**
 * An icon slot that animates its icon in and out: transitions.dev "Icon swap"
 * between an empty icon (a) and the icon (b), while the slot's width eases
 * open or closed so the button resizes smoothly.
 */
function IconSlot({ src, side, iconClassName }: IconSlotProps) {
  // Keep the last icon so it can animate out after `src` is cleared.
  const last = useRef(src);
  if (src) last.current = src;
  const open = Boolean(src);

  return (
    <span
      className={[styles.slot, styles[side], 't-icon-swap'].join(' ')}
      data-state={open ? 'b' : 'a'}
      data-open={open}
      aria-hidden="true"
    >
      <span className="t-icon" data-icon="a" />
      <span className="t-icon" data-icon="b">
        {last.current && <Icon src={last.current} className={iconClassName} />}
      </span>
    </span>
  );
}

/**
 * Figma component "Button" — primary variant.
 * States: default, clicked (rendered as :active) and disabled (native attribute).
 */
export function Button({
  children,
  leadingIcon,
  trailingIcon,
  type = 'button',
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      // t-learn: transitions.dev "Learn more hover" — nudges the trailing icon on hover.
      className={[styles.button, trailingIcon && 't-learn', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <IconSlot src={leadingIcon} side="leading" />
      {/* String labels morph when they change (transitions.dev "Text morph"). */}
      <span className={styles.label}>{typeof children === 'string' ? <MorphText text={children} /> : children}</span>
      <IconSlot src={trailingIcon} side="trailing" iconClassName="t-learn-chevron" />
    </button>
  );
}
