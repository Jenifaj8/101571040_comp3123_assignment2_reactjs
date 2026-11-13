
# Employee Management System - React Frontend

**Course:** COMP3123 - Full Stack Development  
**Assignment:** Assignment 2  
**Student ID:** 101571040

## Overview

This folder contains the React frontend for the Employee Management System.

The application uses React, Vite, React Router, Axios, and Bootstrap to provide a responsive interface for employee management.

The frontend communicates with a secured Node.js and Express backend connected to MongoDB Atlas.

## Technologies

- ReactJS
- Vite
- React Router
- Axios
- Bootstrap 5
- JavaScript

## Frontend Structure

```text
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── axios.js
│   ├── components/
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Employees.jsx
│   │   ├── AddEmployee.jsx
│   │   ├── ViewEmployee.jsx
│   │   └── EditEmployee.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:8081
```

3. Ensure the backend is running.

4. Start React:

```bash
npm run dev
```

Open the URL displayed by Vite.

The backend CORS configuration must allow the frontend's origin.

## Production Build

```bash
npm run build
```

The production files are generated inside `dist/`.

## Docker

The frontend uses a multi-stage Dockerfile with Node.js for building React and Nginx for serving the production files.

Run Docker Compose from the **main project directory**:

```bash
docker compose up -d --build
```

Open:

http://localhost:8080

To stop the containers:

```bash
docker compose stop
```

## Main Project Documentation

For the complete application features, backend setup, API endpoints, authentication, MongoDB Atlas configuration, Postman collection, security testing, and deployment instructions, refer to:

**[Main Project README](../README.md)**

## GitHub Repository

https://github.com/Jenifaj8/101571040_comp3123_assignment2_reactjs
