// useFullscreen.js
import { useCallback } from 'react';

const useFullscreen = () => {
  const requestFullscreen = useCallback(containerRef => {
    const container = containerRef.current;
    container?.requestFullscreen?.() ||
      container?.webkitRequestFullscreen?.() ||
      container?.mozRequestFullScreen?.() ||
      container?.msRequestFullscreen?.();
  }, []);

  return requestFullscreen;
};

export default useFullscreen;