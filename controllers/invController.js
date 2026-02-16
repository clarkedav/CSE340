// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Build Add Classification View
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    sticky: null
  })
}

// Build Add Inventory View
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const data = await invModel.getClassifications()
  const classificationList = await utilities.buildClassificationList(data)

  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    sticky: null
  })
}
/* ***************************
 * Build Management View (Inventory Management)
 * ***************************/
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList()

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      messages: req.flash(),
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Return Inventory by Classification as JSON
 * ***************************/
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData.rows && invData.rows.length > 0) {
      res.json(invData.rows)
    } else {
      next(new Error("No data returned"))
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont

