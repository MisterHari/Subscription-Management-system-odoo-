const argon2 = require("argon2");

const hashPassword = async (password) => {
    return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 19456,
        timeCost: 2,
        parallelism: 1
    });
};

const verifyPassword = async (hash, password) => {
    return await argon2.verify(hash, password);
};

module.exports = {
    hashPassword,
    verifyPassword
};
