import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice"; // Features klasöründen import

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
});

export default store;
