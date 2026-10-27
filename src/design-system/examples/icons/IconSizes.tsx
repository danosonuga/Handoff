import starLine from '@/assets/icons/shape/star-line.svg';
import { Icon } from '@/components/Icon/Icon';

// Drawn on a 24px grid: 24 by default in layouts, 20 in dense lists, 16 inside buttons.
export default function IconSizes() {
  return (
    <>
      <Icon src={starLine} size={16} />
      <Icon src={starLine} size={20} />
      <Icon src={starLine} size={24} />
    </>
  );
}
