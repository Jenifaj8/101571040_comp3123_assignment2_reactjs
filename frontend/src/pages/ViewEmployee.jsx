
/*
Purpose:
Display the details of an employee
belonging to the logged-in user.
Show a visible confirmation after a successful update.
*/

import { useEffect, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function ViewEmployee() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Keep the message visible after navigation state is cleared
    const [successMessage, setSuccessMessage] = useState(
        () => location.state?.successMessage || ""
    );

    // Retrieve employee details
    useEffect(() => {
        let active = true;

        const fetchEmployee = async () => {
            try {
                const response = await api.get(
                    `/api/v1/emp/employees/${id}`
                );

                if (active) {
                    setEmployee(response.data.employee);
                    setError("");
                }

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
                        "Unable to load employee details."
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

    // Clear navigation state without clearing the visible message
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);

            navigate(
                location.pathname,
                {
                    replace: true,
                    state: null
                }
            );
        }
    }, [
        location.pathname,
        location.state,
        navigate
    ]);

    return (
        <>
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-7">

                        {/* Loading message */}
                        {loading && (
                            <p>Loading employee details...</p>
                        )}

                        {/* Error message */}
                        {error && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {/* Employee details */}
                        {!loading && employee && (
                            <div
                                className={
                                    successMessage
                                        ? "card shadow-sm border-success"
                                        : "card shadow-sm"
                                }
                            >
                                <div className="card-body p-4">

                                    <h2 className="mb-4">
                                        Employee Details
                                    </h2>

                                    {/* Successful update confirmation */}
                                    {successMessage && (
                                        <div
                                            className="alert alert-success d-flex align-items-center justify-content-between gap-2"
                                            role="status"
                                        >
                                            <span>
                                                <strong>
                                                    {successMessage}
                                                </strong>
                                            </span>

                                            <button
                                                type="button"
                                                className="btn-close"
                                                aria-label="Dismiss success message"
                                                onClick={() =>
                                                    setSuccessMessage("")
                                                }
                                            />
                                        </div>
                                    )}

                                    {/* Profile Picture */}
                                    <div className="text-center mb-4">
                                        {employee.profile_picture ? (
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${employee.profile_picture}`}
                                                alt={`${employee.first_name} ${employee.last_name}`}
                                                width="150"
                                                height="150"
                                                style={{
                                                    objectFit: "cover",
                                                    borderRadius: "50%"
                                                }}
                                            />
                                        ) : (
                                            <div className="text-muted">
                                                No Profile Picture
                                            </div>
                                        )}
                                    </div>

                                    {/* Employee Details */}
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <tbody>
                                                <tr>
                                                    <th>First Name</th>
                                                    <td>
                                                        {employee.first_name}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Last Name</th>
                                                    <td>
                                                        {employee.last_name}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Email</th>
                                                    <td>
                                                        {employee.email}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Position</th>
                                                    <td>
                                                        {employee.position}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Department</th>
                                                    <td>
                                                        {employee.department}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Salary</th>
                                                    <td>
                                                        ${Number(
                                                            employee.salary
                                                        ).toLocaleString()}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Date of Joining</th>
                                                    <td>
                                                        {employee.date_of_joining
                                                            ?.slice(0, 10)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex flex-wrap gap-2">
                                        <Link
                                            to={`/employees/${employee._id}/edit`}
                                            className="btn btn-warning"
                                        >
                                            Edit Employee
                                        </Link>

                                        <Link
                                            to="/employees"
                                            className="btn btn-secondary"
                                        >
                                            Back to List
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default ViewEmployee;
