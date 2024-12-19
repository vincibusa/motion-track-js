/* eslint-disable no-unused-vars */
// components/Squat.jsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Custom Hooks
import useCameraPermission from '../../hooks/useCameraPermission';
import usePoseTracking from './hooks/usePoseTracking';
import useFullscreen from '../../hooks/useFullScreen';

// Import Constants
import { STAGES, STAGE_RANGES } from './constants/constants';

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
    ? ['LEFT_HIP', 'LEFT_KNEE', 'LEFT_ANKLE, LEFT_SHOULDER']
      : ['RIGHT_HIP', 'RIGHT_KNEE', 'RIGHT_ANKLE, RIGHT_SHOULDER'];
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
  const [stageSequence, setStageSequence] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [target, setTarget] = useState("");
  const [targetReps, setTargetReps] = useState(10);
  const [showStartButton, setShowStartButton] = useState(false);
  const [kneeAngle, setKneeAngle] = useState(0); // Added state for knee angle
  const [trunkAngle, setTrunkAngle] = useState(0); // Added state for trunk angle

  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();


  const validateRepetition = useCallback(
    (currentAngle, trunkAngle) => {
      const determineStage = (kneeAngle) => {
        let stage = null;

        if (
          STAGE_RANGES[STAGES.STAGE1].min <= kneeAngle &&
          kneeAngle <= STAGE_RANGES[STAGES.STAGE1].max
        ) {
          stage = STAGES.STAGE1;
        } else if (
          STAGE_RANGES[STAGES.STAGE2].min <= kneeAngle &&
          kneeAngle <= STAGE_RANGES[STAGES.STAGE2].max
        ) {
          stage = STAGES.STAGE2;
        } else if (
          STAGE_RANGES[STAGES.STAGE3].min <= kneeAngle &&
          kneeAngle <= STAGE_RANGES[STAGES.STAGE3].max
        ) {
          stage = STAGES.STAGE3;
        }
  

        return stage;
      };

      const validateStageSequence = (sequence) => {
        const correctSequence = [
          STAGES.STAGE1,  // Posizione eretta
          STAGES.STAGE2,  // Discesa
          STAGES.STAGE3,  // Squat profondo
          STAGES.STAGE2,  // Risalita
          STAGES.STAGE1   // Ritorno posizione eretta
        ];
  
        if (sequence.length !== correctSequence.length) {
    
          return false;
        }
        const isValid = sequence.every((stage, index) => stage === correctSequence[index]);
       
        return isValid;
      };

      const newStage = determineStage(currentAngle, trunkAngle);
      if (newStage===STAGES.STAGE1 ) {
        if(trunkAngle<STAGES.STAGE1.min ){
       toast.warning(`Sei troppo flesso, estendi la schiena`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
      
            return;
        }

      }
      if (newStage===STAGES.STAGE2 ) {
        if(trunkAngle<STAGES.STAGE2.min ){
       toast.warning(`Sei troppo flesso, estendi la schiena`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
     
            return;
        }
        if(trunkAngle>STAGES.STAGE2.max ){
        toast.warning(`Sei troppo dritto, fletti leggermente la schiena`, {
                position: "top-center",
                autoClose: 1000,
                  className : "text-2xl w-full h-auto "
              });
        
              return;
          }

      }
      if (newStage===STAGES.STAGE3 ) {
        if(trunkAngle<STAGES.STAGE3.min ){
       toast.warning(`Sei troppo flesso, estendi la schiena`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
      
            return;
        }
        if(trunkAngle>STAGES.STAGE2.max ){
          toast.warning(`Sei troppo dritto, fletti leggermente la schiena`, {
                  position: "top-center",
                  autoClose: 1000,
                    className : "text-2xl w-full h-auto "
                });
          
                return;
            }

      }

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
            toast.success(`Squat valido!`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
            return [];
          } else if (newSequence.length === 5) {

            setInvalidReps((prevReps) => prevReps + 1);
            setTotalReps((prevTotal) => prevTotal + 1);
            toast.error(`Squat non valido!`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
            return [];
          } else if (
            newSequence.length < 5 &&
            newStage === STAGES.STAGE1 &&
            prev[prev.length - 1] === STAGES.STAGE2
          ) {
 
            toast.error(`Squat incompleto, scendi più in basso`, {
              position: "top-center",
              autoClose: 1000,
                 className : "text-2xl w-full h-auto "
            });
            setInvalidReps((prevReps) => prevReps + 1);
            setTotalReps((prevTotal) => prevTotal + 1);
            return [];
          }

          return newSequence;
        });
      }
    },
    [currentStage, stageSequence]
  );

  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    setKneeAngle,
    setMaxFlexion,
    validateRepetition,
    setTrunkAngle,
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
      localStorage.setItem('name', "Report Squat");
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
           className : "text-2xl w-full h-auto "
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
}

export default Squat;