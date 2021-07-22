module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect("/welcome");
    }
    next();
};

module.exports.requireLoggedInUser = (req, res, next) => {
    if (!req.session.userId && req.url != "/register" && req.url != "/login") {
        return res.redirect("/register");
    }
    next();
};

module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.sigId) {
        return res.redirect("/welcome");
    }
    next();
};
