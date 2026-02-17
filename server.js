'use strict'

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

// Favicon
app.get("/favicon.ico", (req, res) => res.status(204).end())

// Body parsing
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Cookie parser
app.use(cookieParser())

// Session
app.use(session({
    store: new (require("connect-pg-simple")(session))({
        createTableIfMissing: true,
        pool,
    }),
    secret: process.env.SESSION_SECRET || "changeThisSecret",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
}))

// Flash
app.use(flash())

// Task 1 - Set loggedin/accountData locals on EVERY request
// This makes the header show correct login state on all pages
app.use(utilities.setLocals)

// Static files
app.use(express.static("public"))

// View engine
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Routes
app.use("/account", accountRoute)
app.get("/", utilities.handleErrors(baseController.buildHome))

// Task 2 - checkAccountType ensures only Employee/Admin access /inv admin routes
app.use("/inv", utilities.checkJWTToken, utilities.checkAccountType, inventoryRoute)

app.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

// 404
app.use(async (req, res, next) => {
    next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

// Error handler
app.use(async (err, req, res, next) => {
    let nav = ""
    try { nav = await utilities.getNav() } catch (e) { console.error(e) }
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    const message = err.status === 404 ? err.message : "Oh no! There was a crash. Maybe try a different route?"
    res.status(err.status || 500).render("errors/error", { title: err.status || "Server Error", message, nav })
})

const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"
app.listen(port, () => console.log(`App listening on ${host}:${port}`))