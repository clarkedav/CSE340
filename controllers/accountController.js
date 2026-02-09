const utilities = require("../utilities")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    message: req.flash("notice")
  })
}

module.exports = { buildLogin }



const { findByEmail } = require('../models/account-model')

// Show login page
const showLogin = (req, res) => {
  res.render('account/login')
}

// Handle login form submission
const login = async (req, res) => {
  // Data Trail: names match DB columns
  const { account_email, account_password } = req.body

  try {
    const user = await findByEmail(account_email)

    if (!user) {
      return res.render('errors/error', { message: 'Email not found' })
    }

    if (user.account_password !== account_password) {
      return res.render('errors/error', { message: 'Incorrect password' })
    }

    // Successful login
    res.send(`Welcome back, ${user.account_email}!`)
  } catch (err) {
    console.error('Error in login controller:', err)
    res.status(500).render('errors/error', { message: 'Server error' })
  }
}

module.exports = {
  buildLogin,
  showLogin,
  login
}

