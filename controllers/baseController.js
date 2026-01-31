const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

module.exports = baseController

async function triggerError(req, res, next) {
  throw new Error("Intentional server error for testing.")
}

