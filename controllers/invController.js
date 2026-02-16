const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build Add Classification View
 ***************************/
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    sticky: null
  })
}

/* ***************************
 * Build Add Inventory View
 ***************************/
invCont.buildAddInventory = async function (req, res) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    sticky: null
  })
}

/* ***************************
 * Inventory Management View
 ***************************/
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
 ***************************/
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData.rows && invData.rows.length > 0) {
      res.json(invData.rows)
    } else {
      res.json([]) // return empty array if no inventory
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Edit Inventory View
 ***************************/
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      return res.status(404).render("errors/error", {
        title: "Inventory Not Found",
        message: "Sorry, the requested inventory item does not exist.",
        nav,
      })
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      sticky: itemData,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Update inventory item
 * ***************************/
invCont.updateInventory = async function (req, res, next) {
  try {
    const {
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body

    // Call model to update the inventory item
    const result = await invModel.updateInventory(
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )

    if (result.rowCount === 1) {
      req.flash("notice", [`${inv_make} ${inv_model} updated successfully.`])
      return res.redirect("/inv")
    } else {
      throw new Error("Inventory update failed")
    }
  } catch (error) {
    next(error)
  }
}


module.exports = invCont

