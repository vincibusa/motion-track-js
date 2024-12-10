// VideoCanvas.jsx
import React, { useEffect } from 'react';

const VideoCanvas = ({ videoRef, canvasRef, isTracking }) => {
  return (
    <div className="relative w-full h-full">
      <video
        style={{ transform: 'scaleX(-1)' }}
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        autoPlay
        playsInline
        muted
      />
      <canvas
        style={{ transform: 'scaleX(-1)' }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </div>
  );
};

export default VideoCanvas;