import { useCallback } from 'react';

const useFullscreen = () => {
  const requestFullscreen = useCallback(containerRef => {
    const container = containerRef.current;
    
    // Check if running on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    // Handle iOS differently since it doesn't support true fullscreen
    if (isIOS) {
      // For iOS, we'll use viewport meta tag manipulation
      const metaViewport = document.querySelector('meta[name=viewport]');
      if (!metaViewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.getElementsByTagName('head')[0].appendChild(meta);
      } else {
        metaViewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
      }
      
      // Force orientation to landscape if needed
      if (window.screen.orientation && window.screen.orientation.lock) {
        window.screen.orientation.lock('landscape').catch(() => {
          // Orientation locking not supported or failed
          console.log('Orientation lock not supported');
        });
      }
      
      return;
    }

    // For Android and other devices, try native fullscreen API
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  }, []);

  return requestFullscreen;
};

export default useFullscreen;