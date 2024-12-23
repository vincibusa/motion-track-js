// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import flexionReducer from "./slices/flexionSlices"
import repsReducer from "./slices/repsSlice"
const store = configureStore({
  reducer: {
    flexion: flexionReducer,
    reps: repsReducer,
  },
});

export default store;
