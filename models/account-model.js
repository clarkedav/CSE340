/* ******************************************
 * Account Model
 * Handles database queries for account table
 *******************************************/
const pool = require("../database")

/* Register new account */
async function registerAccount(firstname, lastname, email, password) {
  try {
    const sql = `
      INSERT INTO account 
      (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *
    `
    return await pool.query(sql, [firstname, lastname, email, password])
  } catch (error) {
    console.error("registerAccount error:", error)
    return null
  }
}

/* Check if email exists */
async function checkExistingEmail(email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [email])
    return result.rowCount
  } catch (error) {
    console.error("checkExistingEmail error:", error)
    return 0
  }
}

/* Get account by email */
async function getAccountByEmail(email) {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email, account_password, account_type
      FROM account
      WHERE account_email = $1
    `
    const result = await pool.query(sql, [email])
    return result.rows[0]
  } catch (error) {
    console.error("getAccountByEmail error:", error)
    return null
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail
}

