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
    sticky: null,
    messages: req.flash()
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
    sticky: null,
    messages: req.flash()
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
      messages: req.flash()
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
    res.json(invData.rows || [])
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
      req.flash("notice", "Inventory item not found.")
      return res.redirect("/inv/")
    }

    const classificationSelect =
      await utilities.buildClassificationList(itemData.classification_id)

    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
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
 * Update Inventory
 ***************************/
invCont.updateInventory = async function (req, res, next) {
  try {
    let {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    } = req.body

    // Default images if missing
    inv_image = inv_image || "/images/no-image.png"
    inv_thumbnail = inv_thumbnail || "/images/no-image.png"

    // Convert numeric fields safely
    const invIdInt = parseInt(inv_id)
    const classificationIdInt = parseInt(classification_id)
    const yearInt = parseInt(inv_year)
    const milesInt = parseInt(inv_miles)
    const priceFloat = parseFloat(inv_price)

    // Validate numeric input
    if (
      isNaN(invIdInt) ||
      isNaN(classificationIdInt) ||
      isNaN(yearInt) ||
      isNaN(milesInt) ||
      isNaN(priceFloat)
    ) {
      req.flash("notice", "Invalid numeric input detected.")
      const nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      return res.status(400).render("inventory/edit-inventory", {
        title: `Edit ${inv_make || ""} ${inv_model || ""}`,
        nav,
        classificationSelect,
        sticky: req.body,
        messages: req.flash()
      })
    }

    // Call model to update inventory
    const updatedItem = await invModel.updateInventory(
      invIdInt,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      priceFloat,
      yearInt,
      milesInt,
      inv_color,
      classificationIdInt
    )

    if (updatedItem) {
      req.flash("notice", `${updatedItem.inv_make} ${updatedItem.inv_model} updated successfully.`)
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the update failed.")
      return res.redirect(`/inv/edit/${invIdInt}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Process Add Inventory
 ***************************/
invCont.addInventory = async function (req, res, next) {
  try {
    let {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail
    } = req.body

    inv_image = inv_image || "/images/no-image.png"
    inv_thumbnail = inv_thumbnail || "/images/no-image.png"

    const addedItem = await invModel.addInventory(
      parseInt(classification_id),
      inv_make,
      inv_model,
      inv_description,
      parseFloat(inv_price),
      parseInt(inv_year),
      parseInt(inv_miles),
      inv_color,
      inv_image,
      inv_thumbnail
    )

    if (addedItem && addedItem.rows && addedItem.rows.length > 0) {
      req.flash("notice", `${inv_make} ${inv_model} added successfully.`)
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the inventory item could not be added.")
      return res.redirect("/inv/add-inventory")
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Export Controller
 ***************************/
module.exports = invCont
