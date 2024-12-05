
 export const STAGES = {
    STAGE1: 'STAGE1',
    STAGE2: 'STAGE2',
    STAGE3: 'STAGE3',
  };
  
 export  const STAGE_RANGES = {
    [STAGES.STAGE1]: { min: 90, max: 120 },
    [STAGES.STAGE2]: { min: 120, max: 155 },
    [STAGES.STAGE3]: { min: 155, max: 180 },
  };

 export  const POSE_LANDMARKS = {
    LEFT_HIP: 23,
    LEFT_KNEE: 25,
    LEFT_ANKLE: 27,
    RIGHT_HIP: 24,
    RIGHT_KNEE: 26,
    RIGHT_ANKLE: 28,
  };