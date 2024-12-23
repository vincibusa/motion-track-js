// redux/slices/squatRepsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  reps: [],
};

const squatRepsSlice = createSlice({
  name: 'squatReps',
  initialState,
  reducers: {
    addSquatRep: (state, action) => {
      state.reps.push(action.payload);
    },
    resetSquatReps: (state) => {
      state.reps = [];
    },
  },
});

export const { addSquatRep, resetSquatReps } = squatRepsSlice.actions;
export default squatRepsSlice.reducer;
