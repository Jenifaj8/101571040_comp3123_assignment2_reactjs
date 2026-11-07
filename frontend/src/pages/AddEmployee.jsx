
/*
Purpose:
Allow authenticated users to create employees
with an optional profile picture.
*/

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function AddEmployee() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        position: "",
        salary: "",
        date_of_joining: "",
        department: ""
    });

    const [picture, setPicture] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Update controlled inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Select and validate picture
    const handlePictureChange = (event) => {
        const file = event.target.files[0];

        setError("");
        setPicture(null);
        setPreview("");

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Only JPEG, PNG and WebP images are allowed.");
            event.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Profile picture must not exceed 2 MB.");
            event.target.value = "";
            return;
        }

        setPicture(file);

        // Show image preview
        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    // Submit employee form
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        // Validate required fields
        if (
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim() ||
            !formData.position.trim() ||
            !formData.department.trim() ||
            !formData.date_of_joining ||
            formData.salary === ""
        ) {
            setError("Please complete all required fields.");
            return;
        }

        // Validate salary
        const salary = Number(formData.salary);

        if (!Number.isFinite(salary) || salary < 0) {
            setError("Please enter a valid salary.");
            return;
        }

        setLoading(true);

        try {
            // Create multipart form data
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            // Add profile picture if selected
            if (picture) {
                data.append("profile_picture", picture);
            }

            // Check salary before submitting
            console.log(
                "Salary being submitted:",
                data.get("salary")
            );

            // Send employee data to backend
            await api.post("/api/v1/emp/employees", data);

            // Return to Employee List
            navigate("/employees", { replace: true });

        } catch (error) {
            const status = error.response?.status;

            if (status === 400 || status === 413) {
                setError(
                    error.response?.data?.message ||
                    "Please check the employee information."
                );
            } else if (status === 429) {
                setError("Too many requests. Please try again later.");
            } else if (status === 403 || status === 404) {
                setError(
                    "You do not have permission to perform this action."
                );
            } else {
                setError(
                    "Unable to create employee. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-9 col-lg-7">
                        <div className="card shadow-sm">
                            <div className="card-body p-4">
                                <h2 className="mb-4">
                                    Add Employee
                                </h2>

                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {[
                                        ["first_name", "First Name"],
                                        ["last_name", "Last Name"],
                                        ["email", "Email Address"],
                                        ["position", "Position"],
                                        ["department", "Department"]
                                    ].map(([name, label]) => (
                                        <div
                                            className="mb-3"
                                            key={name}
                                        >
                                            <label
                                                htmlFor={name}
                                                className="form-label"
                                            >
                                                {label}
                                            </label>

                                            <input
                                                type={
                                                    name === "email"
                                                        ? "email"
                                                        : "text"
                                                }
                                                id={name}
                                                name={name}
                                                className="form-control"
                                                value={formData[name]}
                                                onChange={handleChange}
                                                maxLength={
                                                    name === "email"
                                                        ? 254
                                                        : 100
                                                }
                                                required
                                            />
                                        </div>
                                    ))}

                                    {/* Salary */}
                                    <div className="mb-3">
                                        <label
                                            htmlFor="salary"
                                            className="form-label"
                                        >
                                            Salary
                                        </label>

                                        <input
                                            type="number"
                                            id="salary"
                                            name="salary"
                                            className="form-control"
                                            value={formData.salary}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    {/* Date of Joining */}
                                    <div className="mb-3">
                                        <label
                                            htmlFor="date_of_joining"
                                            className="form-label"
                                        >
                                            Date of Joining
                                        </label>

                                        <input
                                            type="date"
                                            id="date_of_joining"
                                            name="date_of_joining"
                                            className="form-control"
                                            value={formData.date_of_joining}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    {/* Profile Picture */}
                                    <div className="mb-3">
                                        <label
                                            htmlFor="profile_picture"
                                            className="form-label"
                                        >
                                            Profile Picture (Optional)
                                        </label>

                                        <input
                                            type="file"
                                            id="profile_picture"
                                            className="form-control"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handlePictureChange}
                                        />

                                        <small className="text-muted">
                                            JPEG, PNG or WebP. Maximum 2 MB.
                                        </small>
                                    </div>

                                    {/* Picture Preview */}
                                    {preview && (
                                        <div className="mb-3">
                                            <p>Picture Preview</p>

                                            <img
                                                src={preview}
                                                alt="Selected employee preview"
                                                width="120"
                                                height="120"
                                                style={{
                                                    objectFit: "cover",
                                                    borderRadius: "8px"
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Saving..."
                                                : "Save Employee"}
                                        </button>

                                        <Link
                                            to="/employees"
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </Link>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddEmployee;
