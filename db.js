const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);


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

module.exports.addProfileInfo = (userId, age, city, homepage) => {
    return db.query(
        `INSERT INTO profiles (user_id, age, city, homepage)
        VALUES ($1, $2, $3, $4) RETURNING id`,
        [userId, age, city, homepage]
    );
};

// module.exports.mergeSignature = () => {
//     return db.query(
//         `SELECT users.*, signatures.signature
//         FROM users
//         FULL JOIN signatures ON users.id=signatures.user_id`,
//     );
// };

module.exports.selectSigners = () => {
    return db.query(
        `SELECT users.first, users.last, signatures.signature, profiles.age, profiles.city, profiles.homepage
            FROM users
            INNER JOIN signatures ON users.id=signatures.user_id
            LEFT JOIN profiles ON users.id=profiles.user_id`
    );
};

module.exports.selectSignersByCity = (city) => {
    return db.query(
        `SELECT users.first, users.last, profiles.age, profiles.city, profiles.homepage
            FROM users
            FULL JOIN profiles ON users.id=profiles.user_id
            WHERE profiles.city = $1`,
        [city]
    );
};
