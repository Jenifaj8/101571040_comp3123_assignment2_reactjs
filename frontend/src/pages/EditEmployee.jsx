
/*
Purpose:
Allow authenticated users to update their
employees and replace profile pictures.
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

                setCurrentPicture(employee.profile_picture || "");

            } catch (error) {
                if (!active) return;

                const status = error.response?.status;

                if (status === 403 || status === 404) {
                    setError("Employee not found or access denied.");
                } else if (status === 400) {
                    setError("Invalid employee ID.");
                } else if (status === 429) {
                    setError("Too many requests. Please try again later.");
                } else {
                    setError("Unable to load employee information.");
                }
            } finally {
                if (active) setLoading(false);
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
        setPicture(null);
        setPreview("");

        if (!file) return;

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

        if (
            !formData.first_name.trim() ||
            !formData.last_name.trim() ||
            !formData.email.trim() ||
            !formData.position.trim() ||
            !formData.department.trim() ||
            !formData.date_of_joining ||
            String(formData.salary).trim() === ""
        ) {
            setError("Please complete all required fields.");
            return;
        }

        const salary = Number(formData.salary);

        if (!Number.isFinite(salary) || salary < 0) {
            setError("Please enter a valid non-negative salary.");
            return;
        }

        setSaving(true);

        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value);
            });

            if (picture) {
                data.append("profile_picture", picture);
            }

            // Temporary debugging for salary verification
            console.log(
                "Salary being submitted:",
                data.get("salary")
            );

            const response = await api.put(
                `/api/v1/emp/employees/${id}`,
                data
            );

            console.log(
                "Salary returned by backend:",
                response.data.employee?.salary
            );

            navigate(`/employees/${id}`, { replace: true });

        } catch (error) {
            const status = error.response?.status;

            if (status === 400 || status === 413) {
                setError(
                    error.response?.data?.message ||
                    "Please check the employee information."
                );
            } else if (status === 403 || status === 404) {
                setError("Employee not found or access denied.");
            } else if (status === 429) {
                setError("Too many requests. Please try again later.");
            } else {
                setError("Unable to update employee. Please try again.");
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
                                <h2 className="mb-4">Edit Employee</h2>

                                {loading && <p>Loading employee...</p>}

                                {error && (
                                    <div
                                        className="alert alert-danger"
                                        role="alert"
                                    >
                                        {error}
                                    </div>
                                )}

                                {!loading && formData.email && (
                                    <form onSubmit={handleSubmit}>
                                        {[
                                            ["first_name", "First Name"],
                                            ["last_name", "Last Name"],
                                            ["email", "Email Address"],
                                            ["position", "Position"],
                                            ["department", "Department"]
                                        ].map(([name, label]) => (
                                            <div className="mb-3" key={name}>
                                                <label
                                                    htmlFor={name}
                                                    className="form-label"
                                                >
                                                    {label}
                                                </label>

                                                <input
                                                    type={name === "email"
                                                        ? "email"
                                                        : "text"}
                                                    id={name}
                                                    name={name}
                                                    className="form-control"
                                                    value={formData[name]}
                                                    onChange={handleChange}
                                                    maxLength={name === "email"
                                                        ? 254
                                                        : 100}
                                                    required
                                                />
                                            </div>
                                        ))}

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

                                        <div className="mb-3">
                                            <label
                                                htmlFor="profile_picture"
                                                className="form-label"
                                            >
                                                Replace Profile Picture (Optional)
                                            </label>

                                            <input
                                                type="file"
                                                id="profile_picture"
                                                className="form-control"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handlePictureChange}
                                            />

                                            <small className="text-muted">
                                                Leave empty to keep the current
                                                picture. Maximum 2 MB.
                                            </small>
                                        </div>

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

                                        <div className="d-flex gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={saving}
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
