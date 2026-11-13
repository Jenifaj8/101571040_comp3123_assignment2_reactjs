
# COMP3123 Assignment 2 - Employee Management System

**Student Name:** Jenifa Joseph  
**Student ID:** 101571040  
**Course:** COMP3123 - Full Stack Development  
**Assignment:** Assignment 2 - ReactJS  
**Application:** Employee Management System

## 1. Project Overview

The Employee Management System is a full-stack application developed using ReactJS, Node.js, Express.js, and MongoDB Atlas.

The application allows registered users to securely create, view, update, delete, and search employee records.

Each user can access only their own employee records through JWT-based authentication and ownership validation.

The application also supports profile-picture uploads, responsive design, API security, validation, confirmation messages, and Docker deployment.

## 2. Technologies Used

### Frontend

- ReactJS
- Vite
- React Router
- Axios
- Bootstrap 5
- JavaScript
- HTML and CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT (JSON Web Token)
- bcryptjs
- Multer
- Helmet
- CORS
- Express Rate Limit
- Morgan

### Development, Testing, and Deployment

- Visual Studio Code
- Postman
- Git and GitHub
- Docker
- Docker Compose
- Nginx

## 3. Application Features

### User Authentication

- User registration
- User login
- Password hashing using bcryptjs
- JWT-based authentication
- Protected React routes
- Display of the logged-in user's email in the navigation bar
- Logout confirmation page
- Back to Login button after logout
- Automatic handling of unauthorized requests
- Redirect to Login when accessing protected routes without authentication

### Employee Management

- Create employees
- Retrieve all employees belonging to the logged-in user
- Retrieve employee details by ID
- Update employee information
- Delete employees with confirmation
- Search employees by department
- Search employees by position
- Search using department and position together
- Display a success message after creating an employee
- Display a success message after updating an employee
- Display a confirmation message after deleting an employee

### Employee Profile Pictures

- Upload profile pictures during employee creation
- Replace profile pictures during employee updates
- Preview selected images
- Display uploaded pictures in the Employee List and details pages
- Support JPEG, PNG, and WebP images
- Enforce a maximum image size of 2 MB
- Display validation messages for invalid image types and oversized files
- Preserve existing pictures when no replacement is selected
- Remove uploaded files when appropriate during replacement and deletion

### Security

- JWT authentication middleware
- Hashed user passwords
- Employee ownership restrictions
- Protected API endpoints
- Restricted CORS configuration
- Helmet security headers
- API rate limiting
- Request logging
- Centralized error handling
- Input validation
- Rejection of missing and invalid JWT tokens
- Rejection of unauthorized employee access

### Responsive User Interface

- Responsive Login and Signup forms
- Responsive Add and Edit Employee forms
- Desktop employee table
- Mobile employee cards
- Responsive navigation
- Mobile-friendly View, Edit, and Delete buttons
- Success and error notification messages

## 4. Project Structure

```text
101571040_comp3123_assignment2_reactjs/
|
|-- backend/
|   |-- src/
|   |-- logs/
|   |-- uploads/
|   |-- .dockerignore
|   |-- .env
|   |-- .env.example
|   |-- Dockerfile
|   |-- package.json
|   |-- package-lock.json
|   |-- postman_collection.json
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |   |-- axios.js
|   |   |-- components/
|   |   |   |-- Navbar.jsx
|   |   |-- pages/
|   |   |   |-- Login.jsx
|   |   |   |-- Signup.jsx
|   |   |   |-- Logout.jsx
|   |   |   |-- Employees.jsx
|   |   |   |-- AddEmployee.jsx
|   |   |   |-- ViewEmployee.jsx
|   |   |   |-- EditEmployee.jsx
|   |   |-- routes/
|   |   |   |-- ProtectedRoute.jsx
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   |-- index.css
|   |-- .dockerignore
|   |-- .env
|   |-- .env.example
|   |-- .gitignore
|   |-- Dockerfile
|   |-- nginx.conf
|   |-- package.json
|   |-- package-lock.json
|   |-- vite.config.js
|   |-- README.md
|
|-- .gitignore
|-- docker-compose.yml
|-- COMP3123_Assignment2_Postman_Collection.json
|-- README.md
```

The `.env` files, `node_modules`, logs, and uploaded pictures contain local configuration, dependencies, or generated data and are excluded from GitHub where applicable.

## 5. MongoDB Atlas Configuration

The application uses MongoDB Atlas.

**Database name:**

`comp3123_assignment2`

### Collections

- `users`
- `employees`

Employee documents are associated with the authenticated user through a user reference.

The backend verifies ownership when retrieving, updating, deleting, and searching employee records.

A valid MongoDB Atlas connection string must be configured before starting the backend.

## 6. Environment Variables

Environment variables are stored in `.env` files.

Private environment files must not be committed to GitHub.

### Backend Environment

Create `backend/.env` using `backend/.env.example` as a template.

```env
PORT=8081
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

Replace the placeholder values with valid configuration.

If Vite runs on port 5174, change the backend CORS origin to:

```env
CORS_ORIGIN=http://localhost:5174
```

The CORS origin must match the actual React development server address.

### Frontend Environment

Create `frontend/.env` using `frontend/.env.example` as a template.

```env
VITE_API_URL=http://localhost:8081
```

This URL is used when running the frontend separately from the backend during local development.

### Docker Environment

Docker Compose loads the backend environment variables from `backend/.env`.

The Docker frontend is built with an empty `VITE_API_URL` so requests use relative paths through Nginx.

Nginx forwards `/api/` and `/uploads/` requests to the backend container.

## 7. Running the Application Locally

### Step 1 - Install Backend Dependencies

Open a terminal in the project root:

```bash
cd backend
npm install
```

### Step 2 - Start the Backend

```bash
npm start
```

The backend runs at:

`http://localhost:8081`

### Step 3 - Verify the Backend

Open:

`http://localhost:8081/health`

Expected response:

```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Step 4 - Install Frontend Dependencies

Open a separate terminal in the project root:

```bash
cd frontend
npm install
```

### Step 5 - Start the Frontend

```bash
npm run dev
```

Open the URL displayed by Vite.

The default development URL is:

`http://localhost:5173`

If port 5173 is occupied, Vite may use another port, such as 5174.

Ensure the backend CORS configuration matches the frontend URL.

## 8. Docker Deployment

The application supports Docker deployment using Docker Compose.

The Docker configuration includes:

- Node.js and Express backend container
- React production build served using Nginx
- Docker networking between services
- MongoDB Atlas integration
- Bind-mounted profile-picture storage
- Nginx reverse proxy for API requests and uploaded images

### Requirements

- Docker Desktop
- Docker Compose
- MongoDB Atlas connection string
- Valid backend `.env` configuration

### Build Docker Images

From the main project folder:

```bash
docker compose build
```

### Start Docker Containers

```bash
docker compose up -d
```

### Verify Containers

```bash
docker compose ps
```

Both the frontend and backend containers should display a running status.

### Access the Docker Application

Open:

`http://localhost:8080`

Login page:

`http://localhost:8080/login`

The Docker frontend runs through Nginx on port 8080.

Nginx forwards backend API requests internally to the Node.js service.

### Stop Docker Containers

```bash
docker compose stop
```

### Restart Docker Containers

```bash
docker compose start
```

### Rebuild After Code Changes

```bash
docker compose up -d --build
```

### View Docker Logs

```bash
docker compose logs backend
docker compose logs frontend
```

### Persistent Profile Pictures

The backend Docker configuration uses the following bind mount:

```yaml
volumes:
  - ./backend/uploads:/app/uploads
```

This stores uploaded pictures in the local backend uploads directory.

MongoDB Atlas stores the employee records separately.

The configuration is intended to preserve locally uploaded images when containers are restarted or recreated while the host upload directory remains available.

### Nginx Image Upload Configuration

Nginx is configured with:

```nginx
client_max_body_size 3M;
```

This setting allows multipart requests containing images up to 2 MB, with additional room for form data.

The application and backend enforce the actual 2 MB maximum file-size restriction.

This configuration prevents Nginx from rejecting otherwise valid images between 1 MB and 2 MB.

## 9. REST API Endpoints

**Local Backend URL:**

`http://localhost:8081`

### User Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/signup` | Register a user |
| POST | `/api/v1/user/login` | Log in and receive a JWT |

### Employee Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/emp/employees` | Create employee |
| GET | `/api/v1/emp/employees` | Get all employees belonging to the user |
| GET | `/api/v1/emp/employees/search` | Search employees |
| GET | `/api/v1/emp/employees/:id` | Get employee by ID |
| PUT | `/api/v1/emp/employees/:id` | Update employee |
| DELETE | `/api/v1/emp/employees?eid=ID` | Delete employee |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check server availability |

## 10. JWT Authentication

After a successful login, the backend returns a JWT.

Protected employee endpoints require the following header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Requests with missing or invalid tokens are rejected with HTTP 401.

Employee access is also restricted by ownership.

An authenticated user attempting to retrieve another user's employee receives a not-found response.

### Logged-In User Identification

After successful authentication, the React application stores the JWT and the email address entered during login.

The email is displayed in the navigation bar to identify the current session.

Examples:

- `Logged in as: alex.johnson@example.com`
- `Logged in as: testemployee02@example.com`

The displayed email is for identification only. The backend uses the JWT and ownership checks to authorize employee access.

### Logout and Protected Routes

When the user clicks Logout:

1. The JWT and locally stored user email are removed.
2. The application redirects to the `/logout` page.
3. A confirmation message is displayed.
4. The user can select **Back to Login**.
5. Protected employee pages redirect unauthenticated users to `/login`.

The logout process was tested using Docker.

## 11. Employee Search

Employees can be searched using the department and position query parameters.

### Search by Department

```text
GET /api/v1/emp/employees/search?department=IT
```

### Search by Position

```text
GET /api/v1/emp/employees/search?position=Developer
```

### Search by Department and Position

```text
GET /api/v1/emp/employees/search?department=IT&position=Developer
```

Search results are restricted to the authenticated user's employees.

The React Employee List provides search fields and a Clear Search button.

## 12. Profile Picture Upload

Employee creation and update endpoints accept `multipart/form-data`.

The optional file field is:

`profile_picture`

Supported image formats:

- JPEG
- PNG
- WebP

Maximum file size:

**2 MB**

The frontend validates image type and size before submission.

The backend also validates uploaded files.

Invalid or oversized files receive an error response.

Uploaded pictures are served through the `/uploads/` path.

## 13. React Application Routes

| Route | Description |
|-------|-------------|
| `/login` | User login |
| `/signup` | User registration |
| `/logout` | Logout confirmation |
| `/employees` | Employee List |
| `/employees/add` | Add Employee |
| `/employees/:id` | View Employee |
| `/employees/:id/edit` | Edit Employee |

The employee management routes are protected.

Unauthenticated users are redirected to the Login page.

### Employee Confirmation Messages

The application displays confirmation messages for successful employee operations.

**Create Employee:**

`Employee created successfully!`

**Update Employee:**

`Employee updated successfully!`

**Delete Employee:**

`Employee Name was deleted successfully.`

These messages help users confirm that their actions were completed successfully.

## 14. Postman API Testing

The project includes an exported Postman collection:

`COMP3123_Assignment2_Postman_Collection.json`

### Import Instructions

1. Open Postman.
2. Select Import.
3. Choose the exported Postman collection.
4. Start the backend.
5. Configure the required authentication credentials.
6. Execute the Login request.
7. Copy the JWT returned by the backend.
8. Provide the JWT through the appropriate Bearer Token field or Postman variable.
9. Execute the employee requests.

The collection contains tests for:

- Signup
- Login
- Create Employee
- Get All Employees
- Get Employee by ID
- Update Employee Details
- Delete Employee
- Search by Department
- Search by Position
- Search by Department and Position
- Search with Missing Filters
- Create Employee with Profile Picture
- Update Employee Profile Picture
- Reject Invalid Profile Picture
- Reject Oversized Profile Picture
- Reject Invalid JWT
- Reject Missing JWT
- Unauthorized Employee Access

Credential placeholders must be configured locally before executing requests that require them.

## 15. Testing Results

### Functional Testing

Successfully tested:

- User registration
- User login
- Employee creation
- Employee retrieval
- Employee updates
- Employee deletion
- Employee search
- Profile-picture upload and replacement
- Successful employee creation notification
- Successful employee update notification
- Successful logout confirmation

### Security Testing

The following cases were tested:

| Test | Expected Result |
|------|-----------------|
| Valid JWT | Authorized request succeeds |
| Missing JWT | 401 Unauthorized |
| Invalid JWT | 401 Unauthorized |
| Unauthorized employee access | 404 Not Found |
| Unauthorized deletion | Employee remains protected |
| Employee search ownership | Only the user's records returned |
| Rate limit exceeded | 429 Too Many Requests |
| Access protected page after logout | Redirect to Login |

Two separate accounts were used to test employee ownership restrictions.

The unauthorized View and Edit tests confirmed that one authenticated user could not access another user's employee records.

### Login and Signup Validation

The following validation cases were tested:

- Missing email address
- Missing password
- Invalid login credentials
- Signup password shorter than eight characters
- Signup passwords that do not match

Required-field and minimum-length errors are displayed through browser validation.

Invalid credentials and mismatched passwords display application error messages.

### Image Upload Testing

- Valid image uploads
- Image preview
- Invalid file-type rejection
- Oversized image rejection
- Profile-picture replacement
- Preservation of existing pictures when no replacement is selected
- Successful image upload through Docker after updating Nginx's request-body limit

### Responsive Testing

The application was tested using mobile browser simulation at a width of 375 pixels.

Screens reviewed:

- Login
- Signup
- Employee List
- Add Employee
- View Employee
- Edit Employee

The Employee List uses a table on larger screens and cards on smaller screens.

### Docker Testing

- Backend image built successfully
- Frontend image built successfully
- Docker containers started successfully
- Login worked through the Docker frontend
- Employee data loaded from MongoDB Atlas
- Profile pictures displayed correctly
- Image-size validation worked in Docker
- Employee creation worked with profile-picture upload
- Employee creation confirmation displayed successfully
- Employee update confirmation displayed successfully
- Logout confirmation displayed successfully
- Protected routes redirected to Login after logout

### Local Logging

Backend logs were reviewed through Docker Desktop.

The logs displayed HTTP requests, request methods, response status codes, and request durations.

### Rate-Limiting Test

The API was tested using repeated HTTP requests.

Unauthenticated requests returned HTTP 401 before the rate limit was reached.

The 101st request returned HTTP 429, confirming that the rate-limiting middleware was working.

## 16. GitHub Repository

Repository URL:

https://github.com/Jenifaj8/101571040_comp3123_assignment2_reactjs

The repository contains:

- React frontend
- Express backend
- Docker configuration
- Postman collection
- Environment example files
- Project documentation

Sensitive configuration files and generated dependencies are excluded using Git ignore rules.

## 17. Important Notes

- MongoDB Atlas connectivity is required.
- Backend environment variables must be configured before starting the application.
- Frontend and backend ports must match the selected development configuration.
- Docker deployment is designed for local Docker Desktop execution.
- Docker runs the frontend through port 8080.
- The backend development server runs on port 8081.
- Employee records are stored in MongoDB Atlas.
- Profile pictures are stored in the backend uploads directory.
- Fictional employee records were used during testing.
- The private `.env` files must not be included in the public GitHub repository or submission ZIP.
- `node_modules` should be excluded from the submission ZIP.

## 18. Sample Test Credentials for Marking

The following fictional accounts are provided for testing authentication and user-specific employee access.

| User | Email | Password |
|------|-------|----------|
| User 1 - Test Employee 02 | testemployee02@example.com | TestPass123! |
| User 2 - Alex Johnson | alex.johnson@example.com | TestPass123! |

**Docker Application URL:**

http://localhost:8080/login

### Testing User Authorization

Each account has access only to its own employees.

**User 1 - Test Employee 02**

This account contains employee records such as:

- Olivia Brown
- Daniel Carter
- Sophia Wilson
- John Martin

**User 2 - Alex Johnson**

This account contains employee records such as:

- Michael Brown
- Stefanie Supal
- Natalie Thompson

To verify ownership restrictions:

1. Log in using User 1.
2. Open the Employee List and observe the available records.
3. Log out.
4. Log in using User 2.
5. Confirm that User 2 has a different Employee List.
6. Attempt to access an employee belonging to User 1 using the employee's URL.
7. Confirm that the application displays:

   `Employee not found or access denied.`

8. Attempt to open the unauthorized employee's Edit page.
9. Confirm that editing is also denied.

### Running the Application for Marking

1. Configure `backend/.env` with a valid MongoDB Atlas connection string and JWT secret.
2. Open Docker Desktop.
3. From the main project directory, run:

```bash
docker compose up -d --build
```

4. Open:

   http://localhost:8080/login

5. Log in using either test account above.

**Important:** These are dedicated fictional test accounts. The credentials require access to the configured MongoDB Atlas database containing the sample records.
