require("dotenv").config({
    path: require("path").resolve(__dirname, "../.env")
});

const {
    hashPassword,
} = require("../src/utils/password");

const pool = require("../src/config/database");

async function createAdmin() {
    try {

        const name = process.env.ADMIN_NAME;
        const email = process.env.ADMIN_EMAIL?.toLowerCase();
        const password = process.env.ADMIN_PASSWORD;


        if (!name || !email || !password) {
            throw new Error("Missing admin environment variables");
        }

        if (password.length < 8) {
            throw new Error("Admin password must be at least 8 characters");
        }

        const existing = await pool.query(`
            SELECT email FROM team_members WHERE email = $1
            UNION ALL
            SELECT email FROM customers WHERE email = $1
        `, [email]);

        if (existing.rows.length) {
            throw new Error("This email already exists");
        }

        const hash = await hashPassword(password);
        console.log(hash);

        await pool.query(`
            INSERT INTO team_members (
                name, email, password_hash, role
            )
            VALUES ($1, $2, $3, 'admin')
        `, [name, email, hash]);


    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

createAdmin();
