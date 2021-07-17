const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition"); 

module.exports.getInfo = () => {
    return db.query(`SELECT * FROM signatures`);
};

module.exports.addInfo = (first, last, signature) => {
    return db.query(
        `INSERT INTO signatures (first, last, signature)
        VALUES ($1, $2, $3)`,
        [first, last, signature]
    );
};  
