// redux/flexionSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  maxFlexion: 0,
};

const flexionSlice = createSlice({
  name: 'flexion',
  initialState,
  reducers: {
    updateMaxFlexion: (state, action) => {
      state.maxFlexion = action.payload;
    },
  },
});

export const { updateMaxFlexion } = flexionSlice.actions;
export default flexionSlice.reducer;
