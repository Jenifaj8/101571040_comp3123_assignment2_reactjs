
/*
Purpose:
Display employees belonging to the logged-in user.
Allow users to search, view, edit and delete employees.
Show a table on desktop and responsive cards on mobile.
Display confirmation messages after create and delete.
*/

import { useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Employees() {
    const location = useLocation();
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Read the success message from AddEmployee
    const [success, setSuccess] = useState(
        () => location.state?.successMessage || ""
    );

    const [deletingId, setDeletingId] = useState(null);

    // Retrieve employees from backend
    useEffect(() => {
        let active = true;

        const fetchEmployees = async () => {
            try {
                const response = await api.get(
                    "/api/v1/emp/employees"
                );

                if (active) {
                    setEmployees(response.data.employees);
                }

            } catch (error) {
                if (!active) return;

                if (error.response?.status === 429) {
                    setError(
                        "Too many requests. Please try again later."
                    );
                } else {
                    setError(
                        "Unable to load employees. Please try again."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchEmployees();

        return () => {
            active = false;
        };
    }, []);

    // Keep the confirmation visible while clearing route state
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccess(location.state.successMessage);

            navigate(location.pathname, {
                replace: true,
                state: null
            });
        }
    }, [
        location.pathname,
        location.state,
        navigate
    ]);

    // Search using backend API
    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const cleanDepartment = department.trim();
        const cleanPosition = position.trim();

        if (!cleanDepartment && !cleanPosition) {
            setError(
                "Enter a department or position to search."
            );
            return;
        }

        if (
            cleanDepartment.length > 100 ||
            cleanPosition.length > 100
        ) {
            setError(
                "Search terms must not exceed 100 characters."
            );
            return;
        }

        setSearching(true);
        setLoading(true);

        try {
            const params = {};

            if (cleanDepartment) {
                params.department = cleanDepartment;
            }

            if (cleanPosition) {
                params.position = cleanPosition;
            }

            const response = await api.get(
                "/api/v1/emp/employees/search",
                { params }
            );

            setEmployees(response.data.employees);
            setSearchActive(true);

        } catch (error) {
            const status = error.response?.status;

            if (status === 400) {
                setError(
                    "Please enter valid search information."
                );
            } else if (status === 429) {
                setError(
                    "Too many requests. Please try again later."
                );
            } else {
                setError(
                    "Unable to search employees. Please try again."
                );
            }
        } finally {
            setSearching(false);
            setLoading(false);
        }
    };

    // Clear search and retrieve all employees again
    const handleClearSearch = async () => {
        setDepartment("");
        setPosition("");
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await api.get(
                "/api/v1/emp/employees"
            );

            setEmployees(response.data.employees);
            setSearchActive(false);

        } catch (error) {
            if (error.response?.status === 429) {
                setError(
                    "Too many requests. Please try again later."
                );
            } else {
                setError(
                    "Unable to load employees. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete an employee
    const handleDelete = async (employee) => {
        const fullName =
            `${employee.first_name} ${employee.last_name}`;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${fullName}?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setDeletingId(employee._id);

        try {
            await api.delete(
                "/api/v1/emp/employees",
                {
                    params: {
                        eid: employee._id
                    }
                }
            );

            setEmployees((previous) =>
                previous.filter(
                    (item) => item._id !== employee._id
                )
            );

            setSuccess(
                `${fullName} was deleted successfully.`
            );

        } catch (error) {
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
                    "Unable to delete employee. Please try again."
                );
            }
        } finally {
            setDeletingId(null);
        }
    };

    // Display employee profile picture or placeholder
    const renderEmployeePicture = (employee) => {
        if (employee.profile_picture) {
            return (
                <img
                    src={
                        `${import.meta.env.VITE_API_URL}${employee.profile_picture}`
                    }
                    alt={
                        `${employee.first_name} ${employee.last_name}`
                    }
                    width="55"
                    height="55"
                    style={{
                        objectFit: "cover",
                        borderRadius: "50%"
                    }}
                />
            );
        }

        return (
            <div
                className="d-flex align-items-center justify-content-center bg-light border rounded-circle text-muted text-center"
                style={{
                    width: "55px",
                    height: "55px",
                    fontSize: "10px",
                    flexShrink: 0
                }}
            >
                No Picture
            </div>
        );
    };

    // Reuse action buttons on desktop and mobile
    const renderEmployeeActions = (employee, mobile = false) => {
        return (
            <div className="d-flex flex-wrap gap-2">
                <Link
                    to={`/employees/${employee._id}`}
                    className={
                        `btn btn-info btn-sm ${
                            mobile ? "flex-fill" : ""
                        }`
                    }
                >
                    View
                </Link>

                <Link
                    to={`/employees/${employee._id}/edit`}
                    className={
                        `btn btn-warning btn-sm ${
                            mobile ? "flex-fill" : ""
                        }`
                    }
                >
                    Edit
                </Link>

                <button
                    type="button"
                    className={
                        `btn btn-danger btn-sm ${
                            mobile ? "flex-fill" : ""
                        }`
                    }
                    onClick={() => handleDelete(employee)}
                    disabled={deletingId !== null}
                >
                    {deletingId === employee._id
                        ? "Deleting..."
                        : "Delete"}
                </button>
            </div>
        );
    };

    return (
        <>
            <Navbar />

            <div className="container mt-4 mb-5">

                {/* Page heading and Add button */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <h2 className="mb-0">
                        Employee List
                    </h2>

                    <Link
                        to="/employees/add"
                        className="btn btn-primary"
                    >
                        Add Employee
                    </Link>
                </div>

                {/* Employee search */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">
                            Search Employees
                        </h5>

                        <form onSubmit={handleSearch}>
                            <div className="row g-3">

                                <div className="col-md-4">
                                    <label
                                        htmlFor="department"
                                        className="form-label"
                                    >
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        id="department"
                                        className="form-control"
                                        placeholder="e.g. IT"
                                        value={department}
                                        onChange={(event) =>
                                            setDepartment(event.target.value)
                                        }
                                        maxLength={100}
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label
                                        htmlFor="position"
                                        className="form-label"
                                    >
                                        Position
                                    </label>

                                    <input
                                        type="text"
                                        id="position"
                                        className="form-control"
                                        placeholder="e.g. Developer"
                                        value={position}
                                        onChange={(event) =>
                                            setPosition(event.target.value)
                                        }
                                        maxLength={100}
                                    />
                                </div>

                                <div className="col-md-4 d-flex align-items-end gap-2 flex-wrap">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || searching}
                                    >
                                        {searching
                                            ? "Searching..."
                                            : "Search"}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleClearSearch}
                                        disabled={loading}
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="alert alert-danger"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {/* Success message for create or delete */}
                {success && (
                    <div
                        className="alert alert-success d-flex align-items-center justify-content-between gap-2"
                        role="status"
                    >
                        <strong>{success}</strong>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Dismiss success message"
                            onClick={() => setSuccess("")}
                        />
                    </div>
                )}

                {/* Loading message */}
                {loading && (
                    <p>Loading employees...</p>
                )}

                {/* Empty employee list */}
                {!loading && !error && employees.length === 0 && (
                    <div className="alert alert-info">
                        {searchActive
                            ? "No employees match your search."
                            : "No employees yet."}
                    </div>
                )}

                {/* Employee list */}
                {!loading && employees.length > 0 && (
                    <>
                        {/* Desktop and tablet table */}
                        <div className="d-none d-md-block table-responsive">
                            <table className="table table-striped table-bordered align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Picture</th>
                                        <th>Name</th>
                                        <th>Position</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {employees.map((employee) => (
                                        <tr key={employee._id}>
                                            <td>
                                                {renderEmployeePicture(
                                                    employee
                                                )}
                                            </td>

                                            <td>
                                                {employee.first_name}{" "}
                                                {employee.last_name}
                                            </td>

                                            <td>
                                                {employee.position}
                                            </td>

                                            <td>
                                                {employee.department}
                                            </td>

                                            <td>
                                                {renderEmployeeActions(
                                                    employee
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile employee cards */}
                        <div className="d-md-none">
                            <div className="row g-3">
                                {employees.map((employee) => (
                                    <div
                                        className="col-12"
                                        key={employee._id}
                                    >
                                        <div className="card shadow-sm h-100">
                                            <div className="card-body">

                                                <div className="d-flex align-items-center gap-3 mb-3">
                                                    {renderEmployeePicture(
                                                        employee
                                                    )}

                                                    <div
                                                        className="flex-grow-1"
                                                        style={{
                                                            minWidth: 0
                                                        }}
                                                    >
                                                        <h5 className="card-title mb-1 text-break">
                                                            {employee.first_name}{" "}
                                                            {employee.last_name}
                                                        </h5>

                                                        <p className="text-muted small mb-0 text-break">
                                                            {employee.position}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <span className="fw-semibold">
                                                        Department:
                                                    </span>{" "}
                                                    <span className="text-break">
                                                        {employee.department}
                                                    </span>
                                                </div>

                                                <hr />

                                                {renderEmployeeActions(
                                                    employee,
                                                    true
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </>
    );
}

export default Employees;
