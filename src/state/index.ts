import { AppState } from "./app";
import { AuthState } from "./auth";

export interface RootState {
	auth: AuthState;
	app: AppState;
}