export const STAGES = {
  STAGE1: 'STAGE1', // Standing
  STAGE2: 'STAGE2', // Going down
  STAGE3: 'STAGE3', // Deep squat
};

export const STAGE_RANGES = {
  [STAGES.STAGE1]: { min: 160, max: 180 }, // Standing position
  [STAGES.STAGE2]: { min: 90, max: 160 }, // Descent
  [STAGES.STAGE3]: { min: 60, max: 90 }, // Deep squat
};

export const POSE_LANDMARKS = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  LEFT_KNEE: 25,
  LEFT_ANKLE: 27,
  RIGHT_HIP: 24,
  RIGHT_KNEE: 26,
  RIGHT_ANKLE: 28,
};