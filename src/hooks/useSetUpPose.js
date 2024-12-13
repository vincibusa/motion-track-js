import { useRef, useCallback } from 'react';
import * as MediapipePose from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

const useSetupPose = ({ videoRef, onResults }) => {
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  const trackingRef = useRef(false);

  const setupPose = useCallback(() => {
    const video = videoRef.current;
    const pose = new MediapipePose.Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
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
      width: Math.min(window.innerWidth, 1280),
      height: Math.min(window.innerHeight, 720),
    });
    cameraRef.current = camera;
    camera.start();
  }, [onResults, videoRef]);

  const cleanup = () => {
    trackingRef.current = false;
    cameraRef.current?.stop();
    poseRef.current?.close();
    poseRef.current = null;
  };

  return {
    setupPose,
    cleanup,
    trackingRef,
  };
};

export default useSetupPose;
