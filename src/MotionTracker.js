import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';

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

const POSE_CONNECTIONS = [
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE],
  [POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE],
  [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE],
  [POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE],
];

const MotionTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [timer, setTimer] = useState(10);
  const poseRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);

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

  const drawSkeleton = (landmarks, ctx, width, height) => {
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }
    });
  };

  const onResults = useCallback((results) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available');
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('Canvas context not available');
      return;
    }

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

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
          landmarks[POSE_LANDMARKS.RIGHT_HIP].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_HIP].y * height,
        ];
        const rightShoulder = [
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y * height,
        ];
        const rightWrist = [
          landmarks[POSE_LANDMARKS.RIGHT_WRIST].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_WRIST].y * height,
        ];

        const newAngle = calculateRightShoulderFlexion(
          rightHip,
          rightShoulder,
          rightWrist
        );
        setAngle(newAngle);

        drawSkeleton(landmarks, ctx, width, height);

        landmarks.forEach((landmark, idx) => {
          if (idx >= 11 && idx <= 32) {
            const x = landmark.x * width;
            const y = landmark.y * height;
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

  const setupPose = useCallback(async () => {
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video) {
        console.error('Video element not found');
        return;
      }

      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        console.error('getUserMedia is not supported in this browser.');
        setUseFallback(true);
        return;
      }

      const pose = new MediapipePose.Pose({
        locateFile: (file) => {
          if (file === 'pose_solution_simd_wasm_bin.js') {
            return 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose_solution_wasm_bin.js';
          }
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
        useCpuInference: true,
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

  useEffect(() => {
    setupPose();
    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [setupPose]);

  const fallbackVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.src = '/fallback-video.mp4';
    video.play().catch((err) => {
      console.error('Error playing fallback video:', err);
    });
  }, []);

  useEffect(() => {
    if (useFallback) {
      fallbackVideo();
    }
  }, [useFallback, fallbackVideo]);

  // Handle responsive resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current && videoRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        videoRef.current.width = clientWidth;
        videoRef.current.height = clientHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        aspectRatio: '16 / 9',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          transform: 'scaleX(-1)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          color: 'white',
          fontSize: '1.5em',
          textShadow: '0 0 5px rgba(0,0,0,0.5)',
        }}
      >
        Time: {timer}s
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          color: 'white',
          fontSize: '1.5em',
          textShadow: '0 0 5px rgba(0,0,0,0.5)',
        }}
      >
        Right Shoulder: {Math.round(angle)}°
      </div>
      {useFallback && (
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '5%',
            color: 'yellow',
            fontSize: '1em',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
            borderRadius: '5px',
          }}
        >
          Webcam not supported. Using fallback video.
        </div>
      )}
    </div>
  );
};

export default MotionTracker;