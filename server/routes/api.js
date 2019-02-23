const express = require('express');
const router = express.Router();
const oracledb = require('oracledb');

require('dotenv').config(); // this loads the defined variables from .env

// Connect
const connection = (closure) => {
    return oracledb.getConnection({
        user: process.env.ORACLE_USER,
        password: process.env.ORACLE_PASSWORD,
        connectString: process.env.ORACLE_CONNECTION_STRING
    }, (err, client) => {
        if (err) return console.log(err);

        closure(client);
    });
};

// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};

// Get movies
router.get('/movies', (req, res) => {
    connection((db) => {
        db.execute(
            `SELECT * FROM MOVIES`,
            []
        ).then((movies) => {
                response.data = movies.rows;
                res.json(response);
            })
            .catch((err) => {
                sendError(err, res);
            });
    });
});

module.exports = router;
