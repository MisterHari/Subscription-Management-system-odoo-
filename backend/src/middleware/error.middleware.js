module.exports = (err, req, res, next) => {
    console.error(err);

    if (err.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "A record with this value already exists"
        });
    }

    if (err.code === "23503") {
        return res.status(400).json({
            success: false,
            message: "Referenced customer does not exist"
        });
    }

    if (err.code === "23514" || err.code === "22P02") {
        return res.status(400).json({
            success: false,
            message: "Invalid data provided"
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
};
