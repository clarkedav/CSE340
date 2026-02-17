/* ******************************************
 * Account Controller
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
            account_email: "",
            messages: req.flash()
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
            account_email: "",
            messages: req.flash()
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
        return res.render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            messages: req.flash()
        })
    }

    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists > 0) {
        req.flash("notice", "Email exists. Please log in or use a different email.")
        return res.redirect("/account/register")
    }

    const regResult = await accountModel.registerAccount(
        account_firstname, account_lastname, account_email, hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
        return res.redirect("/account/login")
    } else {
        req.flash("notice", "Registration failed.")
        return res.render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            messages: req.flash()
        })
    }
}

// Login processing
async function accountLogin(req, res) {
    const nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
            messages: req.flash()
        })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
            messages: req.flash()
        })
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
    try {
        const nav = await utilities.getNav()
        res.render("account/management", {
            title: "Account Management",
            nav,
            errors: null,
            messages: req.flash()
        })
    } catch (error) {
        next(error)
    }
}

// Task 5 - Deliver account update view
async function buildUpdateView(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const account_id = parseInt(req.params.account_id)
        const accountData = await accountModel.getAccountById(account_id)
        res.render("account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            sticky: accountData,
            messages: req.flash()
        })
    } catch (error) {
        next(error)
    }
}

// Task 5 - Process account info update
async function updateAccountInfo(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const { account_id, account_firstname, account_lastname, account_email } = req.body

        const updateResult = await accountModel.updateAccount(
            parseInt(account_id), account_firstname, account_lastname, account_email
        )

        if (updateResult) {
            // Refresh JWT with updated info
            const updatedData = await accountModel.getAccountById(parseInt(account_id))
            delete updatedData.account_password
            const accessToken = jwt.sign(updatedData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
            res.cookie("jwt", accessToken, {
                httpOnly: true,
                maxAge: 3600 * 1000,
                secure: process.env.NODE_ENV !== "development"
            })
            req.flash("notice", "Account updated successfully.")
            return res.redirect("/account")
        } else {
            req.flash("notice", "Account update failed. Please try again.")
            return res.render("account/update-account", {
                title: "Update Account",
                nav,
                errors: null,
                sticky: req.body,
                messages: req.flash()
            })
        }
    } catch (error) {
        next(error)
    }
}

// Task 5 - Process password update
async function updatePassword(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const { account_id, account_password } = req.body

        const hashedPassword = await bcrypt.hash(account_password, 10)
        const updateResult = await accountModel.updatePassword(parseInt(account_id), hashedPassword)

        if (updateResult) {
            req.flash("notice", "Password changed successfully.")
            return res.redirect("/account")
        } else {
            req.flash("notice", "Password change failed. Please try again.")
            return res.render("account/update-account", {
                title: "Update Account",
                nav,
                errors: null,
                sticky: req.body,
                messages: req.flash()
            })
        }
    } catch (error) {
        next(error)
    }
}

// Task 6 - Logout
async function accountLogout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildManagement,
    buildUpdateView,
    updateAccountInfo,
    updatePassword,
    accountLogout
}