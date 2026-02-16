'use strict'

const jwt = require("jsonwebtoken")
const invModel = require("../models/inventory-model")
require("dotenv").config()

const utilities = {}

/* ****************************************
 * Get navigation HTML
 **************************************** */
utilities.getNav = async function () {
  try {
    const data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
      list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
    })
    list += "</ul>"
    return list
  } catch (error) {
    console.error("Error building nav:", error)
    return ""
  }
}

/* ****************************************
 * JWT Middleware: Check if token exists & valid
 **************************************** */
utilities.checkJWTToken = (req, res, next) => {
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
 * Authorization: General login check
 **************************************** */
utilities.checkLogin = (req, res, next) => {
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
utilities.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/* ****************************************
 * Build classification select list
 **************************************** */
utilities.buildClassificationList = async function (selectedId = 0) {
  try {
    const data = await invModel.getClassifications()
    let selectList = '<select id="classificationList" name="classification_id">'
    selectList += '<option value="0">Choose a Classification</option>'
    data.rows.forEach((row) => {
      const selected = row.classification_id === Number(selectedId) ? ' selected' : ''
      selectList += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`
    })
    selectList += '</select>'
    return selectList
  } catch (error) {
    console.error("Error building classification list:", error)
    return null
  }
}

module.exports = utilities
