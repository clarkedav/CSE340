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
 * JWT Middleware: Check token exists & valid
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
 * Task 2 - Check Employee or Admin type
 **************************************** */
utilities.checkAccountType = (req, res, next) => {
    const token = req.cookies.jwt
    if (!token) {
        req.flash("notice", "You must be logged in as an Employee or Admin to access this area.")
        return res.redirect("/account/login")
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
        if (err) {
            req.flash("notice", "Session expired. Please log in again.")
            res.clearCookie("jwt")
            return res.redirect("/account/login")
        }
        if (accountData.account_type === "Employee" || accountData.account_type === "Admin") {
            res.locals.accountData = accountData
            res.locals.loggedin = 1
            next()
        } else {
            req.flash("notice", "You do not have permission to access this area.")
            return res.redirect("/account/login")
        }
    })
}

/* ****************************************
 * Set locals for all requests (no redirect)
 * Used so header shows correct login state
 **************************************** */
utilities.setLocals = (req, res, next) => {
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
            if (!err) {
                res.locals.accountData = accountData
                res.locals.loggedin = 1
            }
        })
    }
    next()
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
 * Error Handling Wrapper
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