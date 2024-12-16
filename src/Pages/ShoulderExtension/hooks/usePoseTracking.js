/* eslint-disable react-hooks/exhaustive-deps */
// usePoseTracking.js
import {  useCallback, useEffect, useMemo } from 'react';
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
  // Memoize REQUIRED_LANDMARKS based on the side (left or right)
  const REQUIRED_LANDMARKS = useMemo(() => {
    return side === 'left'
      ? [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]
      : [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST];
  }, [side]);

  // Custom hook for drawing landmarks
  const { drawLandmarks } = useDrawLandmarks(
    // Passiamo solo le connessioni del lato che ci interessa
    {
      leftSide: side === 'left' ? landmarkConnections.leftSide : [],
      rightSide: side === 'right' ? landmarkConnections.rightSide : []
    }
  );

  // Calculate Shoulder Flexion Angle
  const calculateShoulderFlexion = (hip, shoulder, elbow) => {
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];

    const dotProduct = hipToShoulder[0] * shoulderToElbow[0] + hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.hypot(...hipToShoulder);
    const magnitude2 = Math.hypot(...shoulderToElbow);

    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleDegrees = (Math.acos(cosAngle) * 180) / Math.PI;

    return 180 - angleDegrees;
  };

  // Check Shoulder Alignment
  const checkPositionAlignment = (hip, shoulder) => {
    const idealDirection = [0, -1];
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const length = Math.hypot(...hipToShoulder);
    const unitHipToShoulder = hipToShoulder.map(coord => coord / length);

    const dotProduct = idealDirection[0] * unitHipToShoulder[0] + idealDirection[1] * unitHipToShoulder[1];
    return Math.acos(dotProduct) * (180 / Math.PI);
  };

  // Pose Results Handler
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
        const updatedMax = Math.max(prevMax, newAngle);
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });

      const alignmentAngle = checkPositionAlignment(hip, shoulder);
      const tolerance = 30;
      if (alignmentAngle > tolerance) {
        toast.error("Incorrect position! Please align your shoulder perpendicular to the ground.", {
          position: "top-right",
          autoClose: 3000,
          draggable: true,
        });
      }

      drawLandmarks(landmarks, ctx, width, height);
    },
    []
  );

  // Custom hook for setting up the pose detection
  const { setupPose, cleanup, trackingRef } = useSetupPose({ videoRef, onResults });

  useEffect(() => {
    if (isTracking) {
      trackingRef.current = true;
      setupPose();
    }
    return cleanup;
  }, [isTracking, setupPose, ]);

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
