# Student Management System

A full-stack web application for managing student information with a Node.js/Express backend and vanilla JavaScript frontend.

## Features

- ✅ Add new students with validation
- ✅ View all students in a table
- ✅ Delete students (with confirmation)
- ✅ Form validation (frontend and backend)
- ✅ Error handling and user feedback
- ✅ Responsive UI with loading indicators
- ✅ CORS support for frontend/backend separation
- ✅ XSS protection
- ✅ Input sanitization

## Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- A text editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Student Management System"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
# Linux/Mac
cp .env.example .env

# Windows
copy .env.example .env
```

Edit `.env` with your database connection details:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=student_db
NODE_ENV=development
```

### 4. Set Up Database

Create the database and tables:

```bash
npm run db:setup
```

Or run individually:

```bash
npm run db:create    # Create the database
npm run db:init      # Create tables
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
Student Management System/
├── public/
│   └── index.html          # Frontend HTML with embedded CSS and JS
├── src/
│   ├── app.js              # Express app configuration
│   ├── config/
│   │   └── db.js           # PostgreSQL connection pool
│   ├── controllers/
│   │   └── studentController.js  # API endpoint handlers
│   └── routes/
│       └── studentRoutes.js      # API route definitions
├── scripts/
│   ├── create_database.js  # Database initialization script
│   └── create_tables.js    # Table schema creation script
├── server.js               # Server entry point
├── .env                    # Environment variables (DO NOT commit)
├── .env.example            # Example environment variables
└── package.json            # Dependencies and scripts
```

## API Endpoints

All API endpoints are prefixed with `/api/students`

### Get All Students

```http
GET /api/students
```

**Response:**
```json
[
  {
    "student_id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "course_name": "Computer Science",
    "age": 20,
    "phone_number": "+1234567890",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

### Get Single Student

```http
GET /api/students/:id
```

### Create Student

```http
POST /api/students
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "course_name": "Information Technology",
  "age": 21,
  "phone_number": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "message": "Student created successfully",
  "student": {
    "student_id": 2,
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    ...
  }
}
```

### Update Student

```http
PUT /api/students/:id
Content-Type: application/json

{
  "full_name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

### Delete Student

```http
DELETE /api/students/:id
```

## Input Validation

### Frontend Validation
- Required fields: full_name, email, course_name, age, phone_number
- Email format validation
- Age: Must be a number between 15-100
- Phone: Must contain at least 10 digits

### Backend Validation
- All frontend validations are enforced on the server
- Email uniqueness is enforced (no duplicates)
- Invalid input returns 400 Bad Request with error details
- Duplicate email returns 409 Conflict

## Error Handling

The application provides clear error messages for:
- Validation errors
- Duplicate emails
- Network failures
- Database errors
- Invalid student IDs

Errors are displayed to users in red alert boxes at the top of the page.

## Security Features

- ✅ **XSS Protection**: All user data is properly escaped before display
- ✅ **SQL Injection Prevention**: All queries use parameterized statements
- ✅ **CORS Enabled**: Frontend and backend can run on different ports/domains
- ✅ **Input Validation**: Both frontend and backend validation
- ✅ **Environment Secrets**: Sensitive data stored in .env (not in code)

## Development

### Available npm Scripts

```bash
npm start           # Start production server
npm run dev         # Start with nodemon (auto-reload)
npm run db:create   # Create PostgreSQL database
npm run db:init     # Create tables
npm run db:setup    # Create database and tables
```

### Adding New Features

1. Update frontend (`public/index.html`) for UI/UX changes
2. Add routes in `src/routes/studentRoutes.js`
3. Add controller logic in `src/controllers/studentController.js`
4. Test with curl or Postman

## Troubleshooting

### "Cannot find module 'cors'"

Run: `npm install`

### "ECONNREFUSED - PostgreSQL connection failed"

- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists: `npm run db:setup`

### "listen EADDRINUSE: address already in use :::3000"

Change the PORT in `.env` or kill the process using port 3000

### "Email already exists"

The email is already in the database. Use a different email address.

## Database Schema

```sql
CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| DB_HOST | Database hostname | localhost |
| DB_PORT | Database port | 5432 |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | (required) |
| DB_NAME | Database name | student_db |
| NODE_ENV | Environment mode | development |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check browser console for error messages

---

**Last Updated:** 2024
