const pool = require("../database/")

const invModel = {}

/* ***************************
 *  Get all classification data
 * ************************** */
invModel.getClassifications = async function () {
  try {
    const sql = "SELECT * FROM public.classification ORDER BY classification_name"
    return await pool.query(sql)
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get inventory by classification id
 * ************************** */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const sql = `
      SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
    `
    return await pool.query(sql, [classification_id])
  } catch (error) {
    throw error
  }
}

/* ***************************
 *  Get vehicle by inventory id
 * ************************** */
invModel.getVehicleById = async function (inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1"
    return await pool.query(sql, [inv_id])
  } catch (error) {
    throw error
  }
}

module.exports = invModel
