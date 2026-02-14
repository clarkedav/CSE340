const jwt = require("jsonwebtoken")

/* Middleware to check if user is logged in */
function checkJWT(req, res, next) {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "You must log in to view this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = decoded // store account info in req.user
    next()
  } catch (error) {
    req.flash("notice", "Session expired or invalid. Please log in again.")
    return res.redirect("/account/login")
  }
}

module.exports = { checkJWT }
