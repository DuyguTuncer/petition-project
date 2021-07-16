const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/geography"); // change the geography to the
// petition that you have named

module.exports.getCities = () => {
    return db.query(`SELECT * FROM cities`);
};

module.exports.addCity = (city, country) => {
    // Injection check it out!
    // when you have multiple lines of codes
    // make sure to use the template strings
    return db.query(
        `INSERT INTO cities (city, country)
        VALUES ($1, $2)`,
        [city, country]
    );
};
