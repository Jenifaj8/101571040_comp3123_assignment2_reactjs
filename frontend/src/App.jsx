
/*
Purpose:
Configure application routes and navigation
for the Employee Management System.
*/

import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Employees from "./pages/Employees";
import AddEmployee from "./pages/AddEmployee";
import ViewEmployee from "./pages/ViewEmployee";
import EditEmployee from "./pages/EditEmployee";
import ProtectedRoute from "./routes/ProtectedRoute";

// Page for unknown routes
function NotFound() {
    return (
        <div className="container text-center mt-5">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}

// Main application routes
function App() {
    return (
        <Routes>
            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected employee routes */}
            <Route element={<ProtectedRoute />}>
                <Route
                    path="/employees"
                    element={<Employees />}
                />

                <Route
                    path="/employees/add"
                    element={<AddEmployee />}
                />

                <Route
                    path="/employees/:id"
                    element={<ViewEmployee />}
                />

                <Route
                    path="/employees/:id/edit"
                    element={<EditEmployee />}
                />
            </Route>

            {/* Unknown routes */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
