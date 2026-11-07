
/*
Purpose:
Display navigation and allow users to log out.
*/

import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();

    // Handle user logout
    const handleLogout = () => {
        // Remove JWT token
        localStorage.removeItem("token");

        // Redirect to Login
        navigate("/login", { replace: true });
    };

    return (
        <nav className="navbar navbar-dark bg-primary px-4">
            <Link className="navbar-brand" to="/employees">
                Employee Management System
            </Link>

            <button
                type="button"
                className="btn btn-outline-light"
                onClick={handleLogout}
            >
                Logout
            </button>
        </nav>
    );
}

export default Navbar;
