// usePoseTracking.js
import { useRef, useCallback, useEffect } from 'react';
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

  const REQUIRED_LANDMARKS = side === 'left'
    ? [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE]
    : [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE];

  const calculateSquatAngle = (shoulder, hip, knee, ankle) => {
    // Calculate hip angle (between shoulder-hip and hip-knee)
    const shoulderToHip = [hip[0] - shoulder[0], hip[1] - shoulder[1]];
    const hipToKnee = [knee[0] - hip[0], knee[1] - hip[1]];
    
    const hipDotProduct = shoulderToHip[0] * hipToKnee[0] + shoulderToHip[1] * hipToKnee[1];
    const hipMagnitude1 = Math.hypot(...shoulderToHip);
    const hipMagnitude2 = Math.hypot(...hipToKnee);
    
    const hipCosAngle = Math.min(Math.max(hipDotProduct / (hipMagnitude1 * hipMagnitude2), -1), 1);
    const hipAngle = (Math.acos(hipCosAngle) * 180) / Math.PI;

    // Calculate knee angle (between hip-knee and knee-ankle)
    const kneeToAnkle = [ankle[0] - knee[0], ankle[1] - knee[1]];
    
    const kneeDotProduct = hipToKnee[0] * kneeToAnkle[0] + hipToKnee[1] * kneeToAnkle[1];
    const kneeMagnitude1 = Math.hypot(...hipToKnee);
    const kneeMagnitude2 = Math.hypot(...kneeToAnkle);
    
    const kneeCosAngle = Math.min(Math.max(kneeDotProduct / (kneeMagnitude1 * kneeMagnitude2), -1), 1);
    const kneeAngle = (Math.acos(kneeCosAngle) * 180) / Math.PI;

    // Return the average of hip and knee angles for overall squat angle
    return (hipAngle + kneeAngle) / 2;
  };

  const drawLandmarks = (landmarks, ctx, width, height) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

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

      const squatAngle = calculateSquatAngle(shoulder, hip, knee, ankle);
      setAngle(squatAngle);
      validateRepetition(squatAngle);

      setMaxFlexion((prevMax) => {
        const updatedMax = Math.min(prevMax, squatAngle); // Per lo squat, l'angolo minore indica una flessione maggiore
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
      width: 1280,
      height: 720,
    });
    cameraRef.current = camera;
    camera.start();
  }, [onResults, videoRef]);

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