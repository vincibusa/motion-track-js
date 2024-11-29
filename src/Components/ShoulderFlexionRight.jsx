
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import '@mediapipe/pose/pose';
import { FaStopwatch, FaChartLine, FaAngleLeft,  } from "react-icons/fa";
import { BsPlayCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';  // Importa useNavigate
import { ToastContainer, toast } from 'react-toastify';

const POSE_LANDMARKS = {
  RIGHT_SHOULDER: 12,
  RIGHT_ELBOW: 14,
  RIGHT_WRIST: 16,
  RIGHT_HIP: 24,
};

const REQUIRED_LANDMARKS = [
  POSE_LANDMARKS.RIGHT_HIP,
  POSE_LANDMARKS.RIGHT_SHOULDER,
  POSE_LANDMARKS.RIGHT_ELBOW,
  POSE_LANDMARKS.RIGHT_WRIST,
];
const ShoulderFlexionRight = () => {

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

  const calculateShoulderFlexion = (hip, shoulder, elbow) => {
    // Convert coordinates to vectors
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToElbow = [elbow[0] - shoulder[0], elbow[1] - shoulder[1]];
  
    // Calculate dot product and magnitudes
    const dotProduct =
      hipToShoulder[0] * shoulderToElbow[0] + hipToShoulder[1] * shoulderToElbow[1];
    const magnitude1 = Math.sqrt(hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2);
    const magnitude2 = Math.sqrt(shoulderToElbow[0] ** 2 + shoulderToElbow[1] ** 2);
  
    // Calculate the angle in radians
    const cosAngle = Math.min(Math.max(dotProduct / (magnitude1 * magnitude2), -1), 1);
    let angleRadians = Math.acos(cosAngle);
  
    // Convert to degrees
    let angleDegrees = (angleRadians * 180) / Math.PI;
  
    // Adjust for natural flexion (arm down vs raised)
    if (elbow[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees; // Arm down
    } else {
      angleDegrees = 180 - angleDegrees; // Arm raised
    }
  
    return angleDegrees;
  };
  
  const checkPositionAlignment = (hip, shoulder) => {
    // Define the ideal perpendicular direction (vertical line passing through the hip)
    const idealDirection = [0, -1]; // Y-axis pointing upwards
  
    // Calculate the vector from the hip to the shoulder
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
  
    // Normalize both vectors
    const lengthHipToShoulder = Math.sqrt(hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2);
    const unitHipToShoulder = [hipToShoulder[0] / lengthHipToShoulder, hipToShoulder[1] / lengthHipToShoulder];
  
    // Calculate the dot product between the two unit vectors
    const dotProduct = idealDirection[0] * unitHipToShoulder[0] + idealDirection[1] * unitHipToShoulder[1];
  
    // Calculate the angle between the two vectors
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
        const rightHip = [
          landmarks[POSE_LANDMARKS.RIGHT_HIP].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_HIP].y * height,
        ];
        const rightShoulder = [
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y * height,
        ];
        const rightElbow = [
          landmarks[POSE_LANDMARKS.RIGHT_ELBOW].x * width,
          landmarks[POSE_LANDMARKS.RIGHT_ELBOW].y * height,
        ];
  
        const newAngle = calculateShoulderFlexion(rightHip, rightShoulder, rightElbow);
        setAngle(newAngle);
        setMaxFlexion((prevMax) => {
          const updatedMax = Math.max(prevMax, newAngle);
          console.log(updatedMax); // Logga il valore aggiornato
          localStorage.setItem('maxFlexion', updatedMax.toString());
          return updatedMax;
        });

       
        // Check for alignment with the ideal position
        const alignmentAngle = checkPositionAlignment(rightHip, rightShoulder);
        const tolerance = 30; // Tolerance of 30 degrees
        if (alignmentAngle > tolerance) {
          toast.error("Posizione errata! Riemetti la spalla sulla perpendicolare.", {
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
    []
  );


  const classifyFlexion = (angle) => {
    if (angle >= 0 && angle <= 100) return "Scarsa mobilità";
    if (angle >= 101 && angle <= 130) return "Discreta";
    if (angle >= 150 && angle <= 170) return "Buona";
    if (angle > 170 && angle <= 180) return "Ottima";
    return "Invalido";
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
                    <span className="font-bold">{classifyFlexion(maxFlexion)}</span>
                  </p>
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default ShoulderFlexionRight;