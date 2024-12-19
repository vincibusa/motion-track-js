export const STAGES = {
  STAGE1: 'STAGE1', // Posizione eretta
  STAGE2: 'STAGE2', // Discesa
  STAGE3: 'STAGE3', // Squat profondo
};

export const STAGE_RANGES = {
  [STAGES.STAGE1]: { min: 145, max: 180 }, // Gambe quasi dritte
  [STAGES.STAGE2]: { min: 120, max: 144 }, // Fase di discesa
  [STAGES.STAGE3]: { min: 0, max: 119 },  // Squat profondo
};

export const POSE_LANDMARKS = {
  LEFT_HIP: 23,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27,
  LEFT_SHOULDER: 11,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  RIGHT_ANKLE: 28,
  RIGHT_SHOULDER: 12,
};



export const TRUNK_ANGLE_RANGES = {
 S1: { min: 140, max: 180 }, // Good trunk angle during squat
  S2: { min: 120, max: 154 }, // Warning zone
  S3: { min: 0, max: 119 }, // Poor form, too much forward lean
};