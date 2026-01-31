const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId

  // Get inventory data from model
  const data = await invModel.getInventoryByClassificationId(classification_id)

  // Extract rows from result
  const vehicles = data.rows

  // Build HTML grid
  const grid = await utilities.buildClassificationGrid(vehicles)

  // Build navigation
  let nav = await utilities.getNav()

  // Safely get classification name
  const className = vehicles.length > 0
    ? vehicles[0].classification_name
    : "Inventory"

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetail = async function (req, res, next) {
  const inv_id = req.params.inv_id

  // Get single vehicle from model
  const data = await invModel.getVehicleById(inv_id)

  // Build navigation
  let nav = await utilities.getNav()

  // Build vehicle detail HTML
  const vehicleHTML = utilities.buildVehicleDetail(data.rows[0])

  res.render("inventory/detail", {
    title: `${data.rows[0].inv_make} ${data.rows[0].inv_model}`,
    nav,
    vehicleHTML
  })
}

module.exports = invCont





