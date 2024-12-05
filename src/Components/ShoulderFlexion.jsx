import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import { FaStopwatch, FaChartLine, FaAngleLeft } from "react-icons/fa";
import { BsPlayCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
  LEFT_HIP: 23,
  RIGHT_SHOULDER: 12,
  RIGHT_ELBOW: 14,
  RIGHT_WRIST: 16,
  RIGHT_HIP: 24,
};

const ShoulderFlexion = ({ side = 'left' }) => {
  const REQUIRED_LANDMARKS = side === 'left' 
    ? [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_SHOULDER, POSE_LANDMARKS.LEFT_ELBOW, POSE_LANDMARKS.LEFT_WRIST]
    : [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_SHOULDER, POSE_LANDMARKS.RIGHT_ELBOW, POSE_LANDMARKS.RIGHT_WRIST];

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const containerRef = useRef(null);
  const poseRef = useRef(null);
  const trackingRef = useRef(false);

  const navigate = useNavigate();
  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  useEffect(() => {
    trackingRef.current = isTracking;
  }, [isTracking]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      alert('Please allow camera access to use this feature.');
      setCameraPermissionGranted(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const calculateShoulderFlexion = (hip, shoulder, elbow) => {
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];
  
    const dotProduct = hipToShoulder[0] * shoulderToElbow[0] + hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.sqrt(hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2);
    const magnitude2 = Math.sqrt(shoulderToElbow[0] ** 2 + shoulderToElbow[1] ** 2);
  
    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleRadians = Math.acos(cosAngle);
    let angleDegrees = (angleRadians * 180) / Math.PI;
  
    if (elbow[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees;
    } else {
      angleDegrees = 180 - angleDegrees;
    }
  
    return angleDegrees;
  };
  
  const checkPositionAlignment = (hip, shoulder) => {
    const idealDirection = [0, -1];
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
  
    const lengthHipToShoulder = Math.sqrt(hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2);
    const unitHipToShoulder = [hipToShoulder[0] / lengthHipToShoulder, hipToShoulder[1] / lengthHipToShoulder];
  
    const dotProduct = idealDirection[0] * unitHipToShoulder[0] + idealDirection[1] * unitHipToShoulder[1];
    const angle = Math.acos(dotProduct) * (180 / Math.PI);
  
    return angle;
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
        const hipIdx = side === 'left' ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP;
        const shoulderIdx = side === 'left' ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER;
        const elbowIdx = side === 'left' ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW;

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
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
  
        drawLandmarks(landmarks, ctx, width, height);
      }
    },
    [side]
  );

  const classifyFlexion = (angle) => {
    if (angle >= 0 && angle <= 100) return "Poor mobility";
    if (angle >= 101 && angle <= 130) return "Fair";
    if (angle >= 150 && angle <= 170) return "Good";
    if (angle > 170 && angle <= 180) return "Excellent";
    return "Invalid";
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
      poseRef.current = null;
    };
  }, [setupPose, isTracking]);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 10) {
            setIsTracking(false);
            setTimeout(() => {
              navigate('/report');
            }, 500);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTracking, navigate]);

  const requestFullscreen = () => {
    const container = containerRef.current;
    if (container?.requestFullscreen) {
      container.requestFullscreen();
    } else if (container?.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container?.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container?.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  };

  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();
      if (!cameraPermissionGranted) {
        alert('Camera permission is required to use this feature.');
        return;
      }
    }
    requestFullscreen();
    setIsCountdownActive(true);
    let seconds = 5;
  
    const interval = setInterval(() => {
      seconds -= 1;
      setCountdown(seconds);
  
      if (seconds <= 0) {
        clearInterval(interval);
        setIsCountdownActive(false);
        const today = new Date().toISOString();
        localStorage.setItem('startDate', today);
        setHasStarted(true);
        setIsTracking(true);
      }
    }, 1000);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900" ref={containerRef}>
      <ToastContainer />
      <button
        className="absolute top-4 left-4 text-white bg-gray-700 p-2 rounded-full z-50"
        onClick={() => navigate('/mobility-test')}
      >
        <FaAngleLeft size={24} />
      </button>

      <div className="absolute top-4 right-4 text-white bg-gray-700 p-2 rounded-full flex items-center z-50">
        <FaStopwatch size={20} className="mr-2" />
        {timer}s
      </div>

      <div className="relative w-full h-full">
        <video
          style={{
            transform: 'scaleX(-1)',
          }}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
        />
        <canvas
          style={{
            transform: 'scaleX(-1)',
          }}
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        {!isTracking && !isCountdownActive && (
          <button
            onClick={handleStart}
            className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600"
          >
            <BsPlayCircleFill className="text-white text-4xl" />
          </button>
        )}

        {isCountdownActive && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
            Starting in: {countdown} seconds
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 z-50">
        {isTracking && (
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white text-lg font-bold mb-3 flex items-center">
              <FaChartLine className="mr-2 text-yellow-400" />
              Summary
            </h3>
            <div className="text-white space-y-2">
              <p className="flex justify-between">
                <span>Maximum Flexion:</span>
                <span className="font-bold">{Math.round(maxFlexion)}°</span>
              </p>
              <p className="flex justify-between">
                <span>Classification:</span>
                <span className="font-bold">{classifyFlexion(maxFlexion)}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>  
    );
}

export default ShoulderFlexion;