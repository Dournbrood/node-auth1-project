const database = require("../data/dbConfig.js");

module.exports = {
    add,
    findBy,
    find
}

function find() {
    return database("users as u")
        .select("u.*");
}

function add(user) {
    return database("users")
        .insert(user)
        .then((ids) => {
            const [id] = ids;
            return database("users")
                .select("id", "username")
                .where({ id })
                .first();
        });
};

function findBy(filter) {
    return database("users")
        .select("id", "username", "password")
        .where(filter);
};