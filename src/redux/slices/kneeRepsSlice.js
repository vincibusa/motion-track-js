// redux/slices/kneeRepsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reps: [], // Array di ripetizioni: [{ isValid, timestamp, reasons }, ...]
};

const kneeRepsSlice = createSlice({
  name: 'kneeReps',
  initialState,
  reducers: {
    addKneeRep: (state, action) => {
      state.reps.push(action.payload);
    },
    resetKneeReps: (state) => {
      state.reps = [];
    },
  },
});

export const { addKneeRep, resetKneeReps } = kneeRepsSlice.actions;
export default kneeRepsSlice.reducer;
