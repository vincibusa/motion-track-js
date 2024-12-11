// constants.js
export const STAGES = {
    STAGE1: 'STAGE1', // Braccio disteso (circa 180 gradi)
    STAGE2: 'STAGE2', // Curl parziale
    STAGE3: 'STAGE3', // Curl completo
  };
  
  export const STAGE_RANGES = {
    [STAGES.STAGE1]: { min: 0, max: 90 }, // Braccio quasi completamente disteso
    [STAGES.STAGE2]: { min: 91, max: 120 },  // Fase intermedia
    [STAGES.STAGE3]: { min: 120, max: 180 },   // Curl completo
  };
  
  export const POSE_LANDMARKS = {
    LEFT_SHOULDER: 11,
    LEFT_ELBOW: 13,
    LEFT_WRIST: 15,
    RIGHT_SHOULDER: 12,
    RIGHT_ELBOW: 14,
    RIGHT_WRIST: 16,
  };