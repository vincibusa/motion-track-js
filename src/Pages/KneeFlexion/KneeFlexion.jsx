/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Custom Hooks
import useCameraPermission from '../../hooks/useCameraPermission';
import usePoseTracking from './hooks/usePoseTracking';
import useFullscreen from '../../hooks/useFullScreen';
import useRepValidation from './hooks/useRepValidation';

// Import Components
import NavigationButton from '../../Components/NavigationButton';
import RepsDisplay from '../../Components/RepsDisplay';
import RepsInput from '../../Components/RepsInput';
import StartButton from '../../Components/StartButton';
import CountdownDisplay from '../../Components/CountdownDisplay';
import VideoCanvas from '../../Components/VideoCanvas';

const KneeFlexion = ({ side = 'left' }) => {
  const getLandmarks = () => {
    return side === 'left'
      ? ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE']
      : ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE'];
  };

  const REQUIRED_LANDMARKS = getLandmarks();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const navigate = useNavigate();

  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [validReps, setValidReps] = useState(0);
  const [invalidReps, setInvalidReps] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [target, setTarget] = useState("");
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);

  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();

  const handleValidRep = () => setValidReps(prev => prev + 1);
  const handleInvalidRep = () => setInvalidReps(prev => prev + 1);
  const handleTotalRep = () => setTotalReps(prev => prev + 1);

  const { validateRepetition } = useRepValidation({
    onValidRep: handleValidRep,
    onInvalidRep: handleInvalidRep,
    onTotalRep: handleTotalRep
  });

  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    setAngle,
    setMaxFlexion,
    validateRepetition,
  });

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
      localStorage.setItem('name', "Flessione del ginocchio");
      setTimeout(() => {
        navigate('/report-exercise');
      }, 500);
    }
  }, [totalReps, targetReps, validReps, invalidReps, navigate]);

  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();

      if (!cameraPermissionGranted) {
        alert('Non hai i permessi per utilizzare la fotocamera. Per favore, consenti l\'accesso.');
        return;
      }
    }
    requestFullscreen(containerRef);
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
        setIsTracking(true);
      }
    }, 1000);
  };

  const handleConfirmReps = () => {
    const reps = Number(target);
    if (reps >= 1 && reps <= 50) {
      setTargetReps(reps);
      setShowStartButton(true);
    } else {
      toast.error('Inserisci un numero di ripetizioni valido (1-50).', {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900" ref={containerRef}>
      <ToastContainer />
      
      <NavigationButton onClick={() => navigate(-1)} />

      <RepsDisplay totalReps={totalReps} targetReps={targetReps} />

      <VideoCanvas videoRef={videoRef} canvasRef={canvasRef} isTracking={isTracking} />

      <div className="absolute inset-0 flex items-center justify-center">
        {!isTracking && !isCountdownActive && !showStartButton && (
          <RepsInput target={target} setTarget={setTarget} onConfirm={handleConfirmReps} />
        )}
        {!isTracking && !isCountdownActive && showStartButton && (
          <StartButton onStart={handleStart} />
        )}

        {isCountdownActive && (
          <CountdownDisplay countdown={countdown} />
        )}
      </div>
    </div>
  );
};

export default KneeFlexion;