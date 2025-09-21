import { User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";

interface Category {
	id: string;
	name: string;
	slug: string;
	imageURL: string;
}

export interface AppState {
	categories: User | null;
}

const initialValue = {
	categories: null,
};

const appSlice = createSlice({
	name: "app",
	initialState: initialValue,
	reducers: {
		setCategories(state, action) {
			state.categories = action.payload;
		},
	},
});

export const { setCategories } = appSlice.actions;

export const appReducer = appSlice.reducer;
