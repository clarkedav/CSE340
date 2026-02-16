const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process registration
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route → requires login
router.get(
  "/",
  utilities.checkJWTToken,  // checks token validity
  utilities.checkLogin,     // ensures user is logged in
  utilities.handleErrors(accountController.buildManagement)
)

module.exports = router


