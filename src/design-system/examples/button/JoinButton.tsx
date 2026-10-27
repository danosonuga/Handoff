import { useState } from 'react';
import arrowRight from '@/assets/arrow-right.svg';
import checkIcon from '@/assets/check.svg';
import { Button } from '@/components/Button/Button';

/** The card's join interaction: label morphs, arrow swaps for a check, then disabled. */
export default function JoinButton() {
  const [joined, setJoined] = useState(false);

  return (
    <Button
      leadingIcon={joined ? checkIcon : undefined}
      trailingIcon={joined ? undefined : arrowRight}
      disabled={joined}
      onClick={() => setJoined(true)}
    >
      {joined ? 'Joined' : 'Join as a volunteer'}
    </Button>
  );
}
