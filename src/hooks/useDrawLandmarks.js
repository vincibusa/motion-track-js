import { useCallback } from 'react';

const useDrawLandmarks = (landmarkConnections) => {
  const drawLandmarks = useCallback((landmarks, ctx, width, height) => {
    if (!landmarks || !ctx) return;

    // Definisci stili
    const leftSideStyle = {
      stroke: 'white',
      fill: '#ADD8E6'
    };
    
    const rightSideStyle = {
      stroke: 'white', 
      fill: '#ADD8E6'
    };

    // Funzione helper per disegnare una singola connessione
    const drawConnection = (startIdx, endIdx, style) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      
      if (start && end) {
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();

        // Disegna i punti dei landmark
        ctx.fillStyle = style.fill;
        [start, end].forEach(point => {
          ctx.beginPath();
          ctx.arc(point.x * width, point.y * height, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    };

    // Disegna le connessioni per il lato sinistro
    landmarkConnections.leftSide.forEach(([start, end]) => {
      drawConnection(start, end, leftSideStyle);
    });

    // Disegna le connessioni per il lato destro
    landmarkConnections.rightSide.forEach(([start, end]) => {
      drawConnection(start, end, rightSideStyle);
    });

  }, [landmarkConnections]);

  return { drawLandmarks };
};

// Esempio di configurazione dei landmark
export const defaultLandmarkConnections = {
  leftSide: [
    // Braccio sinistro
    [11, 13], // spalla-gomito
    [13, 15], // gomito-polso
    // Gamba sinistra
    [23, 25], // anca-ginocchio
    [25, 27], // ginocchio-caviglia
    // Torso sinistro
    [11, 23], // spalla-anca
  ],
  rightSide: [
    // Braccio destro
    [12, 14], // spalla-gomito
    [14, 16], // gomito-polso
    // Gamba destra
    [24, 26], // anca-ginocchio
    [26, 28], // ginocchio-caviglia
    // Torso destro
    [12, 24], // spalla-anca
  ]
};

export default useDrawLandmarks;