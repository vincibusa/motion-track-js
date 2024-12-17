/* hooks/useRepValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { STAGES, STAGE_RANGES, ELBOW_ALIGNMENT_THRESHOLD } from '../constants/constants';

const useRepValidation = ({ onValidRep, onInvalidRep, onTotalRep }) => {
  const [stageSequence, setStageSequence] = useState([]);
  const lastToastTimeRef = useRef(0);

  // Riferimenti per la gestione del cheating
  const initialDistanceRef = useRef(null);

  const isCheatingRef = useRef(false);

  const isShoulderHipMisalignedRef = useRef(false);

  const isElbowTorsoMisalignedRef = useRef(false);

  // Riferimento per accumulare i motivi di invalidità della rep
  const repFaultReasonsRef = useRef([]);

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

  const addFaultReason = (reason) => {
    // Aggiunge un motivo di fault solo se non è già presente (per evitare duplicati)
    if (!repFaultReasonsRef.current.includes(reason)) {
      repFaultReasonsRef.current.push(reason);
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


      const newStage = determineStage(currentAngle);

      // Iniziare una nuova ripetizione quando si torna a STAGE1
      if (stageSequence.length > 0 && newStage === STAGES.STAGE1) {
        // Validazione della ripetizione precedente prima di iniziarne una nuova
        if (stageSequence.length > 0) {
          const isValidSequence = validateStageSequence(stageSequence);
          onTotalRep();
          if (isValidSequence && repFaultReasonsRef.current.length === 0) {
            // Ripetizione valida
            onValidRep();
            showToastIfAllowed('Bicep curl valido!', 'success', 1000, lastToastTimeRef);
          } else {
            // Ripetizione non valida
            onInvalidRep();
            const reasons = repFaultReasonsRef.current.length > 0 
              ? `Motivo:\n${repFaultReasonsRef.current.join('\n')}` 
              : 'Bicep curl non valido!';
            showToastIfAllowed(`Bicep curl non valido!\n${reasons}`, 'error', 1000, lastToastTimeRef);
          }
          // Reset dei motivi di fault dopo la validazione
          repFaultReasonsRef.current = [];
        }
        // Iniziare una nuova ripetizione
        setStageSequence([newStage]);
        console.log('🔄 Stage Sequence (Nuova Ripetizione):', [newStage]); // Aggiunto
        return;
      }

      if (!newStage) {
        if (stageSequence.length > 0) {
          setStageSequence([]);
          console.log('🔄 Stage Sequence resettata:', []); // Aggiunto
        }
        return;
      }

      // Gestione warning postura (Cheating)
      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = shoulderEarDistance;
      } else {
        const distanceThreshold = initialDistanceRef.current * 0.8; // 20% di diminuzione
        if (shoulderEarDistance < distanceThreshold && !isCheatingRef.current) {
          isCheatingRef.current = true;
          addFaultReason('Deprimere la scapola! Abbassa la spalla per correggere la postura.');
       
        } else if (shoulderEarDistance >= distanceThreshold) {
          isCheatingRef.current = false;
        }
      }

      // Gestione warning postura angolo spalla-anca
      if (shoulderHipAngle > 20) { // Soglia aggiornata a 20 gradi
        if (!isShoulderHipMisalignedRef.current) {
          isShoulderHipMisalignedRef.current = true;
          addFaultReason('Correggere la postura! L\'angolo tra spalla e anca deve essere minore di 20 gradi.');
      
        }
      } else {
        isShoulderHipMisalignedRef.current = false;
      }

      // Gestione warning allineamento gomito-torso
      if (elbowTorsoAngle > ELBOW_ALIGNMENT_THRESHOLD) { // Soglia di 20 gradi
        if (!isElbowTorsoMisalignedRef.current) {
          isElbowTorsoMisalignedRef.current = true;
          addFaultReason('Allineare il gomito con il busto!');
       
        }
      } else {
        isElbowTorsoMisalignedRef.current = false;
      }

      setStageSequence((prev) => {
        if (prev[prev.length - 1] === newStage) {
          return prev;
        }

        const newSequence = [...prev, newStage];
        console.log('🔄 Stage Sequence aggiornata:', newSequence); // Aggiunto
        const isValidSequence = validateStageSequence(newSequence);

        // Se la sequenza è completa
        if (isValidSequence) {
          onTotalRep();
          if (repFaultReasonsRef.current.length === 0) {
            // Nessun warning durante la rep, rep valida
            onValidRep();
            showToastIfAllowed('Bicep curl valido!', 'success', 1000, lastToastTimeRef);
          } else {
            // Ci sono stati warning, quindi anche se la sequenza è corretta, la rep è invalida
            onInvalidRep();
            const reasons = repFaultReasonsRef.current.join('\n');
            showToastIfAllowed(`Bicep curl non valido!\nMotivo:\n${reasons}`, 'error', 1000, lastToastTimeRef);
          }
          // Reset della sequenza e dei motivi per la prossima rep
          repFaultReasonsRef.current = [];
          console.log('🔄 Stage Sequence completata e resettata:', []); // Aggiunto
          return [];
        }

        // Se abbiamo raggiunto 5 stage senza completare la sequenza
        if (newSequence.length === 5) {
          onInvalidRep();
          onTotalRep();
          const reasons = repFaultReasonsRef.current.length > 0 
            ? `Motivo:\n${repFaultReasonsRef.current.join('\n')}` 
            : 'Bicep curl non valido!';
          showToastIfAllowed(reasons, 'error', 1000, lastToastTimeRef);
          // Reset della sequenza e dei motivi per la prossima rep
          repFaultReasonsRef.current = [];
          console.log('🔄 Stage Sequence superata senza completare la sequenza:', []); // Aggiunto
          return [];
        }

        // Se si ritorna a STAGE1 troppo presto
        if (
          newSequence.length < 5 &&
          newStage === STAGES.STAGE1 &&
          prev[prev.length - 1] === STAGES.STAGE2
        ) {
          onInvalidRep();
          onTotalRep();
          const reasons = repFaultReasonsRef.current.length > 0 
            ? `Motivo:\n${repFaultReasonsRef.current.join('\n')}` 
            : 'Bicep curl incompleto, completa il movimento';
          showToastIfAllowed(reasons, 'error', 1000, lastToastTimeRef);
          // Reset della sequenza e dei motivi per la prossima rep
          repFaultReasonsRef.current = [];
          console.log('🔄 Stage Sequence interrotta troppo presto:', []); // Aggiunto
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
