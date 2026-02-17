const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const { inventoryRules, checkUpdateData } = require("../utilities/inventory-validation")

/* ***************************
 * Inventory Management View
 * ************************** */
router.get(
  "/",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.buildManagement)
)

/* ***************************
 * Add Classification View
 * ************************** */
router.get(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddClassification)
)

/* ***************************
 * Process Add Classification
 * ************************** */
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.addClassification)
)

/* ***************************
 * Add Inventory View
 * ************************** */
router.get(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.buildAddInventory)
)

/* ***************************
 * Process Add Inventory
 * ************************** */
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkLogin,
  inventoryRules(),
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
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.editInventoryView)
)

/* ***************************
 * Process Inventory Update
 * ************************** */
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkLogin,
  inventoryRules(),
  checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)


module.exports = router
