
/*
Purpose:
Display the details of an employee
belonging to the logged-in user.
*/

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

function ViewEmployee() {
    const { id } = useParams();

    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Retrieve employee details
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await api.get(
                    `/api/v1/emp/employees/${id}`
                );

                setEmployee(response.data.employee);

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
                        "Unable to load employee details."
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [id]);

    return (
        <>
            <Navbar />

            <div className="container mt-4 mb-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-7">

                        {loading && (
                            <p>Loading employee details...</p>
                        )}

                        {error && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        )}

                        {!loading && employee && (
                            <div className="card shadow-sm">
                                <div className="card-body p-4">

                                    <h2 className="mb-4">
                                        Employee Details
                                    </h2>

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
                                                    <td>{employee.first_name}</td>
                                                </tr>

                                                <tr>
                                                    <th>Last Name</th>
                                                    <td>{employee.last_name}</td>
                                                </tr>

                                                <tr>
                                                    <th>Email</th>
                                                    <td>{employee.email}</td>
                                                </tr>

                                                <tr>
                                                    <th>Position</th>
                                                    <td>{employee.position}</td>
                                                </tr>

                                                <tr>
                                                    <th>Department</th>
                                                    <td>{employee.department}</td>
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
                                    <div className="d-flex gap-2">
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
