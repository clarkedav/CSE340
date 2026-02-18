/* ******************************************
 * Review Validation
 *******************************************/
const { body, validationResult } = require("express-validator")
const utilities = require("./index")
const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")

const reviewValidate = {}

/* *****************************
 * Review rules
 *****************************/
reviewValidate.reviewRules = () => [
    body("review_text")
        .trim()
        .notEmpty().withMessage("Review text is required.")
        .isLength({ min: 10 }).withMessage("Review must be at least 10 characters."),
    body("review_rating")
        .notEmpty().withMessage("Please select a rating.")
        .isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("inv_id")
        .notEmpty().withMessage("Vehicle ID is required.")
        .isInt().withMessage("Invalid vehicle ID.")
]

/* *****************************
 * Check review data
 *****************************/
reviewValidate.checkReviewData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const { inv_id } = req.body
        const nav = await utilities.getNav()
        const vehicle = await invModel.getInventoryById(parseInt(inv_id))
        const reviews = await reviewModel.getReviewsByInventoryId(parseInt(inv_id))
        const ratingData = await reviewModel.getAverageRating(parseInt(inv_id))

        const vehicleHTML = buildVehicleHTML(vehicle)

        return res.render("inventory/detail", {
            title: `${vehicle.inv_make} ${vehicle.inv_model}`,
            nav,
            vehicleHTML,
            reviews,
            ratingData,
            errors: errors.array(),
            sticky: req.body,
            messages: {}
        })
    }
    next()
}

/* *****************************
 * Helper to rebuild vehicleHTML
 *****************************/
function buildVehicleHTML(vehicle) {
    return `
        <div class="vehicle-detail">
            <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
            <div class="vehicle-info">
                <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
                <ul>
                    <li><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</li>
                    <li><strong>Year:</strong> ${vehicle.inv_year}</li>
                    <li><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</li>
                    <li><strong>Color:</strong> ${vehicle.inv_color}</li>
                    <li><strong>Description:</strong> ${vehicle.inv_description}</li>
                </ul>
            </div>
        </div>`
}

module.exports = reviewValidate