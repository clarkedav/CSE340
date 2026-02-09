const db = require('../database') // our new query wrapper

// Get user by email
async function findByEmail(account_email) {
  const query = 'SELECT * FROM account WHERE account_email = $1'
  
  try {
    // Use db.query, works for both dev (with logging) and prod
    const { rows } = await db.query(query, [account_email])
    return rows[0] // return first matching account
  } catch (error) {
    console.error('Error in findByEmail:', error)
    throw error
  }
}

module.exports = {
  findByEmail
}

