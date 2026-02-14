const { body, validationResult } = require("express-validator")
const utilities = require(".") // to access getNav

const validate = {}

/* ******************************
 * Classification Data Validation Rules
 * ***************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .isAlphanumeric()
      .withMessage("Classification name must not contain spaces or special characters."),
  ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    try {
      const nav = await utilities.getNav()
      const sticky = { classification_name: req.body.classification_name }

      // Add error messages to flash
      req.flash(
        "error",
        errors.array().map(err => err.msg).join(", ")
      )

      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
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

module.exports = validate

