
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import { FaStopwatch, FaChartLine, FaAngleLeft,  } from "react-icons/fa";
import { BsPlayCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import { ToastContainer, toast } from 'react-toastify';
const POSE_LANDMARKS = {
    LEFT_HIP: 23,
    LEFT_KNEE: 25, // Ginocchio sinistro
    LEFT_ANKLE: 27, // Caviglia sinistra
  };
  
const REQUIRED_LANDMARKS = [
  POSE_LANDMARKS.LEFT_HIP,
  POSE_LANDMARKS.LEFT_KNEE,
  POSE_LANDMARKS.LEFT_ANKLE,
];

const STAGES = {
  STAGE1: 'STAGE1', // 90-120 gradi
  STAGE2: 'STAGE2', // 120-155 gradi
  STAGE3: 'STAGE3', // 155-180 gradi
};

const STAGE_RANGES = {
  [STAGES.STAGE1]: { min: 90, max: 120 },
  [STAGES.STAGE2]: { min: 120, max: 155 },
  [STAGES.STAGE3]: { min: 155, max: 180 },
};

const EXTENSION_THRESHOLD = 170; // Angolo minimo per considerare l'estensione completa
const FLEXION_THRESHOLD = 90; // Angolo massimo per considerare una flessione significativa

const KneeFlexionLeft = () => {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null); // Ref for the Camera
  const containerRef = useRef(null);
  const poseRef = useRef(null);
  const trackingRef = useRef(false); // Ref to keep track of the current tracking state

  const navigate = useNavigate();  // Inizializza navigate
  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [countdown, setCountdown] = useState(5); // Timer iniziale
  const [isCountdownActive, setIsCountdownActive] = useState(false); // 
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
    // Nuovi stati per il conteggio delle ripetizioni
    const [validReps, setValidReps] = useState(0);
    const [isExtended, setIsExtended] = useState(false);
    const [isFlexed, setIsFlexed] = useState(false);
    const [currentStage, setCurrentStage] = useState(null);
    const [stageSequence, setStageSequence] = useState([]);
    const [isValidatingRep, setIsValidatingRep] = useState(false);
  // Update the trackingRef whenever tracking state changes
  useEffect(() => {
    trackingRef.current = isTracking;
  }, [isTracking]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true); // Permesso concesso
      stream.getTracks().forEach(track => track.stop()); // Ferma il flusso per ora
    } catch (error) {
      alert('Per favore, consenti l\'accesso alla fotocamera per utilizzare questa funzione.');
      setCameraPermissionGranted(false);
    }
  };

  useEffect(() => {
    // Richiedi il permesso per la fotocamera al caricamento del componente
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
    
    // Convertiamo in gradi
    let angleDegrees = (angleRadians * 180) / Math.PI;
    
    // Calcoliamo l'angolo supplementare per ottenere l'angolo di estensione
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
  // Sequenza corretta: S1 -> S2 -> S3 -> S2 -> S1
  const correctSequence = [
    STAGES.STAGE1,
    STAGES.STAGE2,
    STAGES.STAGE3,
    STAGES.STAGE2,
    STAGES.STAGE1
  ];

  if (sequence.length !== correctSequence.length) return false;

  for (let i = 0; i < correctSequence.length; i++) {
    if (sequence[i] !== correctSequence[i]) return false;
  }

  return true;
};

const validateRepetition = (currentAngle) => {
  const newStage = determineStage(currentAngle);
  
  if (!newStage) {
    // Angolo fuori da qualsiasi stage, resettiamo la sequenza
    if (stageSequence.length > 0) {
      setStageSequence([]);
      console.log("Sequenza resettata - angolo fuori range");
    }
    return;
  }

  if (newStage !== currentStage) {
    console.log(`Nuovo stage rilevato: ${newStage}`);
    setCurrentStage(newStage);

    // Aggiungiamo il nuovo stage alla sequenza solo se è diverso dall'ultimo
    setStageSequence(prev => {
      if (prev.length === 0 || prev[prev.length - 1] !== newStage) {
        const newSequence = [...prev, newStage];
        console.log("Sequenza attuale:", newSequence);

        // Verifichiamo se abbiamo completato una rep valida
        if (validateStageSequence(newSequence)) {
          console.log("Ripetizione valida completata!");
          setValidReps(prevReps => {
            const newCount = prevReps + 1;
            toast.success(`Ripetizione ${newCount} completata!`, {
              position: "top-center",
              autoClose: 1000,
            });
            return newCount;
          });
          return []; // Resettiamo la sequenza dopo una rep valida
        }

        // Se la sequenza diventa troppo lunga senza essere valida, la resettiamo
        if (newSequence.length > 5) {
          console.log("Sequenza troppo lunga - reset");
          return [];
        }

        return newSequence;
      }
      return prev;
    });
  }
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

      const leftHip = [
        landmarks[POSE_LANDMARKS.LEFT_HIP].x * width,
        landmarks[POSE_LANDMARKS.LEFT_HIP].y * height,
      ];
      const leftKnee = [
        landmarks[POSE_LANDMARKS.LEFT_KNEE].x * width,
        landmarks[POSE_LANDMARKS.LEFT_KNEE].y * height,
      ];
      const leftAnkle = [
        landmarks[POSE_LANDMARKS.LEFT_ANKLE].x * width,
        landmarks[POSE_LANDMARKS.LEFT_ANKLE].y * height,
      ];

      const kneeAngle = calculateKneeAngle(leftHip, leftKnee, leftAnkle);
      setAngle(kneeAngle);

      // Valida la ripetizione con l'angolo corrente
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
  
  const getCurrentStageDisplay = () => {
    if (!currentStage) return "Fuori Range";
    return `Stage ${currentStage.slice(-1)}`;
  };


  const classifyKneeAngle = (angle) => {
    if (angle >= 0 && angle <= 60) return "Angolo insufficiente";
    if (angle > 60 && angle <= 120) return "Angolo adeguato";
    if (angle > 120 && angle <= 150) return "Buona posizione";
    if (angle > 150 && angle <= 180) return "Posizione perfetta";
    return "Posizione invalida";
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
      poseRef.current = null; // Prevent any further calls
    };
  }, [ isTracking]);

  // Timer logic
// Timer logic
useEffect(() => {
  let interval;
  if (isTracking) {
    interval = setInterval(() => {
      setTimer((prev) => {
        if (prev >= 10) {
         
    
          
          setIsTracking(false); // Ferma il tracking quando il timer raggiunge 10
          
        
          setTimeout(() => {
            navigate('/report'); // Naviga alla pagina report dopo il ritardo
          }, 500); // Ritardo di 2000ms (2 secondi)
          return prev;
        }
        return prev + 1;
      });
      setAngle((prev) => prev + Math.random() * 5 - 2.5); // Cambia l'angolo a caso
    }, 1000);
  }

  return () => clearInterval(interval); // Pulisci l'intervallo quando il componente viene smontato
}, [isTracking, navigate]);


  const requestFullscreen = () => {
    const container = containerRef.current;
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container && container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen(); // Per Safari
    } else if (container && container.mozRequestFullScreen) {
      container.mozRequestFullScreen(); // Per Firefox
    } else if (container && container.msRequestFullscreen) {
      container.msRequestFullscreen(); // Per IE/Edge
    }
  };

  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      // Se i permessi non sono stati concessi, richiedili
      await requestCameraPermission();
      
      // Se dopo la richiesta i permessi non sono ancora concessi, mostra un messaggio
      if (!cameraPermissionGranted) {
        alert('Non hai i permessi per utilizzare la fotocamera. Per favore, consenti l\'accesso.');
        return;
      }
    }
    requestFullscreen()
    // Procedi con il countdown solo se i permessi sono concessi
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
          Inizio in: {countdown} secondi
        </div>
      )}
    </div>

    <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 z-50">
      {isTracking && (
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
              <span className="font-bold">{classifyKneeAngle(maxFlexion)}</span>
            </p>
            <p className="flex justify-between">
        <span>Stage Corrente:</span>
        <span className="font-bold">{getCurrentStageDisplay()}</span>
      </p>
      <p className="flex justify-between">
        <span>Progresso Sequenza:</span>
        <span className="font-bold">{stageSequence.length}/5</span>
      </p>
            <p className="flex justify-between">
              <span>Ripetizioni Valide:</span>
              <span className="font-bold">{validReps}</span>
            </p>
            <p className="flex justify-between">
              <span>Angolo Corrente:</span>
              <span className="font-bold">{Math.round(angle)}°</span>
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default KneeFlexionLeft;