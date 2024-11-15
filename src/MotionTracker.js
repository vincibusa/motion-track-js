/* eslint-disable no-unused-vars */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';

// Define necessary landmark indices
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Define skeleton connections
const POSE_CONNECTIONS = [
  // Arms
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],

  // Torso
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],

  // Legs
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

const MotionTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [timer, setTimer] = useState(10);
  const poseRef = useRef(null);

  // Function to calculate shoulder flexion angle
  const calculateRightShoulderFlexion = (hip, shoulder, wrist) => {
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToWrist = [wrist[0] - shoulder[0], wrist[1] - shoulder[1]];

    const dotProduct =
      hipToShoulder[0] * shoulderToWrist[0] +
      hipToShoulder[1] * shoulderToWrist[1];
    const magnitudeHipToShoulder = Math.sqrt(
      hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2
    );
    const magnitudeShoulderToWrist = Math.sqrt(
      shoulderToWrist[0] ** 2 + shoulderToWrist[1] ** 2
    );

    const cosAngle =
      dotProduct / (magnitudeHipToShoulder * magnitudeShoulderToWrist);
    let angleDegrees =
      Math.acos(Math.min(Math.max(cosAngle, -1), 1)) * (180 / Math.PI);

    if (wrist[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees;
    }

    return angleDegrees;
  };

  // Function to draw custom skeleton
  const drawSkeleton = (landmarks, ctx) => {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(
          start.x * canvasRef.current.width,
          start.y * canvasRef.current.height
        );
        ctx.lineTo(
          end.x * canvasRef.current.width,
          end.y * canvasRef.current.height
        );
        ctx.stroke();
      }
    });
  };

  // Define the onResults function using useCallback
  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      const landmarks = results.poseLandmarks;
      const requiredLandmarks = [
        POSE_LANDMARKS.RIGHT_HIP,
        POSE_LANDMARKS.RIGHT_SHOULDER,
        POSE_LANDMARKS.RIGHT_WRIST,
      ];

      const allLandmarksExist = requiredLandmarks.every(
        (idx) => landmarks[idx]
      );

      if (allLandmarksExist) {
        const rightHip = [
          landmarks[POSE_LANDMARKS.RIGHT_HIP].x * canvas.width,
          landmarks[POSE_LANDMARKS.RIGHT_HIP].y * canvas.height,
        ];
        const rightShoulder = [
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x * canvas.width,
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y * canvas.height,
        ];
        const rightWrist = [
          landmarks[POSE_LANDMARKS.RIGHT_WRIST].x * canvas.width,
          landmarks[POSE_LANDMARKS.RIGHT_WRIST].y * canvas.height,
        ];

        const newAngle = calculateRightShoulderFlexion(
          rightHip,
          rightShoulder,
          rightWrist
        );
        setAngle(newAngle);

        // Draw custom skeleton
        drawSkeleton(landmarks, ctx);

        // Optionally draw body landmarks
        landmarks.forEach((landmark, idx) => {
          if (idx >= 11 && idx <= 32) { // Only body landmarks
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      } else {
        console.warn('Some required landmarks are missing.');
      }
    } else {
      console.warn('No landmarks detected.');
    }
  }, []);

  // Setup MediaPipe Pose
  const setupPose = useCallback(async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Create an instance of Pose with correctly replaced file names
      const pose = new MediapipePose.Pose({
        locateFile: (file) => {
          // Replace 'simd_wasm_bin.js' with 'wasm_bin.js' correctly
          if (file === 'pose_solution_simd_wasm_bin.js') {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_wasm_bin.js';
          }
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
        useCpuInference: true, // Ensure CPU inference is used
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

      // Manage webcam access
      const camera = new Camera(video, {
        onFrame: async () => {
          try {
            await pose.send({ image: video });
          } catch (err) {
            console.error('Error sending image to Pose:', err);
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    } catch (error) {
      console.error('Error setting up MediaPipe Pose:', error);
    }
  }, [onResults]);

  // Handle timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    setupPose();
    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [setupPose]);

  return (
    <div style={{ position: 'relative', width: '1280px', height: '720px' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="1280"
        height="720"
        style={{
          position: 'absolute',
          zIndex: 1,
          transform: 'scaleX(-1)', // Mirror the video for natural viewing
        }}
      />
      <canvas
        ref={canvasRef}
        width="1280"
        height="720"
        style={{
          position: 'absolute',
          zIndex: 2,
          transform: 'scaleX(-1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          zIndex: 3,
          top: '20px',
          left: '20px',
          color: 'white',
          fontSize: '24px',
        }}
      >
        Time: {timer}s
      </div>
      <div
        style={{
          position: 'absolute',
          zIndex: 3,
          top: '50px',
          left: '20px',
          color: 'white',
          fontSize: '24px',
        }}
      >
        Right Shoulder: {Math.round(angle)}°
      </div>
    </div>
  );
};

export default MotionTracker;