/*
Purpose:
Handle employee management operations.
*/

const mongoose = require("mongoose");
const EmployeeModel = require("../models/EmployeeModel");

// CREATE EMPLOYEE
const createEmployee = async (request, response) => {
    try {
        const {
            first_name,
            last_name,
            email,
            position,
            salary,
            date_of_joining,
            department
        } = request.body;

        // Validate required string fields
        const fields = [
            first_name,
            last_name,
            email,
            position,
            department
        ];

        if (fields.some(field =>
            typeof field !== "string" ||
            !field.trim() ||
            field.trim().length > 100
        )) {
            return response.status(400).json({
                message: "Employee text fields are required and must be valid"
            });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email.trim()) || email.length > 254) {
            return response.status(400).json({
                message: "Invalid employee email"
            });
        }

        // Validate salary
        if (
            typeof salary !== "number" ||
            !Number.isFinite(salary) ||
            salary < 0
        ) {
            return response.status(400).json({
                message: "Salary must be a valid non-negative number"
            });
        }

        // Validate date
        if (
            typeof date_of_joining !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(date_of_joining) ||
            Number.isNaN(Date.parse(date_of_joining)) ||
            new Date(date_of_joining).toISOString().slice(0, 10) !== date_of_joining
        ) {
            return response.status(400).json({
                message: "Date of joining must be a valid YYYY-MM-DD date"
            });
        }

        // Create employee for authenticated user
        const employee = new EmployeeModel({
            first_name,
            last_name,
            email,
            position,
            salary,
            date_of_joining,
            department,
            user: request.user.id
        });

        const savedEmployee = await employee.save();

        return response.status(201).json({
            message: "Employee created successfully",
            employee: savedEmployee
        });

    } catch (error) {
        console.error("Create employee error:", error.message);

        return response.status(500).json({
            message: "An error occurred while creating employee"
        });
    }
};


// GET ALL EMPLOYEES
const getAllEmployees = async (request, response) => {
    try {
        const employees = await EmployeeModel.find({
            user: request.user.id
        });

        return response.status(200).json({
            message: "Employees retrieved successfully",
            employees: employees
        });

    } catch (error) {
        console.error("Get employees error:", error.message);

        return response.status(500).json({
            message: "An error occurred while retrieving employees"
        });
    }
};


 // SEARCH EMPLOYEES BY DEPARTMENT OR POSITION
const searchEmployees = async (request, response) => {
    try {
        const { department, position } = request.query;

        // Validate search parameters
        if (
            (department === undefined && position === undefined) ||
            [department, position].some(value =>
                value !== undefined &&
                (typeof value !== "string" ||
                    !value.trim() ||
                    value.trim().length > 100)
            )
        ) {
            return response.status(400).json({
                message: "Valid department or position is required"
            });
        }

        // Search only employees belonging to the logged-in user
        const filter = {
            user: request.user.id
        };

        // Escape special regex characters
        const escapeRegex = value =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Case-insensitive department search
        if (department !== undefined) {
            filter.department = {
                $regex: escapeRegex(department.trim()),
                $options: "i"
            };
        }

        // Case-insensitive position search
        if (position !== undefined) {
            filter.position = {
                $regex: escapeRegex(position.trim()),
                $options: "i"
            };
        }

        const employees = await EmployeeModel.find(filter);

        return response.status(200).json({
            message: "Employees retrieved successfully",
            employees: employees
        });

    } catch (error) {
        console.error("Search employees error:", error.message);

        return response.status(500).json({
            message: "An error occurred while searching employees"
        });
    }
};


// GET EMPLOYEE BY ID
const getEmployeeById = async (request, response) => {
    try {
        const employeeId = request.params.id;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(employeeId)) {
            return response.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Find employee belonging to authenticated user
        const employee = await EmployeeModel.findOne({
            _id: employeeId,
            user: request.user.id
        });

        if (!employee) {
            return response.status(404).json({
                message: "Employee not found"
            });
        }

        return response.status(200).json({
            message: "Employee retrieved successfully",
            employee: employee
        });

    } catch (error) {
        console.error("Get employee error:", error.message);

        return response.status(500).json({
            message: "An error occurred while retrieving employee"
        });
    }
};


// UPDATE EMPLOYEE
const updateEmployee = async (request, response) => {
    try {
        const employeeId = request.params.id;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(employeeId)) {
            return response.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Only allow specific fields to be updated
        const allowedFields = [
            "first_name",
            "last_name",
            "email",
            "position",
            "salary",
            "date_of_joining",
            "department"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (request.body[field] !== undefined) {
                updates[field] = request.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return response.status(400).json({
                message: "No valid employee fields provided"
            });
        }

        // Update employee belonging to authenticated user
        const employee = await EmployeeModel.findOneAndUpdate(
            {
                _id: employeeId,
                user: request.user.id
            },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!employee) {
            return response.status(404).json({
                message: "Employee not found"
            });
        }

        return response.status(200).json({
            message: "Employee updated successfully",
            employee: employee
        });

    } catch (error) {
        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return response.status(400).json({
                message: "Invalid employee information"
            });
        }

        console.error("Update employee error:", error.message);

        return response.status(500).json({
            message: "An error occurred while updating employee"
        });
    }
};


// DELETE EMPLOYEE
const deleteEmployee = async (request, response) => {
    try {
        const employeeId = request.query.eid;

        // Validate MongoDB ObjectId
        if (!mongoose.isValidObjectId(employeeId)) {
            return response.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Delete only an employee owned by the logged-in user
        const employee = await EmployeeModel.findOneAndDelete({
            _id: employeeId,
            user: request.user.id
        });

        if (!employee) {
            return response.status(404).json({
                message: "Employee not found"
            });
        }

        // Successful deletion - no response body
        return response.status(204).send();

    } catch (error) {
        console.error("Delete employee error:", error.message);

        return response.status(500).json({
            message: "An error occurred while deleting employee"
        });
    }
};


// Export controller functions
module.exports = {
    createEmployee,
    getAllEmployees,
    searchEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};
