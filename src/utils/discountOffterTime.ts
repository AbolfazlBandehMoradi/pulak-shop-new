import { useEffect, useState } from "react";

const discountOfferTime = (expireDate: string | null) => {
  if (!expireDate) return
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeLeft = (targetTime: number) => {
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  useEffect(() => {
    const targetTime = new Date(expireDate).getTime();

    const updateCountdown = () => {
      const newTimeLeft = calculateTimeLeft(targetTime);
      if (!newTimeLeft) {
        clearInterval(intervalRef.current);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft(newTimeLeft);
    };

    const intervalRef = { current: setInterval(updateCountdown, 1000) };

    updateCountdown();

    return () => clearInterval(intervalRef.current);
  }, [expireDate]);

  return timeLeft;
};

export default discountOfferTime;
