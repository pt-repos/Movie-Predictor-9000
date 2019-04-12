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
  console.log('query: ' + query);
  if (!query) {
    query = ``;
  }
  connection((db) => {
    db.execute(query, params)
      .then((entries) => {
        console.log('entries: ' + entries.rows);
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

// Get filtered Persons list for search bar
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

// Get top Movies
router.get('/person/movies', (req, res) => {
  var query;
  // console.log('id: ' + req.query.id + ', criteria: ' + req.query.criteria);
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

// Get popularity trend
router.get('/person/trends', (req, res) => {
  var query;
  if (req.query.id) {
    // Avg popularity trent grouped into year periods
    if (req.query.criteria === 'popularity') {
      query =
        `SELECT ROUND(AVG(POPULARITY), 2) AS VALUE,
        TO_CHAR(FLOOR(EXTRACT(YEAR FROM RELEASEDATE)/5) * 5) 
          || '-' || 
          TO_CHAR(FLOOR(EXTRACT(YEAR FROM RELEASEDATE)/5) * 5 + 5 - 1)
          AS PERIOD
        FROM LTCARBON.MOVIE
        WHERE MOVIEID IN
          (SELECT MOVIEID FROM LTCARBON.CAST
          NATURAL JOIN LTCARBON.DIRECTOR
          WHERE ACTORID = ` + req.query.id + ` OR DIRECTORID = ` + req.query.id + `)
        AND EXTRACT(YEAR FROM RELEASEDATE) IS NOT NULL
        GROUP BY FLOOR(EXTRACT(YEAR FROM RELEASEDATE)/5)
        ORDER BY PERIOD`;
    }

    // Avg ratings trend grouped into year periods
    if (req.query.criteria === 'rating') {
      query =
        `SELECT ROUND(AVG(RATING), 2) AS VALUE,
          TO_CHAR(FLOOR(EXTRACT(YEAR FROM to_date('1970-01-01', 'YYYY-MM-DD') + VIEWDATE / 86400)/5) * 5) 
          || '-' || 
          TO_CHAR(FLOOR(EXTRACT(YEAR FROM to_date('1970-01-01', 'YYYY-MM-DD') + VIEWDATE / 86400)/5) * 5 + 5 - 1)
          AS PERIOD
          FROM USERVIEW
          NATURAL JOIN USERRATING
          WHERE MOVIEID IN
            (SELECT DISTINCT(MOVIEID) FROM LTCARBON.CAST
            NATURAL JOIN LTCARBON.DIRECTOR
            WHERE ACTORID = ` + req.query.id + ` OR DIRECTORID = ` + req.query.id + `)
          GROUP BY FLOOR(EXTRACT(YEAR FROM to_date('1970-01-01', 'YYYY-MM-DD') + VIEWDATE / 86400)/5)
          ORDER BY PERIOD`;
    }
  }

  executeQueryAndRespond(query, [], res);
});

// Get person's top genres' data
router.get('/person/genres', (req, res) => {
  var query;
  if (req.query.id) {
    // Avg popularity trent grouped into year periods
    query =
      `SELECT GENREID, NAME, SUM(POPULARITY) AS POPULARITY, COUNT(MOVIEID) AS MCOUNT
      FROM LTCARBON.MOVIE
      NATURAL JOIN LTCARBON.MOVIEGENRE
      NATURAL JOIN LTCARBON.GENRE
      WHERE MOVIEID IN 
        (SELECT MOVIEID FROM LTCARBON.CAST
        WHERE ACTORID = ` + req.query.id + `
        UNION
        SELECT MOVIEID FROM LTCARBON.DIRECTOR
        WHERE DIRECTORID = ` + req.query.id + `)
      GROUP BY (GENREID, NAME)
      ORDER BY FLOOR(POPULARITY/5) DESC, MCOUNT DESC
      FETCH FIRST 5 ROWS ONLY`;
  }

  executeQueryAndRespond(query, [], res);
});

// Get person's successful pairings
router.get('/person/pairings', (req, res) => {
  var query =
    `SELECT FULLNAME, a.* FROM (
      SELECT DIRECTORID AS PID, SUM(REVENUE) AS TOTAL_REV, COUNT(MOVIEID) AS NUM_MOVIES
      FROM LTCARBON.MOVIE
      NATURAL JOIN
        -- Movies given person acted in and their directors
        (SELECT MOVIEID, DIRECTORID FROM LTCARBON.DIRECTOR
        NATURAL JOIN LTCARBON.CAST
        WHERE ACTORID = ` + req.query.id + ` AND DIRECTORID != ACTORID)
      WHERE REVENUE > 0
      GROUP BY (DIRECTORID)
      UNION
      SELECT ACTORID AS PID, SUM(REVENUE) AS TOTAL_REV, COUNT(MOVIEID) AS NUM_MOVIES
      FROM LTCARBON.MOVIE
      NATURAL JOIN
        -- Movies given person acted in and their directors
        (SELECT MOVIEID, ACTORID FROM LTCARBON.DIRECTOR
        NATURAL JOIN LTCARBON.CAST
        WHERE DIRECTORID = ` + req.query.id + ` AND DIRECTORID != ACTORID)
      WHERE REVENUE > 0
      GROUP BY (ACTORID)
    ) a
    JOIN LTCARBON.PERSON p ON a.PID = p.PERSONID
    ORDER BY TOTAL_REV DESC
    FETCH FIRST 10 ROWS ONLY`;

  executeQueryAndRespond(query, [], res);
})

// Get movies with selected pairing
router.get('/person/pairing/movies', (req, res) => {
  var query =
    `SELECT a.* FROM
      (SELECT MOVIEID, TITLE, REVENUE, RELEASEDATE FROM LTCARBON.MOVIE 
      NATURAL JOIN LTCARBON.DIRECTOR
      WHERE DIRECTORID = ` + req.query.id + `) a
      JOIN LTCARBON.CAST b ON b.MOVIEID = a.MOVIEID
      WHERE ACTORID = ` + req.query.pairing + `
    UNION
    SELECT a.* FROM
      (SELECT MOVIEID, TITLE, REVENUE, RELEASEDATE FROM LTCARBON.MOVIE 
      NATURAL JOIN LTCARBON.DIRECTOR
      WHERE DIRECTORID = ` + req.query.pairing + `) a
      JOIN LTCARBON.CAST b ON b.MOVIEID = a.MOVIEID
      WHERE ACTORID = ` + req.query.id;

  executeQueryAndRespond(query, [], res);
})

// Get movies
router.get('/movies', (req, res) => {

  var query =
    `SELECT title, revenue
    FROM LTCARBON.MOVIE
    ORDER BY revenue DESC
    FETCH FIRST 12 ROWS ONLY`;

  executeQueryAndRespond(query, [], res);
});

// Get movie detail
router.get('/movie/detail', (req, res) => {

  var query;
  if (req.query.id) {
    query =
      `SELECT m.*, a.AVG_RATING FROM
        (SELECT * FROM LTCARBON.MOVIE
        WHERE MOVIEID = ` + req.query.id + `) m
      LEFT OUTER JOIN
        (SELECT MOVIEID, ROUND(AVG(RATING), 2) AS AVG_RATING FROM PULKIT.USERRATING
        WHERE MOVIEID = ` + req.query.id + `
        GROUP BY MOVIEID) a
      ON m.MOVIEID = a.MOVIEID`;
  }

  executeQueryAndRespond(query, [], res);
})

// Get movie's director
router.get('/movie/detail/director', (req, res) => {
  var query =
    `SELECT PERSONID, FULLNAME FROM LTCARBON.PERSON
    WHERE PERSONID IN 
      (SELECT DIRECTORID FROM LTCARBON.DIRECTOR
      WHERE MOVIEID = ` + req.query.id + `)`;

  executeQueryAndRespond(query, [], res);
})

// Get movie's cast
router.get('/movie/detail/cast', (req, res) => {
  var query =
    `SELECT PERSONID, FULLNAME, ROLE FROM LTCARBON.PERSON
    JOIN
      (SELECT ACTORID, ROLE FROM LTCARBON.CAST
      WHERE MOVIEID = ` + req.query.id + `)
    ON ACTORID = PERSONID
    NATURAL JOIN (
      SELECT ACTORID, SUM(POPULARITY) AS POPULARITY FROM LTCARBON.PERSON
      JOIN (SELECT ACTORID, MOVIEID FROM LTCARBON.CAST)
      ON PERSONID = ACTORID
      NATURAL JOIN (SELECT MOVIEID, POPULARITY FROM LTCARBON.MOVIE)
      GROUP BY ACTORID)
    ORDER BY POPULARITY DESC`;

  executeQueryAndRespond(query, [], res);
})

// Get similar movies
router.get('/movie/similar', (req, res) => {

  // console.log('test: ');
  // var query =
  //   `SELECT GENREID FROM LTCARBON.MOVIEGENRE
  //   WHERE MOVIEID = ` + req.query.id;

  // executeQueryAndRespond(query, [], res);
  if (req.query.id) {
    connection((db) => {
      db.execute(
        `SELECT GENREID FROM LTCARBON.MOVIEGENRE
        WHERE MOVIEID = ` + req.query.id,
        []
      ).then((entries) => {
        const genres = entries.rows;
        console.log('genres: ' + genres);
        var query = `SELECT MOVIEID, TITLE, RELEASEDATE FROM (`;
        for (i = 0; i < genres.length; i++) {
          query += `
            SELECT MOVIEID, TITLE, POPULARITY, RELEASEDATE FROM LTCARBON.MOVIE
            NATURAL JOIN LTCARBON.MOVIEGENRE
            WHERE GENREID = ` + genres[i];

          if (i < genres.length - 1) {
            query += `
              INTERSECT`;
          }
        }
        query += `
          MINUS
          SELECT MOVIEID, TITLE, POPULARITY, RELEASEDATE FROM LTCARBON.MOVIE
          NATURAL JOIN LTCARBON.MOVIEGENRE
          WHERE GENREID NOT IN (` + genres + `)
          ) WHERE MOVIEID <> `+ req.query.id + `
          ORDER BY dbms_random.value
          FETCH FIRST 30 ROWS ONLY`;

        console.log('query: ' + query);
        executeQueryAndRespond(query, [], res);
      })
        .catch((err) => {
          console.log('err res: ' + res);
          sendError(err, res);
        });
    });
  }
});

module.exports = router;
