// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import flexionReducer from "./slices/flexionSlices"
import repsReducer from "./slices/repsSlice"
import squatRepsReducer from "./slices/squatRepsSlice"
import kneeRepsReducer from "./slices/kneeRepsSlice"
const store = configureStore({
  reducer: {
    flexion: flexionReducer,
    reps: repsReducer,
    squatReps: squatRepsReducer,
    kneeReps: kneeRepsReducer,
  },
});

export default store;
