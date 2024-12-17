/* eslint-disable react-hooks/exhaustive-deps */
/* hooks/usePoseTracking.js */
import { useCallback, useEffect, useMemo } from 'react';
import { POSE_LANDMARKS } from '../constants/constants';
import useDrawLandmarks from '../../../hooks/useDrawLandmarks';
import useSetupPose from '../../../hooks/useSetUpPose';

const usePoseTracking = ({
  side,
  isTracking,
  canvasRef,
  videoRef,
  setAngle,
  setMaxFlexion,
  validateRepetition, // Funzione aggiornata per includere la distanza
}) => {
  // Definiamo le connessioni per ogni lato
  const landmarkConnections = useMemo(() => ({
    leftSide: [
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
      [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
      [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
    ],
    rightSide: [
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
      [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
      [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
    ]
  }), []);

  // Manteniamo REQUIRED_LANDMARKS per il calcolo degli angoli
  const REQUIRED_LANDMARKS = useMemo(() =>
    side === 'left'
      ? [
          POSE_LANDMARKS.LEFT_SHOULDER,
          POSE_LANDMARKS.LEFT_ELBOW,
          POSE_LANDMARKS.LEFT_WRIST,
          POSE_LANDMARKS.LEFT_HIP,
          POSE_LANDMARKS.LEFT_EAR, // Aggiunto l'orecchio sinistro
        ]
      : [
          POSE_LANDMARKS.RIGHT_SHOULDER,
          POSE_LANDMARKS.RIGHT_ELBOW,
          POSE_LANDMARKS.RIGHT_WRIST,
          POSE_LANDMARKS.RIGHT_HIP,
          POSE_LANDMARKS.RIGHT_EAR, // Aggiunto l'orecchio destro
        ],
    [side]
  );

  // Usiamo il nuovo hook con le connessioni appropriate
  const { drawLandmarks } = useDrawLandmarks({
    leftSide: side === 'left' ? landmarkConnections.leftSide : [],
    rightSide: side === 'right' ? landmarkConnections.rightSide : []
  });

  const calculateArmAngle = useCallback((shoulder, elbow, wrist) => {
    const upperArm = {
      x: elbow[0] - shoulder[0],
      y: elbow[1] - shoulder[1],
    };

    const forearm = {
      x: wrist[0] - elbow[0],
      y: wrist[1] - elbow[1],
    };

    const upperArmAngle = Math.atan2(upperArm.y, upperArm.x);
    const forearmAngle = Math.atan2(forearm.y, forearm.x);

    let angleDifference = (forearmAngle - upperArmAngle) * (180 / Math.PI);
    angleDifference = Math.abs(angleDifference);
    if (angleDifference > 180) {
      angleDifference = 360 - angleDifference;
    }

    return angleDifference;
  }, []);

  const calculateShoulderHipAngle = useCallback((shoulder, hip) => {
    const verticalVector = { x: 0, y: 1 };
    
    const shoulderHipVector = {
      x: hip[0] - shoulder[0],
      y: hip[1] - shoulder[1],
    };

    const dotProduct = (shoulderHipVector.x * verticalVector.x) + 
                      (shoulderHipVector.y * verticalVector.y);
    const shoulderHipMagnitude = Math.sqrt(
      shoulderHipVector.x * shoulderHipVector.x + 
      shoulderHipVector.y * shoulderHipVector.y
    );

    const angle = Math.acos(dotProduct / shoulderHipMagnitude) * (180 / Math.PI);
    return angle;
  }, []);

  const calculateShoulderEarDistance = useCallback((shoulder, ear) => {
    const dx = ear[0] - shoulder[0];
    const dy = ear[1] - shoulder[1];
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const onResults = useCallback(
    (results) => {
      if (!trackingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas || !results.poseLandmarks) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const landmarks = results.poseLandmarks;
      const [shoulderIndex, elbowIndex, wristIndex, hipIndex, earIndex] = REQUIRED_LANDMARKS;

      const shoulder = [
        landmarks[shoulderIndex].x * width,
        landmarks[shoulderIndex].y * height,
      ];
      const elbow = [
        landmarks[elbowIndex].x * width,
        landmarks[elbowIndex].y * height,
      ];
      const wrist = [
        landmarks[wristIndex].x * width,
        landmarks[wristIndex].y * height,
      ];
      const hip = [
        landmarks[hipIndex].x * width,
        landmarks[hipIndex].y * height,
      ];
      const ear = [
        landmarks[earIndex].x * width,
        landmarks[earIndex].y * height,
      ];

      const armAngle = calculateArmAngle(shoulder, elbow, wrist);
      const shoulderHipAngle = calculateShoulderHipAngle(shoulder, hip);
      const shoulderEarDistance = calculateShoulderEarDistance(shoulder, ear);

      setAngle(armAngle);
      // Passiamo sia gli angoli che la distanza a validateRepetition
      validateRepetition(armAngle, shoulderHipAngle, shoulderEarDistance);

      setMaxFlexion((prevMax) => {
        const updatedMax = Math.min(prevMax, armAngle);
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });

      drawLandmarks(landmarks, ctx, width, height);
    },
    []
  );

  const { setupPose, cleanup, trackingRef } = useSetupPose({ videoRef, onResults });

  useEffect(() => {
    if (isTracking) {
      trackingRef.current = true;
      setupPose();
    }
    return cleanup;
  }, [isTracking, setupPose]);

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
