// module.exports.requireLoggedOutUser = (req, res, next) => {
//     // is the user logged in???
//     if (req.session.userId) {
//         return res.redirect("/welcome");
//     }
//     // only if user is NOT logged in do you proceed to the rest of the code
//     next();
// };

// module.exports.requireLoggedInUser = (req, res, next) => {
//     if (!req.session.userId && req.url != "/register" && req.url != "/login") {
//         return res.redirect("/register");
//     }
//     // only if user IS logged in do you proceed to the rest of the code
//     next();
// };