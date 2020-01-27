const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(morgan("common"));

const Users = require("./users-model.js");

// This one gets saved for tomorrow!
/* server.get("/api/users", (request, response, next) => {

}) */

server.post("/api/register", (request, response, next) => {
    let user = request.body;
    bcrypt.hash(request.body.password, 12, function (error, hash) {
        if (hash) {
            user.password = hash;

            Users.add(user)
                .then((newUser) => {
                    response.status(200).json({ ...newUser });
                })
                .catch((error) => {
                    console.log(error);
                    response.status(500).json({ message: "Internal server error. SCREAM AT DEVS!" });
                })
        }
        else {
            console.log(error);
            response.status(500).json({ message: "Internal server error. SCREAM AT DEVS!" });
        }
    })
})

server.post("/api/login", (request, response, next) => {
    let { username, password, ...rest } = request.body

    Users.findBy({ username })
        .first()
        .then((user) => {
            if (user && bcrypt.compareSync(password, user.password)) {
                response.status(200).json({ message: `Welcome, $    {username}!` });
            }
            else {
                response.status(401).json({ message: "Invalid Credentials..." });
            }
        })
        .catch((error) => {
            console.log(error);
            response.status(500).json({ message: "Internal server error. SCREAM AT DEVS!" });
        })
})

module.exports = server;