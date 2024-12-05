// useTimer.js
import { useState, useEffect } from 'react';

const useTimer = (isTracking, onExpire) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev >= 10) {
            clearInterval(interval);
            onExpire();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTracking, onExpire]);

  return timer;
};

export default useTimer;