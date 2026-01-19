import { useState, useEffect } from 'react';

export default function useTimer(initialSeconds) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive]);

  const resetTimer = () => {
    setTimeLeft(initialSeconds);
    setIsActive(true);
  };

  const pauseTimer = () => setIsActive(false);
  const resumeTimer = () => setIsActive(true);

  return { 
    timeLeft, 
    resetTimer, 
    pauseTimer, 
    resumeTimer,
    isActive 
  };
}
