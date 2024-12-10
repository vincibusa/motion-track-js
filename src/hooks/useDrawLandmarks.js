// useDrawLandmarks.js
import { useCallback } from 'react';

const useDrawLandmarks = (requiredLandmarks) => {
  const drawLandmarks = useCallback((landmarks, ctx, width, height) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;

    // Draw lines between landmarks
    ctx.beginPath();
    for (let i = 0; i < requiredLandmarks.length - 1; i++) {
      const start = landmarks[requiredLandmarks[i]];
      const end = landmarks[requiredLandmarks[i + 1]];

      if (start && end) {
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
      }
    }
    ctx.stroke();

    // Draw landmark points
    ctx.fillStyle = '#ADD8E6';
    requiredLandmarks.forEach((idx) => {
      const landmark = landmarks[idx];
      if (landmark) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [requiredLandmarks]);

  return { drawLandmarks };
};

export default useDrawLandmarks;