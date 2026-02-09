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

/* ***********************
 * Routes
 *************************/

// Deliver login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// (Later you will add POST /login here)

module.exports = router

