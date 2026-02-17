/* ******************************************
 * server.js
 *******************************************/
'use strict'

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const session = require("express-session")
const flash = require("connect-flash")
const expressLayouts = require("express-ejs-layouts")
const pool = require("./database/")
require("dotenv").config()

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const cookieParser = require("cookie-parser")

const app = express()

/* ***********************
 * Middleware
 ************************/

// Favicon handler
app.get("/favicon.ico", (req, res) => res.status(204).end())

// Body parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Session with PostgreSQL store
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "changeThisSecret",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
)

// Flash messages
app.use(flash())

// Static Files
app.use(express.static("public"))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use("/account", accountRoute)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", utilities.checkJWTToken, inventoryRoute)
app.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

/* ***********************
 * 404 handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = ""
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error("Error building nav in error handler:", error)
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`)
})