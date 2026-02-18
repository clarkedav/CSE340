const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Helper - Fix image path
 * If path doesn't include /vehicles/, correct it
 ***************************/
function fixImagePath(imgPath, filename) {
  if (!imgPath || imgPath === '/images/no-image.png') {
    return `/images/vehicles/${filename}`
  }
  return imgPath
}

/* ***************************
 * PUBLIC - Build by Classification
 ***************************/
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const nav = await utilities.getNav()

    if (!data || data.rows.length === 0) {
      return res.render("inventory/classification", {
        title: "No Vehicles Found",
        nav,
        grid: "<p>No vehicles found for this classification.</p>",
        messages: req.flash()
      })
    }

    const className = data.rows[0].classification_name

    let grid = '<ul id="inv-display">'
    data.rows.forEach((vehicle) => {
      grid += `
        <li>
          <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
          </a>
          <div>
            <h2><a href="/inv/detail/${vehicle.inv_id}">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>
            <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
          </div>
        </li>`
    })
    grid += '</ul>'

    res.render("inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * PUBLIC - Build vehicle detail view
 ***************************/
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const vehicle = await invModel.getInventoryById(inv_id)
    const nav = await utilities.getNav()

    if (!vehicle) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/")
    }

    const vehicleHTML = `
      <div class="vehicle-detail">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info">
          <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
          <ul>
            <li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</li>
            <li><strong>Year:</strong> ${vehicle.inv_year}</li>
            <li><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</li>
            <li><strong>Color:</strong> ${vehicle.inv_color}</li>
            <li><strong>Description:</strong> ${vehicle.inv_description}</li>
          </ul>
        </div>
      </div>`

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Add Classification View
 ***************************/
invCont.buildAddClassification = async function (req, res) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
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
    errors: null,
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
      errors: null,
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

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    res.render("inventory/edit-inventory", {
      title: `Edit ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      errors: null,
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
      inv_id, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_year,
      inv_miles, inv_color, classification_id
    } = req.body

    inv_image = inv_image || "/images/vehicles/no-image.png"
    inv_thumbnail = inv_thumbnail || "/images/vehicles/no-image-tn.png"

    const invIdInt = parseInt(inv_id)
    const classificationIdInt = parseInt(classification_id)
    const yearInt = parseInt(inv_year)
    const milesInt = parseInt(inv_miles)
    const priceFloat = parseFloat(inv_price)

    if (isNaN(invIdInt) || isNaN(classificationIdInt) || isNaN(yearInt) || isNaN(milesInt) || isNaN(priceFloat)) {
      const nav = await utilities.getNav()
      const classificationSelect = await utilities.buildClassificationList(classification_id)
      return res.status(400).render("inventory/edit-inventory", {
        title: `Edit ${inv_make || ""} ${inv_model || ""}`,
        nav,
        errors: null,
        classificationSelect,
        sticky: req.body,
        messages: { notice: ["Invalid numeric input detected."] }
      })
    }

    const updatedItem = await invModel.updateInventory(
      invIdInt, inv_make, inv_model, inv_description,
      inv_image, inv_thumbnail, priceFloat, yearInt,
      milesInt, inv_color, classificationIdInt
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
      classification_id, inv_make, inv_model, inv_description,
      inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail
    } = req.body

    inv_image = inv_image || "/images/vehicles/no-image.png"
    inv_thumbnail = inv_thumbnail || "/images/vehicles/no-image-tn.png"

    const addedItem = await invModel.addInventory(
      parseInt(classification_id), inv_make, inv_model, inv_description,
      parseFloat(inv_price), parseInt(inv_year), parseInt(inv_miles),
      inv_color, inv_image, inv_thumbnail
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
 * Delete Inventory View
 ***************************/
invCont.deleteInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      req.flash("notice", "Inventory item not found.")
      return res.redirect("/inv/")
    }

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      errors: null,
      sticky: itemData,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Build Delete Confirmation View
 ***************************/
invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id)
    const nav = await utilities.getNav()
    const itemData = await invModel.getInventoryById(inv_id)

    if (!itemData) {
      req.flash("notice", "Inventory item not found.")
      return res.redirect("/inv/")
    }

    res.render("inventory/delete-confirm", {
      title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
      nav,
      errors: null,
      sticky: itemData,
      messages: req.flash()
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Process Inventory Delete
 ***************************/
invCont.deleteInventory = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id)
    const deleteResult = await invModel.deleteInventoryById(inv_id)

    if (deleteResult) {
      req.flash("notice", "Inventory item deleted successfully.")
      return res.redirect("/inv/")
    } else {
      req.flash("error", "Sorry, the delete failed.")
      return res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 * Add Classification (POST)
 ***************************/
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body
    const result = await invModel.insertClassification(classification_name)
    const nav = await utilities.getNav()

    if (result && result.rowCount > 0) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      return res.redirect("/inv/")
    } else {
      req.flash("notice", "Sorry, the classification could not be added.")
      return res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        sticky: req.body,
        messages: req.flash()
      })
    }
  } catch (error) {
    next(error)
  }
}

module.exports = invCont