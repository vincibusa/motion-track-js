import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import {  FaAngleLeft } from "react-icons/fa";
import { BsPlayCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

const POSE_LANDMARKS = {
  LEFT_HIP: 23,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  RIGHT_ANKLE: 28,
};

const STAGES = {
  STAGE1: 'STAGE1',
  STAGE2: 'STAGE2',
  STAGE3: 'STAGE3',
};

const STAGE_RANGES = {
  [STAGES.STAGE1]: { min: 90, max: 120 },
  [STAGES.STAGE2]: { min: 120, max: 155 },
  [STAGES.STAGE3]: { min: 155, max: 180 },
};

const EXTENSION_THRESHOLD = 170;
const FLEXION_THRESHOLD = 90;

const KneeFlexion = ({ side = 'left' }) => {
  const getLandmarks = () => {
    if (side === 'left') {
      return [POSE_LANDMARKS.LEFT_HIP, POSE_LANDMARKS.LEFT_KNEE, POSE_LANDMARKS.LEFT_ANKLE];
    }
    return [POSE_LANDMARKS.RIGHT_HIP, POSE_LANDMARKS.RIGHT_KNEE, POSE_LANDMARKS.RIGHT_ANKLE];
  };

  const REQUIRED_LANDMARKS = getLandmarks();

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
  const [validReps, setValidReps] = useState(0);
  const [invalidReps, setInvalidReps] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [stageSequence, setStageSequence] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [target, setTarget] = useState("");
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);

  useEffect(() => {
    trackingRef.current = isTracking;
  }, [isTracking]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      alert('Per favore, consenti l\'accesso alla fotocamera per utilizzare questa funzione.');
      setCameraPermissionGranted(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const calculateKneeAngle = (hip, knee, ankle) => {
    const hipToKnee = [knee[0] - hip[0], knee[1] - hip[1]];
    const kneeToAnkle = [ankle[0] - knee[0], ankle[1] - knee[1]];
    
    const dotProduct = hipToKnee[0] * kneeToAnkle[0] + hipToKnee[1] * kneeToAnkle[1];
    const magnitude1 = Math.sqrt(hipToKnee[0] ** 2 + hipToKnee[1] ** 2);
    const magnitude2 = Math.sqrt(kneeToAnkle[0] ** 2 + kneeToAnkle[1] ** 2);
    
    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleRadians = Math.acos(cosAngle);
    let angleDegrees = (angleRadians * 180) / Math.PI;
    angleDegrees = 180 - angleDegrees;
    
    return angleDegrees;
  };

  const determineStage = (angle) => {
    if (angle >= STAGE_RANGES.STAGE1.min && angle < STAGE_RANGES.STAGE1.max) {
      return STAGES.STAGE1;
    } else if (angle >= STAGE_RANGES.STAGE2.min && angle < STAGE_RANGES.STAGE2.max) {
      return STAGES.STAGE2;
    } else if (angle >= STAGE_RANGES.STAGE3.min && angle <= STAGE_RANGES.STAGE3.max) {
      return STAGES.STAGE3;
    }
    return null;
  };

  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,
      STAGES.STAGE2,
      STAGES.STAGE3,
      STAGES.STAGE2,
      STAGES.STAGE1,
    ];
    if (sequence.length !== correctSequence.length) return false;
    return sequence.every((stage, index) => stage === correctSequence[index]);
  };

  const validateRepetition = (currentAngle) => {
    const newStage = determineStage(currentAngle);

    if (!newStage) {
      if (stageSequence.length > 0) {
        setStageSequence([]);
      }
      return;
    }

    if (newStage !== currentStage) {
      setCurrentStage(newStage);

      setStageSequence((prev) => {
        if (prev[prev.length - 1] === newStage) {
          return prev;
        }

        const newSequence = [...prev, newStage];

        if (validateStageSequence(newSequence)) {
          setValidReps((prevReps) => prevReps + 1);
          setTotalReps((prevTotal) => prevTotal + 1);
          toast.success(`Ripetizione valida!`, {
            position: "top-center",
            autoClose: 1000,
          });
          return [];
        } else if (newSequence.length === 5) {
          setInvalidReps((prevReps) => prevReps + 1);
          setTotalReps((prevTotal) => prevTotal + 1);
          toast.error(`Ripetizione errata!`, {
            position: "top-center",
            autoClose: 1000,
          });
          return [];
        } else if (
          newSequence.length < 5 &&
          newStage === STAGES.STAGE1 &&
          prev[prev.length - 1] === STAGES.STAGE2
        ) {
          toast.error(`Ripetizione non valida, stendi meglio il ginocchio`, {
            position: "top-center",
            autoClose: 1000,
          });
          setInvalidReps((prevReps) => prevReps + 1);
          setTotalReps((prevTotal) => prevTotal + 1);
          return [];
        } else if (newSequence.length > 5) {
          return [];
        }

        return newSequence;
      });
    }
  };

  useEffect(() => {
    if (totalReps >= targetReps) {
      setIsTracking(false);
      toast.info(`Hai completato ${targetReps} ripetizioni!`, {
        position: "top-center",
        autoClose: 2000,
      });
      localStorage.setItem('totalReps', totalReps.toString());
      localStorage.setItem('validReps', validReps.toString());
      localStorage.setItem('invalidReps', invalidReps.toString());
      setTimeout(() => {
        navigate('/report-exercise');
      }, 500);
    }
  }, [totalReps, targetReps, validReps, invalidReps, navigate]);

  const onResults = useCallback(
    (results) => {
      if (!trackingRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas || !results.poseLandmarks) return;

      const ctx = canvas.getContext('2d');
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const landmarks = results.poseLandmarks;

      const [hipIndex, kneeIndex, ankleIndex] = REQUIRED_LANDMARKS;
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

      const kneeAngle = calculateKneeAngle(hip, knee, ankle);
      setAngle(kneeAngle);
      validateRepetition(kneeAngle);

      setMaxFlexion((prevMax) => {
        const updatedMax = Math.max(prevMax, kneeAngle);
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });

      drawLandmarks(landmarks, ctx, width, height);
    },
    []
  );

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
  }, [isTracking, setupPose]);

  const requestFullscreen = () => {
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container && container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container && container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container && container.msRequestFullscreen) {
      container.msRequestFullscreen();
    }
  };

  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();
      
      if (!cameraPermissionGranted) {
        alert('Non hai i permessi per utilizzare la fotocamera. Per favore, consenti l\'accesso.');
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
      className="absolute top-4 left-4 text-white bg-gray-700 p-2 w-16 h-16 rounded-full z-50 flex items-center justify-center"
      onClick={() => navigate('/mobility-test')}
    >
      <FaAngleLeft size={24} />
    </button>

       <div className="absolute top-4 right-4 text-white bg-gray-700 p-2 w-16 h-16 rounded-full flex items-center justify-center z-50">

      {totalReps}/{targetReps}
    </div>

    <div className="relative w-full h-full">
      <video
        style={{ transform: 'scaleX(-1)' }}
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        style={{ transform: 'scaleX(-1)' }}
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>

    <div className="absolute inset-0 flex items-center justify-center">
       {!isTracking && !isCountdownActive && !showStartButton && (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-white text-xl mb-4 text-center">
        Quante ripetizioni vuoi fare?
      </h2>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="text"
          min="1"
          max="50"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="w-20 px-3 py-2 text-center text-lg rounded bg-gray-700 text-white"
        />
        <button
          onClick={(e) => { setTargetReps(Number(target)); setShowStartButton(true); }}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Conferma
        </button>
      </div>
    </div>
  )}
      {!isTracking && !isCountdownActive && showStartButton && (
        <button
          onClick={handleStart}
          className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600"
        >
          <BsPlayCircleFill className="text-white text-4xl" />
        </button>
      )}

      {isCountdownActive && (
        <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
          Inizio in: {countdown} secondi
        </div>
      )}
    </div>


  </div>

    );
}

export default KneeFlexion;