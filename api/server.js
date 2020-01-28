const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

const server = express();

//Everything from here until line 32 is required every single time you want session persistence. Just put it in the app.
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const dbConnection = require("../data/dbConfig");

const sessionConfig = {
    name: "loginSession",
    secret: process.env.SESSION_SECRET || "MooOoOoOooooOOOOO!!!",
    cookie: {
        maxAge: 1000 * 60 * 30, // 30 minutes...
        secure: false, //Make sure this is TRUE in production.
        httpOnly: true, //Ensures that only HTTP can access this session, JS cannot do it. (Even though we're doing it that way here...?)
    },
    resave: false,
    saveUninitialized: false,
    store: new KnexSessionStore({
        knex: dbConnection,
        tablename: "session",
        sidfieldname: "sid",
        createtable: true,
        clearInterval: 60000,
    }),
}

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(morgan("common"));

server.use(session(sessionConfig));

const Users = require("./users-model.js");

const { checkLoginStatus } = require("../middleware/restriction");

// This one gets saved for tomorrow!
server.get("/api/users", checkLoginStatus, (request, response, next) => {
    Users.find()
        .then((foundUsers) => {
            response.status(200).json({ ...foundUsers });
        })
        .catch((error) => {
            console.log(error);
            response.status(500).json({ message: "Internal server error. SCREAM AT DEVS!" });
        })
})

server.post("/api/register", (request, response) => {
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
                request.session.loggedIn = true;
                request.session.userId = user.id;
                // console.log(request.session);
                response.status(200).json({ message: `Welcome, ${username}!` });
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