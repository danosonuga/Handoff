import arrowRight from '@/assets/arrow-right.svg';
import { Button } from '@/components/Button/Button';

export default function DisabledButton() {
  return (
    <>
      <Button disabled>Join Cause</Button>
      <Button disabled trailingIcon={arrowRight}>
        Join Cause
      </Button>
    </>
  );
}
