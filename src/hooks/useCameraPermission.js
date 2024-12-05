// useCameraPermission.js
import { useState, useEffect } from 'react';

const useCameraPermission = () => {
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop());
    } catch {
      alert('Please allow camera access to use this feature.');
      setCameraPermissionGranted(false);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  return { cameraPermissionGranted, requestCameraPermission };
};

export default useCameraPermission;