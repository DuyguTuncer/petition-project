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
        `SELECT users.id, users.hashed_password, signatures.id AS signature_id
         FROM users
         LEFT JOIN signatures ON users.id=signatures.user_id
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

module.exports.getSignature = (userId) => {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        userId,
    ]);
};

module.exports.countSigners = () => {
    return db.query(
        `SELECT COUNT(*)
        FROM signatures`
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

//-------------------Render the info in edit page--------------------

module.exports.renderInfo = (userId) => {
    return db.query(
        `SELECT users.first, users.last, users.email_address, profiles.age, profiles.city, profiles.homepage
    FROM users
    LEFT JOIN profiles ON users.id=profiles.user_id
    WHERE users.id = $1`,
        [userId]
    );
};

//-------------------Delete the signature--------------------

module.exports.deleteSignature = (userId) => {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [userId]);
};

//-------------------UPSERT the info if password is NOT provided--------------------

module.exports.editUserInfoWithoutPassword = (
    userId,
    first,
    last,
    emailAddress
) => {
    return db.query(
        `UPDATE users
        SET first =$2, last = $3, email_address =$4
        WHERE id =$1`,
        [userId, first, last, emailAddress]
    );
};

//-------------------UPSERT the info if password is provided--------------------

module.exports.editUserInfoWithPassword = (
    userId,
    first,
    last,
    emailAddress,
    hashedPassword
) => {
    return db.query(
        `INSERT INTO users (id, first, last, email_address, hashed_password)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id)
    DO UPDATE SET first = $2, last = $3, email_address = $4, hashed_password = $5 WHERE users.id = $1`,
        [userId, first, last, emailAddress, hashedPassword]
    );
};

//-------------------UPSERT profile--------------------

module.exports.editProfile = (userId, age, city, homepage) => {
    return db.query(
        `INSERT INTO profiles (user_id, age, city, homepage)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $2, city = $3, homepage = $4 WHERE profiles.user_id = $1`,
        [userId, age, city, homepage]
    );
};
