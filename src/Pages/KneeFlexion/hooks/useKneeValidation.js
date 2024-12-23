/* hooks/useKneeValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import { STAGES, STAGE_RANGES } from '../constants/constants';
import { addKneeRep } from '../../../redux/slices/kneeRepsSlice';

const useKneeValidation = () => {
  const dispatch = useDispatch();

  const [currentStage, setCurrentStage] = useState(null);
  const [stageSequence, setStageSequence] = useState([]);
  const lastToastTimeRef = useRef(0);

  const showToastIfAllowed = (message, type) => {
    const currentTime = Date.now();
    if (currentTime - lastToastTimeRef.current >= 1000) {
      toast[type](message, {
        position: 'top-center',
        autoClose: 1000,
        className: 'text-2xl w-full h-auto',
      });
      lastToastTimeRef.current = currentTime;
    }
  };

  // Determina stage in base all'angolo
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

  // Verifica sequenza [STAGE1, STAGE2, STAGE3, STAGE2, STAGE1]
  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,
      STAGES.STAGE2,
      STAGES.STAGE3,
      STAGES.STAGE2,
      STAGES.STAGE1,
    ];
    if (sequence.length !== correctSequence.length) {
      return false;
    }
    return sequence.every((stage, index) => stage === correctSequence[index]);
  };

  /**
   * Funzione principale. Viene chiamata ad ogni frame dal tuo hook di Pose Tracking.
   */
  const validateRepetition = useCallback((currentAngle) => {
    // Calcolo stage in base all'angolo
    const newStage = determineStage(currentAngle);
    if (!newStage) {
      // Se non c'è stage e abbiamo stadi memorizzati, resettiamo
      if (stageSequence.length > 0) {
        setStageSequence([]);
      }
      return;
    }

    if (newStage !== currentStage) {
      setCurrentStage(newStage);

      setStageSequence((prev) => {
        // Evitiamo duplicati consecutivi
        if (prev[prev.length - 1] === newStage) {
          return prev;
        }

        const newSequence = [...prev, newStage];

        // 1) Se la sequenza è corretta => rep valida
        if (validateStageSequence(newSequence)) {
          showToastIfAllowed('Ripetizione valida!', 'success');
          dispatch(
            addKneeRep({
              isValid: true,
              timestamp: new Date().toISOString(),
              reasons: [], // nessun errore
            })
          );
          return [];
        }
        // 2) Se abbiamo già 5 stadi e non è valida => rep non valida
        else if (newSequence.length === 5) {
          showToastIfAllowed('Ripetizione errata!', 'error');
          dispatch(
            addKneeRep({
              isValid: false,
              timestamp: new Date().toISOString(),
              reasons: ['Ripetizione errata'],
            })
          );
          return [];
        }
        // 3) Se torniamo a STAGE1 troppo presto => rep non valida
        else if (
          newSequence.length < 5 &&
          newStage === STAGES.STAGE1 &&
          prev[prev.length - 1] === STAGES.STAGE2
        ) {
          showToastIfAllowed('Ripetizione non valida, stendi meglio il ginocchio', 'error');
          dispatch(
            addKneeRep({
              isValid: false,
              timestamp: new Date().toISOString(),
              reasons: ['Ripetizione non valida, stendi meglio il ginocchio'],
            })
          );
          return [];
        }
        // 4) Se la sequenza supera i 5 stadi (caso raro), resettiamo
        else if (newSequence.length > 5) {
          return [];
        }

        return newSequence;
      });
    }
  }, [currentStage, stageSequence, dispatch]);

  return {
    validateRepetition,
    currentStage,
    stageSequence,
  };
};

export default useKneeValidation;
