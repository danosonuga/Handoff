import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Button.module.css';

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  children: ReactNode;
  /** Optional icon before the label (Figma slot: system/add_circle_fill, hidden in V1). */
  leadingIcon?: string;
  /** Optional icon after the label (Figma slot: arrow/arrow_right_line). */
  trailingIcon?: string;
};

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
      {leadingIcon && <Icon src={leadingIcon} />}
      <span className={styles.label}>{children}</span>
      {trailingIcon && <Icon src={trailingIcon} className="t-learn-chevron" />}
    </button>
  );
}
