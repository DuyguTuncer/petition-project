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

const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

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

app.use(requireLoggedInUser);

// ---------------HOME PAGE--------------------

app.get("/", (req, res) => {
    console.log("Get request happened!");
    res.redirect("/register");
});

// ---------------REGISTER--------------------

app.get("/register", requireLoggedOutUser, (req, res) => {
    console.log("Get request happened to the register page!");
    res.render("register", {
        layout: "main",
    });
});

app.post("/register", requireLoggedOutUser, (req, res) => {
    // console.log("req.body in /register -post request", req.body);
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

app.get("/login", requireLoggedOutUser, (req, res) => {
    console.log("Get request happened to the login page!");
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    // console.log(req.body);
    if (req.body.emailAddress == false || req.body.password == false) {
        res.render("login", {
            layout: "main",
            showErrorMessage: true,
        });
    }
    db.findEmail(req.body.emailAddress)
        .then(({ rows }) => {
            // console.log("rows:", rows);
            // rows[0].hashed_password;
            bcrypt
                .compare(req.body.password, rows[0].hashed_password)
                .then((check) => {
                    console.log("check", check);
                    if (!check) {
                        res.render("login", {
                            layout: "main",
                            showErrorMessage: true,
                        });
                    } else {
                        req.session.userId = rows[0].id;
                        req.session.sigId = rows[0].signature_id;
                        res.redirect("/thanks");
                    }
                })
                .catch((err) =>
                    console.log("Error when comparing bcrypt", err)
                );
        })
        .catch((err) => console.log("Error when finding email", err));
});

// ---------------PROFILE-------------------

app.get("/profile", (req, res) => {
    console.log("Get request happened to the profile page!");
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    // console.log("req.body in /profile -post request", req.body);
    db.addProfileInfo(
        req.session.userId,
        req.body.age || null,
        req.body.city || null,
        req.body.homepage || null
    )
        .then(() => {
            res.redirect("/welcome");
        })
        .catch((err) => console.log("Error in adding profile info", err));
});

// ---------------WELCOME--------------------

app.get("/welcome", requireNoSignature, (req, res) => {
    console.log("Get request happened to the welcome page!");
    res.render("welcome", {
        layout: "main",
    });
});

app.post("/welcome", requireNoSignature, (req, res) => {
    // console.log(req.body);
    // console.log(req.body.canvas);
    if (!req.body.canvas) {
        res.render("welcome", {
            layout: "main",
            showErrorMessage: true,
        });
    } else {
        db.addSignatureInfo(req.body.canvas, req.session.userId)
            .then((results) => {
                req.session.sigId = results.rows[0].id;
                console.log("req.body.sigId :", req.body.sigId);
                console.log("results.rows[0].id", results.rows[0].id);
                res.redirect("/thanks");
            })
            .catch((err) => console.log("Error", err));
    }
});

// ---------------THANKS--------------------

app.get("/thanks", requireSignature, (req, res) => {
    // console.log("req.session.userId", req.session.userId);
    var signatureUrl = db
        .getSignature(req.session.userId)
        .then((result) => {
            console.log("result.rows in thanks", result.rows);
            return result.rows[0];
        })
        .catch((err) => {
            console.log("Error in signatureUrl ", err);
        });

    var numberOfSignatures = db
        .countSigners()
        .then((result) => {
            // console.log("result.rows[0].count in thanks", result.rows[0].count);
            return result.rows[0].count;
        })
        .catch((err) => {
            console.log("Error in numberOfSignatures ", err);
        });

    Promise.all([signatureUrl, numberOfSignatures]).then((results) => {
        console.log("results in thanks", results);
        res.render("thanks", {
            layout: "main",
            numberOfSigners: results[1],
            signaturePic: results[0].signature,
        });
    });
});

app.post("/thanks", (req, res) => {
    db.deleteSignature(req.session.userId).then(() => {
        // console.log("req.session.userId in post thanks", req.session.userId);
        // console.log("result in post thanks", result);
        req.session.sigId = null;
        res.redirect("/welcome");
    });
});

// ---------------EDIT--------------------

app.get("/edit", (req, res) => {
    console.log("Get request happened to the EDIT page!", req.session);
    db.renderInfo(req.session.userId)
        .then(({ rows }) => {
            console.log("rows in EDIT", rows);
            res.render("edit", {
                layout: "main",
                arrayOfResults: rows,
            });
        })
        .catch((err) => console.log("Error for get request in EDIT page", err));
});

app.post("/edit", (req, res) => {
    console.log("req.body in edit post", req.body);
    if (!req.body.password == "") {
        bcrypt.hash(req.body.password).then((hashedPassword) => {
            // console.log("hashedPassword", hashedPassword);
            // console.log("req.body in edit post", req.body);
            db.editUserInfoWithPassword(
                req.session.userId,
                req.body.first,
                req.body.last,
                req.body.emailAddress,
                hashedPassword
            )
                .then(() => {
                    db.editProfile(
                        req.session.userId,
                        req.body.age || null,
                        req.body.city || null,
                        req.body.homepage || null
                    );
                    res.redirect("/thanks");
                })
                .catch((err) =>
                    console.log(
                        "Error in POST request for Edit with password",
                        err
                    )
                );
        });
    } else {
        db.editUserInfoWithoutPassword(
            req.session.userId,
            req.body.first,
            req.body.last,
            req.body.emailAddress
        )
            .then(() => {
                db.editProfile(
                    req.session.userId,
                    req.body.age || null,
                    req.body.city || null,
                    req.body.homepage || null
                );
                res.redirect("/thanks");
            })
            .catch((err) =>
                console.log(
                    "Error in POST request for Edit without password",
                    err
                )
            );
    }
});

// ---------------SIGNERS--------------------

app.get("/signers", requireSignature, (req, res) => {
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

app.get("/signers/:city", requireSignature, (req, res) => {
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
