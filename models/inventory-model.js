const pool = require("../database/")

const invModel = {}

/* ***************************
 * Get all classifications
 ***************************/
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

/* ***************************
 * Get inventory by classification — includes classification_name via JOIN
 ***************************/
invModel.getInventoryByClassificationId = async function (classification_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1
    `
    return await pool.query(sql, [classification_id])
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error)
    throw error
  }
}

/* ***************************
 * Get inventory by id
 ***************************/
invModel.getInventoryById = async function (inv_id) {
  try {
    const sql = `
      SELECT i.*, c.classification_name
      FROM inventory i
      JOIN classification c ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getInventoryById error:", error)
    return null
  }
}

/* ***************************
 * Insert classification
 ***************************/
invModel.insertClassification = async function (classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    console.error("insertClassification error:", error)
  }
}

/* ***************************
 * Insert new inventory
 ***************************/
invModel.addInventory = async function (
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  inv_image = "/images/vehicles/no-image.png",
  inv_thumbnail = "/images/vehicles/no-image.png"
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_description,
        inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
    `
    return await pool.query(sql, [
      classification_id, inv_make, inv_model, inv_description,
      inv_price, inv_year, inv_miles, inv_color, inv_image, inv_thumbnail
    ])
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

/* ***************************
 * Update Inventory Data
 ***************************/
invModel.updateInventory = async function (
  inv_id, inv_make, inv_model, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_year,
  inv_miles, inv_color, classification_id
) {
  try {
    const sql = `
      UPDATE inventory
      SET inv_make = $1, inv_model = $2, inv_description = $3,
          inv_image = $4, inv_thumbnail = $5, inv_price = $6,
          inv_year = $7, inv_miles = $8, inv_color = $9,
          classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `
    const result = await pool.query(sql, [
      inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
      inv_price, inv_year, inv_miles, inv_color, classification_id, inv_id
    ])
    return result.rows[0]
  } catch (error) {
    console.error("updateInventory error:", error)
    throw error
  }
}

/* ***************************
 * Delete inventory by id
 ***************************/
invModel.deleteInventoryById = async function (inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    return await pool.query(sql, [inv_id])
  } catch (error) {
    console.error("Delete Inventory Error:", error)
    return 0
  }
}

module.exports = invModel
