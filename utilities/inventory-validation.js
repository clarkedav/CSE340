const { body, validationResult } = require("express-validator")
const utilities = require("./index") // import utilities to access buildClassificationList

const invValidate = {}

/* *******************************
 * Server-side rules for inventory form
 * *******************************/
invValidate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .notEmpty()
      .withMessage("Classification is required"),
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required"),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required"),
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("inv_price")
      .trim()
      .isDecimal()
      .withMessage("Price must be a number"),
    body("inv_year")
      .trim()
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be valid"),
    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive number"),
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required"),
  ]
}

/* *******************************
 * Validation check middleware
 * *******************************/
invValidate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    try {
      // Keep the entered values for sticky form
      const sticky = { ...req.body }

      // Rebuild navigation and classification select list
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(req.body.classification_id)

      // Add error messages to flash
      req.flash(
        "error",
        errors.array().map(err => err.msg).join(", ")
      )

      // Re-render form with sticky values, classification list, nav, and errors
      return res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        sticky,
        messages: req.flash(),
      })
    } catch (error) {
      return next(error)
    }
  }
  next()
}

module.exports = invValidate
