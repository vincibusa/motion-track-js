// usePoseTracking.js
import { useCallback, useEffect } from 'react';

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



  const REQUIRED_LANDMARKS = side === 'left'
    ? [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE]
    : [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE];

    const { drawLandmarks } = useDrawLandmarks(REQUIRED_LANDMARKS);

  const calculateKneeAngle = (hip, knee, ankle) => {
    const hipToKnee = [knee[0] - hip[0], knee[1] - hip[1]];
    const kneeToAnkle = [ankle[0] - knee[0], ankle[1] - knee[1]];
    
    const dotProduct = hipToKnee[0] * kneeToAnkle[0] + hipToKnee[1] * kneeToAnkle[1];
    const magnitude1 = Math.hypot(...hipToKnee);
    const magnitude2 = Math.hypot(...kneeToAnkle);
    
    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleDegrees = (Math.acos(cosAngle) * 180) / Math.PI;
    angleDegrees = 180 - angleDegrees;
    
    return angleDegrees;
  };



  const onResults = useCallback(
    (results) => {
      if (!trackingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas || !results.poseLandmarks) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const landmarks = results.poseLandmarks;
      const [hipIndex, kneeIndex, ankleIndex] = REQUIRED_LANDMARKS;
      const hip = [
        landmarks[hipIndex].x * width,
        landmarks[hipIndex].y * height,
      ];
      const knee = [
        landmarks[kneeIndex].x * width,
        landmarks[kneeIndex].y * height,
      ];
      const ankle = [
        landmarks[ankleIndex].x * width,
        landmarks[ankleIndex].y * height,
      ];

      const kneeAngle = calculateKneeAngle(hip, knee, ankle);
      setAngle(kneeAngle);
      validateRepetition(kneeAngle);

      setMaxFlexion((prevMax) => {
        const updatedMax = Math.max(prevMax, kneeAngle);
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