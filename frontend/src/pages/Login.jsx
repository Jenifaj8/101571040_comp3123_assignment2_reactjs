
/*
Purpose:
Allow users to log in to the Employee Management System.
Store the JWT and authenticated user email.
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle login form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        // Validate required fields
        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const cleanEmail = email.trim().toLowerCase();

            // Authenticate with backend
            const response = await api.post(
                "/api/v1/user/login",
                {
                    email: cleanEmail,
                    password: password
                }
            );

            // Store JWT token
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Store email for navbar display
            localStorage.setItem(
                "userEmail",
                cleanEmail
            );

            // Redirect to employee list
            navigate("/employees", {
                replace: true
            });

        } catch (error) {
            const status = error.response?.status;

            if (status === 401) {
                setError("Invalid email or password.");
            } else if (status === 429) {
                setError(
                    "Too many login attempts. Please try again later."
                );
            } else if (status === 400) {
                setError(
                    error.response?.data?.message ||
                    "Please check your information."
                );
            } else {
                setError(
                    "Unable to log in. Please try again later."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">

                            <h2 className="text-center mb-4">
                                Employee Management Login
                            </h2>

                            {/* Login error */}
                            {error && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                {/* Email */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="email"
                                        className="form-label"
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="password"
                                        className="form-label"
                                    >
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                {/* Login button */}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>
                            </form>

                            <p className="text-center mt-3 mb-0">
                                Don't have an account?{" "}
                                <Link to="/signup">
                                    Sign Up
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
