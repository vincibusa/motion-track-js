/* hooks/useRepValidation.js */
import { useState, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

import {
  STAGES,
  STAGE_RANGES,
  ELBOW_ALIGNMENT_THRESHOLD
} from '../constants/constants';
import { addRep } from '../../../redux/slices/repsSlice';

const useRepValidation = () => {
  const dispatch = useDispatch();

  // Usiamo lo state per la sequenza degli stage
  const [stageSequence, setStageSequence] = useState([]);

  // Riferimenti per evitare troppe toast ravvicinate e per gestire la postura
  const lastToastTimeRef = useRef(0);
  const initialDistanceRef = useRef(null);
  const repFaultReasonsRef = useRef([]);

  // Flag per controllo postura
  const isCheatingRef = useRef(false);
  const isShoulderHipMisalignedRef = useRef(false);
  const isElbowTorsoMisalignedRef = useRef(false);

  // Mostra toast limitando la frequenza
  const showToastIfAllowed = (message, type, autoClose = 1000, lastWarningRef) => {
    const currentTime = Date.now();
    if (currentTime - lastWarningRef.current >= autoClose) {
      toast[type](message, {
        position: 'top-center',
        autoClose,
        className: 'text-2xl w-full h-auto'
      });
      lastWarningRef.current = currentTime;
    }
  };

  /**
   * Aggiunge un motivo di errore all'array, evitando duplicati.
   */
  const addFaultReason = (reason) => {
    if (!repFaultReasonsRef.current.includes(reason)) {
      repFaultReasonsRef.current.push(reason);
    }
  };

  /**
   * Restituisce in quale stage ci troviamo in base all'angolo.
   */
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

  /**
   * Verifica se la sequenza è esattamente [STAGE1, STAGE2, STAGE3, STAGE2, STAGE1].
   */
  const validateStageSequence = (sequence) => {
    const correctSequence = [
      STAGES.STAGE1,
      STAGES.STAGE2,
      STAGES.STAGE3,
      STAGES.STAGE2,
      STAGES.STAGE1
    ];
    if (sequence.length !== correctSequence.length) return false;
    return sequence.every((stage, idx) => stage === correctSequence[idx]);
  };

  /**
   * Funzione principale richiamata a ogni frame per validare l'esecuzione.
   */
  const validateRepetition = useCallback(
    (currentAngle, shoulderHipAngle, shoulderEarDistance, elbowTorsoAngle) => {
      // Determina lo stage attuale
      const newStage = determineStage(currentAngle);

      // Se è la prima volta, memorizziamo la distanza spalla-orecchio
      if (initialDistanceRef.current === null) {
        initialDistanceRef.current = shoulderEarDistance;
      }

      // Controllo depressione spalla (spalla troppo vicina all'orecchio)
      if (initialDistanceRef.current !== null) {
        const distanceThreshold = initialDistanceRef.current * 0.8; // 20% di diminuzione consentita
        if (shoulderEarDistance < distanceThreshold && !isCheatingRef.current) {
          isCheatingRef.current = true;
          addFaultReason(
            'Deprimere la scapola! Abbassa la spalla per correggere la postura.'
          );
        } else if (shoulderEarDistance >= distanceThreshold) {
          isCheatingRef.current = false;
        }
      }

      // Controllo postura spalla-anca
      if (shoulderHipAngle > 20) {
        if (!isShoulderHipMisalignedRef.current) {
          isShoulderHipMisalignedRef.current = true;
          addFaultReason(
            "Correggere la postura! L'angolo tra spalla e anca dev'essere < 20°."
          );
        }
      } else {
        isShoulderHipMisalignedRef.current = false;
      }

      // Controllo allineamento gomito-busto
      if (elbowTorsoAngle > ELBOW_ALIGNMENT_THRESHOLD) {
        if (!isElbowTorsoMisalignedRef.current) {
          isElbowTorsoMisalignedRef.current = true;
          addFaultReason('Allineare il gomito con il busto!');
        }
      } else {
        isElbowTorsoMisalignedRef.current = false;
      }

      // Aggiorniamo la sequenza degli stage
      setStageSequence((prevSequence) => {
        // Evitiamo di aggiungere duplicati consecutivi
        if (prevSequence[prevSequence.length - 1] === newStage) {
          return prevSequence;
        }

        const newSequence = [...prevSequence, newStage];

        // Se siamo tornati a STAGE1 e la sequenza conta almeno 5 stadi...
        if (newStage === STAGES.STAGE1 && prevSequence.length > 0) {
          const isValidSequence = validateStageSequence(newSequence);

          // Se la sequenza non è valida, controlliamo che non manchi STAGE3
          if (!isValidSequence) {
            if (!newSequence.includes(STAGES.STAGE3)) {
              addFaultReason(
                "Movimento incompleto! Non hai completato il movimento."
              );
            }
          }

          // Copia i motivi di errore (potrebbero essersi aggiornati poco sopra)
          const finalReasons = [...repFaultReasonsRef.current];

          // Rep valida se la sequenza è corretta e non ci sono motivi di errore
          if (isValidSequence && finalReasons.length === 0) {
            showToastIfAllowed(
              'Bicep curl valido!',
              'success',
              1000,
              lastToastTimeRef
            );

            dispatch(
              addRep({
                isValid: true,
                timestamp: new Date().toISOString(),
                reasons: [],
              })
            );
          } else {
            // Rep non valida
            const reasonsText =
              finalReasons.length > 0
                ? `Motivo:\n${finalReasons.join('\n')}`
                : 'Bicep curl non valido!';

            showToastIfAllowed(
              `Bicep curl non valido!\n${reasonsText}`,
              'error',
              1000,
              lastToastTimeRef
            );

            dispatch(
              addRep({
                isValid: false,
                timestamp: new Date().toISOString(),
                reasons: finalReasons,
              })
            );
          }

          // Reset degli array / state dopo la conclusione di una rep
          repFaultReasonsRef.current = [];
          return [];
        }

        // Se la sequenza si allunga troppo senza tornare a STAGE1,
        // consideriamo la rep come non valida.
        if (newSequence.length >= 5) {
          // Se non abbiamo raggiunto STAGE3, aggiungiamo la reason di movimento incompleto
          if (!newSequence.includes(STAGES.STAGE3)) {
            addFaultReason(
              "Movimento incompleto! Non hai raggiunto l'angolo di flessione richiesto."
            );
          }

          const finalReasons = [...repFaultReasonsRef.current];
          const reasonsText =
            finalReasons.length > 0
              ? `Motivo:\n${finalReasons.join('\n')}`
              : 'Bicep curl non valido!';

          showToastIfAllowed(
            `Bicep curl non valido!\n${reasonsText}`,
            'error',
            1000,
            lastToastTimeRef
          );

          dispatch(
            addRep({
              isValid: false,
              timestamp: new Date().toISOString(),
              reasons: finalReasons,
            })
          );

          // Resettiamo tutto
          repFaultReasonsRef.current = [];
          return [];
        }

        return newSequence;
      });
    },
    [dispatch]
  );

  return { validateRepetition, stageSequence };
};

export default useRepValidation;
