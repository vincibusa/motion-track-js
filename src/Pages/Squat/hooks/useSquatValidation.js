/* eslint-disable react-hooks/exhaustive-deps */
/* hooks/useSquatValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { STAGES, STAGE_RANGES, TRUNK_ANGLE_RANGES } from '../constants/constants';

const useSquatValidation = ({ onValidRep, onInvalidRep, onTotalRep }) => {
  const [stageSequence, setStageSequence] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const lastToastTimeRef = useRef(0);

  // Reference for tracking form faults
  const formFaultsRef = useRef([]);

  const showToastIfAllowed = (message, type, autoClose = 1000) => {
    const currentTime = Date.now();
    if (currentTime - lastToastTimeRef.current >= autoClose) {
      toast[type](message, {
        position: "top-left",
        autoClose,
        className: "text-2xl w-full h-auto"
      });
      lastToastTimeRef.current = currentTime;
    }
  };

  const addFormFault = (reason) => {
    if (!formFaultsRef.current.includes(reason)) {
      formFaultsRef.current.push(reason);
    }
  };

  const determineStage = (kneeAngle, trunkAngle) => {
    let stage = null;

    // Check Stage 1 (Standing position)
    if (kneeAngle >= STAGE_RANGES[STAGES.STAGE1].min && 
        kneeAngle <= STAGE_RANGES[STAGES.STAGE1].max) {
      stage = STAGES.STAGE1;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S1.min) {
       showToastIfAllowed('Sei troppo flesso, estendi la schiena', 'warning');
      }
    } 
    // Check Stage 2 (Descent/Ascent)
    else if (kneeAngle >= STAGE_RANGES[STAGES.STAGE2].min && 
             kneeAngle <= STAGE_RANGES[STAGES.STAGE2].max) {
      stage = STAGES.STAGE2;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S2.min) {
        addFormFault('Sei troppo flesso, estendi la schiena');
      }
    //   if (trunkAngle > TRUNK_ANGLE_RANGES.S2.max) {
    //     addFormFault('Sei troppo dritto, fletti leggermente la schiena');
    //   }
    } 
    // Check Stage 3 (Bottom position)
    else if (kneeAngle >= STAGE_RANGES[STAGES.STAGE3].min && 
             kneeAngle <= STAGE_RANGES[STAGES.STAGE3].max) {
      stage = STAGES.STAGE3;
      if (trunkAngle < TRUNK_ANGLE_RANGES.S3.min) {
        addFormFault('Sei troppo flesso, estendi la schiena');
      }
    //   if (trunkAngle > TRUNK_ANGLE_RANGES.S3.max) {
    //     addFormFault('Sei troppo dritto, fletti leggermente la schiena');
    //   }
    }

    return stage;
  };

  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,  // Standing position
      STAGES.STAGE2,  // Descent
      STAGES.STAGE3,  // Bottom position
      STAGES.STAGE2,  // Ascent
      STAGES.STAGE1   // Return to standing
    ];

    if (sequence.length !== correctSequence.length) return false;
    return sequence.every((stage, index) => stage === correctSequence[index]);
  };

  const validateRepetition = useCallback(
    (kneeAngle, trunkAngle) => {
      const newStage = determineStage(kneeAngle, trunkAngle);

      if (!newStage) {
        if (stageSequence.length > 0) {
          setStageSequence([]);
          formFaultsRef.current = [];
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

          // Complete and valid repetition
          if (validateStageSequence(newSequence)) {
            onTotalRep();
            if (formFaultsRef.current.length === 0) {
              onValidRep();
              showToastIfAllowed('Squat valido!', 'success');
            } else {
              onInvalidRep();
              const faults = formFaultsRef.current.join('\n');
              showToastIfAllowed(`Squat non valido!\nMotivo:\n${faults}`, 'error');
            }
            formFaultsRef.current = [];
            return [];
          } 
          // Invalid sequence (wrong order or too many stages)
          else if (newSequence.length === 5) {
            onTotalRep();
            onInvalidRep();
            const message = formFaultsRef.current.length > 0
              ? `Squat non valido!\nMotivo:\n${formFaultsRef.current.join('\n')}`
              : 'Squat non valido!';
            showToastIfAllowed(message, 'error');
            formFaultsRef.current = [];
            return [];
          } 
          // Incomplete depth
          else if (newSequence.length < 5 && 
                   newStage === STAGES.STAGE1 && 
                   prev[prev.length - 1] === STAGES.STAGE2) {
            onTotalRep();
            onInvalidRep();
            showToastIfAllowed('Squat incompleto, scendi più in basso', 'error');
            formFaultsRef.current = [];
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
    stageSequence,
    currentStage
  };
};

export default useSquatValidation;