/* ******************************************
 * Review Controller
 *******************************************/
const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* *****************************
 * Add a review (POST)
 *****************************/
reviewCont.addReview = async function (req, res, next) {
    try {
        const { review_text, review_rating, inv_id } = req.body
        const account_id = res.locals.accountData.account_id

        const result = await reviewModel.addReview(
            review_text,
            parseInt(review_rating),
            parseInt(inv_id),
            parseInt(account_id)
        )

        if (result) {
            req.flash("notice", "Your review was submitted successfully.")
        } else {
            req.flash("notice", "Sorry, your review could not be submitted.")
        }

        return res.redirect(`/inv/detail/${inv_id}`)
    } catch (error) {
        next(error)
    }
}

/* *****************************
 * Delete a review (POST)
 *****************************/
reviewCont.deleteReview = async function (req, res, next) {
    try {
        const { review_id, inv_id } = req.body
        const account_id = res.locals.accountData.account_id

        const result = await reviewModel.deleteReview(
            parseInt(review_id),
            parseInt(account_id)
        )

        if (result) {
            req.flash("notice", "Review deleted successfully.")
        } else {
            req.flash("notice", "Sorry, the review could not be deleted.")
        }

        return res.redirect(`/inv/detail/${inv_id}`)
    } catch (error) {
        next(error)
    }
}

/* *****************************
 * My Reviews View
 *****************************/
reviewCont.buildMyReviews = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const account_id = res.locals.accountData.account_id
        const reviews = await reviewModel.getReviewsByAccountId(parseInt(account_id))

        res.render("review/my-reviews", {
            title: "My Reviews",
            nav,
            reviews,
            errors: null,
            messages: req.flash()
        })
    } catch (error) {
        next(error)
    }
}

module.exports = reviewCont