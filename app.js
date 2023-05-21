const express = require("express");

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Erorr: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//get movies

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT *
    FROM movie;`;
  const moviesArray = await db.all(getMovieQuery);
  response.send(
    moviesArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

//get movies withId

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE movie_id=${movieId};`;
  const moviesArray = await db.all(getMovieQuery);

  response.send(...moviesArray);
});

//add movie

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)

        VALUES
            (
                ${directorId},
                ${movieName},
                ${leadActor}
                
            );`;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//update movie

app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const movie = request.body;
    const { directorId, movieName, leadActor } = movie;

    const updateMovieQuery = ` 
                UPDATE 
                    movie 
                SET 
                    directorId= ${directorId},
                    movieName= ${movieName},
                    leadActor= ${leadActor}

                WHERE 
                    movie_id  = ${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
  } catch (e) {
    console.log(`Update Movie error: ${e.message}`);
  }
});

//delect movie use with ID

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const delectMovieQuery = `
        DELETE 
        FROM movie
        WHERE movie_id=${movieId};`;
  await db.run(delectMovieQuery);
  response.send("Movie Removed");
});
const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//get details with directorId
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
            SELECT * 
            FROM director;`;

  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((each) => convertDbObjectToResponseObject1(each))
  );
});

//get details with director id

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
            SELECT movie_name
            FROM movie 
            WHERE director_id=${directorId};`;

  const directorArray = await db.all(getDirectorQuery);

  response.send(
    directorArray.map((each) => convertDbObjectToResponseObject(each))
  );
});

module.exports = app;
