
/*
Purpose:
Allow authenticated users to update their
employees and replace profile pictures.
Validate picture type and size before uploading.
*/

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function EditEmployee() {
    const { id } = useParams();
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
    const [currentPicture, setCurrentPicture] = useState("");
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [pictureError, setPictureError] = useState("");

    // Load existing employee information
    useEffect(() => {
        let active = true;

        const fetchEmployee = async () => {
            try {
                const response = await api.get(
                    `/api/v1/emp/employees/${id}`
                );

                if (!active) return;

                const employee = response.data.employee;

                setFormData({
                    first_name: employee.first_name || "",
                    last_name: employee.last_name || "",
                    email: employee.email || "",
                    position: employee.position || "",
                    salary: String(employee.salary ?? ""),
                    date_of_joining:
                        employee.date_of_joining?.slice(0, 10) || "",
                    department: employee.department || ""
                });

                setCurrentPicture(
                    employee.profile_picture || ""
                );

            } catch (error) {
                if (!active) return;

                const status = error.response?.status;

                if (status === 403 || status === 404) {
                    setError(
                        "Employee not found or access denied."
                    );
                } else if (status === 400) {
                    setError("Invalid employee ID.");
                } else if (status === 429) {
                    setError(
                        "Too many requests. Please try again later."
                    );
                } else {
                    setError(
                        "Unable to load employee information."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchEmployee();

        return () => {
            active = false;
        };
    }, [id]);

    // Update form inputs
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Validate selected profile picture
    const handlePictureChange = (event) => {
        const file = event.target.files?.[0];

        setError("");
        setPictureError("");
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

        // Validate image type
        if (!allowedTypes.includes(file.type)) {
            setPictureError(
                "Invalid file type. Please select a JPEG, PNG or WebP image."
            );

            event.target.value = "";
            return;
        }

        // Validate maximum image size (2 MB)
        const maxFileSize = 2 * 1024 * 1024;

        if (file.size > maxFileSize) {
            const fileSizeMB = (
                file.size / (1024 * 1024)
            ).toFixed(2);

            setPictureError(
                `This image is ${fileSizeMB} MB. ` +
                "Profile pictures must be 2 MB or smaller. " +
                "Please select a smaller image."
            );

            event.target.value = "";
            return;
        }

        // Store the valid replacement picture
        setPicture(file);

        // Display new picture preview
        const reader = new FileReader();

        reader.onload = () => {
            setPreview(reader.result);
        };

        reader.readAsDataURL(file);
    };

    // Save employee updates
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        // Prevent invalid picture submission
        if (pictureError) {
            return;
        }

        // Validate required fields
        if (
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim() ||
            !formData.position.trim() ||
            !formData.department.trim() ||
            !formData.date_of_joining ||
            String(formData.salary).trim() === ""
        ) {
            setError(
                "Please complete all required fields."
            );
            return;
        }

        // Validate salary
        const salary = Number(formData.salary);

        if (!Number.isFinite(salary) || salary < 0) {
            setError(
                "Please enter a valid non-negative salary."
            );
            return;
        }

        setSaving(true);

        try {
            // Create multipart form data
            const data = new FormData();

            Object.entries(formData).forEach(
                ([key, value]) => {
                    data.append(key, value);
                }
            );

            // Add replacement picture if selected
            if (picture) {
                data.append(
                    "profile_picture",
                    picture
                );
            }

            // Send updated employee information
            await api.put(
                `/api/v1/emp/employees/${id}`,
                data
            );

            // Return to employee details
            navigate(
                `/employees/${id}`,
                { replace: true }
            );

        } catch (error) {
            const status = error.response?.status;

            if (status === 413) {
                setPictureError(
                    "Profile picture is too large. Maximum size is 2 MB."
                );
            } else if (status === 400) {
                setError(
                    error.response?.data?.message ||
                    "Please check the employee information."
                );
            } else if (
                status === 403 ||
                status === 404
            ) {
                setError(
                    "Employee not found or access denied."
                );
            } else if (status === 429) {
                setError(
                    "Too many requests. Please try again later."
                );
            } else {
                setError(
                    "Unable to update employee. Please try again."
                );
            }
        } finally {
            setSaving(false);
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
                                    Edit Employee
                                </h2>

                                {/* Loading message */}
                                {loading && (
                                    <p>Loading employee...</p>
                                )}

                                {/* General error message */}
                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* Employee edit form */}
                                {!loading && formData.email && (
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
                                                Replace Profile Picture
                                                (Optional)
                                            </label>

                                            <input
                                                type="file"
                                                id="profile_picture"
                                                className={
                                                    pictureError
                                                        ? "form-control is-invalid"
                                                        : "form-control"
                                                }
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePictureChange}
                                                aria-invalid={
                                                    Boolean(pictureError)
                                                }
                                                aria-describedby={
                                                    pictureError
                                                        ? "picture-error"
                                                        : "picture-help"
                                                }
                                            />

                                            <small
                                                id="picture-help"
                                                className="text-muted d-block mt-1"
                                            >
                                                Leave empty to keep the
                                                current picture.
                                                JPEG, PNG or WebP.
                                                Maximum 2 MB.
                                            </small>

                                            {/* Picture validation error */}
                                            {pictureError && (
                                                <div
                                                    id="picture-error"
                                                    className="alert alert-danger mt-2 mb-0"
                                                    role="alert"
                                                >
                                                    {pictureError}
                                                </div>
                                            )}
                                        </div>

                                        {/* Current or new picture preview */}
                                        {(preview || currentPicture) && (
                                            <div className="mb-3">
                                                <p>
                                                    {preview
                                                        ? "New Picture Preview"
                                                        : "Current Picture"}
                                                </p>

                                                <img
                                                    src={
                                                        preview ||
                                                        `${import.meta.env.VITE_API_URL}${currentPicture}`
                                                    }
                                                    alt="Employee profile"
                                                    width="120"
                                                    height="120"
                                                    style={{
                                                        objectFit: "cover",
                                                        borderRadius: "8px"
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="d-flex flex-wrap gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={
                                                    saving ||
                                                    Boolean(pictureError)
                                                }
                                            >
                                                {saving
                                                    ? "Saving..."
                                                    : "Update Employee"}
                                            </button>

                                            <Link
                                                to={`/employees/${id}`}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </Link>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditEmployee;
