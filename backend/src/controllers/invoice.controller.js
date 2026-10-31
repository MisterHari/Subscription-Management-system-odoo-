const pool = require("../config/database");
const asyncHandler = require("../utils/async-handler");

const SELECT_FIELDS = `
    id,
    customer_id AS "customerId",
    issue_date AS "issueDate",
    due_date AS "dueDate",
    amount::float8 AS amount,
    status
`;

exports.getInvoices = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT ${SELECT_FIELDS}
        FROM invoices
        ORDER BY id DESC
    `);

    res.json(result.rows);
});

exports.getInvoice = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT ${SELECT_FIELDS}
        FROM invoices
        WHERE id = $1
    `, [req.params.id]);

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Invoice not found"
        });
    }

    res.json(result.rows[0]);
});

exports.createInvoice = asyncHandler(async (req, res) => {
    const {
        customerId,
        issueDate,
        dueDate,
        amount,
        status = "draft"
    } = req.body;

    if (
        !customerId ||
        !dueDate ||
        amount === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Customer, due date and amount are required"
        });
    }

    if (!["draft", "pending", "paid", "overdue"].includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid invoice status"
        });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a positive number"
        });
    }

    const result = await pool.query(`
        INSERT INTO invoices (
            customer_id,
            issue_date,
            due_date,
            amount,
            status
        )
        VALUES (
            $1,
            COALESCE($2::date, CURRENT_DATE),
            $3,
            $4,
            $5
        )
        RETURNING ${SELECT_FIELDS}
    `, [
        customerId,
        issueDate || null,
        dueDate,
        amount,
        status
    ]);

    res.status(201).json(result.rows[0]);
});

exports.updateInvoice = asyncHandler(async (req, res) => {
    const {
        customerId,
        issueDate,
        dueDate,
        amount,
        status
    } = req.body;

    if (
        !customerId ||
        !issueDate ||
        !dueDate ||
        amount === undefined ||
        !status
    ) {
        return res.status(400).json({
            success: false,
            message: "All invoice fields are required"
        });
    }

    if (
        !["draft", "pending", "paid", "overdue"].includes(status) ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid invoice data"
        });
    }

    const result = await pool.query(`
        UPDATE invoices
        SET
            customer_id = $1,
            issue_date = $2,
            due_date = $3,
            amount = $4,
            status = $5
        WHERE id = $6
        RETURNING ${SELECT_FIELDS}
    `, [
        customerId,
        issueDate,
        dueDate,
        amount,
        status,
        req.params.id
    ]);

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Invoice not found"
        });
    }

    res.json(result.rows[0]);
});

exports.deleteInvoice = asyncHandler(async (req, res) => {
    const result = await pool.query(
        "DELETE FROM invoices WHERE id = $1 RETURNING id",
        [req.params.id]
    );

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Invoice not found"
        });
    }

    res.json({
        success: true,
        message: "Invoice deleted successfully"
    });
});
