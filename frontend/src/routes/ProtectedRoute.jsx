
/*
Purpose:
Protect employee pages from unauthenticated users.
*/

import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
    const token = localStorage.getItem("token");

    // Redirect to login if no token exists
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Render protected pages when logged in
    return <Outlet />;
}

export default ProtectedRoute;
