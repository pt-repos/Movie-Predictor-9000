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
  if (!query) {
    query = ``;
  }
  connection((db) => {
    db.execute(query, params)
      .then((entries) => {
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
      `WITH filtered_list AS (
        SELECT * FROM LTCARBON.PERSON 
        WHERE LOWER(FULLNAME) LIKE '%` + req.query.name.toLowerCase() + `%'
      )
      SELECT fl.*, b.POP FROM
        filtered_list fl
        JOIN
        (SELECT ACTORID, SUM(POPULARITY) AS POP FROM
          (SELECT ACTORID, POPULARITY FROM LTCARBON.MOVIE
          NATURAL JOIN LTCARBON.CAST
          WHERE ACTORID IN (SELECT PERSONID FROM filtered_list)
          UNION
          SELECT DIRECTORID, POPULARITY AS POP FROM LTCARBON.MOVIE
          NATURAL JOIN LTCARBON.DIRECTOR
          WHERE DIRECTORID IN (SELECT PERSONID FROM filtered_list))
        GROUP BY ACTORID) b
        ON fl.PERSONID = b.ACTORID
        ORDER BY b.POP DESC
      FETCH FIRST 5 ROWS ONLY`;
  }
  else if (req.query.id) {
    query =
      `SELECT * FROM LTCARBON.PERSON
        WHERE PERSONID = ` + req.query.id;
  }

  executeQueryAndRespond(query, [], res);
});

// Get 
router.get('/person/movies', (req, res) => {
  var query;
  console.log('id: ' + req.query.id + ', criteria: ' + req.query.criteria);
  if (req.query.id) {
    // select movies based on user ratings and popularity
    if (req.query.criteria === 'rating') {
      query =
        `SELECT MOVIEID, TITLE, ROLE, REVENUE, ROUND(AVG_RATING, 1) AS AVG_RATING, RELEASEDATE FROM (
        SELECT row_number() over (ORDER BY ROUND(AVG_RATING, 1) DESC, POPULARITY DESC) AS rn, a.* FROM (
          (SELECT MOVIEID, TITLE, ROLE, REVENUE, 
          AVG(RATING) AS AVG_RATING, RELEASEDATE, POPULARITY
          FROM USERRATING
          NATURAL JOIN
            (SELECT MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE, POPULARITY 
            FROM LTCARBON.MOVIE
            NATURAL JOIN LTCARBON.CAST
            WHERE ACTORID = ` + req.query.id + `)
          GROUP BY (MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE, POPULARITY))
          UNION
          (SELECT MOVIEID, TITLE, 'Director' AS ROLE, REVENUE,
          AVG(RATING) AS AVG_RATING, RELEASEDATE, POPULARITY 
          FROM USERRATING
          NATURAL JOIN
            (SELECT MOVIEID, TITLE, REVENUE, RELEASEDATE, POPULARITY 
            FROM LTCARBON.MOVIE
            NATURAL JOIN LTCARBON.DIRECTOR
            WHERE DIRECTORID = ` + req.query.id + `)
          GROUP BY (MOVIEID, TITLE, REVENUE, RELEASEDATE, POPULARITY))
        ) a
      ) ORDER BY rn`;
    }
    // select movies based on popularity and revenue
    else {
      query =
        `SELECT MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE FROM (
          (SELECT MOVIEID, TITLE, ROLE, REVENUE, RELEASEDATE, POPULARITY 
          FROM LTCARBON.MOVIE
          NATURAL JOIN LTCARBON.CAST
          WHERE ACTORID = ` + req.query.id + `)
          UNION
          (SELECT MOVIEID, TITLE, 'Director' AS ROLE, REVENUE, RELEASEDATE, POPULARITY 
          FROM LTCARBON.MOVIE
          NATURAL JOIN LTCARBON.DIRECTOR
          WHERE DIRECTORID = ` + req.query.id + `)
        )`;

      if (req.query.criteria === 'revenue') {
        query += `ORDER BY REVENUE DESC`;
      }
      else {
        query += `ORDER BY ROUND(POPULARITY) DESC, REVENUE DESC`;
      }
    }
  }

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
});

module.exports = router;
