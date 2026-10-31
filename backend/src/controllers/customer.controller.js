const pool = require("../config/database");
const asyncHandler = require("../utils/async-handler");

exports.getCustomers = asyncHandler(async (req, res) => {
    const result = await pool.query(`
        SELECT
            id,
            name,
            email,
            company,
            joined
        FROM customers
        ORDER BY id DESC
    `);

    res.json(result.rows);
});

exports.getCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
        "SELECT * FROM customers WHERE id = $1",
        [id]
    );

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    res.json(result.rows[0]);
});

exports.createCustomer = asyncHandler(async (req, res) => {
    const { name, email, company, joined } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required"
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email address"
        });
    }

    const result = await pool.query(`
        INSERT INTO customers (name, email, company, joined)
        VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE))
        RETURNING id, name, email, company, joined
    `, [name.trim(), email.trim().toLowerCase(), company || null, joined || null]);

    res.status(201).json(result.rows[0]);
});

exports.updateCustomer = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, email, company } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "Name and email are required"
        });
    }

    const result = await pool.query(`
        UPDATE customers
        SET name = $1, email = $2, company = $3
        WHERE id = $4
        RETURNING id, name, email, company, joined
    `, [name.trim(), email.trim().toLowerCase(), company || null, id]);

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    res.json(result.rows[0]);
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
    const result = await pool.query(
        "DELETE FROM customers WHERE id = $1 RETURNING id",
        [req.params.id]
    );

    if (!result.rows.length) {
        return res.status(404).json({
            success: false,
            message: "Customer not found"
        });
    }

    res.json({
        success: true,
        message: "Customer deleted successfully"
    });
});
