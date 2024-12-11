// usePoseTracking.js
import { useRef, useCallback, useEffect } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { toast } from 'react-toastify';
import { POSE_LANDMARKS } from '../POSE_LANDMARKS';

const usePoseTracking = ({
  side,
  isTracking,
  canvasRef,
  videoRef,
  setAngle,
  setMaxExtension,
}) => {
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const trackingRef = useRef(false);

  // Calculate Shoulder Extension Angle
  const calculateShoulderExtension = (hip, shoulder, elbow) => {
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];

    const dotProduct = hipToShoulder[0] * shoulderToElbow[0] + hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.hypot(...hipToShoulder);
    const magnitude2 = Math.hypot(...shoulderToElbow);

    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleDegrees = (Math.acos(cosAngle) * 180) / Math.PI;

    return angleDegrees;
  };

  // Check Shoulder Alignment
  const checkPositionAlignment = (hip, shoulder) => {
    const idealDirection = [0, 1]; // Direction for shoulder alignment in extension
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const length = Math.hypot(...hipToShoulder);
    const unitHipToShoulder = hipToShoulder.map(coord => coord / length);

    const dotProduct = idealDirection[0] * unitHipToShoulder[0] + idealDirection[1] * unitHipToShoulder[1];
    return Math.acos(dotProduct) * (180 / Math.PI);
  };

  // Draw Landmarks on Canvas
  const drawLandmarks = (landmarks, ctx, width, height, REQUIRED_LANDMARKS) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    ctx.beginPath();
    REQUIRED_LANDMARKS.slice(0, -1).forEach((idx, i) => {
      const start = landmarks[idx];
      const end = landmarks[REQUIRED_LANDMARKS[i + 1]];
      if (start && end) {
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
      }
    });
    ctx.stroke();

    ctx.fillStyle = '#ADD8E6';
    REQUIRED_LANDMARKS.forEach(idx => {
      const landmark = landmarks[idx];
      if (landmark) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  // Handle Pose Results
  const onResults = useCallback(
    results => {
      if (!trackingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas || !results.poseLandmarks) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const landmarks = results.poseLandmarks;
      const REQUIRED_LANDMARKS = side === 'left'
        ? [
            POSE_LANDMARKS.LEFT_HIP,
            POSE_LANDMARKS.LEFT_SHOULDER,
            POSE_LANDMARKS.LEFT_ELBOW,
            POSE_LANDMARKS.LEFT_WRIST
          ]
        : [
            POSE_LANDMARKS.RIGHT_HIP,
            POSE_LANDMARKS.RIGHT_SHOULDER,
            POSE_LANDMARKS.RIGHT_ELBOW,
            POSE_LANDMARKS.RIGHT_WRIST
          ];

      const allLandmarksExist = REQUIRED_LANDMARKS.every(idx => landmarks[idx]);

      if (allLandmarksExist) {
        const hipIdx = REQUIRED_LANDMARKS[0];
        const shoulderIdx = REQUIRED_LANDMARKS[1];
        const elbowIdx = REQUIRED_LANDMARKS[2];

        const hip = [landmarks[hipIdx].x * width, landmarks[hipIdx].y * height];
        const shoulder = [landmarks[shoulderIdx].x * width, landmarks[shoulderIdx].y * height];
        const elbow = [landmarks[elbowIdx].x * width, landmarks[elbowIdx].y * height];

        const newAngle = calculateShoulderExtension(hip, shoulder, elbow);
        setAngle(newAngle);
        setMaxExtension(prevMax => {
          const updatedMax = Math.max(prevMax, newAngle);
          localStorage.setItem('maxExtension', updatedMax.toString());
          return updatedMax;
        });

        const alignmentAngle = checkPositionAlignment(hip, shoulder);
        const tolerance = 30;
        if (alignmentAngle > tolerance) {
          toast.error("Incorrect position! Please align your shoulder parallel to the ground.", {
            position: "top-right",
            autoClose: 3000,
            draggable: true,
          });
        }

        drawLandmarks(landmarks, ctx, width, height, REQUIRED_LANDMARKS);
      }
    },
    [side, setAngle, setMaxExtension, canvasRef]
  );

  const setupPose = useCallback(() => {
    const video = videoRef.current;
    const pose = new MediapipePose.Pose({
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
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
  }, [onResults]);

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
