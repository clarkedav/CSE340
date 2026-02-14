/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")
const expressLayouts = require("express-ejs-layouts")
const path = require("path")
const pool = require("./database/")
require("dotenv").config()

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")

/* ***********************
 * Express App
 *************************/
const app = express()

/* ***********************
 * Middleware
 ************************/

// Favicon handler to prevent repeated 404s
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
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
)

// Flash messages
app.use(flash())

// Assign flash messages HTML to res.locals
app.use((req, res, next) => {
  res.locals.messages = req.flash()
  next()
})

// Static Files
app.use(express.static("public"))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Apply JWT Middleware Globally
 *************************/
app.use(utilities.checkJWTToken)

/* ***********************
 * Routes
 *************************/

// Account routes
app.use("/account", accountRoute)

// Inventory routes
app.use("/inv", inventoryRoute)

// Intentional error route (Task 3)
app.get(
  "/trigger-error",
  utilities.handleErrors(baseController.triggerError)
)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Sorry, we appear to have lost that page.",
  })
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = ""
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error("Error building nav in error handler:", error)
  }

  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  let message
  if (err.status === 404) {
    message = err.message
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

