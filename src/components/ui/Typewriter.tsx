import { useEffect, useState } from 'react';

type TypewriterProps = {
  text: string;
  start: boolean;
  loop?: number; // 0 = infinite
  cursor?: boolean;
  cursorStyle?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  delaySpeed?: number;
};

function Typewriter({
  text,
  start,
  loop = 0,
  cursor = false,
  cursorStyle = '|',
  typeSpeed = 70,
  deleteSpeed = 40,
  delaySpeed = 1500,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!start) return;

    let i = 0;
    let isDeleting = false;
    let loopsDone = 0;

    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (!isDeleting) {
        // typing
        setDisplayed(text.slice(0, i + 1));
        i++;

        if (i === text.length) {
          isDeleting = true;

          timeout = setTimeout(tick, delaySpeed);
          return;
        }

        timeout = setTimeout(tick, typeSpeed);
      } else {
        // deleting
        setDisplayed(text.slice(0, i - 1));
        i--;

        if (i === 0) {
          isDeleting = false;
          loopsDone++;

          if (loop !== 0 && loopsDone >= loop) return;

          timeout = setTimeout(tick, typeSpeed);
          return;
        }

        timeout = setTimeout(tick, deleteSpeed);
      }
    };

    tick();

    return () => clearTimeout(timeout);
  }, [text, start, loop, typeSpeed, deleteSpeed, delaySpeed]);

  return (
    <>
      {displayed}
      {cursor && <span>{cursorStyle}</span>}
    </>
  );
}

export default Typewriter;
