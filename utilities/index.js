const jwt = require("jsonwebtoken")
const invModel = require("../models/inventory-model") // for getNav
require("dotenv").config()

const Util = {}

/* ****************************************
 * Get navigation HTML
 **************************************** */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * JWT Middleware: Check if token exists & valid
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

    // Token valid → store account info in locals
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
  })
}

/* ****************************************
 * Authorization: General login check
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Error Handling Wrapper for async functions
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = Util
