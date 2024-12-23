// store/repsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reps: [] // Array di ripetizioni: [{ isValid, timestamp, reasons, repNumber }, ...]
};

const repsSlice = createSlice({
  name: 'reps',
  initialState,
  reducers: {
    addRep: (state, action) => {
      state.reps.push(action.payload);
    },
    resetReps: (state) => {
      state.reps = [];
    },
  },
});

export const { addRep, resetReps } = repsSlice.actions;
export default repsSlice.reducer;
