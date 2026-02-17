const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
// Fix #2: Import checkInventoryData alongside the other validators
const { inventoryRules, checkInventoryData, checkUpdateData } = require("../utilities/inventory-validation")

/* ***************************
 * Inventory Management View
 * ************************** */
router.get(
  "/",
  // Fix #1: Removed duplicate utilities.checkJWTToken — it is already applied
  // in server.js at the /inv level, so calling it again here is redundant
  utilities.checkLogin,
  utilities.handleErrors(invController.buildManagement)
)

/* ***************************
 * Add Classification View
 * ************************** */
router.get(
  "/add-classification",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddClassification)
)

/* ***************************
 * Process Add Classification
 * ************************** */
router.post(
  "/add-classification",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 * Add Inventory View
 * ************************** */
router.get(
  "/add-inventory",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddInventory)
)

/* ***************************
 * Process Add Inventory
 * ************************** */
router.post(
  "/add-inventory",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  inventoryRules(),
  // Fix #2: Added missing checkInventoryData middleware so validation errors
  // are caught and the form is re-rendered with sticky data and error messages
  checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)


/* ***************************
 * Return JSON inventory by classification
 * ************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ***************************
 * Edit Inventory View
 * ************************** */
router.get(
  "/edit/:inv_id",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.editInventoryView)
)

/* ***************************
 * Process Inventory Update
 * ************************** */
router.post(
  "/update",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  inventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

/* ***************************
 * Delete Inventory View (confirmation)
 ************************** */
router.get(
  "/delete/:inv_id",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.deleteInventoryView)
)

/* ***************************
 * Process Inventory Delete
 ************************** */
router.post(
  "/delete",
  // Fix #1: Removed duplicate utilities.checkJWTToken
  utilities.checkLogin,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router