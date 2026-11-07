
/*
Purpose:
Configure Axios for communication between
React and the Express backend.

Attach JWT tokens and handle expired sessions.
*/

import axios from "axios";

// Create a shared Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

// Attach JWT token to protected requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Handle unauthorized responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";

        // Do not redirect on invalid login credentials
        const isAuthRequest =
            requestUrl.includes("/api/v1/user/login") ||
            requestUrl.includes("/api/v1/user/signup");

        if (status === 401 && !isAuthRequest) {
            // Remove expired or invalid token
            localStorage.removeItem("token");

            // Redirect user to Login
            window.location.replace("/login");
        }

        return Promise.reject(error);
    }
);

export default api;
