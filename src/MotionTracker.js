import React, { useRef, useState, useEffect , useCallback} from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';

// Definisci manualmente gli indici dei landmark necessari
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
    RIGHT_ANKLE: 28, // Fixed casing
  };

// Definisci le connessioni dello scheletro del corpo
const POSE_CONNECTIONS = [
  // Braccia
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW],
  [POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW],
  [POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST],

  // Tronco
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.LEFT_SHOULDER],
  [POSE_LANDMARKS.NOSE, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.RIGHT_SHOULDER],
  [POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_HIP],
  [POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_HIP],
  [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.RIGHT_HIP],

  // Gambe
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

  // Funzione per calcolare l'angolo di flessione della spalla
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
    let angleDegrees = Math.acos(Math.min(Math.max(cosAngle, -1), 1)) * (180 / Math.PI);

    if (wrist[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees;
    }

    return angleDegrees;
  };

  // Funzione per disegnare lo scheletro personalizzato
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

  // Configura MediaPipe Pose
// Update Pose initialization to load non-SIMD WASM binaries
const setupPose = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Create an instance of Pose without SIMD
    const pose = new MediapipePose.Pose({
      locateFile: (file) => {
        // Load non-SIMD WASM binaries by replacing 'simd' with 'wasm'
        if (file === 'pose_solution_packed_assets.bin') {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
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
      // Disable segmentation if not needed
      enableSegmentation: false,
    });
  
    pose.onResults(onResults);
    poseRef.current = pose;
  
    // Manage webcam access
    const camera = new Camera(video, {
      onFrame: async () => {
        await pose.send({ image: video });
      },
      width: 1280,
      height: 720,
    });
    camera.start();
  }, []);  // Aggiungi dipendenze se necessario

  const onResults = (results) => {
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

        // Disegna lo scheletro personalizzato
        drawSkeleton(landmarks, ctx);

        // Disegna i landmark del corpo (opzionale)
        landmarks.forEach((landmark, idx) => {
          if (idx >= 11 && idx <= 32) { // Solo i landmark del corpo
            const x = landmark.x * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      } else {
        console.warn('Alcuni landmarks necessari sono mancanti.');
      }
    } else {
      console.warn('Nessun landmark rilevato.');
    }
  };

  // Funzione per gestire il timer
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
          transform: 'scaleX(-1)', // Specchia il video per una visualizzazione naturale
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