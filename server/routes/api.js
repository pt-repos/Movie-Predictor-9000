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

// Execute router.get() queries and send the response
function executeQueryAndRespond(query, params, res) {
  connection((db) => {
    db.execute(query, params)
      .then((entries) => {
        // console.log(entries);
        responseData = [];
        for (let entry of entries.rows) {
          data = {};
          for (let i = 0; i < entries.metaData.length; i++) {
            data[entries.metaData[i].name.toLowerCase()] = entry[i];
          }
          responseData.push(data);
        }
        response.data = responseData;
        console.log(response);
        res.json(response);
      })
      .catch((err) => {
        console.log('err res: ' + res);
        sendError(err, res);
      });
  });
};

// Get search bar result for filtered Persons list
router.get('/person', (req, res) => {
  var query;
  if (req.query.name) {
    query =
      `SELECT * FROM LTCARBON.PERSON 
        WHERE UPPER(FULLNAME) LIKE '%` + req.query.name.toUpperCase() + `%'
        FETCH FIRST 5 ROWS ONLY`;
  }
  else if (req.query.id) {
    query =
      `SELECT * FROM LTCARBON.PERSON
        WHERE PERSONID = ` + req.query.id;
  }

  // console.log('query: ' + query);
  executeQueryAndRespond(query, [], res);
});

// Get 
router.get('/person/movies', (req, res) => {
  var query;
  if (req.query.id) {
    query =
      `SELECT MOVIEID, TITLE, ROLE, REVENUE, AVG(RATING) AS AVG_RATING, RELEASEDATE 
      FROM USERRATING
      NATURAL JOIN
        (SELECT MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE, POPULARITY 
        FROM LTCARBON.MOVIE
        NATURAL JOIN LTCARBON.CAST
        WHERE ACTORID = ` + req.query.id + `)
      GROUP BY (MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE, POPULARITY)
      ORDER BY ROUND(AVG_RATING) DESC, POPULARITY DESC
      FETCH FIRST 5 ROWS ONLY`;
  }

  // console.log(query);
  executeQueryAndRespond(query, [], res);
});

// Get movies
router.get('/movies', (req, res) => {
  
  var query =
    `SELECT title, revenue
    FROM LTCARBON.MOVIE
    ORDER BY revenue DESC
    FETCH FIRST 12 ROWS ONLY`;

  executeQueryAndRespond(query, [], res);
  // connection((db) => {
  //   db.execute(
  //     `SELECT title, revenue
  //           FROM LTCARBON.MOVIE
  //           ORDER BY revenue DESC
  //           FETCH FIRST 12 ROWS ONLY`,
  //     []
  //   ).then((movies) => {
  //     movielist = [];
  //     console.log(movies);
  //     for (let movie of movies.rows) {
  //       movieData = {};
  //       for (let i = 0; i < movies.metaData.length; i++) {
  //         const datapoint = movies.metaData[i];
  //         movieData[datapoint.name.toLowerCase()] = movie[i]
  //       }
  //       movielist.push(movieData)
  //     }
  //     response.data = movielist;
  //     res.json(response);
  //   })
  //     .catch((err) => {
  //       sendError(err, res);
  //     });
  // });
});

module.exports = router;
