// constants.js
export const STAGES = {
  STAGE1: 'STAGE1', // Braccio disteso (circa 180 gradi)
  STAGE2: 'STAGE2', // Curl parziale
  STAGE3: 'STAGE3', // Curl completo
};

export const STAGE_RANGES = {
  [STAGES.STAGE1]: { min: 0, max: 40 }, // Braccio quasi completamente disteso
  [STAGES.STAGE2]: { min: 40, max: 110 },  // Fase intermedia
  [STAGES.STAGE3]: { min: 110, max: 180 },   // Curl completo
};

export const POSE_LANDMARKS = {
  // Spalle, gomiti, polsi, anca
  LEFT_SHOULDER: 11,
  LEFT_ELBOW: 13,
  LEFT_WRIST: 15,
  LEFT_HIP: 23,
  RIGHT_SHOULDER: 12,
  RIGHT_ELBOW: 14,
  RIGHT_WRIST: 16,
  RIGHT_HIP: 24,
  // Orecchie
  LEFT_EAR: 7,   // MediaPipe FaceMesh Landmark Index for Left Ear
  RIGHT_EAR: 8,  // MediaPipe FaceMesh Landmark Index for Right Ear
};

// Aggiungi una costante per l'allineamento del gomito
export const ELBOW_ALIGNMENT_THRESHOLD = 20; // Gradi
