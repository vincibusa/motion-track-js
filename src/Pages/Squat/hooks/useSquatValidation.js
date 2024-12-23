/* eslint-disable react-hooks/exhaustive-deps */
/* hooks/useSquatValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import {
  STAGES,
  STAGE_RANGES,
  TRUNK_ANGLE_RANGES
} from '../constants/constants';
import { addSquatRep } from '../../../redux/slices/squatRepsSlice';

const useSquatValidation = () => {
  const dispatch = useDispatch();

  // Sequenza di stage (STAGE1, STAGE2, STAGE3, STAGE2, STAGE1)
  const [stageSequence, setStageSequence] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);

  // Riferimenti per evitare toast multipli e per accumulare form faults
  const lastToastTimeRef = useRef(0);
  const formFaultsRef = useRef([]);

  // Mostra toast limitando la frequenza
  const showToastIfAllowed = (message, type, autoClose = 1000) => {
    const currentTime = Date.now();
    if (currentTime - lastToastTimeRef.current >= autoClose) {
      toast[type](message, {
        position: 'top-left',
        autoClose,
        className: 'text-2xl w-full h-auto',
      });
      lastToastTimeRef.current = currentTime;
    }
  };

  const addFormFault = (reason) => {
    if (!formFaultsRef.current.includes(reason)) {
      formFaultsRef.current.push(reason);
    }
  };

  // Determina stage in base a kneeAngle e trunkAngle
  const determineStage = (kneeAngle, trunkAngle) => {
    let stage = null;
    // Stage1
    if (
      kneeAngle >= STAGE_RANGES[STAGES.STAGE1].min &&
      kneeAngle <= STAGE_RANGES[STAGES.STAGE1].max
    ) {
      stage = STAGES.STAGE1;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S1.min) {
        addFormFault('Sei troppo flesso, estendi la schiena');
      }
    }
    // Stage2
    else if (
      kneeAngle >= STAGE_RANGES[STAGES.STAGE2].min &&
      kneeAngle <= STAGE_RANGES[STAGES.STAGE2].max
    ) {
      stage = STAGES.STAGE2;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S2.min) {
        addFormFault('Sei troppo flesso, estendi la schiena');
      }
    }
    // Stage3
    else if (
      kneeAngle >= STAGE_RANGES[STAGES.STAGE3].min &&
      kneeAngle <= STAGE_RANGES[STAGES.STAGE3].max
    ) {
      stage = STAGES.STAGE3;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S3.min) {
        addFormFault('Sei troppo flesso, estendi la schiena');
      }
    }

    return stage;
  };

  // Verifica sequenza corretta [STAGE1, STAGE2, STAGE3, STAGE2, STAGE1]
  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,
      STAGES.STAGE2,
      STAGES.STAGE3,
      STAGES.STAGE2,
      STAGES.STAGE1,
    ];
    if (sequence.length !== correctSequence.length) return false;
    return sequence.every((st, idx) => st === correctSequence[idx]);
  };

  /**
   * Validazione: viene chiamata ad ogni frame, simile al tuo uso bicep curl.
   */
  const validateRepetition = useCallback((kneeAngle, trunkAngle) => {
    const newStage = determineStage(kneeAngle, trunkAngle);

    // Se non individuiamo uno stage valido, resettiamo tutto
    if (!newStage) {
      if (stageSequence.length > 0) {
        setStageSequence([]);
        formFaultsRef.current = [];
      }
      return;
    }

    // Se lo stage è cambiato rispetto al frame precedente
    if (newStage !== currentStage) {
      setCurrentStage(newStage);

      setStageSequence((prev) => {
        // Se l'ultimo stage aggiunto è uguale al nuovo, non facciamo nulla
        if (prev[prev.length - 1] === newStage) {
          return prev;
        }

        const newSequence = [...prev, newStage];

        // SE ABBIAMO 5 STAGE => potenziale conclusione rep
        if (newSequence.length === 5) {
          // Determiniamo se la sequenza è corretta
          const isSequenceValid = validateStageSequence(newSequence);

          // Copiamo i motivi di errori accumulati
          const faultReasons = [...formFaultsRef.current];

          if (isSequenceValid && faultReasons.length === 0) {
            // Rep valida
            showToastIfAllowed('Squat valido!', 'success');
            dispatch(
              addSquatRep({
                isValid: true,
                timestamp: new Date().toISOString(),
                reasons: [],
              })
            );
          } else {
            // Rep non valida
            const message =
              faultReasons.length > 0
                ? `Squat non valido!\nMotivo:\n${faultReasons.join('\n')}`
                : 'Squat non valido!';

            showToastIfAllowed(message, 'error');
            dispatch(
              addSquatRep({
                isValid: false,
                timestamp: new Date().toISOString(),
                reasons: faultReasons,
              })
            );
          }

          // Reset
          formFaultsRef.current = [];
          return [];
        }
        // Se torniamo a STAGE1 troppo presto (sequence < 5)
        // e l'ultimo era STAGE2 => squat incompleto
        else if (
          newSequence.length < 5 &&
          newStage === STAGES.STAGE1 &&
          prev[prev.length - 1] === STAGES.STAGE2
        ) {
          // squat non concluso
          showToastIfAllowed('Squat incompleto, scendi più in basso', 'error');

          dispatch(
            addSquatRep({
              isValid: false,
              timestamp: new Date().toISOString(),
              reasons: ['Squat incompleto, scendi più in basso'],
            })
          );

          // Reset
          formFaultsRef.current = [];
          return [];
        }

        // Se nessun caso conclusivo, continuiamo ad accumulare la sequenza
        return newSequence;
      });
    }
  }, [currentStage, stageSequence, dispatch]);

  return {
    validateRepetition,
    stageSequence,
    currentStage,
  };
};

export default useSquatValidation;
