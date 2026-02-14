const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

// Define controller object
const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ***************************/
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId

  try {
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const vehicles = data.rows
    const grid = await utilities.buildClassificationGrid(vehicles)
    const nav = await utilities.getNav()

    const className = vehicles.length > 0 ? vehicles[0].classification_name : "Inventory"

    res.render("inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build vehicle detail view
 * ***************************/
invCont.buildDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id

  try {
    const data = await invModel.getVehicleById(inv_id)
    const nav = await utilities.getNav()
    const vehicleHTML = utilities.buildVehicleDetail(data.rows[0])

    res.render("inventory/detail", {
      title: `${data.rows[0].inv_make} ${data.rows[0].inv_model}`,
      nav,
      vehicleHTML,
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build management view (Task 1)
 * ***************************/
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Classification View (Task 2)
 * ***************************/
invCont.buildAddClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: req.flash(),
      sticky: {},
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Add new classification (Task 2)
 * ***************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { classification_name } = req.body

    const result = await invModel.insertClassification(classification_name)

    if (result.rowCount > 0) {
      req.flash("notice", "Classification added successfully.")
      // Rebuild nav to include new classification
      const newNav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        messages: req.flash(),
      })
    } else {
      req.flash("error", "Failed to add classification.")
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: null,
        messages: req.flash(),
      })
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Inventory View (Task 3)
 * ***************************/
invCont.buildAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      messages: req.flash(),
      sticky: {}, // empty object for sticky form initially
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Add new inventory (Task 3)
 * ***************************/
invCont.addInventory = async function (req, res, next) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body

  // Prepare sticky object in case of failure
  const sticky = {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  }

  try {
    const result = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )

    if (result.rowCount > 0) {
      req.flash("notice", "Inventory item added successfully.")
      res.redirect("/inv/")
    } else {
      req.flash("error", "Failed to add inventory item.")
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: null,
        messages: req.flash(),
        sticky,
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont






