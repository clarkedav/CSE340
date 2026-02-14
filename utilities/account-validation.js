const { body, validationResult } = require("express-validator")

const regValidate = {}

/* **************************************
 * Registration Validation Rules
 ****************************************/
regValidate.registerRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("First name must be at least 2 characters"),
    body("account_lastname")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters"),
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("account_password")
      .trim()
      .isStrongPassword()
      .withMessage(
        "Password must be at least 8 characters and include 1 uppercase, 1 number, and 1 symbol"
      ),
  ]
}

/* **************************************
 * Check Validation Results Middleware
 ****************************************/
regValidate.checkRegistrationData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array())
    return res.redirect("/account/register")
  }
  next()
}

/* **************************************
 * Login Validation Rules
 ****************************************/
regValidate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ]
}

/* **************************************
 * Check Login Validation Results
 ****************************************/
regValidate.checkLoginData = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("errors", errors.array())
    return res.redirect("/account/login")
  }
  next()
}

module.exports = regValidate

