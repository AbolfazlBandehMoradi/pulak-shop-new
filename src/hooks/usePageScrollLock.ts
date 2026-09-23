import { useEffect } from 'react';

type ScrollLockSnapshot = {
  scrollX: number;
  scrollY: number;
  body: {
    overflow: string;
    position: string;
    top: string;
    left: string;
    width: string;
    paddingRight: string;
  };
  rootOverflow: string;
};

let activeLocks = 0;
let snapshot: ScrollLockSnapshot | null = null;

function lockPageScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  activeLocks += 1;
  if (activeLocks > 1) return;

  const body = document.body;
  const root = document.documentElement;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const scrollbarWidth = window.innerWidth - root.clientWidth;

  snapshot = {
    scrollX,
    scrollY,
    body: {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    },
    rootOverflow: root.style.overflow,
  };

  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = `-${scrollX}px`;
  body.style.width = '100%';
  root.style.overflow = 'hidden';

  if (scrollbarWidth > 0) {
    const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
  }
}

function unlockPageScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || activeLocks === 0) return;

  activeLocks -= 1;
  if (activeLocks > 0 || !snapshot) return;

  const body = document.body;
  const root = document.documentElement;
  const previous = snapshot;

  body.style.overflow = previous.body.overflow;
  body.style.position = previous.body.position;
  body.style.top = previous.body.top;
  body.style.left = previous.body.left;
  body.style.width = previous.body.width;
  body.style.paddingRight = previous.body.paddingRight;
  root.style.overflow = previous.rootOverflow;

  snapshot = null;
  window.scrollTo(previous.scrollX, previous.scrollY);
}

/** Prevents the document behind an open modal or drawer from scrolling. */
export function usePageScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    lockPageScroll();
    return unlockPageScroll;
  }, [isLocked]);
}
