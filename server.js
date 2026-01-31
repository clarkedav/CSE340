/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
//const static = require("./routes/static")

app.use(express.static("public"))

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
//app.use(static)

// Intentional error route (Task 3)
app.get(
  "/trigger-error",
  utilities.handleErrors(baseController.triggerError)
)


// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * File Not Found Route - must be last route in list
 *************************/
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "Sorry, we appear to have lost that page."
  })
})

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  // Build navigation
  let nav = ""
  try {
    nav = await utilities.getNav()
  } catch (error) {
    console.error("Error building nav in error handler:", error)
  }

  // Log the error for debugging
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)

  // Determine the message to display to the user
  let message
  if (err.status === 404) {
    message = err.message  // show 404 message
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?"  // generic for all other errors
  }

  // Render the error view
  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',  // "404" or "500"
    message,
    nav                                    // Pass nav so partials can render
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})


