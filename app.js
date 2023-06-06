const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get players list
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT * 
    FROM cricket_team;`;

  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//post new players

app.post("/players/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;
  const playerQuery = `
        INSERT INTO 
           cricket_team(player_name,jersey_number,role)
        VALUES
        (
            '${playerName}',
             ${jerseyNumber},
            '${role}'
        );`;

  await db.run(playerQuery);
  response.send("Player Added to Team");
});

//get player using ID

app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayersQuery = `
        SELECT * 
        FROM cricket_team
        WHERE
        player_id= ${playerId};`;
    const playersArray = await db.get(getPlayersQuery);

    //response.send(playersArray);

    response.send(convertDbObjectToResponseObject(playersArray));
  } catch (e) {
    console.log(`DB Error :${e.message}`);
  }
});

//Update player list

app.put("/players/:playerId/", async (request, response) => {
  const newPlayer = request.body;
  const { playerName, jerseyNumber, role } = newPlayer;
  const { playerId } = request.params;
  const updatePlayerQuery = `
        UPDATE
           cricket_team
        SET
            player_name='${playerName}',
            jersey_number=${jerseyNumber},
            role='${role}'
        
        WHERE 
            player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete player List

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const delectQuery = `
        DELETE FROM 
            cricket_team
        WHERE 
            player_id=${playerId};`;

  await db.run(delectQuery);
  response.send("Player Removed");
});

module.exports = app;
