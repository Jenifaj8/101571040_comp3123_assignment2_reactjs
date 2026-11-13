
/*
Purpose:
Display a logout confirmation screen
and allow users to return to Login.
*/

import {
    Link,
    Navigate,
    useLocation
} from "react-router-dom";

function Logout() {
    const location = useLocation();

    // Only display confirmation after the Logout action
    if (!location.state?.loggedOut) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="row justify-content-center">
                <div className="col-md-7 col-lg-5">
                    <div className="card shadow-sm border-success">
                        <div className="card-body p-4 p-md-5 text-center">

                            {/* Success icon */}
                            <div
                                className="d-flex align-items-center justify-content-center mx-auto mb-4 bg-success text-white rounded-circle"
                                style={{
                                    width: "75px",
                                    height: "75px",
                                    fontSize: "40px"
                                }}
                                aria-hidden="true"
                            >
                                ✓
                            </div>

                            <h2 className="mb-3">
                                Successfully Logged Out!
                            </h2>

                            <div
                                className="alert alert-success"
                                role="status"
                            >
                                You have successfully logged out
                                of the Employee Management System.
                            </div>

                            <p className="text-muted mb-4">
                                Your session has ended.
                                Please log in again to access
                                your employee records.
                            </p>

                            {/* Return to Login */}
                            <Link
                                to="/login"
                                replace
                                className="btn btn-primary px-4"
                            >
                                Back to Login
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Logout;
