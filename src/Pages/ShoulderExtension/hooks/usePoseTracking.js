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

  const calculateShoulderExtension = useCallback((hip, shoulder, elbow) => {
    const shoulderToHip = [hip[0] - shoulder[0], hip[1] - shoulder[1]];
    
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];
  
    const magnitudeShoulderToHip = Math.hypot(...shoulderToHip);
    const magnitudeShoulderToElbow = Math.hypot(...shoulderToElbow);
  
    const dotProduct = shoulderToHip[0] * shoulderToElbow[0] + shoulderToHip[1] * shoulderToElbow[1];
    const cosTheta = Math.min(Math.max(dotProduct / (magnitudeShoulderToHip * magnitudeShoulderToElbow), -1), 1);
  
    let angleRadians = Math.acos(cosTheta);
    
    let crossProduct;

    if (side=='left'){
      crossProduct = shoulderToHip[1] * shoulderToElbow[0] - shoulderToHip[0] * shoulderToElbow[1];
    }
    else if (side=='right'){
      crossProduct = shoulderToHip[0] * shoulderToElbow[1] - shoulderToHip[1] * shoulderToElbow[0]  ;
    }

    const sign = crossProduct > 0 ? 1 : -1; 
  
    const angleDegrees = (angleRadians * 180) / Math.PI * sign;
  
    console.log("Calcolato angolo:", angleDegrees);
    return angleDegrees;
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

      const newAngle = calculateShoulderExtension(hip, shoulder, elbow);
      setAngle(newAngle);
      setMaxFlexion((prevMax) => {
        if (newAngle > 0){
          const updatedMax = Math.max(prevMax, Math.abs(newAngle));
          localStorage.setItem('maxFlexion', updatedMax.toString());
          return updatedMax;
        }
        else{
          const updatedMax = Math.abs(prevMax);
          return updatedMax;
        }
      });

      if (newAngle < -30) {
        if (!hasShownPositiveAngleToast.current) {
          toast.error("Posizione scorretta! Stai flettendo la spalla! Allinea il braccio al busto.", {
            position: "top-center",
            autoClose: 3000,
            draggable: true,
          });
          hasShownPositiveAngleToast.current = true;
        }
      } else {
        hasShownPositiveAngleToast.current = false;
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
