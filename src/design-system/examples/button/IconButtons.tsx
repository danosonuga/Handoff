import arrowRight from '@/assets/arrow-right.svg';
import checkIcon from '@/assets/check.svg';
import { Button } from '@/components/Button/Button';

export default function IconButtons() {
  return (
    <>
      {/* Trailing icon: the arrow nudges right on hover. */}
      <Button trailingIcon={arrowRight}>Join Cause</Button>
      <Button leadingIcon={checkIcon}>Joined</Button>
    </>
  );
}
