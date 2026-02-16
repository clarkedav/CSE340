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
const validate = require("../utilities/account-validation")
const regValidate = require("../utilities/account-validation")



/* ***********************
 * Routes
 *************************/

// Deliver login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

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

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  (req, res) => {
    res.status(200).send("login process") // temporary
  }
)



module.exports = router



