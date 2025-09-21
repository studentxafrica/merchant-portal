// src/api/axiosInstance.js
import axios from 'axios';

// Create an instance
const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_SERVER_HEAD, // Base URL for the API
	withCredentials: true, // if you're using cookies
});


// Response interceptor
axiosInstance.interceptors.response.use(
	response => response,
	error => {
		const status = error.response?.status;

		if (status === 401) {
			localStorage.clear();
			if (window.location.pathname !== '/login') {
				const next = window.location.pathname + window.location.search;
				window.location.href = '/login' + `?next=${encodeURIComponent(next)}`;
			}
		} else if (status === 403) {
			// Handle Forbidden
			alert('You do not have permission to perform this action.');
		} else if (status === 500) {
			// Handle Server Error
			console.error('Server error. Please try again later.');
			alert('Server error. Please try again later.');
		}

		// Optionally rethrow or return a custom error object
		return Promise.reject(error);
	}
);

export default axiosInstance;