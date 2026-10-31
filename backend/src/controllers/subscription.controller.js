const pool = require("../config/database");
const asyncHandler = require("../utils/async-handler");

const SELECT_FIELDS = `
    id,
    customer_id AS "customerId",
    plan,
    cycle,
    amount::float8 AS amount,
    next_billing AS "nextBilling",
    status
`;

exports.getSubscriptions = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT ${SELECT_FIELDS}
        FROM subscriptions
        ORDER BY id DESC
    `);

    res.json(result.rows);
});

exports.getSubscription = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT ${SELECT_FIELDS}
        FROM subscriptions
        WHERE id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }

    res.json(result.rows[0]);
});

exports.createSubscription = asyncHandler(async (req, res) => {
    const {
        customerId,
        plan,
        cycle,
        amount,
        nextBilling,
        status = "active"
    } = req.body;

    if (
        !customerId ||
        !plan ||
        !cycle ||
        amount === undefined ||
        !nextBilling
    ) {
        return res.status(400).json({
            success: false,
            message: "Missing required subscription fields"
        });
    }

    if (!["Monthly", "Yearly"].includes(cycle)) {
        return res.status(400).json({
            success: false,
            message: "Invalid billing cycle"
        });
    }

    if (!["active", "trial", "past-due", "cancelled"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid subscription status"
        });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a positive number"
        });
    }

    const result = await pool.query(`
        INSERT INTO subscriptions (
            customer_id,
            plan,
            cycle,
            amount,
            next_billing,
            status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING ${SELECT_FIELDS}
    `, [customerId, plan, cycle, amount, nextBilling, status]);

    res.status(201).json(result.rows[0]);
});

exports.updateSubscription = asyncHandler(async (req, res) => {
    const {
        customerId,
        plan,
        cycle,
        amount,
        nextBilling,
        status
    } = req.body;

    if (
        !customerId ||
        !plan ||
        !cycle ||
        amount === undefined ||
        !nextBilling ||
        !status
    ) {
        return res.status(400).json({
            success: false,
            message: "All subscription fields are required"
        });
    }

    if (
        !["Monthly", "Yearly"].includes(cycle) ||
        !["active", "trial", "past-due", "cancelled"].includes(status) ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid subscription data"
        });
    }

    const result = await pool.query(`
        UPDATE subscriptions
        SET
            customer_id = $1,
            plan = $2,
            cycle = $3,
            amount = $4,
            next_billing = $5,
            status = $6
        WHERE id = $7
        RETURNING ${SELECT_FIELDS}
    `, [
        customerId,
        plan,
        cycle,
        amount,
        nextBilling,
        status,
        req.params.id
    ]);

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }

    res.json(result.rows[0]);
});

exports.deleteSubscription = asyncHandler(async (req, res) => {
    const result = await pool.query(
        "DELETE FROM subscriptions WHERE id = $1 RETURNING id",
        [req.params.id]
    );

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Subscription not found"
        });
    }

    res.json({
        success: true,
        message: "Subscription deleted successfully"
    });
});
