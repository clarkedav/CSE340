/* ******************************************
 * Account Controller
 * Handles delivery and processing of account views
 *******************************************/
const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } catch (error) {
    next(error)
  }
}


/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
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
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Hash with 10 salt rounds
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
    return // stop execution
  }

  // Check if email already exists
  const emailExists = await accountModel.checkExistingEmail(account_email)
  if (emailExists > 0) {
    req.flash("notice", "Email exists. Please log in or use a different email.")
    return res.redirect("/account/register") // redirect so flash message shows
  }

  // Register new account
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  // If registration succeeded
  if (regResult && regResult.rowCount > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    return res.redirect("/account/login") // redirect so flash message shows
  } else {
    // Registration failed
    req.flash("notice", "Sorry, the registration failed.")
    res.render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email
    })
  }
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount
}

