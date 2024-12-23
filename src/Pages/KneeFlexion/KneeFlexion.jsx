/* eslint-disable no-unused-vars */
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux'; // <--- usa useSelector per Redux
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { resetKneeReps } from '../../redux/slices/kneeRepsSlice';

// Import Custom Hooks
import useCameraPermission from '../../hooks/useCameraPermission';
import usePoseTracking from './hooks/usePoseTracking';
import useFullscreen from '../../hooks/useFullScreen';
import useKneeValidation from './hooks/useKneeValidation';  // <--- import nuovo hook redux

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
  const dispatch = useDispatch();

  // Stati base
  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [target, setTarget] = useState('');
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);

  // Leggiamo le reps dallo store
  const kneeReps = useSelector((state) => state.kneeReps.reps);

  // Calcoliamo totali, validi, invalidi
  const totalReps = kneeReps.length;
  const validReps = kneeReps.filter((r) => r.isValid).length;
  const invalidReps = kneeReps.filter((r) => !r.isValid).length;

  // Altri hook
  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();

  // Hook di validazione
  const { validateRepetition } = useKneeValidation();

  // Hook di PoseTracking
  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    setAngle,
    setMaxFlexion,
    validateRepetition, // Passa la funzione di validazione
  });

  // Quando raggiungiamo il target, fermiamo tutto
  useEffect(() => {
    if (totalReps >= targetReps && isTracking) {
      setIsTracking(false);
      toast.info(`Hai completato ${targetReps} ripetizioni!`, {
        position: 'top-center',
        autoClose: 2000,
      });
      // Salvataggio su localStorage
      localStorage.setItem('totalReps', totalReps.toString());
      localStorage.setItem('validReps', validReps.toString());
      localStorage.setItem('invalidReps', invalidReps.toString());
      localStorage.setItem('name', 'Flessione del ginocchio');
      localStorage.setItem('reps', JSON.stringify(kneeReps)); // se vuoi salvare l’intero array

      setTimeout(() => {
        navigate('/report-exercise');
      }, 500);
    }
  }, [totalReps, targetReps, validReps, invalidReps, kneeReps, navigate, isTracking]);

  // Gestione Start
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
        const today = new Date().toISOString();
        localStorage.setItem('startDate', today);
        setIsTracking(true);
      }
    }, 1000);
  };

  // Gestione input numero reps
  const handleConfirmReps = () => {
    dispatch(resetKneeReps());
    const repsNum = Number(target);
    if (repsNum >= 1 && repsNum <= 50) {
      setTargetReps(repsNum);
      setShowStartButton(true);
    } else {
      toast.error('Inserisci un numero di ripetizioni valido (1-50).', {
        position: 'top-center',
        autoClose: 2000,
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

      {/* Visualizza quante reps abbiamo fatto e quante ne vogliamo */}
      <RepsDisplay totalReps={totalReps} targetReps={targetReps} />

      <VideoCanvas videoRef={videoRef} canvasRef={canvasRef} isTracking={isTracking} />

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Input per numero di reps */}
        {!isTracking && !isCountdownActive && !showStartButton && (
          <RepsInput target={target} setTarget={setTarget} onConfirm={handleConfirmReps} />
        )}

        {/* Bottone Start */}
        {!isTracking && !isCountdownActive && showStartButton && (
          <StartButton onStart={handleStart} />
        )}

        {/* Countdown */}
        {isCountdownActive && <CountdownDisplay countdown={countdown} />}
      </div>
    </div>
  );
};

export default KneeFlexion;
