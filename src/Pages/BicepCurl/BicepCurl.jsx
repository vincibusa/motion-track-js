/* eslint-disable no-unused-vars */
// components/BicepCurl.jsx
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useSelector } from 'react-redux';        // <--- per leggere dallo store
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { resetReps } from '../../redux/slices/repsSlice';

import useCameraPermission from '../../hooks/useCameraPermission';
import usePoseTracking from './hooks/usePoseTracking';
import useFullscreen from '../../hooks/useFullScreen';
import useRepValidation from './hooks/useRepValidation';

import NavigationButton from '../../Components/NavigationButton';
import RepsDisplay from '../../Components/RepsDisplay';
import RepsInput from '../../Components/RepsInput';
import StartButton from '../../Components/StartButton';
import CountdownDisplay from '../../Components/CountdownDisplay';
import VideoCanvas from '../../Components/VideoCanvas';

const BicepCurl = ({ side = 'left' }) => {
  const getLandmarks = () => {
    return side === 'left'
      ? ['LEFT_SHOULDER', 'LEFT_ELBOW', 'LEFT_WRIST']
      : ['RIGHT_SHOULDER', 'RIGHT_ELBOW', 'RIGHT_WRIST'];
  };

  const REQUIRED_LANDMARKS = getLandmarks();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  // Stato locale
  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [target, setTarget] = useState('');
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);

  // Selettori Redux: leggiamo l'array di ripetizioni
  const reps = useSelector((state) => state.reps.reps);
  // Calcoliamo quante sono valide / non valide
  const validReps = reps.filter((r) => r.isValid).length;
  const invalidReps = reps.filter((r) => !r.isValid).length;
  const totalReps = reps.length;

  // Hooks vari
  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();
  const { validateRepetition } = useRepValidation();

  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    setAngle,
    setMaxFlexion,
    validateRepetition
  });

  // Se raggiungiamo targetReps, fermiamo e mostriamo un toast
  useEffect(() => {
    if (totalReps >= targetReps && isTracking) {
      setIsTracking(false);
      toast.info(`Hai completato ${targetReps} ripetizioni!`, {
        position: 'top-center',
        autoClose: 2000
      });

      // Esempio: Salvataggio in localStorage
      localStorage.setItem('totalReps', totalReps.toString());
      localStorage.setItem('validReps', validReps.toString());
      localStorage.setItem('invalidReps', invalidReps.toString());
      localStorage.setItem('name', 'Report Bicep Curl');
      localStorage.setItem('reps', JSON.stringify(reps));

      setTimeout(() => {
        navigate('/report-exercise');
      }, 500);
    }
  }, [totalReps, targetReps, validReps, invalidReps, navigate, reps, isTracking]);

  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();
      // Se ancora non sono garantiti, usciamo
      if (!cameraPermissionGranted) {
        alert(
          "Non hai i permessi per utilizzare la fotocamera. Per favore, consenti l'accesso."
        );
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

  const handleConfirmReps = () => {
    const repsNumber = Number(target);
    //puliamo l'array reps da redux per iniziare una nuova sessione
    dispatch(resetReps());
    if (repsNumber >= 1 && repsNumber <= 50) {
      setTargetReps(repsNumber);
      setShowStartButton(true);
    } else {
      toast.error('Inserisci un numero di ripetizioni valido (1-50).', {
        position: 'top-center',
        autoClose: 2000
      });
    }
  };

  useEffect(() => {
    console.log(reps) // Stampa le ripetizioni
  }
  , [reps]);

  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900"
      ref={containerRef}
    >
      <ToastContainer />

      <NavigationButton onClick={() => navigate(-1)} />

      {/*
        Visualizza quante reps abbiamo fatto su quante ne vogliamo fare
      */}
      <RepsDisplay totalReps={totalReps} targetReps={targetReps} />

      <VideoCanvas
        videoRef={videoRef}
        canvasRef={canvasRef}
        isTracking={isTracking}
      />

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

export default BicepCurl;
