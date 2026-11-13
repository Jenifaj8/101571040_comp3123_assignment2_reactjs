
/*
Purpose:
Display navigation, identify the logged-in user,
and allow users to log out securely.
*/

import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    // Get the email saved after successful login
    const userEmail = localStorage.getItem("userEmail");

    // Handle user logout
    const handleLogout = () => {
        // Clear authentication and displayed user identity
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");

        // Show the logout confirmation page
        navigate("/logout", {
            replace: true,
            state: {
                loggedOut: true
            }
        });
    };

    return (
        <nav className="navbar navbar-dark bg-primary px-4 py-3">
            <div className="container-fluid d-flex flex-wrap align-items-center justify-content-between gap-3">

                {/* Application name */}
                <Link
                    className="navbar-brand mb-0 text-wrap"
                    to="/employees"
                >
                    Employee Management System
                </Link>

                {/* Logged-in user and logout */}
                <div className="d-flex flex-wrap align-items-center gap-3">

                    <span className="text-white small">
                        <strong>Logged in as:</strong>{" "}
                        {userEmail || "Authenticated User"}
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline-light"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;
