
/*
Purpose:
Display employees belonging to the logged-in user.
Allow users to search, view, edit and delete employees.
*/

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function Employees() {
    const [employees, setEmployees] = useState([]);
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchActive, setSearchActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    // Retrieve employees from the backend
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
                    setError("Too many requests. Please try again later.");
                } else {
                    setError("Unable to load employees. Please try again.");
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

    // Search using the backend API
    const handleSearch = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        const cleanDepartment = department.trim();
        const cleanPosition = position.trim();

        if (!cleanDepartment && !cleanPosition) {
            setError("Enter a department or position to search.");
            return;
        }

        if (cleanDepartment.length > 100 || cleanPosition.length > 100) {
            setError("Search terms must not exceed 100 characters.");
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
                setError("Please enter valid search information.");
            } else if (status === 429) {
                setError("Too many requests. Please try again later.");
            } else {
                setError("Unable to search employees. Please try again.");
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
                setError("Too many requests. Please try again later.");
            } else {
                setError("Unable to load employees. Please try again.");
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
            await api.delete("/api/v1/emp/employees", {
                params: {
                    eid: employee._id
                }
            });

            setEmployees((previous) =>
                previous.filter(
                    (item) => item._id !== employee._id
                )
            );

            setSuccess(`${fullName} was deleted successfully.`);

        } catch (error) {
            const status = error.response?.status;

            if (status === 403 || status === 404) {
                setError("Employee not found or access denied.");
            } else if (status === 400) {
                setError("Invalid employee ID.");
            } else if (status === 429) {
                setError("Too many requests. Please try again later.");
            } else {
                setError("Unable to delete employee. Please try again.");
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <h2 className="mb-0">Employee List</h2>

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
                        <h5 className="mb-3">Search Employees</h5>

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

                                <div className="col-md-4 d-flex align-items-end gap-2">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || searching}
                                    >
                                        {searching ? "Searching..." : "Search"}
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
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {/* Success message */}
                {success && (
                    <div className="alert alert-success" role="status">
                        {success}
                    </div>
                )}

                {/* Loading message */}
                {loading && <p>Loading employees...</p>}

                {/* Empty employee list */}
                {!loading && !error && employees.length === 0 && (
                    <div className="alert alert-info">
                        {searchActive
                            ? "No employees match your search."
                            : "No employees yet."}
                    </div>
                )}

                {/* Employee table */}
                {!loading && employees.length > 0 && (
                    <div className="table-responsive">
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
                                            {employee.profile_picture ? (
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}${employee.profile_picture}`}
                                                    alt={`${employee.first_name} ${employee.last_name}`}
                                                    width="50"
                                                    height="50"
                                                    style={{
                                                        objectFit: "cover",
                                                        borderRadius: "50%"
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-muted">
                                                    No Picture
                                                </span>
                                            )}
                                        </td>

                                        <td>
                                            {employee.first_name}{" "}
                                            {employee.last_name}
                                        </td>

                                        <td>{employee.position}</td>

                                        <td>{employee.department}</td>

                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <Link
                                                    to={`/employees/${employee._id}`}
                                                    className="btn btn-info btn-sm"
                                                >
                                                    View
                                                </Link>

                                                <Link
                                                    to={`/employees/${employee._id}/edit`}
                                                    className="btn btn-warning btn-sm"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() =>
                                                        handleDelete(employee)
                                                    }
                                                    disabled={deletingId !== null}
                                                >
                                                    {deletingId === employee._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

export default Employees;
