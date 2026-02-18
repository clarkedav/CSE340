/* ******************************************
 * Review Routes
 *******************************************/
const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const reviewController = require("../controllers/reviewController")
const reviewValidate = require("../utilities/review-validation")

// Add a review (must be logged in)
router.post(
    "/add",
    utilities.checkJWTToken,
    utilities.checkLogin,
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewData,
    utilities.handleErrors(reviewController.addReview)
)

// Delete a review (must be logged in)
router.post(
    "/delete",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.handleErrors(reviewController.deleteReview)
)

// My reviews page
router.get(
    "/my-reviews",
    utilities.checkJWTToken,
    utilities.checkLogin,
    utilities.handleErrors(reviewController.buildMyReviews)
)

module.exports = router