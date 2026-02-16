const pool = require("../database/")

const invModel = {}

/* Get all classifications */
invModel.getClassifications = async function () {
  try {
    const sql = "SELECT * FROM classification ORDER BY classification_name"
    const result = await pool.query(sql)
    return result
  } catch (error) {
    console.error("getClassifications error:", error)
    throw error
  }
}

/* Get inventory by classification */
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const sql = `
      SELECT * FROM inventory
      WHERE classification_id = $1
    `
    return await pool.query(sql, [classification_id])
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* Get inventory by id */
invModel.getInventoryById = async function (inv_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getInventoryById error:", error)
    return null
  }
}

/* Insert classification */
invModel.insertClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("insertClassification error:", error)
  }
}

/* Insert inventory */
invModel.addInventory = async function (classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const sql = `
      INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `
    return await pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_price, inv_year, inv_miles, inv_color])
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

invModel.updateInventory = async function (
  inv_id,
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
      UPDATE inventory
      SET classification_id = $1,
          inv_make = $2,
          inv_model = $3,
          inv_description = $4,
          inv_price = $5,
          inv_year = $6,
          inv_miles = $7,
          inv_color = $8
      WHERE inv_id = $9
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
      inv_color,
      inv_id
    ])
  } catch (error) {
    console.error("updateInventory error:", error)
    throw error
  }
}


module.exports = invModel
