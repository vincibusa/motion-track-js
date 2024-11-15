import { useRef, useState, useEffect } from 'react';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import '@mediapipe/pose/pose'; // Mantieni questa importazione

const MotionTracker = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [timer, setTimer] = useState(10);

  // Funzione per calcolare l'angolo di flessione della spalla
  const calculateRightShoulderFlexion = (hip, shoulder, wrist) => {
    console.log('Calcolando l\'angolo di flessione della spalla');
    const hipToShoulder = [shoulder[0] - hip[0], shoulder[1] - hip[1]];
    const shoulderToWrist = [wrist[0] - shoulder[0], wrist[1] - shoulder[1]];

    const dotProduct = hipToShoulder[0] * shoulderToWrist[0] + hipToShoulder[1] * shoulderToWrist[1];
    const magnitudeHipToShoulder = Math.sqrt(hipToShoulder[0] ** 2 + hipToShoulder[1] ** 2);
    const magnitudeShoulderToWrist = Math.sqrt(shoulderToWrist[0] ** 2 + shoulderToWrist[1] ** 2);

    const cosAngle = dotProduct / (magnitudeHipToShoulder * magnitudeShoulderToWrist);
    let angleDegrees = Math.acos(Math.min(Math.max(cosAngle, -1), 1)) * (180 / Math.PI);

    // Mappa l'angolo correttamente
    if (wrist[1] > shoulder[1]) {
      angleDegrees = 180 - angleDegrees; // Braccio giù
    }

    console.log(`Angolo calcolato: ${angleDegrees}°`);
    return angleDegrees;
  };

  // Configura MediaPipe Pose
  const setupPose = async () => {
    console.log('Inizializzazione di MediaPipe Pose');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const onResults = (results) => {
      console.log('Risultati ricevuti da MediaPipe Pose:', results);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const landmarks = results.poseLandmarks;

        // Verifica che i landmarks esistano
        const requiredLandmarks = [
          POSE_LANDMARKS.RIGHT_HIP,
          POSE_LANDMARKS.RIGHT_SHOULDER,
          POSE_LANDMARKS.RIGHT_WRIST
        ];

        const allLandmarksExist = requiredLandmarks.every(idx => landmarks[idx]);

        if (allLandmarksExist) {
          console.log('Tutti i landmarks richiesti sono presenti');
          const rightHip = [
            landmarks[POSE_LANDMARKS.RIGHT_HIP].x * canvas.width,
            landmarks[POSE_LANDMARKS.RIGHT_HIP].y * canvas.height
          ];
          const rightShoulder = [
            landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].x * canvas.width,
            landmarks[POSE_LANDMARKS.RIGHT_SHOULDER].y * canvas.height
          ];
          const rightWrist = [
            landmarks[POSE_LANDMARKS.RIGHT_WRIST].x * canvas.width,
            landmarks[POSE_LANDMARKS.RIGHT_WRIST].y * canvas.height
          ];

          // Calcola l'angolo
          const newAngle = calculateRightShoulderFlexion(rightHip, rightShoulder, rightWrist);
          setAngle(newAngle);

          // Disegna i landmarks e lo scheletro
          drawLandmarks(landmarks, ctx);
          drawSkeleton(landmarks, ctx);
        } else {
          console.warn('Alcuni landmarks necessari sono mancanti.');
        }
      } else {
        console.warn('Nessun landmark rilevato.');
      }
    };

    console.log('Creazione dell\'istanza di Pose');
    const pose = new Pose({
      locateFile: (file) => {
        console.log(`Richiesta del file: ${file}`);
        switch (file) {
          case 'pose_solution_packed_assets_loader.js':
            return `/mediapipe/pose_solution_packed_assets_loader.js`;
          case 'pose_solution_simd_wasm_bin.js':
            return `/mediapipe/pose_solution_simd_wasm_bin.js`;
          case 'pose_solution_wasm_bin.wasm':
            return `/mediapipe/pose_solution_wasm_bin.wasm`;
          case 'pose_solution_simd_wasm_bin.wasm':
            return `/mediapipe/pose_solution_simd_wasm_bin.wasm`;
          default:
            return `/mediapipe/${file}`;
        }
      },
    });

    console.log('Impostazione delle opzioni di Pose');
    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    console.log('Registrazione della callback onResults');
    pose.onResults(onResults);

    try {
      console.log('Richiesta accesso alla webcam');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      video.srcObject = stream;

      video.onloadeddata = async () => {
        console.log('Webcam caricata, avvio del loop della fotocamera');
        const cameraLoop = async () => {
          console.log('Invio immagine a Pose');
          await pose.send({ image: video });
          requestAnimationFrame(cameraLoop);
        };
        cameraLoop();
      };
    } catch (error) {
      console.error('Errore nell\'accesso ai dispositivi multimediali:', error);
    }
  };

  const drawLandmarks = (landmarks, ctx) => {
    console.log('Disegno dei landmarks');
    ctx.fillStyle = 'red';
    landmarks.forEach((landmark, index) => {
      // Escludi i landmarks del viso (indici 0-10)
      if (index < 11) return;

      ctx.beginPath();
      ctx.arc(landmark.x * canvasRef.current.width, landmark.y * canvasRef.current.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  const drawSkeleton = (landmarks, ctx) => {
    console.log('Disegno dello scheletro');
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    const skeletonConnections = [
      [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    skeletonConnections.forEach(([startIdx, endIdx]) => {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];

      if (start && end) {
        ctx.beginPath();
        ctx.moveTo(start.x * canvasRef.current.width, start.y * canvasRef.current.height);
        ctx.lineTo(end.x * canvasRef.current.width, end.y * canvasRef.current.height);
        ctx.stroke();
      }
    });
  };

  // Funzione per gestire il timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    console.log('Avvio di setupPose');
    setupPose();
  }, []);

  return (
    <div style={{ position: 'relative', width: '640px', height: '480px' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        style={{
          position: 'absolute',
          zIndex: 1,
          transform: 'scaleX(-1)', // Specchia il video per una visualizzazione naturale
        }}
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          position: 'absolute',
          zIndex: 2,
          transform: 'scaleX(-1)',
        }}
      />
      <div style={{ position: 'absolute', zIndex: 3, top: '20px', left: '20px', color: 'white', fontSize: '24px' }}>
        Time: {timer}s
      </div>
      <div style={{ position: 'absolute', zIndex: 3, top: '50px', left: '20px', color: 'white', fontSize: '24px' }}>
        Right Shoulder: {Math.round(angle)}°
      </div>
    </div>
  );
};

export default MotionTracker;