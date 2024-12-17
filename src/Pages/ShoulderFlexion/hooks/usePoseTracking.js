/* eslint-disable react-hooks/exhaustive-deps */
// usePoseTracking.js
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { POSE_LANDMARKS } from '../constants/constants';
import useDrawLandmarks from '../../../hooks/useDrawLandmarks';
import useSetupPose from '../../../hooks/useSetUpPose';
import { toast } from 'react-toastify';

const usePoseTracking = ({
  side,
  isTracking,
  canvasRef,
  videoRef,
  setAngle,
  setMaxFlexion,
}) => {

  const landmarkConnections = useMemo(() => ({
    leftSide: [
      [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
      [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]
    ],
    rightSide: [
      [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
      [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST]
    ]
  }), []);

  const REQUIRED_LANDMARKS = useMemo(() => {
    return side === 'left'
      ? [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]
      : [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST];
  }, [side]);

  const { drawLandmarks } = useDrawLandmarks(
    {
      leftSide: side === 'left' ? landmarkConnections.leftSide : [],
      rightSide: side === 'right' ? landmarkConnections.rightSide : []
    }
  );

  // Riferimenti per tracciare la visualizzazione dei toast
  const hasShownPositiveAngleToast = useRef(false);
  const hasShownAlignmentToast = useRef(false);

  // Funzione aggiornata per calcolare l'angolo con segno
  const calculateShoulderFlexion = useCallback((hip, shoulder, elbow) => {
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];

    const dotProduct = hipToShoulder[0] * shoulderToElbow[0] + hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.hypot(...hipToShoulder);
    const magnitude2 = Math.hypot(...shoulderToElbow);

    let angleRadians = Math.acos(Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1));

    const crossProduct = hipToShoulder[0] * shoulderToElbow[1] - hipToShoulder[1] * shoulderToElbow[0];
    const sign = crossProduct < 0 ? -1 : 1;

    const angleDegrees = (angleRadians * 180) / Math.PI;
    console.log(angleDegrees * sign);
    return angleDegrees * sign;
  }, []);

  const checkPositionAlignment = useCallback((hip, shoulder) => {
    const idealDirection = [0, -1];
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const length = Math.hypot(...hipToShoulder);
    const unitHipToShoulder = hipToShoulder.map(coord => coord / length);

    const dotProduct = idealDirection[0] * unitHipToShoulder[0] + idealDirection[1] * unitHipToShoulder[1];
    return Math.acos(Math.min(Math.max(dotProduct, -1), 1)) * (180 / Math.PI);
  }, []);

  const onResults = useCallback(
    (results) => {
      if (!results.poseLandmarks) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const landmarks = results.poseLandmarks;
      const [hipIdx, shoulderIdx, elbowIdx] = REQUIRED_LANDMARKS;

      const hip = [landmarks[hipIdx].x * width, landmarks[hipIdx].y * height];
      const shoulder = [landmarks[shoulderIdx].x * width, landmarks[shoulderIdx].y * height];
      const elbow = [landmarks[elbowIdx].x * width, landmarks[elbowIdx].y * height];

      const newAngle = calculateShoulderFlexion(hip, shoulder, elbow);
      setAngle(newAngle);
      setMaxFlexion((prevMax) => {
        const updatedMax = Math.max(prevMax, Math.abs(newAngle));
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });

      // Mostra toast se l'angolo è positivo e non è già stato mostrato
      if (newAngle > 0) {
        if (!hasShownPositiveAngleToast.current) {
          toast.error("Esecuzione esercizio scorretta", {
            position: "top-center",
            autoClose: 3000,
            draggable: true,
          });
          hasShownPositiveAngleToast.current = true;
        }
      } else {
        // Reset del flag quando l'angolo non è più positivo
        hasShownPositiveAngleToast.current = false;
      }

      const alignmentAngle = checkPositionAlignment(hip, shoulder);
      const tolerance = 30;
      if (alignmentAngle > tolerance) {
        if (!hasShownAlignmentToast.current) {
          toast.error("Posizione scorretta! Per favore allinea la tua spalla perpendicolarmente al terreno.", {
            position: "top-center",
            autoClose: 3000,
            draggable: true,
          });
          hasShownAlignmentToast.current = true;
        }
      } else {
        // Reset del flag quando l'allineamento è corretto
        hasShownAlignmentToast.current = false;
      }

      drawLandmarks(landmarks, ctx, width, height);
    },
    [
    
    ]
  );

  const { setupPose, cleanup, trackingRef } = useSetupPose({ videoRef, onResults });

  useEffect(() => {
    if (isTracking) {
      trackingRef.current = true;
      setupPose();
    }
    return cleanup;
  }, [isTracking, setupPose,]);

  useEffect(() => {
    const handleResize = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        video.width = Math.min(window.innerWidth, 1280);
        video.height = Math.min(window.innerHeight, 720);
        canvas.width = video.width;
        canvas.height = video.height;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [videoRef, canvasRef]);

  return null;
};

export default usePoseTracking;
