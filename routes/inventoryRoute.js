// Required resources
const express = require("express")
const router = express.Router()
const invCont = require("../controllers/invController")
const utilities = require("../utilities/")
// Validation modules (ensure these exist)
const invValidate = require("../utilities/inventory-validation")
const classificationValidate = require("../utilities/classification-validation")

/* ***************************
 * Routes for Inventory Management
 * ***************************/

// 1️ Inventory by classification
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invCont.buildByClassificationId)
)

// 2️ Vehicle detail view
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invCont.buildDetail)
)

// 3️ Management view
router.get(
  "/",
  utilities.handleErrors(invCont.buildManagement)
)

// 4️ Deliver add classification form
router.get(
  "/add-classification",
  utilities.handleErrors(invCont.buildAddClassification)
)

// 5️ Process add classification form
router.post(
  "/add-classification",
  classificationValidate.classificationRules(),   // server-side rules
  classificationValidate.checkClassificationData, // validation check
  utilities.handleErrors(invCont.addClassification)
)

// 6 Deliver add inventory form
router.get(
  "/add-inventory",
  utilities.handleErrors(invCont.buildAddInventory)
)

// 7️ Process add inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),   // server-side rules
  invValidate.checkInventoryData, // validation check
  utilities.handleErrors(invCont.addInventory)
)

module.exports = router

