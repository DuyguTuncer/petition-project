// const { decodeBase64 } = require("bcryptjs");
// const { listenerCount } = require("events");
const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
// const cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.render("welcome", {
        layout: "main",
    });
});

// app.post("/", (req, res) => {
//     console.log("User submited the form.");
//     res.redirect("/thanks");
// });

app.post("/", (req, res) => {
    console.log(req.body);
    console.log(req.body.first);
    console.log(req.body.last);
    console.log(req.body.canvas);
    db.addInfo(req.body.first, req.body.last, req.body.canvas)
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => console.log("Error", err));
});

app.get("/thanks", (req, res) => {
    console.log("Get request happened to the thanks page!");
    res.render("thanks", {
        layout: "main",
    });
});


app.get("/signers", (req, res) => {
    db.getInfo()
        .then(({ rows }) => {
            console.log("data from db: ", rows);
        })
        .catch((err) => console.log("Error", err));
});

app.listen(8080, () =>
    console.log("I am listening the post 8080 for the petition")
);
