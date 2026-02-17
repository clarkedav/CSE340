const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

require("dotenv").config()

// Registration validation
validate.registrationRules = () => [
    body("account_firstname")
        .trim()
        .escape()
        .notEmpty().withMessage("Please provide a first name."),
    body("account_lastname")
        .trim()
        .escape()
        .notEmpty().withMessage("Please provide a last name."),
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) throw new Error("Email exists. Please log in or use a different email")
        }),
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
        .withMessage("Password does not meet requirements.")
]

// Check registration
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.render("account/register", {
            title: "Registration",
            nav,
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email
        })
    }
    next()
}

// Login validation
validate.loginRules = () => [
    body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    body("account_password")
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

// Check login
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.render("account/login", {
            title: "Login",
            nav,
            errors: errors.array(),
            account_email
        })
    }
    next()
}

module.exports = validate

