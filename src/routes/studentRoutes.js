const express = require("express");
const router = express.Router();

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController.js");

const { strictLimiter } = require("../middleware/rateLimit.js");

router.post("/", strictLimiter, createStudent);
router.get("/", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", strictLimiter, updateStudent);
router.delete("/:id", strictLimiter, deleteStudent);

module.exports = router;