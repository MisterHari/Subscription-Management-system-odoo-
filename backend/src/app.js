const express = require("express");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const authRoutes = require("./routes/auth.routes");

const notFound = require("./middleware/not-found.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Brightloop API is running"
    });
});

// API routes
app.use("/api/customers", customerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/auth", authRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
