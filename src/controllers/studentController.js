const pool = require("../config/db.js");
const { invalidateCache } = require("../middleware/cache.js");

// Input validation helper
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function validateStudentInput(data) {
  const errors = [];

  if (!data.full_name || !data.full_name.trim()) {
    errors.push("Full name is required");
  }

  if (!data.email || !data.email.trim()) {
    errors.push("Email is required");
  } else if (!validateEmail(data.email)) {
    errors.push("Invalid email format");
  }

  if (!data.course_name || !data.course_name.trim()) {
    errors.push("Course name is required");
  }

  if (data.age === undefined || data.age === null || data.age === "") {
    errors.push("Age is required");
  } else {
    const age = parseInt(data.age);
    if (isNaN(age) || age < 15 || age > 100) {
      errors.push("Age must be a number between 15 and 100");
    }
  }

  if (!data.phone_number || !data.phone_number.trim()) {
    errors.push("Phone number is required");
  } else if (!validatePhone(data.phone_number)) {
    errors.push("Phone number must have at least 10 digits");
  }

  return errors;
}

// CREATE
const createStudent = async (req, res) => {
  try {
    const { full_name, email, course_name, age, phone_number } = req.body;

    // Validate input
    const validationErrors = validateStudentInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors
      });
    }

    const result = await pool.query(
      `INSERT INTO students
      (full_name, email, course_name, age, phone_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [full_name.trim(), email.trim(), course_name.trim(), age, phone_number.trim()]
    );

    // Invalidate cache after creating a new student
    invalidateCache();

    return res.status(201).json({
      message: "Student created successfully",
      student: result.rows[0]
    });

  } catch (err) {
    // Handle duplicate email
    if (err.code === '23505') {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    return res.status(500).json({
      message: "Failed to create student",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// READ ALL (with pagination)
const getAllStudents = async (req, res) => {
  try {
    // Get pagination parameters from query string
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const offset = parseInt(req.query.offset) || 0;

    // Validate pagination parameters
    if (limit < 1 || offset < 0) {
      return res.status(400).json({
        message: "Invalid pagination parameters. Limit must be > 0 and offset must be >= 0"
      });
    }

    // Get total count of students
    const countResult = await pool.query("SELECT COUNT(*) FROM students");
    const total = parseInt(countResult.rows[0].count);

    // Get paginated students
    const result = await pool.query(
      "SELECT * FROM students ORDER BY student_id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const pages = Math.ceil(total / limit);

    res.status(200).json({
      data: result.rows,
      pagination: {
        total,
        page,
        pageSize: limit,
        pages,
        offset,
        hasNextPage: offset + limit < total,
        hasPrevPage: offset > 0
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// READ ONE
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    const result = await pool.query(
      "SELECT * FROM students WHERE student_id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// UPDATE
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    // Validate input if fields are provided
    if (Object.keys(req.body).length > 0) {
      const validationErrors = validateStudentInput(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationErrors
        });
      }
    }

    const {
      full_name,
      email,
      course_name,
      age,
      phone_number
    } = req.body;

    const result = await pool.query(
      `UPDATE students
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           course_name = COALESCE($3, course_name),
           age = COALESCE($4, age),
           phone_number = COALESCE($5, phone_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE student_id = $6
       RETURNING *`,
      [
        full_name ? full_name.trim() : null,
        email ? email.trim() : null,
        course_name ? course_name.trim() : null,
        age || null,
        phone_number ? phone_number.trim() : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Invalidate cache after updating a student
    invalidateCache();

    res.status(200).json({
      message: "Student updated successfully",
      student: result.rows[0]
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: "Email already exists"
      });
    }
    res.status(500).json({
      message: "Failed to update student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// DELETE
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    const result = await pool.query(
      "DELETE FROM students WHERE student_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Invalidate cache after deleting a student
    invalidateCache();

    res.status(200).json({
      message: "Student deleted successfully",
      student: result.rows[0]
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};