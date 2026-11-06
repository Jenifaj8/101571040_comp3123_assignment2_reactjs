
/*
Purpose:
Handle employee management operations.
*/

const mongoose = require("mongoose");
const EmployeeModel = require("../models/EmployeeModel");
const fs = require("fs");
const path = require("path");

// Upload directory
const uploadDirectory = path.resolve(__dirname, "../../uploads");

// Remove a file safely from the uploads directory
const removeFile = (filePath) => {
    if (!filePath) {
        return;
    }

    const resolvedPath = path.resolve(filePath);

    // Only allow deleting files inside the uploads directory
    if (path.dirname(resolvedPath) !== uploadDirectory) {
        return;
    }

    try {
        if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
        }
    } catch (error) {
        console.error("File removal error:", error.message);
    }
};

// Remove newly uploaded file if an operation fails
const removeUploadedFile = (request) => {
    if (request.file) {
        removeFile(request.file.path);
    }
};

// Remove an employee's stored profile picture safely
const removeStoredProfilePicture = (picturePath) => {
    if (typeof picturePath !== "string") {
        return;
    }

    const normalizedPath = picturePath.replace(/\\/g, "/");

    if (!normalizedPath.startsWith("/uploads/")) {
        return;
    }

    const filename = normalizedPath.slice("/uploads/".length);

    // Prevent path traversal
    if (!filename || filename !== path.basename(filename)) {
        return;
    }

    removeFile(path.join(uploadDirectory, filename));
};


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
            removeUploadedFile(request);

            return response.status(400).json({
                message: "Employee text fields are required and must be valid"
            });
        }

        // Validate email
        const cleanEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail) || cleanEmail.length > 254) {
            removeUploadedFile(request);

            return response.status(400).json({
                message: "Invalid employee email"
            });
        }

        // Convert salary from multipart/form-data
        const parsedSalary = Number(salary);

        if (
            salary === undefined ||
            salary === null ||
            String(salary).trim() === "" ||
            !Number.isFinite(parsedSalary) ||
            parsedSalary < 0
        ) {
            removeUploadedFile(request);

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
            removeUploadedFile(request);

            return response.status(400).json({
                message: "Date of joining must be a valid YYYY-MM-DD date"
            });
        }

        // Create employee for authenticated user
        const employee = new EmployeeModel({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: cleanEmail,
            position: position.trim(),
            salary: parsedSalary,
            date_of_joining,
            department: department.trim(),

            // Save profile picture path
            profile_picture: request.file
                ? `/uploads/${request.file.filename}`
                : null,

            // Never accept user ID from the client
            user: request.user.id
        });

        const savedEmployee = await employee.save();

        return response.status(201).json({
            message: "Employee created successfully",
            employee: savedEmployee
        });

    } catch (error) {
        removeUploadedFile(request);

        if (
            error.name === "ValidationError" ||
            error.name === "CastError"
        ) {
            return response.status(400).json({
                message: "Invalid employee information"
            });
        }

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

        // Search only employees belonging to logged-in user
        const filter = {
            user: request.user.id
        };

        // Escape special regex characters
        const escapeRegex = value =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Search by department
        if (department !== undefined) {
            filter.department = {
                $regex: escapeRegex(department.trim()),
                $options: "i"
            };
        }

        // Search by position
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
            removeUploadedFile(request);

            return response.status(400).json({
                message: "Invalid employee ID"
            });
        }

        // Find employee belonging to authenticated user
        const existingEmployee = await EmployeeModel.findOne({
            _id: employeeId,
            user: request.user.id
        });

        if (!existingEmployee) {
            removeUploadedFile(request);

            return response.status(404).json({
                message: "Employee not found"
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

        // Validate updated text fields
        const textFields = [
            "first_name",
            "last_name",
            "position",
            "department"
        ];

        for (const field of textFields) {
            if (updates[field] !== undefined) {
                if (
                    typeof updates[field] !== "string" ||
                    !updates[field].trim() ||
                    updates[field].trim().length > 100
                ) {
                    removeUploadedFile(request);

                    return response.status(400).json({
                        message: `Invalid ${field}`
                    });
                }

                updates[field] = updates[field].trim();
            }
        }

        // Validate email if supplied
        if (updates.email !== undefined) {
            if (typeof updates.email !== "string") {
                removeUploadedFile(request);

                return response.status(400).json({
                    message: "Invalid employee email"
                });
            }

            updates.email = updates.email.trim().toLowerCase();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                updates.email.length > 254 ||
                !emailRegex.test(updates.email)
            ) {
                removeUploadedFile(request);

                return response.status(400).json({
                    message: "Invalid employee email"
                });
            }
        }

        // Validate salary
        if (updates.salary !== undefined) {
            const parsedSalary = Number(updates.salary);

            if (
                String(updates.salary).trim() === "" ||
                !Number.isFinite(parsedSalary) ||
                parsedSalary < 0
            ) {
                removeUploadedFile(request);

                return response.status(400).json({
                    message: "Salary must be a valid non-negative number"
                });
            }

            updates.salary = parsedSalary;
        }

        // Validate date
        if (updates.date_of_joining !== undefined) {
            const date = updates.date_of_joining;

            if (
                typeof date !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
                Number.isNaN(Date.parse(date)) ||
                new Date(date).toISOString().slice(0, 10) !== date
            ) {
                removeUploadedFile(request);

                return response.status(400).json({
                    message: "Date of joining must be a valid YYYY-MM-DD date"
                });
            }
        }

        // Save new profile picture path if uploaded
        if (request.file) {
            updates.profile_picture =
                `/uploads/${request.file.filename}`;
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
            removeUploadedFile(request);

            return response.status(404).json({
                message: "Employee not found"
            });
        }

        // Remove previous picture after successful replacement
        if (request.file && existingEmployee.profile_picture) {
            removeStoredProfilePicture(
                existingEmployee.profile_picture
            );
        }

        return response.status(200).json({
            message: "Employee updated successfully",
            employee: employee
        });

    } catch (error) {
        removeUploadedFile(request);

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

        // Delete only an employee belonging to logged-in user
        const employee = await EmployeeModel.findOneAndDelete({
            _id: employeeId,
            user: request.user.id
        });

        if (!employee) {
            return response.status(404).json({
                message: "Employee not found"
            });
        }

        // Remove employee's profile picture
        if (employee.profile_picture) {
            removeStoredProfilePicture(employee.profile_picture);
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
