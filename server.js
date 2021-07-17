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

// app.use((req, res, next) => {
//     console.log("middleware, middleware middle in the waaay");
//     if (!req.cookies.authenticated && req.url != "/") {
//         res.redirect("/cookies");
//     } else {
//         console.log("req.url:", req.url);
//         next();
//     }
// });

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.render("welcome", {
        layout: "main",
    });
});

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
    db.getInfo()
        .then(({ rows }) => {
            // let numberOfSigners = rows.length;
            res.render("thanks", {
                layout: "main",
                numberOfSigners: rows.length
            });
        })
        .catch((err) => console.log("Error", err));
});

app.get("/signers", (req, res) => {
    db.getInfo()
        .then(({ rows }) => {
            console.log("data from db: ", rows);
            console.log("id: ", rows[0].id);
            console.log("first ", rows[0].first);
            let numberOfSigners = rows.length;
            res.render("signers", {
                layout: "main",
                arrayOfResults: rows,
                numberOfSigners: rows.length,
            });
        })
        .catch((err) => console.log("Error", err));
});

app.listen(8080, () =>
    console.log("I am listening the post 8080 for the petition")
);
