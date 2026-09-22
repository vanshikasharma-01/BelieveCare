const Category = require("../models/Category");

// Create Category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, image, isActive } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name: name.trim(),
            description,
            image,
            isActive
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });

    } catch (error) {
        console.error("Create Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get All Categories
exports.getCategories = async (req, res) => {
    try {

        const { active } = req.query;

        let filter = {};

        if (active === "true") {
            filter.isActive = true;
        }

        const categories = await Category.find(filter)
            .sort({ name: 1 });

        return res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });

    } catch (error) {
        console.error("Get Categories Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Get Category By ID
exports.getCategoryById = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error("Get Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Update Category
exports.updateCategory = async (req, res) => {
    try {

        const { name } = req.body;

        if (name) {
            const existingCategory = await Category.findOne({
                name: name.trim(),
                _id: { $ne: req.params.id }
            });

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: "Category name already exists"
                });
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (error) {
        console.error("Update Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
    try {

        const deletedCategory = await Category.findByIdAndDelete(
            req.params.id
        );

        if (!deletedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error("Delete Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// Toggle Category Status
exports.toggleCategoryStatus = async (req, res) => {
    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        category.isActive = !category.isActive;

        await category.save();

        return res.status(200).json({
            success: true,
            message: `Category ${
                category.isActive ? "Activated" : "Deactivated"
            } Successfully`,
            data: category
        });

    } catch (error) {
        console.error("Toggle Category Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};