/* ******************************************
 * Account Controller
 * Handles delivery and processing of account views
 *******************************************/
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const utilities = require("../utilities")
const accountModel = require("../models/account-model")

const accountCont = {}

/* ****************************************
 *  Deliver login view
 **************************************** */
accountCont.buildLogin = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Deliver registration view
 **************************************** */
accountCont.buildRegister = async function (req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
    })
  } catch (error) {
    next(error)
  }
}

/* ****************************************
 *  Process registration
 **************************************** */
accountCont.registerAccount = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(account_password, 10)

    // Check if email already exists
    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists > 0) {
      req.flash("notice", "Email exists. Please log in or use a different email.")
      return res.redirect("/account/register")
    }

    // Register new account
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.redirect("/account/login")
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (error) {
    console.error(error)
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

/* ****************************************
 *  Process login request
 **************************************** */
accountCont.accountLogin = async function (req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
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
      })
    }

    // Remove password before signing JWT
    delete accountData.account_password

    // Create JWT token
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: 3600, // 1 hour in seconds
    })

    // Set cookie
    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600 * 1000, // 1 hour in milliseconds
    }

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true
    }

    res.cookie("jwt", accessToken, cookieOptions)

    // Redirect to account management
    return res.redirect("/account/")
  } catch (error) {
    console.error(error)
    req.flash("notice", "Login failed. Please try again.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Deliver account management view
 **************************************** */
accountCont.buildAccountManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/account-management", {
      title: "Account Management",
      nav,
      messages: req.flash(),
      errors: [],
    })
  } catch (error) {
    next(error)
  }
}

module.exports = accountCont
