const jwt = require("jsonwebtoken")
const invModel = require("../models/inventory-model") // make sure path is correct
require("dotenv").config()

const Util = {}

/* ****************************************
 * Middleware to check JWT and force login
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      req.flash("notice", "Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
    }

    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
  })
}

/* ****************************************
 * Wrap async functions to catch errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/* ****************************************
 * Build the navigation menu
 **************************************** */
Util.getNav = async () => {
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

module.exports = Util

