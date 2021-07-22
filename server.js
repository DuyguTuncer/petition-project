// ---------------SETUP--------------------

const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const bcrypt = require("./bcrypt");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

// ---------------MIDDLEWARES--------------------

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

// app.use((req,res,next) => {
//     console.log("customize middleware is running");
//     if (req.session.sigId && req.url == "/welcome") {
//         res.redirect("/thanks");
//     } else {
//         next;
//     }
// });

// Work on middleware to redirect registered users not profile but thanks page when they log in.

// ---------------HOME PAGE--------------------

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.redirect("/register");
});

// ---------------REGISTER--------------------

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
    bcrypt
        .hash(req.body.password)
        .then((hashedPassword) => {
            // console.log("hashedPassword", hashedPassword);
            return db
                .addInfo(
                    req.body.first,
                    req.body.last,
                    req.body.emailAddress,
                    hashedPassword
                )
                .then((results) => {
                    req.session.userId = results.rows[0].id;
                    req.session.first = req.body.first;
                    req.session.last = req.body.last;
                    console.log(
                        "results.rows[0].id - userId",
                        results.rows[0].id
                    );
                    // console.log("req.session: ", req.session);
                    res.redirect("/profile");
                })
                .catch((err) =>
                    console.log("Error in post request for register", err)
                );
        })
        .catch((err) => console.log("Error in hashingy", err));
});

// ---------------LOGIN--------------------

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
    db.findEmail(req.body.emailAddress)
        .then(({ rows }) => {
            console.log("rows:", rows);
            // rows[0].hashed_password;
            bcrypt
                .compare(req.body.password, rows[0].hashed_password)
                .then((check) => {
                    console.log("check", check);
                    if (!check) {
                        res.render("login", {
                            layout: "main",
                        });
                    } else {
                        req.session.userId = rows[0].id;
                        res.render("profile", {
                            layout: "main",
                        });
                    }
                })
                .catch((err) =>
                    console.log("Error when comparing bcrypt", err)
                );
        })
        .catch((err) => console.log("Error when finding email", err));

    // findEmail() still problematic, when jumping from the profile page to the welcome page.
    // will be handleded with middleware above.
});

// ---------------PROFILE-------------------

app.get("/profile", (req, res) => {
    console.log("Get request happened to the profile page!");
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    console.log("req.body in /profile -post request", req.body);
    db.addProfileInfo(
        req.session.userId,
        req.body.age,
        req.body.city,
        req.body.homepage
    )
        .then(() => {
            res.redirect("/welcome");
        })
        .catch((err) => console.log("Error in adding profile info", err));
});

// ---------------WELCOME--------------------

app.get("/welcome", (req, res) => {
    console.log("Get request happened to the welcome page!");
    res.render("welcome", {
        layout: "main",
    });
});

app.post("/welcome", (req, res) => {
    // console.log(req.body);
    // console.log(req.body.canvas);
    db.addSignatureInfo(req.body.canvas, req.session.userId)
        .then((results) => {
            req.session.sigId = results.rows[0].id;
            // req.session.sigId = results.rows[0].id;
            // req.session.sigId = req.session.userId;
            console.log("req.body.sigId :", req.body.sigId);
            console.log("results.rows[0].id", results.rows[0].id);
            res.redirect("/thanks");
        })
        .catch((err) => console.log("Error", err));
});

// ---------------THANKS--------------------

app.get("/thanks", (req, res) => {
    console.log("Get request happened to the thanks page!");
    db.selectSigners()
        .then(({ rows }) => {
            // let numberOfSigners = rows.length;
            // console.log("rows:", rows);
            console.log(
                "rows[rows.length - 1].signature",
                rows[rows.length - 1].signature
            );
            res.render("thanks", {
                layout: "main",
                numberOfSigners: rows.length,
                signaturePic: rows[rows.length - 1].signature,
                // Improve this practice with a query. It works but not sustainable.
            });
        })
        .catch((err) =>
            console.log("Error for get request in thanks page", err)
        );
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.user).then(() => {
        // console.log("req.session.userId:", req.session.userId);
        // console.log("req.session.sigId:", req.session.sigId);
        req.session.sigId = null;
        res.redirect("/welcome");
    });
});

// ---------------EDIT--------------------

app.get("/edit", (req, res) => {
    console.log("Get request happened to the EDIT page!");
    db.renderInfo(req.session.userId)
        .then(({ rows }) => {
            console.log("rows in EDIT", rows);
            res.render("edit", {
                layout: "main",
                arrayOfResults: rows
            });
        })
        .catch((err) => console.log("Error for get request in EDIT page", err));
});

app.post("/edit", (req, res) => {
    if (!req.body.password === "") {
        bcrypt.hash(req.body.password).then((hashedPassword) => {
            console.log("hashedPassword", hashedPassword);
            return db
                .editUserInfoWithPassword(
                    req.body.first,
                    req.body.last,
                    req.body.emailAddress,
                    hashedPassword
                )
                .then(() => {
                    db.editProfileWithPassword(
                        req.body.age,
                        req.body.city,
                        req.body.homepage
                    );
                    console.log("req.session: ", req.body);
                    res.redirect("/thanks");
                })
                .catch((err) =>
                    console.log("Error in post request for register", err)
                );
        });
        // Check db!!
        // check logic, the way that how you chain the promises. Is that correct?
    }
});


// ---------------SIGNERS--------------------

app.get("/signers", (req, res) => {
    db.selectSigners()
        .then(({ rows }) => {
            // console.log("data from db: ", rows);
            res.render("signers", {
                layout: "main",
                arrayOfResults: rows,
            });
        })
        .catch((err) => console.log("Error", err));
});

// ---------------SIGNERSCITY--------------------

app.get("/signers/:city", (req, res) => {
    console.log("req.params.city", req.params.city);
    db.selectSignersByCity(req.params.city)
        .then(({ rows }) => {
            // console.log("rows", rows);
            res.render("signersCity", {
                layout: "main",
                arrayOfResults: rows,
                signersCity: req.params.city,
            });
        })
        .catch((err) => console.log("Error in /signers/:city", err));
});
// Check req.param

// ---------------LOGOUT--------------------

app.get("/logout", (req, res) => {
    console.log("get request happened to logout");
    req.session = null;
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("I am listening the post 8080 for the petition")
);
