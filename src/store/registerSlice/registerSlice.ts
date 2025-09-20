import { storage } from "@/services";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { loginInterface } from "@/types/loginInterface";

const initialState: Partial<loginInterface> = {
  username: "",
  token: storage.get("token") || "",
};

export { initialState };

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    getToken: (
      state: Partial<loginInterface>,
      action: PayloadAction<loginInterface>
    ) => {
      storage.set("token", action.payload.token);
      storage.set("username", action.payload.username);
      return {
        ...state,
        token: storage.get("token"),
        username: storage.get("username"),
      };
    },
    clearToken: (state: Partial<loginInterface>) => {
      storage.clear();
      return {
        ...state,
        token: null,
        username: null,
      };
    },
  },
});

export default registerSlice.reducer;
export const { clearToken, getToken } = registerSlice.actions;
