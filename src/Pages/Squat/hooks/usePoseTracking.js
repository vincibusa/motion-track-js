import { useRef, useCallback, useEffect, useState } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { toast } from 'react-toastify';
import { POSE_LANDMARKS } from '../constants/constants';

const usePoseTracking = ({
  side,
  isTracking,
  canvasRef,
  videoRef,
  setAngle,
  setMaxFlexion,
  validateRepetition,
}) => {
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const trackingRef = useRef(false);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const REQUIRED_LANDMARKS = side === 'left'
    ? [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE]
    : [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE];

  // Funzione per calcolare le dimensioni ottimali della fotocamera
  const calculateCameraDimensions = () => {
    const aspectRatio = 16 / 9;
    let width = window.innerWidth;
    let height = window.innerHeight;
  
    // Su mobile, usiamo la larghezza completa e aumentiamo l'altezza
    if (width < 768) {
      width = window.innerWidth; // Usa tutta la larghezza disponibile
      height = window.innerHeight; // Usa tutta l'altezza disponibile
    } else {
      // Su desktop, aumentiamo le dimensioni massime
      width = Math.min(1920, width * 1); // Aumentato da 1280 a 1920 e da 0.8 a 0.95
      height = width / aspectRatio;
      
      // Se l'altezza calcolata è maggiore dell'altezza della finestra, 
      // adattiamo in base all'altezza
      if (height > window.innerHeight * 1) {
        height = window.innerHeight * 1;
        width = height * aspectRatio;
      }
    }
  
    return { 
      width: Math.floor(width), 
      height: Math.floor(height) 
    };
  };

  // Aggiungiamo un listener per il resize della finestra
  useEffect(() => {
    const handleResize = () => {
      setDimensions(calculateCameraDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateSquatAngle = (hip, knee, ankle) => {
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

  const calculateTrunkAngle = (shoulder, hip, knee) => {
    const shoulderToHip = [hip[0] - shoulder[0], hip[1] - shoulder[1]];
    const hipToKnee = [knee[0] - hip[0], knee[1] - hip[1]];
    
    const dotProduct = shoulderToHip[0] * hipToKnee[0] + shoulderToHip[1] * hipToKnee[1];
    const magnitude1 = Math.hypot(...shoulderToHip);
    const magnitude2 = Math.hypot(...hipToKnee);
    
    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleDegrees = (Math.acos(cosAngle) * 180) / Math.PI;
    
    return angleDegrees;
  };

  const drawLandmarks = (landmarks, ctx, width, height) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // Draw lines between landmarks
    ctx.beginPath();
    for (let i = 0; i < REQUIRED_LANDMARKS.length - 1; i++) {
      const start = landmarks[REQUIRED_LANDMARKS[i]];
      const end = landmarks[REQUIRED_LANDMARKS[i + 1]];

      if (start && end) {
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
      }
    }
    ctx.stroke();

    // Draw landmark points
    ctx.fillStyle = '#ADD8E6';
    REQUIRED_LANDMARKS.forEach((idx) => {
      const landmark = landmarks[idx];
      if (landmark) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
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
      const [shoulderIndex, hipIndex, kneeIndex, ankleIndex] = REQUIRED_LANDMARKS;
      
      const shoulder = [
        landmarks[shoulderIndex].x * width,
        landmarks[shoulderIndex].y * height,
      ];
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

      const squatAngle = calculateSquatAngle(hip, knee, ankle);
      const trunkAngle = calculateTrunkAngle(shoulder, hip, knee);
      
      setAngle(squatAngle);
      validateRepetition(squatAngle, trunkAngle);

      setMaxFlexion((prevMax) => {
        const updatedMax = Math.min(prevMax, squatAngle);
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });

      drawLandmarks(landmarks, ctx, width, height);
    },
    []
  );

  const setupPose = useCallback(() => {
    const video = videoRef.current;
    const pose = new MediapipePose.Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
      enableSegmentation: false,
    });

    pose.onResults(onResults);
    poseRef.current = pose;

    const camera = new Camera(video, {
      onFrame: async () => {
        if (trackingRef.current && poseRef.current) {
          try {
            await poseRef.current.send({ image: video });
          } catch (error) {
            console.error("Error sending frame to pose:", error);
          }
        }
      },
      width: dimensions.width,
      height: dimensions.height,
    });
    cameraRef.current = camera;
    camera.start();
  }, [onResults, videoRef, dimensions]);

  useEffect(() => {
    if (isTracking) {
      trackingRef.current = true;
      setupPose();
    }
    return () => {
      trackingRef.current = false;
      cameraRef.current?.stop();
      poseRef.current?.close();
      poseRef.current = null;
    };
  }, [isTracking, setupPose]);

  return null;
};

export default usePoseTracking;