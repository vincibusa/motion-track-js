
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import { FaStopwatch, FaChartLine, FaAngleLeft,  } from "react-icons/fa";
import { BsPlayCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import { ToastContainer, toast } from 'react-toastify';
const POSE_LANDMARKS = {
    RIGHT_HIP: 24,
    RIGHT_KNEE: 26, // Ginocchio destro
    RIGHT_ANKLE: 28, // Caviglia destra
  };
  
  
const REQUIRED_LANDMARKS = [
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.RIGHT_KNEE,
  POSE_LANDMARKS.RIGHT_ANKLE,
];

const KneeFlexionRight = () => {

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
    // Vettori: da ginocchio a anca e da ginocchio a caviglia
    const p1 = knee;
    const p2 = hip;
    const p3 = ankle;
  
    // Vettore p1-p2 (ginocchio-anca)
    const v1x = p2[0] - p1[0];
    const v1y = p2[1] - p1[1];
  
    // Vettore p1-p3 (ginocchio-caviglia)
    const v2x = p3[0] - p1[0];
    const v2y = p3[1] - p1[1];
  
    // Prodotto scalare tra i vettori
    const dotProduct = v1x * v2x + v1y * v2y;
  
    // Calcolare le magnitudini dei vettori
    const magnitudeV1 = Math.sqrt(v1x * v1x + v1y * v1y);
    const magnitudeV2 = Math.sqrt(v2x * v2x + v2y * v2y);
  
    // Calcolare il coseno dell'angolo
    const cosAngle = dotProduct / (magnitudeV1 * magnitudeV2);
  
    // Correggere per errori numerici, assicuriamoci che il coseno sia tra -1 e 1
    const angleRadians = Math.acos(Math.min(Math.max(cosAngle, -1), 1));
  
    // Convertire in gradi
    const angleDegrees = angleRadians * (180 / Math.PI);
  
    
  
    // Restituire l'angolo
    return angleDegrees;
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
  
      const rightHip = [
        landmarks[POSE_LANDMARKS.RIGHT_HIP].x * width,
        landmarks[POSE_LANDMARKS.RIGHT_HIP].y * height,
      ];
      const rightKnee = [
        landmarks[POSE_LANDMARKS.RIGHT_KNEE].x * width,
        landmarks[POSE_LANDMARKS.RIGHT_KNEE].y * height,
      ];
      const rightAnkle = [
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE].x * width,
        landmarks[POSE_LANDMARKS.RIGHT_ANKLE].y * height,
      ];
  
      // Calcola l'angolo del ginocchio
      const kneeAngle = calculateKneeAngle(rightHip, rightKnee, rightAnkle);
      setAngle(kneeAngle); // Imposta l'angolo del ginocchio
  
      // Aggiorna maxFlexion se l'angolo è maggiore di maxFlexion
      setMaxFlexion((prevMax) => {
        const updatedMax = Math.max(prevMax, kneeAngle);
        localStorage.setItem('maxFlexion', updatedMax.toString());
        return updatedMax;
      });
  
      // Disegna i landmarks e l'angolo del ginocchio
      drawLandmarks(landmarks, ctx, width, height);
      drawAngle(ctx, rightKnee, kneeAngle); // Disegna l'angolo sul canvas
    },
    []
  );
  
  
  const drawAngle = (ctx, position, angle) => {
    ctx.fillStyle = 'yellow'; // Colore del testo
    ctx.font = '20px Arial'; // Stile del testo
    ctx.fillText(`${Math.round(angle)}°`, position[0] + 10, position[1] - 10); // Scrive l'angolo vicino al ginocchio
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
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900" 
    ref={containerRef}
    >
       <ToastContainer></ToastContainer>
       {/* Back Button */}
       <button
        className="absolute top-4 left-4 text-white bg-gray-700 p-2 rounded-full z-50"
        onClick={() => navigate('/mobility-test')}
      >
        <FaAngleLeft size={24} />
      </button>

      {/* Timer */}
      <div className="absolute top-4 right-4 text-white bg-gray-700 p-2 rounded-full flex items-center z-50">
        <FaStopwatch size={20} className="mr-2" />
        {timer}s
      </div>

      {/* Contenitore Video e Canvas */}
      <div className="relative w-full h-full">
        <video
            style={{
              transform: 'scaleX(-1)',
            }}
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover "
          autoPlay
          playsInline
          muted
        ></video>
        <canvas
           style={{
              transform: 'scaleX(-1)',
            }}
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        ></canvas>
      </div>

      {/* Pulsante Centrale */}
      <div className="absolute inset-0 flex items-center justify-center">
      {!isTracking && !isCountdownActive && (
        <button
          onClick={handleStart}
          className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600"
        >
          <BsPlayCircleFill className="text-white text-4xl" />
        </button>
      )}

      {/* Timer che appare durante il conto alla rovescia */}
      {isCountdownActive && (
        <div className="absolute inset-0 flex items-center justify-center text-2xl text-white">
          Inizio in: {countdown} secondi
        </div>
      )}
      </div>

      {/* Controlli di Feedback in basso */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 z-50">
      {(isTracking ) && (
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
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default KneeFlexionRight;