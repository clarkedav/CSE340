const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

require("dotenv").config()

// Registration rules
validate.registrationRules = () => [
    body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
    body("account_lastname").trim().escape().notEmpty().withMessage("Please provide a last name."),
    body("account_email")
        .trim().isEmail().normalizeEmail().withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists) throw new Error("Email exists. Please log in or use a different email")
        }),
    body("account_password")
        .trim().notEmpty()
        .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
        .withMessage("Password does not meet requirements.")
]

// Check registration data
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
            account_email,
            messages: {}
        })
    }
    next()
}

// Login rules
validate.loginRules = () => [
    body("account_email").trim().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("account_password")
        .trim().notEmpty()
        .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1 })
        .withMessage("Password does not meet requirements")
]

// Check login data
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.render("account/login", {
            title: "Login",
            nav,
            errors: errors.array(),
            account_email,
            messages: {}
        })
    }
    next()
}

// Task 5 - Account update rules
validate.updateAccountRules = () => [
    body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
    body("account_lastname").trim().escape().notEmpty().withMessage("Please provide a last name."),
    body("account_email")
        .trim().isEmail().normalizeEmail().withMessage("A valid email is required.")
        .custom(async (account_email, { req }) => {
            const account_id = parseInt(req.body.account_id)
            const existingAccount = await accountModel.getAccountByEmail(account_email)
            if (existingAccount && existingAccount.account_id !== account_id) {
                throw new Error("Email already in use by another account.")
            }
        })
]

// Check account update data
validate.checkUpdateData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.render("account/update-account", {
            title: "Update Account",
            nav,
            errors: errors.array(),
            sticky: req.body,
            messages: {}
        })
    }
    next()
}

// Task 5 - Password update rules
validate.updatePasswordRules = () => [
    body("account_password")
        .trim().notEmpty()
        .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
        .withMessage("Password does not meet requirements.")
]

// Check password update data
validate.checkPasswordData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.render("account/update-account", {
            title: "Update Account",
            nav,
            errors: errors.array(),
            sticky: req.body,
            messages: {}
        })
    }
    next()
}

module.exports = validate