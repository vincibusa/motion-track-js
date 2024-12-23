/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';  // <--- Importa useSelector
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { resetSquatReps } from '../../redux/slices/squatRepsSlice';

// Import Custom Hooks
import useCameraPermission from '../../hooks/useCameraPermission';
import usePoseTracking from './hooks/usePoseTracking';
import useFullscreen from '../../hooks/useFullScreen';
import useSquatValidation from './hooks/useSquatValidation';

// Import Components
import NavigationButton from '../../Components/NavigationButton';
import RepsDisplay from '../../Components/RepsDisplay';
import RepsInput from '../../Components/RepsInput';
import StartButton from '../../Components/StartButton';
import CountdownDisplay from '../../Components/CountdownDisplay';
import VideoCanvas from '../../Components/VideoCanvas';

const Squat = ({ side = 'left' }) => {
  const getLandmarks = () => {
    return side === 'left'
      ? ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE', 'LEFT_SHOULDER']
      : ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE', 'RIGHT_SHOULDER'];
  };

  const REQUIRED_LANDMARKS = getLandmarks();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch(); 
  

  // State locali
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [target, setTarget] = useState("");
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);

  // Leggiamo le reps dallo store di Redux
  const squatReps = useSelector((state) => state.squatReps.reps);

  // Calcoliamo quante reps totali, valide, invalide
  const totalReps = squatReps.length;
  const validReps = squatReps.filter((r) => r.isValid).length;
  const invalidReps = squatReps.filter((r) => !r.isValid).length;

  // Custom hooks
  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();

  // Hook di validazione (senza callback)
  const { validateRepetition } = useSquatValidation();

  // Hook di PoseTracking
  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    // Passiamo la callback di validazione
    validateRepetition: (kneeAngle, trunkAngle) => validateRepetition(kneeAngle, trunkAngle),
  });

  // Se raggiungiamo targetReps, fermiamo e facciamo redirect
  useEffect(() => {
    if (totalReps >= targetReps && isTracking) {
      setIsTracking(false);
      toast.info(`Hai completato ${targetReps} ripetizioni!`, {
        position: 'top-center',
        autoClose: 2000,
        className: 'text-2xl w-full h-auto'
      });
      // Salvataggio info
      localStorage.setItem('totalReps', totalReps.toString());
      localStorage.setItem('validReps', validReps.toString());
      localStorage.setItem('invalidReps', invalidReps.toString());
      localStorage.setItem('name', 'Report Squat');
      localStorage.setItem('reps', JSON.stringify(squatReps));  // <--- se vuoi salvare l'array intero

      setTimeout(() => {
        navigate('/report-exercise');
      }, 500);
    }
  }, [totalReps, targetReps, validReps, invalidReps, isTracking, navigate, squatReps]);

  // Bottone "START"
  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();
      if (!cameraPermissionGranted) {
        alert("Non hai i permessi per utilizzare la fotocamera. Per favore, consenti l'accesso.");
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
        localStorage.setItem('startDate', new Date().toISOString());
        setIsTracking(true);
      }
    }, 1000);
  };

  // Conferma reps da input
  const handleConfirmReps = () => {
        dispatch(resetSquatReps());
    const repsNum = Number(target);
    if (repsNum >= 1 && repsNum <= 50) {
      setTargetReps(repsNum);
      setShowStartButton(true);
    } else {
      toast.error('Inserisci un numero di ripetizioni valido (1-50).', {
        position: 'top-center',
        autoClose: 2000,
        className: 'text-2xl w-full h-auto'
      });
    }
  };

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900"
      ref={containerRef}
    >
      <ToastContainer />

      <NavigationButton onClick={() => navigate(-1)} />

      {/* Info su quante reps abbiamo fatto e target */}
      <RepsDisplay totalReps={totalReps} targetReps={targetReps} />

      <VideoCanvas videoRef={videoRef} canvasRef={canvasRef} isTracking={isTracking} />

      <div className="absolute inset-0 flex items-center justify-center">
        {!isTracking && !isCountdownActive && !showStartButton && (
          <RepsInput target={target} setTarget={setTarget} onConfirm={handleConfirmReps} />
        )}

        {!isTracking && !isCountdownActive && showStartButton && (
          <StartButton onStart={handleStart} />
        )}

        {isCountdownActive && <CountdownDisplay countdown={countdown} />}
      </div>
    </div>
  );
};

export default Squat;
