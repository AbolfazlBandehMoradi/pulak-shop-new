import { useEffect, useMemo, useRef, useState } from "react";

export type DiscountOfferTime = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isValid: boolean;
};

const EMPTY_TIME: DiscountOfferTime = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: true,
  isValid: false,
};

const getRemainingTime = (endAtMs: number): DiscountOfferTime => {
  const difference = Math.max(endAtMs - Date.now(), 0);

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isExpired: difference === 0,
    isValid: true,
  };
};

const useDiscountOfferTime = (
  expireDate: string | null | undefined,
): DiscountOfferTime => {
  const endAtMs = useMemo(
    () => (expireDate ? Date.parse(expireDate) : Number.NaN),
    [expireDate],
  );

  const intervalRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const [timeLeft, setTimeLeft] = useState<DiscountOfferTime>(() =>
    Number.isFinite(endAtMs) ? getRemainingTime(endAtMs) : EMPTY_TIME,
  );

  useEffect(() => {
    if (!Number.isFinite(endAtMs)) {
      setTimeLeft(EMPTY_TIME);
      return;
    }

    const updateCountdown = () => {
      const nextTime = getRemainingTime(endAtMs);
      setTimeLeft(nextTime);

      if (nextTime.isExpired && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    updateCountdown();
    intervalRef.current = window.setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [endAtMs]);

  return timeLeft;
};

export default useDiscountOfferTime;
