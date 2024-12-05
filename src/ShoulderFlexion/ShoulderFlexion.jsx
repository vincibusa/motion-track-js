// ShoulderFlexion.jsx
import React, { useRef, useState, useCallback } from 'react';
import { FaAngleLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useCameraPermission from '../hooks/useCameraPermission.js';
import usePoseTracking from './hooks/usePoseTracking.js';
import useTimer from '../hooks/useTimer.js';
import useFullscreen from '../hooks/useFullScreen.js';
import VideoCanvas from './components/VideoCanvas.jsx';
import TimerDisplay from './components/TimerDisplay.jsx';
import Countdown from './components/Countdown.jsx';
import ControlButton from './components/ControlButton.jsx';
import Summary from './components/Summary.jsx';
import 'react-toastify/dist/ReactToastify.css';

const ShoulderFlexion = ({ side = 'left' }) => {
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Navigation
  const navigate = useNavigate();

  // State
  const [angle, setAngle] = useState(0);
  const [maxFlexion, setMaxFlexion] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountdownActive, setIsCountdownActive] = useState(false);

  // Hooks
  const { cameraPermissionGranted, requestCameraPermission } = useCameraPermission();
  const requestFullscreen = useFullscreen();

  const handleExpire = useCallback(() => {
    setIsTracking(false);
    setTimeout(() => navigate('/report'), 500);
  }, [navigate]);

  const timer = useTimer(isTracking, handleExpire);

  usePoseTracking({
    side,
    isTracking,
    canvasRef,
    videoRef,
    setAngle,
    setMaxFlexion,
  });

  // Handle Start Button
  const handleStart = async () => {
    if (!cameraPermissionGranted) {
      await requestCameraPermission();
      if (!cameraPermissionGranted) {
        alert('Camera permission is required to use this feature.');
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

  // Classify Flexion
  const classifyFlexion = angle => {
    if (angle <= 100) return "Poor mobility";
    if (angle <= 130) return "Fair";
    if (angle <= 170) return "Good";
    if (angle <= 180) return "Excellent";
    return "Invalid";
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

      <TimerDisplay timer={timer} />

      <VideoCanvas videoRef={videoRef} canvasRef={canvasRef} isTracking={isTracking} />

      <div className="absolute inset-0 flex items-center justify-center">
        {!isTracking && !isCountdownActive && (
          <ControlButton onClick={handleStart} />
        )}

        {isCountdownActive && (
          <Countdown countdown={countdown} />
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4 z-50">
        {isTracking && (
          <Summary maxFlexion={maxFlexion} classifyFlexion={classifyFlexion} />
        )}
      </div>
    </div>
  );
};

export default ShoulderFlexion;