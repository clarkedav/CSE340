const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const invController = require("../controllers/invController")
const { inventoryRules, checkInventoryData, checkUpdateData } = require("../utilities/inventory-validation")

/* ***************************
 * PUBLIC ROUTES
 * Accessible by all visitors — no login required
 * ************************** */

// Classification view (e.g. /inv/type/5)
router.get("/type/:classification_id", utilities.handleErrors(invController.buildByClassificationId))

// Vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId))

// Return JSON inventory by classification (used by management JS)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))


/* ***************************
 * PROTECTED ROUTES
 * Only Employee or Admin can access these
 * ************************** */

// Inventory Management View
router.get(
    "/",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildManagement)
)

// Add Classification View
router.get(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddClassification)
)

// Process Add Classification
router.post(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.addClassification)
)

// Add Inventory View
router.get(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddInventory)
)

// Process Add Inventory
router.post(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    inventoryRules(),
    checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// Edit Inventory View
router.get(
    "/edit/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.editInventoryView)
)

// Process Inventory Update
router.post(
    "/update",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    inventoryRules(),
    checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

// Delete Inventory View
router.get(
    "/delete/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventoryView)
)

// Process Inventory Delete
router.post(
    "/delete",
    utilities.checkJWTToken,
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router