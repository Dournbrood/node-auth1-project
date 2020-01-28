const bcrypt = require("bcryptjs");

const Users = require("../api/users-model");

module.exports = {
    checkLoginStatus
}

function checkLoginStatus(request, response, next) {
    console.log(request.session);
    if (request.session && request.session.loggedIn) {
        next();
    }
    else {
        response.status(401).json({ message: "Authentication failed. Contact a system administrator if you believe this message to be in error." })
    }
}