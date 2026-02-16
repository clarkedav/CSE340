/* ******************************************
 * Account Controller
 * Handles delivery and processing of account views
 *******************************************/
const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Deliver login view
async function buildLogin(req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email: ""
        })
    } catch (error) {
        next(error)
    }
}

// Deliver registration view
async function buildRegister(req, res, next) {
    try {
        const nav = await utilities.getNav()
        res.render("account/register", {
            title: "Register",
            nav,
            errors: null,
            account_firstname: "",
            account_lastname: "",
            account_email: ""
        })
    } catch (error) {
        next(error)
    }
}

// Registration processing
async function registerAccount(req, res) {
    const nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Error processing registration")
        return res.render("account/register", { title: "Registration", nav, errors: null, account_firstname, account_lastname, account_email })
    }

    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists > 0) {
        req.flash("notice", "Email exists. Please log in or use a different email.")
        return res.redirect("/account/register")
    }

    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)
    if (regResult && regResult.rowCount > 0) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
        return res.redirect("/account/login")
    } else {
        req.flash("notice", "Registration failed.")
        return res.render("account/register", { title: "Registration", nav, errors: null, account_firstname, account_lastname, account_email })
    }
}

// Login processing
async function accountLogin(req, res) {
    const nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    delete accountData.account_password

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

    res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV !== "development"
    })

    return res.redirect("/account")
}

// Account management view
async function buildManagement(req, res, next) {
    const nav = await utilities.getNav()
  res.render("account/management", {
    title: "Account Management", nav, 
    errors: []
    })
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildManagement
}

