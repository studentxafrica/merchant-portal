import { Merchant, User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";


export interface AuthState {
	user: Merchant | null;
	role: string | null;
}

const initialValue = {
	user: null,
	role: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState: initialValue,
	reducers: {
		setCurrentUser(state, action) {
			state.user = action.payload.user;
			state.role = action.payload.role;
		},
		setLogout(state) {
			state.user = null;
			state.role = null;
			localStorage.clear();
		},
	},
});

export const { setCurrentUser, setLogout } = authSlice.actions;

export const authReducer = authSlice.reducer;
