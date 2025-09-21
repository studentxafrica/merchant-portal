import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { authReducer } from "./state/auth";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { PersistGate } from "redux-persist/integration/react";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const persistConfig = { key: "studentx-merchant", storage, version: 1 };
const rootReducer = {
	auth: persistReducer(persistConfig, authReducer),
};
const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryClient = new QueryClient();

root.render(
	<QueryClientProvider client={queryClient}>
		<HelmetProvider>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistStore(store)}>
					<App />
				</PersistGate>
			</Provider>
		</HelmetProvider>
	</QueryClientProvider>
);
