


/* ******************************************
 * Account Routes
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

/* ***********************
 * Routes
 *************************/

// Deliver login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Deliver registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account route - account management view
router.get(
  "/",
  utilities.checkJWTToken, // middleware checks JWT
  utilities.handleErrors(accountController.buildManagement)
)

module.exports = router

