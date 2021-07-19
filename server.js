const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always hungry for cookies.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true,
    })
);

app.use(function (req, res, next) {
    res.set("x-frame-options", "deny");
    next();
});

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    console.log("Get request happened to the register page!");
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    console.log("req.body in /register -post request", req.body);
    if (
        req.body.first == false ||
        req.body.last == false ||
        req.body.emailAddress == false ||
        req.body.password == false
    ) {
        res.render("register", {
            layout: "main",
            showErrorMessage: true,
        });
    }

    db.addInfo(
        req.body.first,
        req.body.last,
        req.body.emailAddress,
        req.body.password
    )
        .then((results) => {
            req.session.userId = results.rows[0].id;
            console.log("results.rows[0].id - userId", results.rows[0].id);
            console.log("req.session: ", req.session);
            res.redirect("/welcome");
        })
        .catch((err) => console.log("Error in post request for register", err));
});

app.get("/welcome", (req, res) => {
    console.log("Get request happened to the welcome page!");
    res.render("welcome", {
        layout: "main",
    });
});

app.post("/welcome", (req, res) => {
    // console.log(req.body);
    // console.log(req.body.canvas);
    // if (req.body.canvas == false) {
    //     res.render("welcome", {
    //         layout: "main",
    //         showErrorMessage: true,
    //     });
    // }
    // console.log("req.body.canvas", req.body.canvas);
    db.addSignatureInfo(req.body.canvas, req.session.userId)
        .then((results) => {
            req.session.sigId = results.rows[0].id;
            console.log("req.body.sigId", req.body.sigId);
            console.log("results.rows[0].id", results.rows[0].id);
            res.redirect("/thanks");
        })
        .catch((err) => console.log("Error", err));
});

app.get("/login", (req, res) => {
    console.log("Get request happened to the login page!");
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    console.log(req.body);
    if (req.body.emailAddress == false || req.body.password == false) {
        res.render("login", {
            layout: "main",
            showErrorMessage: true,
        });
    }
    // write a function to find and compare the info
});

app.get("/thanks", (req, res) => {
    console.log("Get request happened to the thanks page!");
    db.getInfo()
        .then(({ rows }) => {
            // let numberOfSigners = rows.length;
            res.render("thanks", {
                layout: "main",
                numberOfSigners: rows.length,
                signaturePic: rows[rows.length - 1].signature,
            });
        })
        .catch((err) => console.log("Error", err));
});

app.get("/signers", (req, res) => {
    db.getInfo()
        .then(({ rows }) => {
            // console.log("data from db: ", rows);
            res.render("signers", {
                layout: "main",
                arrayOfResults: rows,
            });
        })
        .catch((err) => console.log("Error", err));
});

app.get("/logout", (req, res) => {
    console.log("get request happened to logout");
    req.session = null;
    res.redirect("/");
});

app.listen(8080, () =>
    console.log("I am listening the post 8080 for the petition")
);
