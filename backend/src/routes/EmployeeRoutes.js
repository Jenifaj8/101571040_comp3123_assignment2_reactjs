
/*
Purpose:
Define protected employee API routes.
*/

const express = require("express");
const router = express.Router();

const EmployeeController = require("../controllers/EmployeeController");
const verifyToken = require("../middleware/AuthMiddleware");
const uploadProfilePicture = require("../middleware/UploadMiddleware");

// Require authentication for all employee routes
router.use(verifyToken);

// CREATE EMPLOYEE WITH PROFILE PICTURE
router.post(
    "/employees",
    uploadProfilePicture,
    EmployeeController.createEmployee
);

// GET ALL EMPLOYEES
router.get("/employees", EmployeeController.getAllEmployees);

// SEARCH EMPLOYEES BY DEPARTMENT OR POSITION
router.get("/employees/search", EmployeeController.searchEmployees);

// GET EMPLOYEE BY ID
router.get("/employees/:id", EmployeeController.getEmployeeById);

// UPDATE EMPLOYEE WITH PROFILE PICTURE
router.put(
    "/employees/:id",
    uploadProfilePicture,
    EmployeeController.updateEmployee
);

// DELETE EMPLOYEE
router.delete("/employees", EmployeeController.deleteEmployee);

module.exports = router;
