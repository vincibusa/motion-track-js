// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import flexionReducer from "./slices/flexionSlices"

const store = configureStore({
  reducer: {
    flexion: flexionReducer,
  },
});

export default store;
