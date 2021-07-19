const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.addInfo = (first, last, emailAddress, password) => {
    return db.query(
        `INSERT INTO users (first, last, email_address, hashed_password)
        VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, emailAddress, password]
    );
};

module.exports.addSignatureInfo = (signature, userId) => {
    return db.query(
        `INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2) RETURNING id`,
        [signature, userId]
    );
};

module.exports.getInfo = () => {
    return db.query(`SELECT * FROM users`);
};

module.exports.findEmail = (emailAddress) => {
    return db.query(
        `SELECT * FROM users
         WHERE email_address = $1`,
        [emailAddress]
    );
};
