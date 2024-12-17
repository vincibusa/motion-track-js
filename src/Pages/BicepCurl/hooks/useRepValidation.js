/* hooks/useRepValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { STAGES, STAGE_RANGES } from '../constants/constants';

const useRepValidation = ({ onValidRep, onInvalidRep, onTotalRep }) => {
  const [currentStage, setCurrentStage] = useState(null);
  const [stageSequence, setStageSequence] = useState([]);
  const lastToastTimeRef = useRef(0);
  
  // Nuovi riferimenti per la gestione del cheating
  const initialDistanceRef = useRef(null);
  const lastCheatingWarningRef = useRef(0);
  const isCheatingRef = useRef(false);

  const showToastIfAllowed = (message, type, autoClose = 1000) => {
    const currentTime = Date.now();
    if (currentTime - lastToastTimeRef.current >= 1000) {
      toast[type](message, {
        position: "top-center",
        autoClose: autoClose,
      });
      lastToastTimeRef.current = currentTime;
    }
  };

  const determineStage = (angle) => {
    if (angle >= STAGE_RANGES.STAGE1.min && angle <= STAGE_RANGES.STAGE1.max) {
      return STAGES.STAGE1;
    } else if (angle >= STAGE_RANGES.STAGE2.min && angle < STAGE_RANGES.STAGE2.max) {
      return STAGES.STAGE2;
    } else if (angle >= STAGE_RANGES.STAGE3.min && angle < STAGE_RANGES.STAGE3.max) {
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

    if (sequence.length !== correctSequence.length) {
      return false;
    }
    return sequence.every((stage, index) => stage === correctSequence[index]);
  };

  const validateRepetition = useCallback(
    (currentAngle, shoulderHipAngle, shoulderEarDistance) => {
      console.log('📐 Current Angle:', currentAngle);
      console.log('📐 Shoulder-Hip Angle:', shoulderHipAngle);
      console.log('📐 Shoulder-Ear Distance:', shoulderEarDistance);

      const currentTime = Date.now();

      // Gestione warning postura (Cheating)
      if (initialDistanceRef.current === null) {
        // Imposta la distanza iniziale al primo frame
        initialDistanceRef.current = shoulderEarDistance;
      } else {
        const distanceThreshold = initialDistanceRef.current * 0.8; // 20% di diminuzione
        if (shoulderEarDistance < distanceThreshold && !isCheatingRef.current) {
          isCheatingRef.current = true;
          if (currentTime - lastCheatingWarningRef.current >= 2000) { // Evita spam di toast
            showToastIfAllowed('Deprimere la scapola! Abbassa la spalla per correggere la postura.', 'warning', 2000);
            lastCheatingWarningRef.current = currentTime;
          }
        } else if (shoulderEarDistance >= distanceThreshold) {
          isCheatingRef.current = false;
        }
      }

      // Gestione warning postura angolo spalla-anca
      if (shoulderHipAngle > 20) { // Soglia aggiornata a 20 gradi
        showToastIfAllowed('Correggere la postura! L\'angolo tra spalla e anca deve essere minore di 30 gradi', 'warning', 2000);
        return;
      }

      const newStage = determineStage(currentAngle);

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
            onValidRep();
            onTotalRep();
            showToastIfAllowed('Bicep curl valido!', 'success');
            return [];
          } else if (newSequence.length === 5) {
            onInvalidRep();
            onTotalRep();
            showToastIfAllowed('Bicep curl non valido!', 'error');
            return [];
          } else if (
            newSequence.length < 5 &&
            newStage === STAGES.STAGE1 &&
            prev[prev.length - 1] === STAGES.STAGE2
          ) {
            onInvalidRep();
            onTotalRep();
            showToastIfAllowed('Bicep curl incompleto, completa il movimento', 'error');
            return [];
          }

          return newSequence;
        });
      }
    },
    [currentStage, stageSequence, onValidRep, onInvalidRep, onTotalRep]
  );

  return {
    validateRepetition,
    currentStage,
    stageSequence
  };
};

export default useRepValidation;
