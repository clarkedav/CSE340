const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const invController = require("../controllers/invController")

// Inventory Management View
router.get("/", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(invController.buildManagement))

// Add Classification View
router.get("/add-classification", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(invController.buildAddClassification))

// Add Inventory View
router.get("/add-inventory", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(invController.buildAddInventory))

// Return JSON inventory by classification
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Edit Inventory View
router.get("/edit/:inv_id", utilities.checkJWTToken, utilities.checkLogin, utilities.handleErrors(invController.editInventoryView))

// Handle inventory update
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkLogin,
  utilities.handleErrors(invController.updateInventory)
)


module.exports = router
