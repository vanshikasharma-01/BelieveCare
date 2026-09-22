const express = require("express");

const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} = require("../controllers/categoryController");

const {
    authenticateUser,
    authorizeRoles
} = require("../middleware/authMiddleware");

// Public Routes
router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Owner Routes
router.post("/", authenticateUser, authorizeRoles("Owner"), createCategory);

router.put("/:id", authenticateUser, authorizeRoles("Owner"), updateCategory);

router.delete("/:id", authenticateUser, authorizeRoles("Owner"), deleteCategory);

router.patch(
    "/:id/toggle-status",
    authenticateUser,
    authorizeRoles("Owner"),
    toggleCategoryStatus
);

module.exports = router;        