/* ******************************************
 * Review Model
 *******************************************/
const pool = require("../database/")

const reviewModel = {}

/* *****************************
 * Add a new review
 *****************************/
reviewModel.addReview = async function (review_text, review_rating, inv_id, account_id) {
    try {
        const sql = `
            INSERT INTO review (review_text, review_rating, inv_id, account_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `
        const result = await pool.query(sql, [review_text, review_rating, inv_id, account_id])
        return result.rows[0]
    } catch (error) {
        console.error("addReview error:", error)
        return null
    }
}

/* *****************************
 * Get all reviews for a vehicle
 *****************************/
reviewModel.getReviewsByInventoryId = async function (inv_id) {
    try {
        const sql = `
            SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                   a.account_firstname, a.account_lastname
            FROM review r
            JOIN account a ON r.account_id = a.account_id
            WHERE r.inv_id = $1
            ORDER BY r.review_date DESC
        `
        const result = await pool.query(sql, [inv_id])
        return result.rows
    } catch (error) {
        console.error("getReviewsByInventoryId error:", error)
        return []
    }
}

/* *****************************
 * Get all reviews by an account
 *****************************/
reviewModel.getReviewsByAccountId = async function (account_id) {
    try {
        const sql = `
            SELECT r.review_id, r.review_text, r.review_rating, r.review_date,
                   i.inv_make, i.inv_model, i.inv_year
            FROM review r
            JOIN inventory i ON r.inv_id = i.inv_id
            WHERE r.account_id = $1
            ORDER BY r.review_date DESC
        `
        const result = await pool.query(sql, [account_id])
        return result.rows
    } catch (error) {
        console.error("getReviewsByAccountId error:", error)
        return []
    }
}

/* *****************************
 * Delete a review by ID
 *****************************/
reviewModel.deleteReview = async function (review_id, account_id) {
    try {
        const sql = `
            DELETE FROM review
            WHERE review_id = $1 AND account_id = $2
            RETURNING *
        `
        const result = await pool.query(sql, [review_id, account_id])
        return result.rows[0]
    } catch (error) {
        console.error("deleteReview error:", error)
        return null
    }
}

/* *****************************
 * Get average rating for a vehicle
 *****************************/
reviewModel.getAverageRating = async function (inv_id) {
    try {
        const sql = `
            SELECT ROUND(AVG(review_rating), 1) AS avg_rating, COUNT(*) AS total_reviews
            FROM review
            WHERE inv_id = $1
        `
        const result = await pool.query(sql, [inv_id])
        return result.rows[0]
    } catch (error) {
        console.error("getAverageRating error:", error)
        return { avg_rating: 0, total_reviews: 0 }
    }
}

module.exports = reviewModel