const pool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/async-handler");

function generateToken(userId, role) {
    return jwt.sign(
        {
            sub: String(userId),
            role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}

// CUSTOMER SIGNUP
exports.signup = asyncHandler(async (req, res) => {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check both account tables.
    const existing = await pool.query(`
        SELECT email FROM customers WHERE email = $1
        UNION ALL
        SELECT email FROM team_members WHERE email = $1
    `, [normalizedEmail]);

    if (existing.rows.length) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists"
        });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(`
        INSERT INTO customers (
            name, email, password_hash, company
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, company, joined
    `, [
        name.trim(),
        normalizedEmail,
        passwordHash,
        company || null
    ]);

    const customer = result.rows[0];

    const token = generateToken(customer.id, "customer");

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
            ...customer,
            role: "customer"
        }
    });
});

// COMMON LOGIN
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // First check staff/admin.
    let result = await pool.query(`
        SELECT id, name, email, password_hash, role
        FROM team_members
        WHERE email = $1
    `, [normalizedEmail]);

    let user;
    let role;

    if (result.rows.length) {
        user = result.rows[0];
        role = user.role;
    } else {
        // Otherwise check customers.
        result = await pool.query(`
            SELECT id, name, email, password_hash
            FROM customers
            WHERE email = $1
        `, [normalizedEmail]);

        user = result.rows[0];
        role = "customer";
    }

    if (!user || !user.password_hash) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!validPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const token = generateToken(user.id, role);

    res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role
        }
    });
});

// CURRENT USER
exports.getMe = asyncHandler(async (req, res) => {
    const table = req.user.role === "customer"
        ? "customers"
        : "team_members";

    const result = await pool.query(`
        SELECT id, name, email
        FROM ${table}
        WHERE id = $1
    `, [req.user.id]);

    if (!result.rows.length) {
        return res.status(401).json({
            success: false,
            message: "Account no longer exists"
        });
    }

    res.json({
        success: true,
        user: {
            ...result.rows[0],
            role: req.user.role
        }
    });
});

// LOGOUT
exports.logout = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: "Logged out successfully"
    });
});

// ADMIN CREATES STAFF
exports.createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, role = "staff" } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required"
        });
    }

    if (!["admin", "staff"].includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Invalid staff role"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await pool.query(`
        SELECT email FROM customers WHERE email = $1
        UNION ALL
        SELECT email FROM team_members WHERE email = $1
    `, [normalizedEmail]);

    if (existing.rows.length) {
        return res.status(409).json({
            success: false,
            message: "Email already registered"
        });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(`
        INSERT INTO team_members (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role
    `, [name.trim(), normalizedEmail, passwordHash, role]);

    res.status(201).json({
        success: true,
        message: "Staff account created",
        user: result.rows[0]
    });
});
