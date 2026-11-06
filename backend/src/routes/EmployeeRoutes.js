/*
Purpose:
Define protected employee API routes.
*/

const express = require("express");
const router = express.Router();

const EmployeeController = require("../controllers/EmployeeController");
const verifyToken = require("../middleware/AuthMiddleware");

// Require authentication for all employee routes
router.use(verifyToken);

// CREATE EMPLOYEE
router.post("/employees", EmployeeController.createEmployee);

// GET ALL EMPLOYEES
router.get("/employees", EmployeeController.getAllEmployees);

// SEARCH EMPLOYEES BY DEPARTMENT OR POSITION (ASSIGNMENT 2)
router.get("/employees/search", EmployeeController.searchEmployees);

// GET EMPLOYEE BY ID
router.get("/employees/:id", EmployeeController.getEmployeeById);

// UPDATE EMPLOYEE
router.put("/employees/:id", EmployeeController.updateEmployee);

// DELETE EMPLOYEE
router.delete("/employees", EmployeeController.deleteEmployee);

module.exports = router;