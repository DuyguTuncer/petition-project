// const { decodeBase64 } = require("bcryptjs");
// const { listenerCount } = require("events");
const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");


app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.render("welcome", {
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    console.log("Get request happened to the thanks page!");
    res.render("thanks", {
        layout: "main",
    });
});



// -this just retreives info
// rows has our data

app.post("/add-city", (req, res)=> {
    // those are data that could be sent by user - hard coded for now
    db.addCity("Cuenca", "Ecuador").then(() => {
        console.log("yes, we logged the cities");
    }).catch(err => console.log("error in post/addcity", err));
});

app.get("/cities", (req, res) => {
    db.getCities().then(({rows}) => {
        console.log("data from db: ", rows);

    }).catch( err => console.log("Error", err));
});




app.listen(8080, () => console.log("I am listening  the petition"));
