const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")


/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // First name is required
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    // Last name is required
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
   
   
      // valid email is required and cannot already exist in the database
    body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail() // refer to validator.js docs
    .withMessage("A valid email is required.")
    .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
        throw new Error("Email exists. Please log in or use a different email")
        }
    }),

    

    // Password must meet strength requirements
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}


/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body

  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Registration",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    })
  }

  next()
}

validate.checkLoginData = async (req, res, next) => {
  const { email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors,
      email  // sticky for email field
    })
    return
  }
  next()
}


module.exports = validate


// Login Data Validation Rules
validate.loginRules = () => {
  return [
    // email is required and must be valid
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),

    // password is required and must meet same requirements as registration
    body("password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
          minNumbers: 1,
        
     })
      .withMessage("Password does not meet requirements")
  ]
}

