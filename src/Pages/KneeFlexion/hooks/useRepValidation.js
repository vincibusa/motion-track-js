import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { STAGES, STAGE_RANGES } from '../constants/constants';

const useRepValidation = ({ onValidRep, onInvalidRep, onTotalRep }) => {
  const [currentStage, setCurrentStage] = useState(null);
  const [stageSequence, setStageSequence] = useState([]);
  const lastToastTimeRef = useRef(0);

  const showToastIfAllowed = (message, type) => {
    const currentTime = Date.now();
    if (currentTime - lastToastTimeRef.current >= 1000) {
      toast[type](message, {
        position: "top-center",
        autoClose: 1000,
           className : "text-2xl w-full h-auto "
      });
      lastToastTimeRef.current = currentTime;
    }
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
    (currentAngle) => {
      console.log('📐 Current Angle:', currentAngle);

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
            showToastIfAllowed('Ripetizione valida!', 'success');
            return [];
          } else if (newSequence.length === 5) {
            onInvalidRep();
            onTotalRep();
            showToastIfAllowed('Ripetizione errata!', 'error');
            return [];
          } else if (
            newSequence.length < 5 &&
            newStage === STAGES.STAGE1 &&
            prev[prev.length - 1] === STAGES.STAGE2
          ) {
            onInvalidRep();
            onTotalRep();
            showToastIfAllowed('Ripetizione non valida, stendi meglio il ginocchio', 'error');
            return [];
          } else if (newSequence.length > 5) {
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