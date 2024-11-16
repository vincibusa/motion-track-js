// MotionTrackerLeft.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import { FaStopwatch, FaChartLine, FaAngleLeft, FaPlay } from "react-icons/fa";

const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
  LEFT_HIP: 23,
};

const REQUIRED_LANDMARKS = [
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.LEFT_SHOULDER,
  POSE_LANDMARKS.LEFT_ELBOW,
  POSE_LANDMARKS.LEFT_WRIST,
];

const MotionTrackerLeft = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null); // Ref for the Camera
  const poseRef = useRef(null);
  const trackingRef = useRef(false); // Ref to keep track of the current tracking state

  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Update the trackingRef whenever tracking state changes
  useEffect(() => {
    trackingRef.current = isTracking;
  }, [isTracking]);

  const calculateShoulderFlexion = (hip, shoulder, elbow) => {
    // Convert coordinates to vectors
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];

    // Calculate dot product and magnitudes
    const dotProduct =
      hipToShoulder[0] * shoulderToElbow[0] +
      hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.sqrt(
      hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2
    );
    const magnitude2 = Math.sqrt(
      shoulderToElbow[0] ** 2 + shoulderToElbow[1] ** 2
    );

    // Calculate the angle in radians
    const cosAngle = Math.min(
      Math.max(dotProduct / (magnitude1 * magnitude2), -1),
      1
    );
    let angleRadians = Math.acos(cosAngle);

    // Convert to degrees
    let angleDegrees = (angleRadians * 180) / Math.PI;

    // Adjust for natural flexion (arm down vs raised)
    if (elbow[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees; // Arm down
    } else {
      angleDegrees = 180 - angleDegrees; // Arm raised
    }

    return angleDegrees;
  };

  const classifyFlexion = (angle) => {
    if (angle >= 0 && angle <= 100) return "Scarsa mobilità";
    if (angle >= 101 && angle <= 130) return "Discreta";
    if (angle >= 150 && angle <= 170) return "Buona";
    if (angle > 170 && angle <= 180) return "Ottima";
    return "Invalido";
  };

  const drawLandmarks = (landmarks, ctx, width, height) => {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    // Draw connections
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

    // Draw circles
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

      const allLandmarksExist = REQUIRED_LANDMARKS.every(
        (idx) => landmarks[idx]
      );
      if (allLandmarksExist) {
        const leftHip = [
          landmarks[POSE_LANDMARKS.LEFT_HIP].x * width,
          landmarks[POSE_LANDMARKS.LEFT_HIP].y * height,
        ];
        const leftShoulder = [
          landmarks[POSE_LANDMARKS.LEFT_SHOULDER].x * width,
          landmarks[POSE_LANDMARKS.LEFT_SHOULDER].y * height,
        ];
        const leftElbow = [
          landmarks[POSE_LANDMARKS.LEFT_ELBOW].x * width,
          landmarks[POSE_LANDMARKS.LEFT_ELBOW].y * height,
        ];

        const newAngle = calculateShoulderFlexion(
          leftHip,
          leftShoulder,
          leftElbow
        );
        setAngle(newAngle);
        setMaxFlexion((prevMax) => Math.max(prevMax, newAngle));

        drawLandmarks(landmarks, ctx, width, height);
      }
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
  }, [onResults]);

  useEffect(() => {
    if (isTracking) {
      setupPose();
    }
    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (poseRef.current) poseRef.current.close();
      poseRef.current = null; // Prevent any further calls
    };
  }, [setupPose, isTracking]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 10) {
            setIsTracking(false);
            return prev;
          }
          return prev + 1;
        });
        setAngle((prev) => prev + Math.random() * 5 - 2.5);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking]);

  const handleStart = () => {
    setHasStarted(true);
    setIsTracking(true);
    setTimer(0);
    setAngle(0);
    setMaxFlexion(0);
  };

  return (
    <div className="flex flex-col bg-gray-900 p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <div className="relative aspect-video mb-6">
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
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        {!hasStarted ? (
          <div className="flex justify-center">
            <button
              className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 text-white flex items-center space-x-2"
              onClick={handleStart}
            >
              <FaPlay />
              <span>Inizia Tracking</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-white">
                <FaStopwatch className="text-blue-400 text-xl" />
                <span className="text-lg font-semibold shadow-sm">
                  Tempo: {timer}s / 10s
                </span>
              </div>
              <div className="flex items-center space-x-3 text-white">
                <FaAngleLeft className="text-green-400 text-xl" />
                <span className="text-lg font-semibold shadow-sm">
                  Spalla Sinistra: {Math.round(angle)}°
                </span>
              </div>
            </div>

            {(!isTracking && timer >= 10) && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white text-lg font-bold mb-3 flex items-center">
                  <FaChartLine className="mr-2 text-yellow-400" />
                  Riepilogo
                </h3>
                <div className="text-white space-y-2">
                  <p className="flex justify-between">
                    <span>Massima Flessione:</span>
                    <span className="font-bold">{Math.round(maxFlexion)}°</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Classificazione:</span>
                    <span className="font-bold">{classifyFlexion(maxFlexion)}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-gray-700 pt-4">
          <div className="flex justify-between items-center text-white">
            {hasStarted && (
              <button
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                onClick={() => setIsTracking(!isTracking)}
                disabled={timer >= 10}
              >
                {isTracking ? "Stop Tracking" : "Start Tracking"}
              </button>
            )}
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MotionTrackerLeft;