/*
Purpose:
Define API routes for user registration and login.
*/

const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");

// POST /api/v1/user/signup
router.post("/signup", UserController.signup);

// POST /api/v1/user/login
router.post("/login", UserController.login);

module.exports = router;