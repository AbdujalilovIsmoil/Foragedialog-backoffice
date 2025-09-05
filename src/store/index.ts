import registerSlice from "./registerSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: { registerSlice },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
