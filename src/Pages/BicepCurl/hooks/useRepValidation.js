/* hooks/useRepValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { STAGES, STAGE_RANGES, ELBOW_ALIGNMENT_THRESHOLD } from '../constants/constants';

const useRepValidation = ({ onValidRep, onInvalidRep, onTotalRep }) => {
  const [stageSequence, setStageSequence] = useState([]);
  const lastToastTimeRef = useRef(0);

  // Riferimenti per la gestione del cheating
  const initialDistanceRef = useRef(null);
  const lastCheatingWarningRef = useRef(0);
  const isCheatingRef = useRef(false);

  // Riferimenti per la gestione dell'allineamento
  const lastShoulderHipWarningRef = useRef(0);
  const isShoulderHipMisalignedRef = useRef(false);
  
  const lastElbowTorsoWarningRef = useRef(0);
  const isElbowTorsoMisalignedRef = useRef(false);

  const showToastIfAllowed = (message, type, autoClose = 1000, lastWarningRef) => {
    const currentTime = Date.now();
    if (currentTime - lastWarningRef.current >= autoClose) {
      toast[type](message, {
        position: "top-center",
        autoClose,
      });
      lastWarningRef.current = currentTime;
    }
  };

  const determineStage = (angle) => {
    if (angle >= STAGE_RANGES.STAGE1.min && angle <= STAGE_RANGES.STAGE1.max) {
      return STAGES.STAGE1;
    }
    if (angle >= STAGE_RANGES.STAGE2.min && angle < STAGE_RANGES.STAGE2.max) {
      return STAGES.STAGE2;
    }
    if (angle >= STAGE_RANGES.STAGE3.min && angle < STAGE_RANGES.STAGE3.max) {
      return STAGES.STAGE3;
    }
    return null;
  };

  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,
      STAGES.STAGE2,
      STAGES.STAGE3,
      STAGES.STAGE2,
      STAGES.STAGE1
    ];

    if (sequence.length !== correctSequence.length) return false;
    return sequence.every((stage, index) => stage === correctSequence[index]);
  };

  const validateRepetition = useCallback(
    (currentAngle, shoulderHipAngle, shoulderEarDistance, elbowTorsoAngle) => {
      console.log('📐 Current Angle:', currentAngle);
      console.log('📐 Shoulder-Hip Angle:', shoulderHipAngle);
      console.log('📐 Shoulder-Ear Distance:', shoulderEarDistance);
      console.log('📐 Elbow-Torso Angle:', elbowTorsoAngle);

   

      // Gestione warning postura (Cheating)
      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = shoulderEarDistance;
      } else {
        const distanceThreshold = initialDistanceRef.current * 0.8; // 20% di diminuzione
        if (shoulderEarDistance < distanceThreshold && !isCheatingRef.current) {
          isCheatingRef.current = true;
          showToastIfAllowed(
            'Deprimere la scapola! Abbassa la spalla per correggere la postura.',
            'warning',
            2000,
            lastCheatingWarningRef
          );
        } else if (shoulderEarDistance >= distanceThreshold) {
          isCheatingRef.current = false;
        }
      }

      // Gestione warning postura angolo spalla-anca
      if (shoulderHipAngle > 20) { // Soglia aggiornata a 20 gradi
        if (!isShoulderHipMisalignedRef.current) {
          showToastIfAllowed(
            'Correggere la postura! L\'angolo tra spalla e anca deve essere minore di 20 gradi',
            'warning',
            2000,
            lastShoulderHipWarningRef
          );
          isShoulderHipMisalignedRef.current = true;
        }
      } else {
        isShoulderHipMisalignedRef.current = false;
      }

      // Gestione warning allineamento gomito-torso
      if (elbowTorsoAngle > ELBOW_ALIGNMENT_THRESHOLD) { // Soglia di 20 gradi
        if (!isElbowTorsoMisalignedRef.current) {
          showToastIfAllowed(
            'Allineare il gomito con il busto!',
            'warning',
            2000,
            lastElbowTorsoWarningRef
          );
          isElbowTorsoMisalignedRef.current = true;
        }
      } else {
        isElbowTorsoMisalignedRef.current = false;
      }

      const newStage = determineStage(currentAngle);

      if (!newStage) {
        if (stageSequence.length > 0) {
          setStageSequence([]);
        }
        return;
      }

      setStageSequence((prev) => {
        if (prev[prev.length - 1] === newStage) {
          return prev;
        }

        const newSequence = [...prev, newStage];

        if (validateStageSequence(newSequence)) {
          onValidRep();
          onTotalRep();
          showToastIfAllowed('Bicep curl valido!', 'success', 1000, lastToastTimeRef);
          return [];
        }

        if (newSequence.length === 5) {
          onInvalidRep();
          onTotalRep();
          showToastIfAllowed('Bicep curl non valido!', 'error', 1000, lastToastTimeRef);
          return [];
        }

        if (
          newSequence.length < 5 &&
          newStage === STAGES.STAGE1 &&
          prev[prev.length - 1] === STAGES.STAGE2
        ) {
          onInvalidRep();
          onTotalRep();
          showToastIfAllowed('Bicep curl incompleto, completa il movimento', 'error', 1000, lastToastTimeRef);
          return [];
        }

        return newSequence;
      });
    },
    [stageSequence, onValidRep, onInvalidRep, onTotalRep]
  );

  return {
    validateRepetition,
    stageSequence
  };
};

export default useRepValidation;
