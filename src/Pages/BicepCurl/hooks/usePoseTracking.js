/* eslint-disable react-hooks/exhaustive-deps */

  
  // usePoseTracking.js
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
    validateRepetition,
  }) => {
    const REQUIRED_LANDMARKS = useMemo(() => 
      side === 'left'
        ? [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]
        : [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
      [side]
    );
  
    const { drawLandmarks } = useDrawLandmarks(REQUIRED_LANDMARKS);
  
    const calculateArmAngle = useCallback((shoulder, elbow, wrist) => {
      const upperArm = {
        x: elbow[0] - shoulder[0],
        y: elbow[1] - shoulder[1]
      };
      
      const forearm = {
        x: wrist[0] - elbow[0],
        y: wrist[1] - elbow[1]
      };
  
      const upperArmAngle = Math.atan2(upperArm.y, upperArm.x);
      const forearmAngle = Math.atan2(forearm.y, forearm.x);
  
      let angleDifference = (forearmAngle - upperArmAngle) * (180 / Math.PI);
  
      angleDifference = Math.abs(angleDifference);
      if (angleDifference > 180) {
        angleDifference = 360 - angleDifference;
      }
  
      console.log('📐 Current Angle:', angleDifference);
      
      return angleDifference;
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
        const [shoulderIndex, elbowIndex, wristIndex] = REQUIRED_LANDMARKS;
  
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
  
        const armAngle = calculateArmAngle(shoulder, elbow, wrist);
        setAngle(armAngle);
        validateRepetition(armAngle);
        
        // Per il maxFlexion, ora cerchiamo l'angolo più piccolo (curl più completo)
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
  
    return null;
  };
  
  export default usePoseTracking;