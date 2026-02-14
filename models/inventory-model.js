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

async function insertClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *
    `
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("insertClassification error:", error)
  }
}

async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id,
        inv_make,
        inv_model,
        inv_description,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `
    return await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    ])
  } catch (error) {
    return error.message
  }
}


invModel.insertClassification = insertClassification
invModel.addInventory = addInventory


module.exports = invModel
