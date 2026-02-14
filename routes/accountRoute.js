/* ******************************************
 * Account Routes
 *******************************************/

const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const utilities = require("../utilities/")

/* ************************
 * Deliver login view
 *************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ************************
 * Process login request
 *************************/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ************************
 * Deliver registration view
 *************************/
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* ************************
 * Process registration
 *************************/
router.post(
  "/register",
  regValidate.registerRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ************************
 * Account Management Default View
 * Accessible at /account/
 *************************/
router.get("/", utilities.checkJWTToken, utilities.handleErrors(accountController.buildAccountManagement))

module.exports = router
